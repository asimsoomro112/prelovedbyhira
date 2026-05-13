import { Router } from 'express';
import * as disputeController from '../controllers/dispute.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/create', upload.array('evidence', 5), disputeController.createDispute);
router.get('/my', disputeController.listDisputes);
router.get('/:id', disputeController.getDisputeDetail);

// Admin
router.put('/admin/:id/resolve', authorize('ADMIN'), disputeController.adminResolveDispute);

export default router;
