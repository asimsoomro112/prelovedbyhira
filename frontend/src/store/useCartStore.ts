import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { useAuthStore } from './useAuthStore';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    sellingPrice: number;
    images: string[];
    sellerId: string;
    seller: { user: { name: string } };
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (product: any, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncGuestCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,

      fetchCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        set({ isLoading: true });
        try {
          const { data } = await api.get('/cart');
          set({ items: data.items, total: data.total, itemCount: data.itemCount, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addItem: async (product, quantity = 1) => {
        const { isAuthenticated } = useAuthStore.getState();
        const productId = typeof product === 'string' ? product : product.id;

        if (isAuthenticated) {
          await api.post('/cart/add', { productId, quantity });
          const { data } = await api.get('/cart');
          set({ items: data.items, total: data.total, itemCount: data.itemCount });
        } else {
          // Guest Logic
          const currentItems = get().items;
          const existingItem = currentItems.find(item => item.productId === productId);
          
          let newItems;
          if (existingItem) {
            newItems = currentItems.map(item => 
              item.productId === productId 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            const newItem: CartItem = {
              id: `guest_${crypto.randomUUID()}`,
              productId,
              quantity,
              product: product
            };
            newItems = [...currentItems, newItem];
          }

          const total = newItems.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
          const itemCount = newItems.reduce((acc, item) => acc + item.quantity, 0);
          set({ items: newItems, total, itemCount });
        }
      },

      updateItem: async (itemId, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          await api.put(`/cart/item/${itemId}`, { quantity });
          const { data } = await api.get('/cart');
          set({ items: data.items, total: data.total, itemCount: data.itemCount });
        } else {
          const newItems = get().items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          );
          const total = newItems.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
          const itemCount = newItems.reduce((acc, item) => acc + item.quantity, 0);
          set({ items: newItems, total, itemCount });
        }
      },

      removeItem: async (itemId) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          await api.delete(`/cart/item/${itemId}`);
          const { data } = await api.get('/cart');
          set({ items: data.items, total: data.total, itemCount: data.itemCount });
        } else {
          const newItems = get().items.filter(item => item.id !== itemId);
          const total = newItems.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
          const itemCount = newItems.reduce((acc, item) => acc + item.quantity, 0);
          set({ items: newItems, total, itemCount });
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          await api.delete('/cart/clear');
        }
        set({ items: [], total: 0, itemCount: 0 });
      },

      syncGuestCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        const guestItems = get().items.filter(item => item.id.startsWith('guest_'));
        if (guestItems.length === 0) {
          // If no guest items, just fetch the existing backend cart
          const { data } = await api.get('/cart');
          set({ items: data.items, total: data.total, itemCount: data.itemCount });
          return;
        }

        try {
          // Sync each guest item to backend
          for (const item of guestItems) {
            await api.post('/cart/add', { productId: item.productId, quantity: item.quantity });
          }
          // Fetch final merged cart
          const { data } = await api.get('/cart');
          set({ items: data.items, total: data.total, itemCount: data.itemCount });
        } catch (error) {
          console.error("Cart sync failed:", error);
        }
      },
    }),
    { name: 'cart-storage' }
  )
);
