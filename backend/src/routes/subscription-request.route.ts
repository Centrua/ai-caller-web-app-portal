import { Router } from 'express';
import { SubscriptionRequestController } from '../controllers/subscription-request.controller';
import { requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', SubscriptionRequestController.create);
router.get('/', requireSuperAdmin, SubscriptionRequestController.getNonApproved);
router.patch('/:id/approve', requireSuperAdmin, SubscriptionRequestController.approve);

export default router;