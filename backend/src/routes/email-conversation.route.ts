import { Router } from 'express'
import EmailConversationController from '../controllers/email-conversation.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticateToken, EmailConversationController.getConversations)

export default router