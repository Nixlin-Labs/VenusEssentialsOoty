'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      openAuthModal('login');
      router.replace('/');
    }
  }, [hasHydrated, isAuthenticated, openAuthModal, router]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return children;
}
