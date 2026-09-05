import { Request, Response } from 'express'
import crypto from 'crypto'
import messageRepo from '../repositories/message.repository'
import conversationRepo from '../repositories/conversation.repository'
import classifier from './email-classifier.service'

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
    const grantId = obj.grant_id || obj.grantId || null
    if (threadId && grantId) {
      const existing = await conversationRepo.findConversationByThreadAndGrant(threadId, grantId)
      if (existing) {
        await conversationRepo.updateConversationFromMessage(existing, obj)
      } else {
        await conversationRepo.createConversationFromMessage({ ...obj, id: obj.id })
      }
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
