import { db } from '../config/firebase.config';

export class NotificationService {
  static async create({
    userId,
    title,
    message,
    type,
  }: {
    userId: string;
    title: string;
    message: string;
    type: string;
    io?: any; // kept for API compat but not used (Firestore listeners replace socket.io)
  }) {
    // Save to Firestore
    const notifRef = db.collection('notifications').doc();
    const notification = {
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await notifRef.set(notification);

    return { id: notifRef.id, ...notification };
  }
}
