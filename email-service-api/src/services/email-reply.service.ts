import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { GeminiRepository, GeminiRequestDto } from '../repositories/http/gemini.repository'
import { NylasRepository } from '../repositories/http/nylas.repository'
import messageRepo from '../repositories/message.repository'
import outgoingRepo from '../repositories/outgoing.repository'
import leadRepo from '../repositories/lead-inquiry.repository'
import leadService from './lead-extraction.service'
import PromptService from './agent-prompt.service'
import VenueService from './venue.service'

const gemini = new GeminiRepository()
const nylasRepo = new NylasRepository()
const promptService = new PromptService()
const elevenLabsRepo = new ElevenLabsRepository()

async function appendKnowledgeBaseToSystemInstruction(systemInstruction: { parts: Array<{ text: string }> }, agentId?: string | null) {
  if (!agentId) return

  try {
    const agentConfig: any = await elevenLabsRepo.getAgentConfig(agentId)
    const attachedKbList: Array<{ id: string; name?: string; type?: string }> =
      agentConfig?.conversation_config?.agent?.prompt?.knowledge_base || agentConfig?.knowledge_base || []

    if (!Array.isArray(attachedKbList) || attachedKbList.length === 0) {
      console.error(`No attached knowledge-base list for agent ${agentId}`)
      return
    }

    const attachedIds = new Set(attachedKbList.map((doc) => doc.id))

    const allFilesResp = await elevenLabsRepo.getKnowledgeBaseFiles()
    const docs = allFilesResp.documents || []
    const matching = docs.filter((d: any) => attachedIds.has(d.id))

    for (const doc of matching) {
      try {
        const content = await elevenLabsRepo.getKnowledgeBaseContent(doc.id)
        if (content) {
          systemInstruction.parts.push({ text: `Knowledge Base (${doc.name}):\n${content}` })
        } else {
          systemInstruction.parts.push({ text: `Knowledge Base (${doc.name}): no inline content available` })
        }
      } catch (e) {
        console.warn('Failed to fetch KB content for', doc.id, (e as any)?.message || e)
      }
    }
  } catch (e) {
    console.warn('Failed to fetch knowledge-base documents or agent config:', (e as any)?.message || e)
  }
}

export interface GenerateReplyOpts {
  originalMessage: any
  threadId?: string | null
  grantId?: string | null
}

export async function generateReply(opts: GenerateReplyOpts) {
  const { originalMessage, threadId, grantId } = opts

  const subject = originalMessage.subject || ''
  const body = originalMessage.body

  const systemInstruction = {
    parts: [
      { text: 'You are an assistant that composes concise, professional email replies. DO NOT HALLUCINATE INFORMATION. IF THE INFORMATION IS NOT FOUND IN THE KNOWLEDGE BASE INFORMATION IN THIS SYSTEM PROMPT THEN SAY YOU DONT KNOW FOR CERTAIN AND WILL NOTIFY THE TEAM OF THEIR REQUEST' },
      { text: 'Do not repeat closing phrases (for example, "thank you for reaching out" or similar) multiple times. If including a closing, include it at most once.' },
    ],
  }

  if (grantId) {
    try {
      const agentId = await VenueService.getAgentIdByGrant(grantId)
      const sysPrompt = agentId ? await promptService.getSystemPrompt(agentId) : null

      if (sysPrompt) {
        // Prepend venue/system prompt so it takes precedence
        systemInstruction.parts.unshift({ text: sysPrompt })
      }
      try {
        const venueName = await VenueService.getVenueNameByGrant(grantId)
        if (venueName) {
          systemInstruction.parts.unshift({ text: `VENUE_NAME: ${venueName}\nThis is the venue name only use this when using VENUE_NAME` })
        }
      } catch (e) {
        console.warn('Failed to fetch venue name:', (e as any)?.message || e)
      }

      await appendKnowledgeBaseToSystemInstruction(systemInstruction, agentId)

      // Highest-priority safeguard: prevent the model from repeatedly asking
      // the same clarifying questions. This will be prepended so it takes
      // precedence over an agent-configured system prompt.
      systemInstruction.parts.unshift({
        text:
          'TOP PRIORITY: Do not ask repeated clarifying questions. Always examine the full conversation history provided in the message body and do not request information already present. If information is missing, include at most one concise request for the missing fields and then finish the reply. If the assistant previously asked a clarifying question in this thread and the sender did not provide new information, do NOT repeat that question; instead conclude the reply and state the next steps (e.g., notify the team). Do not loop asking for the same information.'
      })
    } catch (e) {
      // Fail gracefully and continue with default system instruction
      console.warn('Failed to fetch venue system prompt/procedures:', (e as any)?.message || e)
    }
  }

  const userParts = [] as Array<{ text: string }>
  if (body) userParts.push({ text: `Message body: ${body}` })
  userParts.push({ text: 'Compose a concise reply of 3-5 sentences addressing the sender and answering any obvious questions. Do not include attachments. Keep it polite and clear.' })
  // Request HTML output from the model so we can send properly formatted email bodies
  userParts.push({ text: 'Respond with HTML only: produce an HTML fragment suitable for an email body (use <p> for paragraphs and <br/> for line breaks). Do not include <html>, <head>, or <body> tags. Avoid external CSS and inline styles; simple semantic HTML only.' })

  // Lead extraction and prompts delegated to leadService
  const leadPrep = await leadService.prepareLeadForReply({ systemParts: systemInstruction.parts, body, originalMessage, threadId, grantId })
  const extracted = leadPrep.leadExtractionResult
  let leadExtractionResult: any = null
  if (extracted) {
    leadExtractionResult = extracted
    for (const p of leadPrep.userPrompts) userParts.push({ text: p })
  }

  const payload: GeminiRequestDto = {
    system_instruction: systemInstruction,
    contents: [
      {
        role: 'user',
        parts: userParts.map(p => ({ text: p.text })),
      },
    ],
    generationConfig: {
      temperature: 0.2,
    },
  }

  const response = await gemini.generateContent(payload)
  const candidate = response.candidates && response.candidates[0]
  const text = (candidate?.content?.parts && candidate.content.parts.map(p => p.text).join('\n\n')) || ''

  // Treat model output as HTML fragment. We store HTML only; no plain-text fallback required.
  const html = text

  // If we ran lead extraction earlier, attach merged extraction to the response
  if (leadExtractionResult) {
    try {
      const merged = leadService.mergeEmbeddedLead(leadExtractionResult, html)
      ;(response as any).lead_extraction = merged
    } catch (e) {
      console.warn('Failed to attach lead extraction result to response:', (e as any)?.message || e)
    }
  }

  // Strip any embedded lead JSON blocks from the HTML before persisting or sending it to the recipient.
  // Also defensively remove any raw JSON objects that contain lead-related keys (in case the model emitted raw JSON without markers).
  let sanitizedHtml = html.replace(/<!--LEAD_JSON-->[\s\S]*?<!--LEAD_JSON-->/g, '').trim()

  // Remove any top-level JSON object that contains any of the lead keys.
  const leadKeysPattern = /\b(?:lead_name|lead_phone|wedding_date|guest_count|tour_requested)\b/i
  sanitizedHtml = sanitizedHtml.replace(/\{[\s\S]*?\}/g, (match) => {
    return leadKeysPattern.test(match) ? '' : match
  }).trim()

  const draft = await outgoingRepo.createDraft({
    original_message_id: originalMessage.id || null,
    thread_id: threadId || null,
    grant_id: grantId || null,
    subject: `Re: ${subject}`,
    body: sanitizedHtml,
    status: 'draft',
    gemini_response: response as any,
  })

  // If we have lead extraction data attached to the response, persist it to lead_inquiries
  try {
    const leadExtraction = (response as any)?.lead_extraction
    if (leadExtraction) {
      await leadService.persistLeadExtraction(leadExtraction, originalMessage, threadId, grantId)
    }
  } catch (e) {
    console.warn('Failed to persist lead inquiry:', (e as any)?.message || e)
  }

  return { draft, html, response }
}

export async function approveDraft(draftId: number) {
  const id = Number(draftId)
  const draft = await outgoingRepo.findDraftById(id)
  if (!draft) {
    const err: any = new Error('Draft not found')
    err.status = 404
    throw err
  }

  let recips = []

  // If no explicit recipients provided, try to derive from latest message in the thread
  const threadId = (draft as any).thread_id || null
  const grantId = (draft as any).grant_id || null
  const latest = await messageRepo.findLatestMessageInThread(threadId, grantId)
  if (latest && (latest as any).from && Array.isArray((latest as any).from) && (latest as any).from.length > 0) {
    recips = (latest as any).from.map((f: any) => f.email).filter(Boolean)
  }

  if (!recips || recips.length === 0) {
    const err: any = new Error('Recipients required: unable to derive recipients from thread')
    err.status = 400
    throw err
  }

  const subject = (draft as any).subject || ''
  const body = (draft as any).body || ''
  // Ensure CRLF line endings for email transport and preserve paragraphs
  const bodyForSend = body.replace(/\r?\n/g, '\r\n')
  const payload: any = { subject, body: bodyForSend, to: recips.map((r: string) => ({ email: r })) }
  if ((draft as any).original_message_id) payload.reply_to_message_id = (draft as any).original_message_id

  const sendResp = await nylasRepo.sendMessage((draft as any).grant_id, payload)
  await outgoingRepo.updateDraftStatus(id, 'sent', { nylas_response: sendResp }, new Date())

  return { sent: true, resp: sendResp }
}

export default { generateReply, approveDraft }
