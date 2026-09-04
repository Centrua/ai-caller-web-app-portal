import { Request, Response } from 'express'
import { verifyElevenLabsSignature } from '../utils/elevenlabs-webhook'
import { EmailRelayService } from '../services/email-relay.service'

const relayService = new EmailRelayService()

export class ElevenLabsWebhookController {
  receiveReply = async (req: Request, res: Response): Promise<void> => {
    try {
      const rawBody = req.body
      const signature = req.header('ElevenLabs-Signature')
      const signingSecret = process.env.ELEVENLABS_CUSTOM_CHANNEL_OUTBOUND_SIGNING_SECRET

      if (!Buffer.isBuffer(rawBody)) {
        res.status(400).json({ success: false, error: 'Raw webhook body is required' })
        return
      }

      if (!signingSecret) {
        res.status(503).json({ success: false, error: 'ElevenLabs webhook is not configured' })
        return
      }

      verifyElevenLabsSignature(rawBody, signature || '', signingSecret)
      const payload = JSON.parse(rawBody.toString('utf8'))

      if (!payload.conversation_id || !Array.isArray(payload.data)) {
        res.status(400).json({ success: false, error: 'Invalid ElevenLabs webhook payload' })
        return
      }

      const responses = payload.data
        .filter((item: any) => item?.type === 'agent_response')
        .map((item: any) => item.event?.agent_response)
        .filter((response: unknown): response is string => typeof response === 'string' && response.length > 0)

      if (payload.status === 'failed') {
        console.error('[ElevenLabs Webhook Failed Turn]', payload.error || 'Unknown error')
      } else if (responses.length > 0) {
        await relayService.sendAgentReply(payload.conversation_id, responses.join('\n\n'))
      }

      res.sendStatus(204)
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Invalid ElevenLabs webhook' })
    }
  }
}