import { Router } from 'express'
import LeadInquiryController from '../controllers/lead-inquiry.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.get('/:id', authenticateToken, LeadInquiryController.getByThreadId)

export default router
