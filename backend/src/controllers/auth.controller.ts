import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/http'

const authService = new AuthService()

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        sendError(res, 400, 'Email and password are required')
        return
      }
      const result = await authService.login(email, password)
      sendSuccess(res, 200, result)
    } catch (error: any) {
      console.error('[AuthController Login Error]:', error)
      sendError(res, 401, error.message)
    }
  }

  async initiateGoogleAuth(req: Request, res: Response): Promise<void> {
    try {
      const url = authService.getGoogleAuthUrl()
      res.redirect(url)
    } catch (error: any) {
      console.error('[AuthController Google Initiate Error]:', error)
      sendError(res, 500, error.message)
    }
  }

  async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query

      if (!code || typeof code !== 'string') {
        sendError(res, 400, 'Authorization code missing from query parameters')
        return
      }

      const result = await authService.handleGoogleCallback(code)

      // Redirect back to Register Venue page with auth token & connected Google email
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      res.redirect(
        `${frontendUrl}/register-venue?token=${result.token}&email=${encodeURIComponent(result.user.email)}`
      )
    } catch (error: any) {
      console.error('[AuthController Google Callback Error]:', error)
      sendError(res, 500, 'Google authentication failed')
    }
  }
}
