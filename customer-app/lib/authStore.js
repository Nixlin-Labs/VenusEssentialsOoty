'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from './api';

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      authModalOpen: false,
      authMode: 'login',
      addresses: [],
      selectedAddressId: null,
      orders: [],
      isLoading: false,

      openAuthModal: (mode = 'login') => set({ authModalOpen: true, authMode: mode }),
      closeAuthModal: () => set({ authModalOpen: false }),
      setAuthMode: (mode) => set({ authMode: mode }),

      login: async ({ emailOrMobile, password }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email: emailOrMobile, password });
          const { user, accessToken, refreshToken } = data.data;
          if (typeof window !== 'undefined') {
            localStorage.setItem('venus_access_token', accessToken);
            localStorage.setItem('venus_refresh_token', refreshToken);
          }
          set({
            isAuthenticated: true,
            user,
            authModalOpen: false,
            authMode: 'login',
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      register: async ({ name, email, mobile, password }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, phone: mobile, password });
          set({ isLoading: false });
          return { ok: true, data };
        } catch (error) {
          set({ isLoading: false });
          return { ok: false, message: error.response?.data?.message || 'Registration failed' };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // silent fail
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('venus_access_token');
          localStorage.removeItem('venus_refresh_token');
        }
        set({
          isAuthenticated: false,
          user: null,
          selectedAddressId: null,
          addresses: [],
          orders: []
        });
      },

      updateProfile: async (payload) => {
        try {
          const res = await api.put('/auth/profile', payload);
          set((state) => ({ user: res.data.data.user }));
          return { success: true };
        } catch (error) {
          return { success: false };
        }
      },

      // Fallbacks for now, should ideally be migrated to backend APIs if endpoints exist
      addAddress: (address) =>
        set((state) => {
          const id = `addr-${Date.now()}`;
          return {
            addresses: [...state.addresses, { ...address, id }],
            selectedAddressId: id,
          };
        }),
      updateAddress: (id, updates) =>
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
      deleteAddress: (id) =>
        set((state) => {
          const remaining = state.addresses.filter((a) => a.id !== id);
          const fallback = remaining[0]?.id || '';
          return {
            addresses: remaining,
            selectedAddressId:
              state.selectedAddressId === id ? fallback : state.selectedAddressId,
          };
        }),
      selectAddress: (id) => set({ selectedAddressId: id }),
      
      placeOrder: ({ items, subtotal, shipping = 150 }) => {
        const state = get();
        const selectedAddress = state.addresses.find((a) => a.id === state.selectedAddressId);
        if (!selectedAddress || !items.length) return null;
        const order = {
          id: `ORD-${Date.now()}`,
          createdAt: new Date().toISOString(),
          items,
          address: selectedAddress,
          subtotal,
          shipping,
          total: subtotal + shipping,
          status: 'Confirmed',
        };
        set((prev) => ({ orders: [order, ...prev.orders] }));
        return order;
      },
    }),
    {
      name: 'venus-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
        orders: state.orders,
      }),
    }
  )
);
