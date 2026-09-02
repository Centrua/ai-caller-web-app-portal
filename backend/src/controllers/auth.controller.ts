// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendError, sendSuccess } from '../utils/http';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        sendError(res, 400, 'Email and password are required');
        return;
      }

      const result = await authService.login(email, password);
      sendSuccess(res, 200, result);
    } 
    catch (error: any) {
      console.error('[AuthController Error]:', error);
      sendError(res, 401, error.message);
    }
  }
}