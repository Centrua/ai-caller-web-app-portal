import { Router } from 'express'
import ProcedureController from '../controllers/procedure.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const procedureController = new ProcedureController()

router.get('/', authenticateToken, procedureController.getProceduresForAgent)

export default router
