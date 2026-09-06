import { Router } from 'express'
import { AgentController } from '../controllers/agent.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const agentController = new AgentController()

router.get('/system-prompt', authenticateToken, agentController.getSystemPrompt)

export default router
