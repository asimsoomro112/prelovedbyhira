import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const getBaseUrl = () => {
	if (typeof window !== 'undefined') {
		if (window.location.hostname !== 'localhost') return '/api';
		return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
	}
	return process.env.NEXT_PUBLIC_BACKEND_URL || "https://revaultx.vercel.app/api";
};

const api = axios.create({
	baseURL: getBaseUrl(),
	withCredentials: true,
});

// Request Interceptor: Always attach the latest token from Zustand store
api.interceptors.request.use((config) => {
	const token = useAuthStore.getState().token;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// 🛡️ FIX C-07: Auto-refresh Firebase token on 401 responses
// Firebase ID tokens expire after 1 hour. This interceptor transparently
// refreshes the token and retries the failed request.
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) reject(error);
		else resolve(token!);
	});
	failedQueue = [];
};

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Only attempt refresh on 401 (not 403), and only once per request
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			// If already refreshing, queue this request
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({
						resolve: (token: string) => {
							originalRequest.headers.Authorization = `Bearer ${token}`;
							resolve(api(originalRequest));
						},
						reject,
					});
				});
			}

			isRefreshing = true;

			try {
				// Dynamically import to avoid circular dependency and SSR issues
				const { auth: firebaseAuth } = await import("@/lib/firebase");
				const currentUser = firebaseAuth.currentUser;

				if (currentUser) {
					const newToken = await currentUser.getIdToken(true); // force refresh
					useAuthStore.getState().updateToken(newToken);
					processQueue(null, newToken);

					// Retry original request with new token
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return api(originalRequest);
				} else {
					// No Firebase user — force logout
					processQueue(error);
					useAuthStore.getState().logout();
					if (typeof window !== "undefined") window.location.href = "/login";
				}
			} catch (refreshError) {
				// Token refresh failed entirely — force logout
				processQueue(refreshError);
				useAuthStore.getState().logout();
				if (typeof window !== "undefined") window.location.href = "/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// For 403 or other errors, just log and reject
		if (error.response?.status === 403) {
			console.warn(`[API SECURITY] 403 Forbidden:`, error.response.data);
		}

		return Promise.reject(error);
	},
);

export default api;
export const authApi = api;
export const productsApi = api;
export const sellerApi = api;
export const ordersApi = api;
export const payoutsApi = api;
export const notificationsApi = api;
export const adminApi = api;
