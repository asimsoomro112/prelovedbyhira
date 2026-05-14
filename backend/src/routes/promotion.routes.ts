import { Router } from 'express';
import * as promotionController from '../controllers/promotion.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('SELLER'));

router.post('/create', promotionController.createPromotion);
router.get('/my', promotionController.getSellerPromotions);
router.delete('/:id', promotionController.deletePromotion);

export default router;
