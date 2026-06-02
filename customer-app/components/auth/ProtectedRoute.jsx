'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
      router.replace('/');
    }
  }, [isAuthenticated, openAuthModal, router]);

  if (!isAuthenticated) return null;
  return children;
}
