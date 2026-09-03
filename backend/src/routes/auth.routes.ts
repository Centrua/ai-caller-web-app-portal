import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router = Router()
const authController = new AuthController()

router.post('/login', (req, res) => authController.login(req, res))

router.get('/google', (req, res) => authController.initiateGoogleAuth(req, res))
router.get('/google/callback', (req, res) => authController.handleGoogleCallback(req, res))

export default router
