import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token?: string) => {
  if (!socket && typeof window !== "undefined") {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (token: string) => {
  const s = getSocket(token);
  if (s && !s.connected) {
    s.auth = { token };
    s.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
