import { Router } from 'express';
import * as payoutController from '../controllers/payout.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('SELLER', 'ADMIN'));

router.get('/balance', payoutController.getBalance);
router.get('/history', payoutController.getPayoutHistory);
router.get('/settings', payoutController.getPayoutSettings);
router.post('/request', payoutController.requestPayout);

export default router;
