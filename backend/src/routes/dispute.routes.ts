import { Router } from 'express';
import * as disputeController from '../controllers/dispute.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/upload';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/create', upload.array('evidence', 5), disputeController.createDispute);
router.get('/my', disputeController.listDisputes);
router.get('/:id', disputeController.getDisputeDetail);

// Admin
router.put('/admin/:id/resolve', authorize(Role.ADMIN), disputeController.adminResolveDispute);

export default router;
