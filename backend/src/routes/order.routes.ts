import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/create', orderController.createOrder);
router.post('/payment/callback', orderController.handlePaymentCallback); // Mock callback

router.get('/my-orders', orderController.getMyOrders);
router.get('/seller-orders', orderController.getSellerOrders);

router.put('/:id/ship', orderController.markAsShipped);
router.put('/:id/confirm-delivery', orderController.confirmDelivery);
router.post('/:id/submit-proof', orderController.submitPaymentProof);
router.put('/:id/admin-confirm', upload.single('receiptImage'), orderController.adminConfirmPayment);
router.get('/:id', orderController.getOrderById);

export default router;
