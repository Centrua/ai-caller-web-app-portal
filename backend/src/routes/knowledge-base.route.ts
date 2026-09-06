import { Router } from 'express'
import multer from 'multer'
import { KnowledgeBaseController } from '../controllers/knowledge-base.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const knowledgeBaseController = new KnowledgeBaseController()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/', authenticateToken, knowledgeBaseController.getKnowledgeBaseContent)
router.post('/', authenticateToken, knowledgeBaseController.createOrUpdateKnowledgeBase)
router.get('/files', authenticateToken, knowledgeBaseController.getKnowledgeBaseFiles)
router.get('/files/:id', authenticateToken, knowledgeBaseController.getKnowledgeBaseFileById)
router.post('/files/upload', authenticateToken, upload.single('file'), knowledgeBaseController.uploadKnowledgeBaseFile)
router.delete('/files/:id', authenticateToken, knowledgeBaseController.deleteKnowledgeBaseFileById)

export default router