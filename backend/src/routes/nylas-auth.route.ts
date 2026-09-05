import { Router } from 'express'
import nylasAuthController from '../controllers/nylas-auth.controller'

const router = Router()

router.get('/auth', (req, res) => nylasAuthController.startAuth(req, res))
router.get('/callback', (req, res) => nylasAuthController.callback(req, res))

export default router
