import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', adminController.getDashboardStats);

router.get('/sellers', adminController.listSellers);
router.get('/sellers/:id', adminController.getSellerDetail);
router.put('/sellers/:id/approve', adminController.approveSeller);
router.put('/sellers/:id/reject', adminController.rejectSeller);

router.get('/payouts', adminController.listPayouts);
router.put('/payouts/:id', upload.single('proofImage'), adminController.updatePayoutStatus);

router.get('/users', adminController.listUsers);
router.put('/users/:id/toggle', adminController.toggleUserStatus);

router.get('/products', adminController.listProducts);
router.delete('/products/:id', adminController.deleteProduct);

router.get('/orders', adminController.listOrders);

router.get('/disputes', adminController.listDisputes);

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;
