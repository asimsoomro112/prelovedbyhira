import type { NextFunction, Response } from "express";
import { db } from "../config/firebase.config";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export const getNotifications = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = req.user?.id;
		const isAdmin = req.user?.role === "ADMIN";

		// Fetch notifications for the user. If admin, also fetch global 'ADMIN' notifications.
		const userIds = isAdmin ? [userId, "ADMIN"] : [userId];

		const snapshot = await db
			.collection("notifications")
			.where("userId", "in", userIds)
			.limit(50)
			.get();

		const notifications = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		// Manual sort to avoid composite index requirement
		notifications.sort((a: any, b: any) => {
			const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return dateB - dateA;
		});

		res.json(notifications.slice(0, 20));
	} catch (error) {
		next(error);
	}
};

export const markAsRead = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = req.params.id as string;
		const userId = req.user?.id;

		// 🛡️ SECURITY: Verify ownership before marking as read
		const notifDoc = await db.collection("notifications").doc(id).get();
		const notifData = notifDoc.data();

		if (
			!notifDoc.exists ||
			(notifData?.userId !== userId && notifData?.userId !== "ADMIN")
		) {
			throw new AppError("Notification not found", 404);
		}

		await db.collection("notifications").doc(id).update({
			isRead: true,
			updatedAt: new Date().toISOString(),
		});
		res.json({ message: "Marked as read" });
	} catch (error) {
		next(error);
	}
};

export const markAllAsRead = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = req.user?.id;
		const isAdmin = req.user?.role === "ADMIN";
		const userIds = isAdmin ? [userId, "ADMIN"] : [userId];

		const batch = db.batch();
		const snapshot = await db
			.collection("notifications")
			.where("userId", "in", userIds)
			.where("isRead", "==", false)
			.get();

		snapshot.docs.forEach((doc) => {
			batch.update(doc.ref, {
				isRead: true,
				updatedAt: new Date().toISOString(),
			});
		});

		await batch.commit();
		res.json({ message: "All notifications marked as read" });
	} catch (error) {
		next(error);
	}
};

export const getUnreadCount = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = req.user?.id;
		const isAdmin = req.user?.role === "ADMIN";
		const userIds = isAdmin ? [userId, "ADMIN"] : [userId];

		const snapshot = await db
			.collection("notifications")
			.where("userId", "in", userIds)
			.where("isRead", "==", false)
			.count()
			.get();

		res.json({ count: snapshot.data().count });
	} catch (error) {
		next(error);
	}
};
