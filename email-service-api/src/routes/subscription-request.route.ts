import { Router } from 'express'
import subscriptionController from '../controllers/subscription-request.controller'

const router = Router()

router.post('/acknowledge', (req, res) => subscriptionController.handleAcknowledgment(req, res))

router.post('/approve', (req, res) => subscriptionController.handleApproval(req, res))

export default router