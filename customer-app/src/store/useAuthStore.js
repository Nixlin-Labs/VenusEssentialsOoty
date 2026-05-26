import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = data.data;
          localStorage.setItem('venus_access_token', accessToken);
          localStorage.setItem('venus_refresh_token', refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true, data };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
      },

      register: async (name, email, phone, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, phone, password });
          set({ isLoading: false });
          return { success: true, data, email };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
      },

      verifyOTP: async (email, otp) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/verify-otp', { email, otp });
          const { user, accessToken, refreshToken } = data.data;
          localStorage.setItem('venus_access_token', accessToken);
          localStorage.setItem('venus_refresh_token', refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'OTP verification failed' };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Silent fail
        }
        localStorage.removeItem('venus_access_token');
        localStorage.removeItem('venus_refresh_token');
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (data) => {
        try {
          const res = await api.put('/auth/profile', data);
          set({ user: res.data.data.user });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      fetchProfile: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'venus-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
