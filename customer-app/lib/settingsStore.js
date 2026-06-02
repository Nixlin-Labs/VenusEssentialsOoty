import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useSettingsStore = create((set) => ({
  settings: null,
  loading: true,
  fetchSettings: async () => {
    try {
      // The public settings API might not exist yet, let's use a generic public endpoint or the same admin endpoint if it's public? 
      // Wait, is there a public settings API? Let's check backend routes.
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      // console.log(data);
      
      if (res.ok && data.data) {
        set({ settings: data.data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false });
    }
  },
}));
