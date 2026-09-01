import { Router } from 'express'
import { ConversationsController } from '../controllers/conversations.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const controller = new ConversationsController()

router.get('/', authenticateToken, controller.list)
router.get('/:id', authenticateToken, controller.get)
router.get('/:id/summary', authenticateToken, controller.summary)
router.get('/:id/audio', authenticateToken, controller.audio)

export default router
