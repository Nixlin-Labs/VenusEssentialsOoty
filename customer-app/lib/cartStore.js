'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { defaultCartItems } from './data';

export const useCart = create()(
  persist(
    (set, get) => ({
      items: defaultCartItems,
      isOpen: false,
      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.variant === item.variant
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
            isOpen: true,
          }));
          return;
        }
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              id: `cart-${Date.now()}`,
              quantity: item.quantity || 1,
            },
          ],
          isOpen: true,
        }));
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },
      updateQty: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },
      updateVariant: (id, variant) => {
        const itemToUpdate = get().items.find((i) => i.id === id);
        if (!itemToUpdate) return;
        const existing = get().items.find(
          (i) => i.id !== id && i.productId === itemToUpdate.productId && i.variant === variant
        );
        if (existing) {
          set((state) => ({
            items: state.items
              .map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + itemToUpdate.quantity }
                  : i
              )
              .filter((i) => i.id !== id),
          }));
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, variant } : i
            ),
          }));
        }
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'venus-cart-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
