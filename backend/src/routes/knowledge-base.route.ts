import { Router } from 'express'
import { KnowledgeBaseController } from '../controllers/knowledge-base.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const knowledgeBaseController = new KnowledgeBaseController()

router.get('/', authenticateToken, knowledgeBaseController.getKnowledgeBaseContent)
router.post('/', authenticateToken, knowledgeBaseController.createKnowledgeBase)

export default router