import crypto from 'crypto'
import { Request, Response } from 'express'

export function verifyNylasSignature(rawBody: Buffer, signature: string, secret: string): void {
  if (!signature || !secret) throw new Error('Nylas webhook signature is missing')

  // Nylas signs the raw request body with HMAC-SHA256 using the webhook secret.
  const expectedHex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  // Use a constant-time comparison to prevent timing attacks.
  const sigBuf = Buffer.from(signature, 'utf8')
  const expBuf = Buffer.from(expectedHex, 'utf8')
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Invalid Nylas webhook signature')
  }
}

export function handleNylasChallenge(req: Request, res: Response): boolean {
  const challenge = req.query.challenge
  if (typeof challenge === 'string') {
    res.type('text/plain').send(challenge)
    return true
  }
  return false
}

export async function handleNylasWebhook(req: Request, res: Response): Promise<void> {
  if (handleNylasChallenge(req, res)) return

  try {
    if (!Buffer.isBuffer(req.body)) {
      console.error('Raw webhook body is not a Buffer')
      res.status(400).json({ success: false, error: 'Raw webhook body is required' })
      return
    }

    const secret = process.env.NYLAS_WEBHOOK_SECRET
    if (!secret) {
      res.status(500).json({ success: false, error: 'Nylas webhook secret is not configured' })
      return
    }

    const signature = (req.header('X-Nylas-Signature') || req.header('x-nylas-signature') || req.header('x-Nylas-Signature') || '') as string
    verifyNylasSignature(req.body as Buffer, signature, secret as string)

    const payload = JSON.parse((req.body as Buffer).toString('utf8'))

    const subject = payload?.data?.object?.subject ?? null
    const snippet = payload?.data?.object?.snippet ?? null

    if (subject || snippet) {
      console.info('Nylas webhook extracted:', { subject, snippet })
    }

    res.sendStatus(200)
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Invalid Nylas webhook' })
  }
}

export default {
  verifyNylasSignature,
  handleNylasChallenge,
  handleNylasWebhook,
}
