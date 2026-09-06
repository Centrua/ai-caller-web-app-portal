import { Router } from 'express'
import { KnowledgeBaseController } from '../controllers/knowledge-base.controller'
import { authenticateToken } from '../middleware/auth.middleware'
import { uploadSingleFile } from '../middleware/upload.middleware'

const router = Router()
const knowledgeBaseController = new KnowledgeBaseController()

router.get('/', authenticateToken, knowledgeBaseController.getKnowledgeBaseContent)
router.post('/', authenticateToken, knowledgeBaseController.createOrUpdateKnowledgeBase)
router.get('/files', authenticateToken, knowledgeBaseController.getKnowledgeBaseFiles)
router.get('/files/:id', authenticateToken, knowledgeBaseController.getKnowledgeBaseFileById)
router.post('/files/upload', authenticateToken, uploadSingleFile, knowledgeBaseController.uploadKnowledgeBaseFile)
router.delete('/files/:id', authenticateToken, knowledgeBaseController.deleteKnowledgeBaseFileById)

export default router