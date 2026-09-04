import { Request, Response } from 'express'
import { type NylasMessage } from '../repositories/http/nylas.repository'
import { verifyNylasSignature } from '../utils/nylas-webhook'
import { VenueRepository } from '../repositories/venue.repository'
import { EmailRelayService } from '../services/email-relay.service'

const venueRepository = new VenueRepository()
const relayService = new EmailRelayService()

export class NylasWebhookController {
  receive = async (req: Request, res: Response): Promise<void> => {
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
        res.status(503).json({ success: false, error: 'Nylas webhook is not configured' })
        return
      }

      verifyNylasSignature(req.body, req.header('X-Nylas-Signature') || '', secret)
      const payload = JSON.parse(req.body.toString('utf8'))
      const trigger = String(payload?.type || '')
      const message = payload?.data?.object as NylasMessage | undefined

      if (trigger.startsWith('message.created') && message?.id && message.grant_id && message.thread_id) {
        const venue = await venueRepository.getVenueByNylasGrantId(message.grant_id)
        if (!venue) {
          res.status(404).json({ success: false, error: 'No venue found for Nylas grant' })
          return
        }
        await relayService.forwardInboundMessage(venue.id, message)
      }

      res.sendStatus(200)
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Invalid Nylas webhook' })
    }
  }
}