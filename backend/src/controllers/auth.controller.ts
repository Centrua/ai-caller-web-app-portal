import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/http'
import { NylasAuthService } from '../services/nylas-auth.service'

const authService = new AuthService()
const nylasAuthService = new NylasAuthService()

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, venueId } = req.body
      if (!email || !password || !venueId) {
        sendError(res, 400, 'Email, password, and venueId are required')
        return
      }
      const result = await authService.register({
        name,
        email,
        password,
        role,
        venueId: Number(venueId),
      })
      sendSuccess(res, 201, result)
    } catch (error: any) {
      console.error('[AuthController Register Error]:', error)
      sendError(res, 400, error.message || 'Registration failed')
    }
  }

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

  async initiateNylasAuth(req: Request, res: Response): Promise<void> {
    try {
      const provider = typeof req.query.provider === 'string' ? req.query.provider : undefined
      res.redirect(nylasAuthService.getAuthorizationUrl(provider))
    } catch (error: any) {
      sendError(res, 500, error.message || 'Nylas authentication is unavailable')
    }
  }

  async handleNylasCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query
      if (typeof code !== 'string' || typeof state !== 'string') {
        sendError(res, 400, 'Nylas authorization code and state are required')
        return
      }

      const result = await nylasAuthService.exchangeCode(code, state)
      const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/register-venue`)
      redirectUrl.searchParams.set('nylas_grant_id', result.grantId)
      if (result.email) redirectUrl.searchParams.set('email', result.email)
      res.redirect(redirectUrl.toString())
    } catch (error: any) {
      console.error('[AuthController Nylas Callback Error]:', error.message)
      sendError(res, 400, 'Nylas authentication failed')
    }
  }
}