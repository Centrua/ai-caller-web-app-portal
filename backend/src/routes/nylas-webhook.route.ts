import { Router } from 'express'
import { NylasWebhookController } from '../controllers/nylas-webhook.controller'

const router = Router()
const controller = new NylasWebhookController()

router.get('/', controller.receive)
router.post('/', controller.receive)

export default router