import express, { Router, Request, Response } from 'express'
import nylasWebhookController from '../controllers/nylas-webhook.controller'

const router = Router()

// Support Nylas webhook challenge verification (GET) and incoming events (POST)
router.get('/', (req: Request, res: Response) => nylasWebhookController.receive(req, res))
// Accept any JSON-like content type (including CloudEvents `application/cloudevents+json`).
router.post('/', express.raw({ type: (req) => {
	const ct = req.headers['content-type']
	return typeof ct === 'string' && ct.toLowerCase().includes('json')
} }), (req: Request, res: Response) => nylasWebhookController.receive(req, res))

export default router
