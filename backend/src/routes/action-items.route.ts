import { Router } from 'express'
import { ActionItemsController } from '../controllers/action-items.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const controller = new ActionItemsController()

router.get('/:id/actions', authenticateToken, controller.actionsList)
router.get('/:id/flags', authenticateToken, controller.getFlags)
router.patch('/:id/complete', authenticateToken, controller.setComplete)
router.patch('/:id/actions/:actionId', authenticateToken, controller.updateAction)

export default router
