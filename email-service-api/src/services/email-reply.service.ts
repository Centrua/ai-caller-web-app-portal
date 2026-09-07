import { ElevenLabsRepository } from '../repositories/http/eleven-labs.repository'
import { GeminiRepository, GeminiRequestDto } from '../repositories/http/gemini.repository'
import { NylasRepository } from '../repositories/http/nylas.repository'
import messageRepo from '../repositories/message.repository'
import outgoingRepo from '../repositories/outgoing.repository'
import leadRepo from '../repositories/lead-inquiry.repository'
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
      console.log(`No attached knowledge-base list for agent ${agentId}`)
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
  const snippet = originalMessage.snippet || ''

  const systemInstruction = {
    parts: [{ text: 'You are an assistant that composes concise, professional email replies. DO NOT HALLUCINATE INFORMATION. IF THE INFORMATION IS NOT FOUND IN THE KNOWLEDGE BASE INFORMATION IN THIS SYSTEM PROMPT THEN SAY YOU DONT KNOW FOR CERTAIN AND WILL NOTIFY THE TEAM OF THEIR REQUEST' }],
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
          'TOP PRIORITY: Do not ask repeated clarifying questions. Always examine the full conversation history provided in the snippet and do not request information already present. If information is missing, include at most one concise request for the missing fields and then finish the reply. If the assistant previously asked a clarifying question in this thread and the sender did not provide new information, do NOT repeat that question; instead conclude the reply and state the next steps (e.g., notify the team). Do not loop asking for the same information.'
      })
    } catch (e) {
      // Fail gracefully and continue with default system instruction
      console.warn('Failed to fetch venue system prompt/procedures:', (e as any)?.message || e)
    }
  }

  const userParts = [] as Array<{ text: string }>
  if (snippet) userParts.push({ text: `Message snippet: ${snippet}` })
  userParts.push({ text: 'Compose a concise reply of 3-5 sentences addressing the sender and answering any obvious questions. Do not include attachments. Keep it polite and clear.' })
  // Request HTML output from the model so we can send properly formatted email bodies
  userParts.push({ text: 'Respond with HTML only: produce an HTML fragment suitable for an email body (use <p> for paragraphs and <br/> for line breaks). Do not include <html>, <head>, or <body> tags. Avoid external CSS and inline styles; simple semantic HTML only.' })

  // Helper: run a structured extraction to detect whether the sender is a potential event lead
  async function extractLeadInfo(snippetText: string) {
    const extractSystem = { parts: systemInstruction.parts }
    const extractUserParts = [] as Array<{ text: string }>
    if (snippetText) extractUserParts.push({ text: `Message snippet: ${snippetText}` })
    extractUserParts.push({ text: 'You will ONLY output JSON. DO NOT HALLUCINATE OR GUESS. Determine whether the sender is a potential event lead (true/false).'
    })
    extractUserParts.push({ text: 'If they are a potential lead, extract ONLY explicitly-provided fields from the thread into a JSON object with these keys: lead_name, lead_phone, wedding_date, guest_count, tour_requested. Use null or omit keys that are not explicitly present. Also include a boolean `is_potential_lead` and an array `missing_fields` listing which of the above fields are missing and would be useful to collect. Return a single valid JSON object and nothing else.' })

    const extractPayload: GeminiRequestDto = {
      system_instruction: extractSystem,
      contents: [ { role: 'user', parts: extractUserParts.map(p => ({ text: p.text })) } ],
      generationConfig: { temperature: 0.0 },
    }

    try {
      const extractResp = await gemini.generateContent(extractPayload)
      const candidate = extractResp.candidates && extractResp.candidates[0]
      const text = (candidate?.content?.parts && candidate.content.parts.map(p => p.text).join('\n\n')) || ''
      // Attempt to parse JSON from the model output
      const jsonStart = text.indexOf('{')
      const jsonText = jsonStart >= 0 ? text.slice(jsonStart) : text
      try {
        const parsed = JSON.parse(jsonText)
        return { parsed, raw: text, resp: extractResp }
      } catch (e) {
        console.warn('Failed to parse lead extraction JSON', e)
        return { parsed: null, raw: text, resp: extractResp }
      }
    } catch (e) {
      console.warn('Lead extraction failed:', (e as any)?.message || e)
      return { parsed: null, raw: null, resp: null }
    }
  }

  // Run extraction to decide whether to alter the reply to collect missing lead info
  const extraction = await extractLeadInfo(snippet)
  const extracted = extraction.parsed

  let leadExtractionResult: any = null
  if (extracted && typeof extracted === 'object' && extracted.is_potential_lead) {
    leadExtractionResult = extracted

    // If sender is a potential lead and there are missing fields, ask model to request only those fields naturally
    // Consult DB for any existing lead info to avoid asking for fields already stored
    let existingLead: any = null
    try {
      existingLead = await leadRepo.findLeadInquiryByThreadAndGrant(threadId || null, grantId || null)
    } catch (e) {
      console.warn('Failed to fetch existing lead inquiry:', (e as any)?.message || e)
    }

    const requiredFields = ['lead_name', 'lead_phone', 'wedding_date', 'guest_count', 'tour_requested']
    const existingInfo = (existingLead && existingLead.lead_info) ? existingLead.lead_info : {}

    // Determine which fields are present either in DB or in the extracted parse
    const present = new Set<string>()
    // Do not collect lead email, 'interested_in', or 'event_type' from the assistant.
    for (const f of requiredFields) {
      const valInDb = existingInfo && existingInfo[f]
      const valInExtract = extracted && (extracted[f] !== undefined && extracted[f] !== null && String(extracted[f]).trim() !== '')
      if (valInDb !== undefined && valInDb !== null && String(valInDb).trim() !== '') present.add(f)
      if (valInExtract) present.add(f)
    }

    const missing = requiredFields.filter(f => !present.has(f))

    if (missing.length > 0) {
      userParts.push({ text: `The sender appears to be a potential event lead. Collect only the missing information naturally and politely: ${missing.join(', ')}. Do NOT ask for information already provided in the thread or already stored in the system. Do NOT repeat a clarifying question that already appears earlier in the conversation if the sender did not answer; instead, offer next steps or state you'll notify the team.` })
    } else {
      // No missing fields: ensure the model does not ask any follow-ups
      userParts.push({ text: 'All required lead fields are present in the thread or in system records. Do not ask any follow-up questions. If no additional information is present beyond what is in the snippet, conclude the reply and state next steps.' })
    }

    // Also instruct model to include any explicitly-provided lead fields in a machine-readable JSON block
    // wrapped between <!--LEAD_JSON--> markers so the system can capture them. The visible reply should remain
    // natural and human-facing; we'll strip the machine-readable block before saving/sending to the recipient.
    userParts.push({ text: 'If you include any lead contact details in the reply, also include a JSON object containing only the explicitly-provided lead fields wrapped between <!--LEAD_JSON--> and <!--LEAD_JSON-->. The JSON should use keys: lead_name, lead_phone, wedding_date, guest_count, tour_requested. Do not fabricate values.' })
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

  // If we ran lead extraction earlier, attach it to the model response and merge any JSON the model embedded in the reply
  if (leadExtractionResult) {
    try {
      // Attempt to find a <!--LEAD_JSON-->...<!--LEAD_JSON--> block in the HTML reply so we can capture any machine-readable
      // content the model may have returned despite instructions. We'll parse it (if present) but then strip it from the
      // stored/sent HTML so the client never receives raw JSON.
      const leadJsonStart = html.indexOf('<!--LEAD_JSON-->')
      const leadJsonEnd = html.indexOf('<!--LEAD_JSON-->', leadJsonStart + 1)
      let embeddedLead = null
      if (leadJsonStart >= 0 && leadJsonEnd > leadJsonStart) {
        const jsonText = html.slice(leadJsonStart + '<!--LEAD_JSON-->'.length, leadJsonEnd).trim()
        try {
          embeddedLead = JSON.parse(jsonText)
        } catch (e) {
          console.warn('Failed to parse embedded lead JSON from reply:', e)
        }
      }

      const merged = Object.assign({}, leadExtractionResult)
      if (!merged.lead_info) merged.lead_info = {}
      if (embeddedLead && typeof embeddedLead === 'object') {
        // Merge only explicitly-provided keys from embeddedLead
          for (const k of Object.keys(embeddedLead)) {
            // Do not collect lead_email, interested_in, or event_type
            if (k === 'lead_email' || k === 'interested_in' || k === 'event_type') continue
            if (embeddedLead[k] !== null && embeddedLead[k] !== undefined && String(embeddedLead[k]).trim() !== '') {
              merged.lead_info[k] = embeddedLead[k]
            }
          }
      }

      // Attach to the Gemini response so it's persisted with the draft
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
      const leadInfo = leadExtraction.lead_info || leadExtraction.parsed || leadExtraction
      // Sanitize: never persist lead_email or interested_in
      if (leadInfo && typeof leadInfo === 'object') {
        delete leadInfo.lead_email
        delete leadInfo.interested_in
        delete leadInfo.event_type
      }

      await leadRepo.upsertLeadInquiryByThreadAndGrant({
        grant_id: grantId || null,
        thread_id: threadId || null,
        original_message_id: originalMessage.id || null,
        lead_info: leadInfo,
        status: 'open',
      })
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
