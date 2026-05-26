import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { encryptedStorage } from '@/lib/storage';
import api from '@/lib/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isCartOpen: false,
      isSyncing: false,

      // Open/close cart drawer
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),

      // Total items count
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Add item (for both guest and authenticated)
      addItem: async (product, variant, quantity = 1, isAuthenticated = false) => {
        if (isAuthenticated) {
          try {
            const { data } = await api.post('/cart/add', {
              productId: product._id,
              variantId: variant._id,
              quantity,
            });
            set({ items: data.data.items || [] });
            return { success: true };
          } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to add to cart' };
          }
        }

        // Guest mode — local state
        const items = [...get().items];
        const existingIndex = items.findIndex((i) => i.variant?._id === variant._id || i.variantId === variant._id);

        if (existingIndex > -1) {
          items[existingIndex].quantity = Math.min(items[existingIndex].quantity + quantity, 10, variant.stock);
        } else {
          items.push({
            product: { _id: product._id, name: product.name, slug: product.slug, images: product.images },
            variant: { _id: variant._id, name: variant.name, sku: variant.sku, price: variant.price, offerPrice: variant.offerPrice, stock: variant.stock, weight: variant.weight },
            productId: product._id,
            variantId: variant._id,
            quantity: Math.min(quantity, variant.stock, 10),
          });
        }

        set({ items });
        return { success: true };
      },

      // Update item quantity
      updateQuantity: async (variantId, quantity, isAuthenticated = false) => {
        if (isAuthenticated) {
          try {
            const { data } = await api.put('/cart/update', { variantId, quantity });
            set({ items: data.data.items || [] });
            return { success: true };
          } catch (error) {
            return { success: false, error: error.response?.data?.message };
          }
        }

        const items = get().items.map((item) => {
          const id = item.variant?._id || item.variantId;
          if (id === variantId) return { ...item, quantity };
          return item;
        });
        set({ items });
        return { success: true };
      },

      // Remove item
      removeItem: async (variantId, isAuthenticated = false) => {
        if (isAuthenticated) {
          try {
            const { data } = await api.delete(`/cart/remove/${variantId}`);
            set({ items: data.data.items || [] });
            return { success: true };
          } catch (error) {
            return { success: false, error: error.response?.data?.message };
          }
        }

        const items = get().items.filter((item) => {
          const id = item.variant?._id || item.variantId;
          return id !== variantId;
        });
        set({ items });
        return { success: true };
      },

      // Clear cart
      clearCart: async (isAuthenticated = false) => {
        if (isAuthenticated) {
          try {
            await api.delete('/cart/clear');
          } catch {
            // Silent
          }
        }
        set({ items: [], coupon: null });
      },

      // Sync guest cart to user on login
      syncCartOnLogin: async () => {
        const { items } = get();
        if (items.length === 0) {
          // Fetch server cart
          try {
            const { data } = await api.get('/cart');
            set({ items: data.data.items || [], isSyncing: false });
          } catch {
            set({ isSyncing: false });
          }
          return;
        }

        set({ isSyncing: true });
        try {
          const syncItems = items.map((item) => ({
            productId: item.product?._id || item.productId,
            variantId: item.variant?._id || item.variantId,
            quantity: item.quantity,
          }));
          const { data } = await api.post('/cart/sync', { items: syncItems });
          set({ items: data.data.items || [], isSyncing: false });
        } catch {
          set({ isSyncing: false });
        }
      },

      // Calculate subtotal
      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const variant = item.variant || {};
          const effectivePrice = variant.offerPrice && variant.offerPrice < variant.price
            ? variant.offerPrice : (variant.price || 0);
          return sum + effectivePrice * item.quantity;
        }, 0);
      },

      // Get items count
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'venus-cart',
      storage: encryptedStorage,
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);

export default useCartStore;
