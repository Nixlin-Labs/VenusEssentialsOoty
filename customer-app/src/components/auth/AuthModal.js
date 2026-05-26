'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import useAuthStore from '@/store/useAuthStore';
import useUIStore from '@/store/useUIStore';
import useCartStore from '@/store/useCartStore';

export default function AuthModal() {
  const { login, register, verifyOTP, isLoading } = useAuthStore();
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthMode } = useUIStore();
  const { syncCartOnLogin } = useCartStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', otp: '' });
  const [otpEmail, setOtpEmail] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success('Welcome back!');
      closeAuthModal();
      syncCartOnLogin();
    } else if (result.error?.includes('not verified')) {
      setOtpEmail(formData.email);
      setAuthMode('otp');
    } else {
      toast.error(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register(formData.name, formData.email, formData.phone, formData.password);
    if (result.success) {
      toast.success('Account created! Check your email for verification code.');
      setOtpEmail(formData.email);
      setAuthMode('otp');
    } else {
      toast.error(result.error);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const result = await verifyOTP(otpEmail, formData.otp);
    if (result.success) {
      toast.success('Email verified! Welcome to Venus Essentials.');
      closeAuthModal();
      syncCartOnLogin();
    } else {
      toast.error(result.error);
    }
  };

  const renderForm = () => {
    switch (authModalMode) {
      case 'login':
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label block mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" placeholder="your@email.com" required id="login-email" />
            </div>
            <div>
              <label className="label block mb-1.5">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" placeholder="••••••••" required id="login-password" />
            </div>
            <button type="button" onClick={() => setAuthMode('forgot')} className="text-sm text-forest-700 hover:text-forest-900 font-medium">
              Forgot password?
            </button>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading} id="login-submit">
              {isLoading ? <span className="spinner" /> : 'Sign In'}
            </button>
            <p className="text-center text-sm text-muted">
              Don't have an account?{' '}
              <button type="button" onClick={() => setAuthMode('register')} className="text-forest-700 font-semibold hover:text-forest-900">
                Create one
              </button>
            </p>
          </form>
        );

      case 'register':
        return (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label block mb-1.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" placeholder="Your Name" required id="register-name" />
            </div>
            <div>
              <label className="label block mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" placeholder="your@email.com" required id="register-email" />
            </div>
            <div>
              <label className="label block mb-1.5">Mobile Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input" placeholder="9876543210" pattern="[6-9][0-9]{9}" required id="register-phone" />
            </div>
            <div>
              <label className="label block mb-1.5">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" placeholder="Min 8 characters" minLength={8} required id="register-password" />
              <p className="text-xs text-muted mt-1">Must include uppercase, lowercase, number, and special character</p>
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading} id="register-submit">
              {isLoading ? <span className="spinner" /> : 'Create Account'}
            </button>
            <p className="text-center text-sm text-muted">
              Already have an account?{' '}
              <button type="button" onClick={() => setAuthMode('login')} className="text-forest-700 font-semibold hover:text-forest-900">
                Sign in
              </button>
            </p>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-forest-50 rounded-full mx-auto flex items-center justify-center mb-3">
                <span className="text-2xl">📧</span>
              </div>
              <p className="text-sm text-charcoal-700">Enter the 6-digit code sent to</p>
              <p className="text-sm font-semibold text-forest-800">{otpEmail}</p>
            </div>
            <div>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="input text-center text-2xl tracking-[0.5em] font-bold"
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                id="otp-input"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading} id="otp-submit">
              {isLoading ? <span className="spinner" /> : 'Verify Email'}
            </button>
          </form>
        );

      case 'forgot':
        return (
          <form onSubmit={(e) => { e.preventDefault(); toast.info('Reset email sent (check console in dev mode)'); setAuthMode('login'); }} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-charcoal-700">Enter your email and we'll send a password reset code.</p>
            </div>
            <div>
              <label className="label block mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required id="forgot-email" />
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg">Send Reset Code</button>
            <button type="button" onClick={() => setAuthMode('login')} className="btn btn-ghost w-full">Back to Sign In</button>
          </form>
        );

      default:
        return null;
    }
  };

  const titles = { login: 'Welcome Back', register: 'Create Account', otp: 'Verify Email', forgot: 'Reset Password' };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[300]" onClick={closeAuthModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[301] flex items-center justify-center p-4"
          >
            <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden" id="auth-modal">
              {/* Header */}
              <div className="bg-forest-800 px-8 py-6 text-center relative">
                <button onClick={closeAuthModal} className="absolute right-4 top-4 text-forest-300 hover:text-white transition-colors">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="font-display text-2xl font-bold text-white">{titles[authModalMode]}</h2>
                <p className="text-forest-300 text-sm mt-1">Venus Essentials</p>
              </div>

              {/* Form */}
              <div className="p-8">
                {renderForm()}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
