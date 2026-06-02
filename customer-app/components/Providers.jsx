'use client';

import CartDrawer from '@/components/layout/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';
import { useSettingsStore } from '@/lib/settingsStore';
import { useEffect } from 'react';

export default function Providers({ children }) {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <>
      {children}
      <CartDrawer />
      <AuthModal />
    </>
  );
}
