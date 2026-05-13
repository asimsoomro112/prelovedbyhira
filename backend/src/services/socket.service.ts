import { Server } from 'socket.io';
import { auth } from '../config/firebase.config';

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      // Verify Firebase ID token (matching the REST API auth)
      const decodedToken = await auth.verifyIdToken(token);
      socket.data.userId = decodedToken.uid;
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
