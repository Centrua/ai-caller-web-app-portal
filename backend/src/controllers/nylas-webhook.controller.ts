import { Request, Response } from 'express'
import { verifyNylasSignature } from '../utils/nylas-webhook'

export class NylasWebhookController {
  receive = async (req: Request, res: Response): Promise<void> => {
    // Echo challenge for webhook setup
    const challenge = req.query.challenge
    if (typeof challenge === 'string') {
      res.type('text/plain').send(challenge)
      return
    }

    try {
      if (!Buffer.isBuffer(req.body)) {
        res.status(400).json({ success: false, error: 'Raw webhook body is required' })
        return
      }

      const secret = process.env.NYLAS_WEBHOOK_SECRET
      if (!secret) {
        // If no secret is configured, accept but warn in logs
        console.warn('NYLAS_WEBHOOK_SECRET is not configured; skipping signature verification')
      } else {
        verifyNylasSignature(req.body as Buffer, req.header('X-Nylas-Signature') || '', secret)
      }

      // Lightweight handling: do not persist or forward inbound messages.
      // This scaffolding accepts and verifies webhooks but intentionally drops the payload.
      const payload = JSON.parse((req.body as Buffer).toString('utf8'))
      console.info('Received Nylas webhook event:', payload?.type || 'unknown')

      res.sendStatus(200)
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Invalid Nylas webhook' })
    }
  }
}

const controller = new NylasWebhookController()
export default controller
