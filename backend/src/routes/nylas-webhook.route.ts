import { Router } from 'express'
import nylasWebhookController from '../controllers/nylas-webhook.controller'

const router = Router()

router.post('/', (req, res) => nylasWebhookController.receive(req, res))

export default router
