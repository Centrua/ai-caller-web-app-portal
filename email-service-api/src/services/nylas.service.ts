import { Request, Response } from 'express'
import crypto from 'crypto'
import messageRepo from '../repositories/message.repository'
import conversationRepo from '../repositories/conversation.repository'
import classifier from './email-classifier.service'
import geminiReply from './email-reply.service'
import outgoingRepo from '../repositories/outgoing.repository'
import { NylasRepository } from '../repositories/http/nylas.repository'
import { isFromConnectedAccount } from '../utils/nylas.utils'
const nylasRepo = new NylasRepository()

export function handleNylasChallenge(req: Request, res: Response): boolean {
  const challenge = req.query.challenge
  if (typeof challenge === 'string') {
    res.type('text/plain').send(challenge)
    return true
  }
  return false
}

export function verifyNylasSignature(rawBody: Buffer, signature: string | undefined, res: Response): boolean {
  const secret = process.env.NYLAS_WEBHOOK_SECRET
  if (!secret) {
    res.status(500).json({ success: false, error: 'Nylas webhook secret not configured' })
    return false
  }

  if (!signature) {
    res.status(400).json({ success: false, error: 'Missing Nylas signature header' })
    return false
  }

  const expectedHex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const sigBuf = Buffer.from(signature, 'utf8')
  const expBuf = Buffer.from(expectedHex, 'utf8')
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    res.status(400).json({ success: false, error: 'Invalid Nylas webhook signature' })
    return false
  }

  return true
}

export async function handleNylasWebhook(req: Request, res: Response): Promise<void> {
  try {
    if (handleNylasChallenge(req, res)) return

    const rawBody = req.body as Buffer
    if (!Buffer.isBuffer(rawBody)) {
      console.error('Raw body is not a buffer:', rawBody)
      res.status(400).json({ success: false, error: 'Raw body buffer required' })
      return
    }

    const signature = (req.header('X-Nylas-Signature') || req.header('x-nylas-signature') || '') as string
    if (!verifyNylasSignature(rawBody, signature, res)) return

    const payload = JSON.parse(rawBody.toString('utf8'))
    const obj = payload?.data?.object

    if (!obj) {
      res.status(400).json({ success: false, error: 'Missing object in payload' })
      return
    }

    // Drop messages that appear to originate from the connected account for this grant
    const fromAddresses = (obj.from && Array.isArray(obj.from))
      ? obj.from.map((f: any) => (f && f.email ? String(f.email).toLowerCase() : null)).filter(Boolean)
      : []

    const grantId = obj.grant_id || obj.grantId || null

    console.log('Processing inbound message for grant:', grantId, 'from addresses:', fromAddresses)
    if (await isFromConnectedAccount(nylasRepo, grantId, fromAddresses)) {
      console.log('Dropping inbound message from connected account email for grant:', grantId, fromAddresses)
      res.status(200).json({ received: true, stored: false, reason: 'self_address' })
      return
    }

    const subject = obj.subject || null
    const snippet = obj.snippet || null

    // Classify: should we store as wedding inquiry?
    const isWedding = await classifier.shouldStoreAsWedding({ subject, snippet })

    // If not a wedding inquiry, drop (do not persist)
    if (!isWedding) {
      console.log('Dropping non-wedding email for thread:', obj.thread_id || obj.threadId)
      res.status(200).json({ received: true, stored: false })
      return
    }

    // Persist message and conversation only for wedding inquiries
    await messageRepo.upsertMessageFromNylas(obj)

    const threadId = obj.thread_id || obj.threadId || null
    if (threadId && grantId) {
      const existing = await conversationRepo.findConversationByThreadAndGrant(threadId, grantId)
      if (existing) {
        await conversationRepo.updateConversationFromMessage(existing, obj)
      } else {
        await conversationRepo.createConversationFromMessage({ ...obj, id: obj.id })
      }
    }

    // Generate a concise reply draft via Gemini for wedding inquiries
    try {
      const { draft } = await geminiReply.generateReply({ originalMessage: obj, threadId, grantId })
      // Auto-send behavior can be configured per-grant via AUTO_SEND_REPLIES_GRANTS (comma-separated grant ids).
      const globalAuto = String(process.env.AUTO_SEND_REPLIES || 'false').toLowerCase() === 'true'
      const grantsEnv = String(process.env.AUTO_SEND_REPLIES_GRANTS || '')
      const grantList = grantsEnv.split(',').map(s => s.trim()).filter(Boolean)
      const grantAllowed = grantId && grantList.length > 0 ? grantList.includes(String(grantId)) : false

      // If `AUTO_SEND_REPLIES_GRANTS` is provided (non-empty), honor it exclusively;
      // do NOT fall back to the global `AUTO_SEND_REPLIES` flag when grant list exists.
      const shouldAutoSend = grantList.length > 0 ? grantAllowed : globalAuto

      if (shouldAutoSend) {
        try {
          const recipients = (obj.from && obj.from.map((f: any) => f.email)) || []
          const payload: any = { subject: (draft as any).subject, body: (draft as any).body, to: recipients.map((r: string) => ({ email: r })) }
          payload.reply_to_message_id = obj.id
          const sendResp = await nylasRepo.sendMessage(grantId, payload)
          await outgoingRepo.updateDraftStatus((draft as any).id, 'sent', { nylas_response: sendResp })
        } catch (sendErr: any) {
          console.error('Auto-send failed for draft:', sendErr?.message || sendErr)
          await outgoingRepo.updateDraftStatus((draft as any).id, 'failed', { send_error: String(sendErr?.message || sendErr) })
        }
      }
    } catch (genErr: any) {
      console.error('Failed to generate reply draft:', genErr?.message || genErr)
    }

    res.status(200).json({ received: true })
  } catch (err: any) {
    console.error('Error processing Nylas webhook:', err?.message || err)
    res.status(400).json({ success: false, error: err?.message || 'Invalid payload' })
  }
}

export default {
  handleNylasChallenge,
  verifyNylasSignature,
  handleNylasWebhook,
}
