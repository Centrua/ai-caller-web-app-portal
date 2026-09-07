import { Router } from 'express'
import outgoingController from '../controllers/outgoing.controller'

const router = Router()

router.patch('/drafts/:id/body', outgoingController.editBody)

export default router