'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from './api';

const mapBackendAddress = (addr) => ({
  id: addr._id || addr.id,
  label: addr.type ? (addr.type.charAt(0).toUpperCase() + addr.type.slice(1)) : 'Home',
  fullName: addr.fullName,
  mobile: addr.phone,
  line1: addr.addressLine1,
  line2: addr.addressLine2 || '',
  city: addr.city,
  state: addr.state,
  pincode: addr.pincode,
  country: 'India',
  isDefault: addr.isDefault
});

const mapFrontendAddress = (addr) => ({
  fullName: addr.fullName,
  phone: addr.mobile,
  addressLine1: addr.line1,
  addressLine2: addr.line2 || '',
  city: addr.city,
  state: addr.state,
  pincode: addr.pincode,
  type: ['home', 'office', 'other'].includes(addr.label?.toLowerCase()) ? addr.label.toLowerCase() : 'home',
  isDefault: addr.isDefault || false
});

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
      hasHydrated: false,

      setHasHydrated: (val) => set({ hasHydrated: val }),
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
            document.cookie = `venus_access_token=${accessToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
            document.cookie = `venus_refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
          }
          set({
            isAuthenticated: true,
            user,
            authModalOpen: false,
            authMode: 'login',
            isLoading: false,
          });
          await get().fetchAddresses();
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
          document.cookie = "venus_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "venus_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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

      fetchAddresses: async () => {
        const state = get();
        if (!state.isAuthenticated) return;
        try {
          const { data } = await api.get('/addresses');
          const addresses = (data.data || []).map(mapBackendAddress);
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          set({
            addresses,
            selectedAddressId: state.selectedAddressId || defaultAddr?.id || null
          });
        } catch (error) {
          console.error("Failed to fetch addresses:", error);
        }
      },

      addAddress: async (address) => {
        set({ isLoading: true });
        try {
          const payload = mapFrontendAddress(address);
          const { data } = await api.post('/addresses', payload);
          set({ isLoading: false });
          await get().fetchAddresses();
          if (data.data?._id) {
            set({ selectedAddressId: data.data._id });
          }
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false };
        }
      },

      updateAddress: async (id, updates) => {
        set({ isLoading: true });
        try {
          const payload = mapFrontendAddress(updates);
          await api.put(`/addresses/${id}`, payload);
          set({ isLoading: false });
          await get().fetchAddresses();
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false };
        }
      },

      deleteAddress: async (id) => {
        set({ isLoading: true });
        try {
          await api.delete(`/addresses/${id}`);
          set({ isLoading: false });
          await get().fetchAddresses();
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false };
        }
      },

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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.isAuthenticated) {
          state.fetchAddresses();
        }
      },
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
