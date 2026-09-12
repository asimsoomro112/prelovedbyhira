import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
	id: string;
	name: string;
	email: string;
	role: "ADMIN" | "SELLER" | "CUSTOMER" | string;
	avatar?: string;
	phone?: string;
	city?: string;
	address?: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	setAuth: (user: User, token: string) => void;
	setUser: (user: User) => void;
	updateToken: (token: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
			setUser: (user) => set({ user }),
			updateToken: (token) => set({ token }),
			logout: () => {
				set({ user: null, token: null, isAuthenticated: false });
				localStorage.removeItem("auth-storage");
			},
		}),
		{ name: "auth-storage" },
	),
);
