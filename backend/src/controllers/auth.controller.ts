import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/http'

const authService = new AuthService()

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
}