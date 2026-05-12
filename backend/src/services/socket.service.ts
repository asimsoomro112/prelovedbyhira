import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupSocketHandlers = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user-${userId}`);
    console.log(`User connected to socket: ${userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${userId}`);
    });
  });
};

export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(`user-${userId}`).emit(event, data);
};
