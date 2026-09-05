import { GeminiRepository, GeminiRequestDto } from '../repositories/http/gemini.repository'
import outgoingRepo from '../repositories/outgoing.repository'
import messageRepo from '../repositories/message.repository'
import { NylasRepository } from '../repositories/http/nylas.repository'

const gemini = new GeminiRepository()
const nylasRepo = new NylasRepository()

export interface GenerateReplyOpts {
  originalMessage: any
  threadId?: string | null
  grantId?: string | null
}

export async function generateReply(opts: GenerateReplyOpts) {
  const { originalMessage, threadId, grantId } = opts

  const subject = originalMessage.subject || ''
  const snippet = originalMessage.snippet || ''
  const from = (originalMessage.from && originalMessage.from[0] && originalMessage.from[0].email) || null

  const systemInstruction = {
    parts: [{ text: 'You are an assistant that composes concise, professional email replies.' }],
  }

  const userParts = [] as Array<{ text: string }>
  if (snippet) userParts.push({ text: `Message snippet: ${snippet}` })
  userParts.push({ text: 'Compose a concise reply of 3-5 sentences addressing the sender and answering any obvious questions. Do not include attachments. Keep it polite and clear.' })
  // Request HTML output from the model so we can send properly formatted email bodies
  userParts.push({ text: 'Respond with HTML only: produce an HTML fragment suitable for an email body (use <p> for paragraphs and <br/> for line breaks). Do not include <html>, <head>, or <body> tags. Avoid external CSS and inline styles; simple semantic HTML only.' })

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

  const draft = await outgoingRepo.createDraft({
    original_message_id: originalMessage.id || null,
    thread_id: threadId || null,
    grant_id: grantId || null,
    subject: `Re: ${subject}`,
    body: html,
    status: 'draft',
    gemini_response: response as any,
  })

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
  await outgoingRepo.updateDraftStatus(id, 'sent', { nylas_response: sendResp })

  return { sent: true, resp: sendResp }
}

export default { generateReply, approveDraft }
