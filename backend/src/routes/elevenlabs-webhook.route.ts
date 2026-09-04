import { Router } from 'express'
import { ElevenLabsWebhookController } from '../controllers/elevenlabs-webhook.controller'

const router = Router()
const controller = new ElevenLabsWebhookController()

router.post('/reply', controller.receiveReply)

export default router