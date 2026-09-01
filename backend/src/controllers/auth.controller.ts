// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        res.status(400).json({ 
          success: false, 
          error: 'Email and password are required' 
        });
        return;
      }

      const result = await authService.login(email, password);
      res.status(200).json({ success: true, data: result });
    } 
    catch (error: any) {
      console.error('[AuthController Error]:', error);
      res.status(401).json({ success: false, error: error.message });
    }
  }
}