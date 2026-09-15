import { Router } from 'express';
import { SubscriptionRequestController } from '../controllers/subscription-request.controller';

const router = Router();

router.post('/', SubscriptionRequestController.create);

export default router;