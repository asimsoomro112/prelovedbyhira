import { Router } from 'express';
import * as sellerController from '../controllers/seller.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public route for Shop Profile
router.get('/public/:id', sellerController.getPublicSellerProfile);

// Apply auth to all seller routes below
router.use(authenticate);

// Allow CUSTOMER to submit verification, but protect other stats/status routes
router.get('/stats', authorize('SELLER', 'ADMIN'), sellerController.getDashboardStats);
router.get('/products', authorize('SELLER', 'ADMIN'), sellerController.getSellerProducts);

router.post('/verify-identity', 
  upload.fields([
    { name: 'cnicFront', maxCount: 1 },
    { name: 'cnicBack', maxCount: 1 }
  ]), 
  sellerController.submitIdentity
);

router.post('/submit-selfie',
  upload.fields([{ name: 'selfie', maxCount: 1 }]),
  sellerController.submitSelfie
);

router.get('/verification/status', sellerController.getVerificationStatus);

router.get('/profile', sellerController.getSellerProfile);
router.put('/profile', 
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  sellerController.updateSellerProfile
);

export default router;
