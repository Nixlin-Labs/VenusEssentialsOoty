import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import adminApi from '@/lib/api';

const useAdminAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: (() => {
        if (typeof window === 'undefined') return false;
        try {
          const item = sessionStorage.getItem('venus-admin-auth');
          if (!item) return false;
          const parsed = JSON.parse(item);
          return !!parsed.state?.isAuthenticated;
        } catch (e) {
          return false;
        }
      })(),
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      checkAuth: async () => {
        try {
          const { data } = await adminApi.get('/auth/me');
          set({ user: data.data.user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await adminApi.post('/auth/admin/login', { email, password });
          const { user, accessToken, refreshToken } = data.data;
          sessionStorage.setItem('venus_admin_token', accessToken);
          sessionStorage.setItem('venus_admin_refresh', refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
      },

      logout: () => {
        sessionStorage.removeItem('venus_admin_token');
        sessionStorage.removeItem('venus_admin_refresh');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'venus-admin-auth',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => sessionStorage) : undefined,
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAdminAuthStore;
