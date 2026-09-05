import express, { Router } from 'express'
import replyController from '../controllers/reply.controller'

const router: Router = express.Router()

router.post('/:draftId/approve', (req, res) => replyController.approve(req, res))

export default router
