import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);

export default router;
