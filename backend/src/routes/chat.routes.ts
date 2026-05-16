import { Router } from 'express';
import { sendMessage, getMessages, getAdminChats, getAdminMessages, adminSendMessage } from '../controllers/chat.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/send', authenticate, sendMessage);
router.get('/messages', authenticate, getMessages);

// Admin Routes
router.get('/admin/chats', authenticate, authorize('ADMIN'), getAdminChats);
router.get('/admin/chats/:userId', authenticate, authorize('ADMIN'), getAdminMessages);
router.post('/admin/chats/:userId/send', authenticate, authorize('ADMIN'), adminSendMessage);

export default router;
