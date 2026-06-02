'use client';
 
import CartDrawer from '@/components/layout/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Toaster } from 'sonner';
import { useSettingsStore } from '@/lib/settingsStore';
import { useAuthStore } from '@/lib/authStore';
import { useEffect } from 'react';
 
export default function Providers({ children }) {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const isLoading = useAuthStore((state) => state.isLoading);
 
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
 
  return (
    <>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[4px] transition-all">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#fbf9f4]/95 px-8 py-6 shadow-botanical-hover border border-[#4e635a]/10 max-w-[200px]">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#4e635a]/20 border-t-[#4e635a]" />
            <p className="mt-4 font-body text-[10px] font-bold uppercase tracking-widest text-[#4e635a]">
              Please wait
            </p>
          </div>
        </div>
      )}
      <CartDrawer />
      <AuthModal />
      <ConfirmModal />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'font-body rounded-2xl border bg-surface text-charcoal shadow-botanical p-4 flex items-center gap-3',
          style: {
            fontFamily: 'Inter, sans-serif',
            backgroundColor: '#fbf9f4',
            color: '#1b1c19',
            borderColor: 'rgba(78, 99, 90, 0.15)',
          },
          success: {
            style: {
              borderLeft: '4px solid #4e635a',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #ba1a1a',
            },
          },
        }}
      />
    </>
  );
}
