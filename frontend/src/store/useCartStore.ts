import { create } from 'zustand';
import api from '@/lib/api';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    sellingPrice: number;
    images: string[];
    seller: { user: { name: string } };
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ items: data.items, total: data.total, itemCount: data.itemCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    await api.post('/cart/add', { productId, quantity });
    const { data } = await api.get('/cart');
    set({ items: data.items, total: data.total, itemCount: data.itemCount });
  },

  updateItem: async (itemId, quantity) => {
    await api.put(`/cart/item/${itemId}`, { quantity });
    const { data } = await api.get('/cart');
    set({ items: data.items, total: data.total, itemCount: data.itemCount });
  },

  removeItem: async (itemId) => {
    await api.delete(`/cart/item/${itemId}`);
    const { data } = await api.get('/cart');
    set({ items: data.items, total: data.total, itemCount: data.itemCount });
  },

  clearCart: async () => {
    await api.delete('/cart/clear');
    set({ items: [], total: 0, itemCount: 0 });
  },
}));
