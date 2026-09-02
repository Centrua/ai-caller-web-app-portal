import { Router } from 'express'
import { ConversationsController } from '../controllers/conversations.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const controller = new ConversationsController()

router.get('/', authenticateToken, controller.list)
router.get('/:id', authenticateToken, controller.get)
router.get('/:id/summary', authenticateToken, controller.summary)
router.get('/:id/audio', authenticateToken, controller.audio)
router.get('/:id/actions', authenticateToken, controller.actionsList)
router.get('/:id/flags', authenticateToken, controller.getFlags)
router.patch('/:id/complete', authenticateToken, controller.setComplete)

// legacy: allow marking done via actions patch as well
router.patch('/:id/actions/:actionId', authenticateToken, controller.updateAction)

export default router
