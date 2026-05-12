import { prisma } from '../lib/prisma';
import { NotificationType } from '@prisma/client';
import { Server } from 'socket.io';
import { emitToUser } from './socket.service';

export class NotificationService {
  static async create({
    userId,
    title,
    message,
    type,
    io,
  }: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    io?: Server;
  }) {
    // 1. Save to Database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    // 2. Emit via Socket.io
    if (io) {
      emitToUser(io, userId, 'notification', notification);
    }

    return notification;
  }
}
