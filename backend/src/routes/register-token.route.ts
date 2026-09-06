import { Router } from 'express';
import { registerTokenController } from '../controllers/register-token.controller';
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router();

router.post('/venue', authenticateToken, registerTokenController.getTokensByVenueId);

export default router;
