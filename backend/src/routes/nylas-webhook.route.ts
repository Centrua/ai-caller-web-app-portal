import { Router } from 'express'
import nylasWebhookController from '../controllers/nylas-webhook.controller'

const router = Router()

// Support Nylas webhook challenge verification (GET) and incoming events (POST)
router.get('/', (req, res) => nylasWebhookController.receive(req, res))
router.post('/', (req, res) => nylasWebhookController.receive(req, res))

export default router
