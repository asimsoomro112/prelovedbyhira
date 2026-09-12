import type { NextFunction, Response } from "express";
import { db } from "../config/firebase.config";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { sendSupportReplyEmail } from "../services/email.service";
import { NotificationService } from "../services/notification.service";

export const sendMessage = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user) throw new AppError("Unauthorized", 401);
		const { text } = req.body;
		if (!text) throw new AppError("Message text is required", 400);

		const messageData = {
			senderId: req.user.id,
			senderName: req.user.name,
			senderRole: req.user.role,
			receiverId: "ADMIN", // Fixed receiver for support chat
			text,
			timestamp: new Date().toISOString(),
			read: false,
		};

		const chatRef = db.collection("support_chats").doc(req.user.id);
		await chatRef.collection("messages").add(messageData);

		// Update last message in main doc for listing
		await chatRef.set(
			{
				userId: req.user.id,
				userName: req.user.name,
				userRole: req.user.role,
				lastMessage: text,
				updatedAt: new Date().toISOString(),
				unreadCount: 0, // Reset or increment based on logic
			},
			{ merge: true },
		);

		// 🔔 Notify Admin
		await NotificationService.create({
			userId: "ADMIN", // Or a specific admin ID if available
			title: "New Support Message",
			message: `${req.user.name} sent a message: "${text.substring(0, 50)}..."`,
			type: "SUPPORT_MESSAGE",
		});

		res.status(201).json({ message: "Message sent successfully" });
	} catch (error) {
		next(error);
	}
};

export const getMessages = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user) throw new AppError("Unauthorized", 401);

		// Users only see their own chat with Admin
		const chatRef = db.collection("support_chats").doc(req.user.id);
		const messagesSnap = await chatRef
			.collection("messages")
			.orderBy("timestamp", "asc")
			.limit(100)
			.get();

		const messages = messagesSnap.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		res.json({ messages });
	} catch (error) {
		next(error);
	}
};

export const getAdminChats = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || req.user.role !== "ADMIN")
			throw new AppError("Unauthorized", 401);

		// Fetch all unique chat documents
		const chatsSnap = await db
			.collection("support_chats")
			.orderBy("updatedAt", "desc")
			.get();
		const chats = chatsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

		res.json({ chats });
	} catch (error) {
		next(error);
	}
};

export const getAdminMessages = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || req.user.role !== "ADMIN")
			throw new AppError("Unauthorized", 401);
		const userId = req.params.userId as string;

		const chatRef = db.collection("support_chats").doc(userId);
		const messagesSnap = await chatRef
			.collection("messages")
			.orderBy("timestamp", "asc")
			.get();

		const messages = messagesSnap.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		res.json({ messages });
	} catch (error) {
		next(error);
	}
};

export const adminSendMessage = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user || req.user.role !== "ADMIN")
			throw new AppError("Unauthorized", 401);
		const userId = req.params.userId as string;
		const { text } = req.body;

		const messageData = {
			senderId: req.user.id,
			senderName: "Neural Concierge (Admin)",
			senderRole: "ADMIN",
			receiverId: userId,
			text,
			timestamp: new Date().toISOString(),
			read: false,
		};

		const chatRef = db.collection("support_chats").doc(userId);
		await chatRef.collection("messages").add(messageData);

		await chatRef.set(
			{
				lastMessage: text,
				updatedAt: new Date().toISOString(),
				adminUnread: true,
			},
			{ merge: true },
		);

		// 🔔 Notify User
		await NotificationService.create({
			userId,
			title: "New Support Reply",
			message: `Admin replied: "${text.substring(0, 50)}..."`,
			type: "SUPPORT_REPLY",
		});

		// 📧 Send Email to User
		try {
			const userDoc = await db.collection("users").doc(userId).get();
			if (userDoc.exists) {
				const userData = userDoc.data();
				if (userData?.email) {
					await sendSupportReplyEmail(
						userData.email,
						userData.name || "Valued User",
						text,
					);
				}
			}
		} catch (emailErr) {
			console.error("Failed to send support email:", emailErr);
		}

		res.status(201).json({ message: "Message sent successfully" });
	} catch (error) {
		next(error);
	}
};
