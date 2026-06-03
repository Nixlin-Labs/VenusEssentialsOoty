'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/lib/authStore';
import { toast } from "sonner";


const initialLogin = { emailOrMobile: '', password: '' };
const initialRegister = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  isVerified: true,
};

function InputField({ label, icon, ...props }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-widest text-outline">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="material-symbols-outlined pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-outline"
            style={{ fontSize: '18px' }}
          >
            {icon}
          </span>
        )}
        <input
          className={`w-full border-0 border-b border-secondary/30 bg-transparent py-3 font-body text-sm text-on-surface outline-none transition-colors placeholder:text-outline-variant focus:border-secondary focus:ring-0 ${icon ? 'pl-7' : 'pl-0'}`}
          {...props}
        />
      </div>
    </div>
  );
}

export default function AuthModal() {
  const { authModalOpen, authMode, closeAuthModal, setAuthMode, login, register } =
    useAuthStore();
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const setL = (key) => (e) => setLoginForm((p) => ({ ...p, [key]: e.target.value }));
  const setR = (key) => (e) => setRegisterForm((p) => ({ ...p, [key]: e.target.value }));

  const handleLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    const ok = await login(loginForm);
    if (!ok) toast.error('Invalid credentials. Please check and try again.');
    else {
      toast.success('Login successful');
      setLoginForm(initialLogin);
      closeAuthModal();
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const result = await register(registerForm);
    if (!result.ok) toast.error(result.message);
    else {
      toast.success('Registration successful');
      setRegisterForm(initialRegister);
      closeAuthModal();
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError('');
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Overlay container for centering and scrolling */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 md:p-6">
            {/* Backdrop (clickable, fixed behind everything) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
              onClick={closeAuthModal}
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl bg-surface shadow-botanical-hover my-auto"
            >
              {/* Top brand strip */}
              <div className="bg-primary px-6 py-5 text-center">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-sand">
                  Venus Ooty Essentials
                </p>
                <h2 className="mt-1 font-display text-2xl text-white">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="mt-1 font-body text-xs text-white/60">
                  {authMode === 'login'
                    ? 'Sign in to access your wellness account'
                    : 'Join the Nilgiri wellness community'}
                </p>
              </div>

              {/* Close button */}
              <button
                type="button"
                aria-label="Close"
                onClick={closeAuthModal}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>

              <div className="p-6">
                {/* Tab switcher */}
                {/* <div className="mb-6 flex rounded-xl border border-outline-variant p-1">
                  {['login', 'register'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => switchMode(mode)}
                      className={`flex-1 rounded-lg py-2 font-body text-sm font-medium transition-all duration-200 ${authMode === mode
                        ? 'bg-primary-container text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-charcoal'
                        }`}
                    >
                      {mode === 'login' ? 'Sign In' : 'Register'}
                    </button>
                  ))}
                </div> */}

                <AnimatePresence mode="wait">
                  {authMode === 'login' ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                      onSubmit={handleLogin}
                    >
                      <InputField
                        label="Email or Mobile"
                        icon="mail"
                        type="text"
                        placeholder="Enter Email or Mobile Number"
                        value={loginForm.emailOrMobile}
                        onChange={setL('emailOrMobile')}
                        autoComplete="username"
                      />
                      <div className="relative">
                        <InputField
                          label="Password"
                          icon="lock"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter Password"
                          value={loginForm.password}
                          onChange={setL('password')}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute bottom-3 right-0 text-outline hover:text-charcoal"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>


                      <button
                        type="submit"
                        className="w-full rounded-xl bg-primary-container py-3.5 font-body text-sm font-medium text-white transition-colors hover:bg-secondary"
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                      onSubmit={handleRegister}
                    >
                      <InputField
                        label="Full Name"
                        icon="person"
                        type="text"
                        placeholder="Your name"
                        value={registerForm.name}
                        onChange={setR('name')}
                      />
                      <InputField
                        label="Email"
                        icon="mail"
                        type="email"
                        placeholder="Enter Email ID"
                        value={registerForm.email}
                        onChange={setR('email')}
                      />
                      <InputField
                        label="Mobile"
                        icon="phone"
                        type="tel"
                        placeholder="Enter Mobile Number"
                        value={registerForm.mobile}
                        onChange={setR('mobile')}
                      />
                      <InputField
                        label="Password"
                        icon="lock"
                        type="password"
                        placeholder="At least 6 characters"
                        value={registerForm.password}
                        onChange={setR('password')}
                      />
                      <InputField
                        label="Confirm Password"
                        icon="lock_reset"
                        type="password"
                        placeholder="Repeat password"
                        value={registerForm.confirmPassword}
                        onChange={setR('confirmPassword')}
                      />

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-primary-container py-3.5 font-body text-sm font-medium text-white transition-colors hover:bg-secondary"
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Trust note */}
                {/* <p className="mt-5 text-center font-body text-xs text-outline">
                  <span className="material-symbols-outlined filled align-middle text-secondary" style={{ fontSize: '14px' }}>
                    lock
                  </span>{' '}
                  Secure &amp; encrypted. Your data stays private.
                </p> */}
                {authMode === 'login' && (
                  <p className="mt-5 text-center font-body text-xs text-outline">Don&apos;t have an account? <button className="text-secondary" onClick={() => switchMode('register')}>Register</button></p>
                )}
                {authMode === 'register' && (
                  <p className="mt-5 text-center font-body text-xs text-outline">Already have an account? <button className="text-secondary" onClick={() => switchMode('login')}>Login</button></p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
