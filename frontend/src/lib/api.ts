import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api',
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

// Response Interceptor: Handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn(`[API SECURITY] ${error.response.status} Error:`, error.response.data);
      console.warn("Details:", error.response.data?.error || "Unknown security rejection");
    }
    return Promise.reject(error);
  }
);

export default api;
export const authApi = api;
export const productsApi = api;
export const sellerApi = api;
export const ordersApi = api;
export const payoutsApi = api;
export const notificationsApi = api;
export const adminApi = api;
