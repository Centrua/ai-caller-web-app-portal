import { Request, Response } from 'express';
import { RegisterTokenService } from '../services/register-token.service';
import { sendError, sendSuccess } from '../utils/http';

export class RegisterTokenController {
  private registerTokenService: RegisterTokenService;

  constructor(registerTokenService?: RegisterTokenService) {
    this.registerTokenService = registerTokenService || new RegisterTokenService();
  }

  public getTokensByVenueId = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id

      if (userId === undefined || isNaN(userId) || userId <= 0) {
        sendError(res, 400, 'Invalid or missing userId');
        return;
      }

      const tokens = await this.registerTokenService.getTokenForVenueByUserId(userId);
      sendSuccess(res, 200, tokens);
    } 
    catch (error: any) {
      sendError(res, 500, error.message || 'Failed to retrieve register tokens');
    }
  };
}

export const registerTokenController = new RegisterTokenController();
