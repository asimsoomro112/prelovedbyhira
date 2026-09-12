// 🛡️ REVAULT 2026: Socket.io disabled in favor of Firestore Listeners
// We return a mock socket object to prevent connection errors while keeping code compatible.

class MockSocket {
	connected = false;
	auth = {};
	on() {
		return this;
	}
	off() {
		return this;
	}
	emit() {
		return this;
	}
	connect() {
		console.log(
			"📡 [ReVault Neural] Socket Connection Suppressed (Using Firestore Listeners)",
		);
		return this;
	}
	disconnect() {
		return this;
	}
}

let socket: any = null;

export const getSocket = (_token?: string) => {
	if (!socket && typeof window !== "undefined") {
		// Return a mock instead of a real io() instance
		socket = new MockSocket();
	}
	return socket;
};

export const connectSocket = (_token: string) => {
	// Suppressed
	return;
};

export const disconnectSocket = () => {
	socket = null;
};
