import { create } from 'zustand';
import api from '@/lib/api';

export const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/wishlist');
      set({ items: data.data || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      set({ items: data.data.wishlist || [] });
      return { success: true, action: data.data.action };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((id) => (typeof id === 'string' ? id : id._id) === productId);
  },
}));
