import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, notificationController.getNotifications);
router.put(
	"/mark-all-read",
	authenticate,
	notificationController.markAllAsRead,
);
router.put("/:id/read", authenticate, notificationController.markAsRead);
router.get(
	"/unread-count",
	authenticate,
	notificationController.getUnreadCount,
);

export default router;
