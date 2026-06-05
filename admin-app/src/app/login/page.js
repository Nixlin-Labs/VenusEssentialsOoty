'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import useAdminAuthStore from '@/store/useAdminAuthStore';
import { Router } from 'next/router';

export default function AdminLoginPage() {
  const { login, isLoading } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome to Venus Admin');
      window.location.href = '/';
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-forest-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-forest-700 rounded-2xl">
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>V</span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>Venus Essentials</h1>
          <p className="mt-1 text-sm text-forest-300">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 admin-card" id="admin-login-form">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" placeholder="admin@venusessentials.com" required id="admin-email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="admin-input" placeholder="••••••••" required id="admin-password" />
          </div>
          <button type="submit" className="w-full py-3 admin-btn admin-btn-primary" disabled={isLoading} id="admin-login-btn">
            {isLoading ? <span className="spinner" /> : 'Sign In to Admin'}
          </button>
          <p className="mt-4 text-xs text-center text-charcoal-500">
            Default: admin@venusessentials.com / Admin@1234
          </p>
        </form>
      </div>
    </div>
  );
}
