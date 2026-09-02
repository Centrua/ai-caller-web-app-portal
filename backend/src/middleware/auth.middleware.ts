import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/http';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

// Extend Express Request to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    sendError(res, 401, 'Access token missing or malformed');
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
    if (err) {
      sendError(res, 403, 'Invalid or expired token');
      return;
    }

    req.user = user as JwtPayload;
    next();
  });
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      sendError(res, 403, 'Forbidden: Insufficient permissions');
      return;
    }
    next();
  };
};