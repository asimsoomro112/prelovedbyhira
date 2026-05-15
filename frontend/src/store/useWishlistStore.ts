import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  title: string;
  brand: string;
  sellingPrice: number;
  images: string[];
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      toggleItem: (item) => {
        const isWishlisted = get().items.some((i) => i.id === item.id);
        if (isWishlisted) {
          get().removeItem(item.id);
        } else {
          get().addItem(item);
        }
      },
      isWishlisted: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'wishlist-storage' }
  )
);
