'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import useUIStore from '@/store/useUIStore';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/categories/coffee-powders', label: 'Coffee' },
  { href: '/categories/tea-powders', label: 'Tea' },
  { href: '/categories/essential-oils', label: 'Essential Oils' },
  { href: '/categories/chocolates', label: 'Chocolates' },
  { href: '/about', label: 'Our Heritage' },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount, openCart } = useCartStore();
  const { openMobileMenu, isMobileMenuOpen, closeMobileMenu, openSearch, openAuthModal } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = getItemCount();

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-forest-800 text-white text-center py-2 px-4">
        <p className="text-xs tracking-wider font-medium">
          ✨ FREE SHIPPING ON ORDERS ABOVE ₹500 • 40+ YEARS OF HERITAGE WELLNESS ✨
        </p>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-[100] transition-all duration-500 ${
          scrolled ? 'glass shadow-md py-3' : 'bg-cream-50 py-4'
        }`}
      >
        <div className="container-wide flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
            className="lg:hidden btn-ghost btn-icon"
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" id="logo-link">
            <div className="w-10 h-10 bg-forest-800 rounded-full flex items-center justify-center group-hover:bg-forest-700 transition-colors">
              <span className="text-white font-display text-lg font-bold">V</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-forest-900 tracking-tight leading-none">Venus Essentials</h1>
              <p className="text-[10px] text-sand-600 tracking-[0.25em] uppercase">Ooty · Since 1980</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" id="main-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-charcoal-700 hover:text-forest-800 transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-forest-800 transition-all duration-300 group-hover:w-3/4 rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button onClick={openSearch} className="btn-ghost btn-icon" id="search-toggle" aria-label="Search">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link href="/wishlist" className="btn-ghost btn-icon hidden sm:flex" id="wishlist-link" aria-label="Wishlist">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </Link>
            )}

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="btn-ghost btn-icon"
                  id="account-menu"
                  aria-label="Account"
                >
                  <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center">
                    <span className="text-forest-800 text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                  </div>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border-light overflow-hidden"
                    >
                      <div className="p-4 bg-sand-50 border-b border-border-light">
                        <p className="text-sm font-semibold text-charcoal-900">{user?.name}</p>
                        <p className="text-xs text-muted truncate">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link href="/account" className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-forest-50 rounded-md" onClick={() => setProfileOpen(false)}>My Account</Link>
                        <Link href="/orders" className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-forest-50 rounded-md" onClick={() => setProfileOpen(false)}>My Orders</Link>
                        <Link href="/wishlist" className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-forest-50 rounded-md" onClick={() => setProfileOpen(false)}>Wishlist</Link>
                        <Link href="/addresses" className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-forest-50 rounded-md" onClick={() => setProfileOpen(false)}>Addresses</Link>
                        <hr className="my-1 border-border-light" />
                        <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error-bg rounded-md">Sign Out</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => openAuthModal('login')} className="btn-ghost text-sm hidden sm:flex" id="login-btn">
                Sign In
              </button>
            )}

            {/* Cart */}
            <button onClick={openCart} className="btn-ghost btn-icon relative" id="cart-toggle" aria-label="Cart">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-forest-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[199]"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[300px] bg-surface z-[200] shadow-xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display text-xl font-bold text-forest-900">Venus Essentials</span>
                  <button onClick={closeMobileMenu} className="btn-ghost btn-icon">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-3 text-charcoal-700 hover:bg-forest-50 hover:text-forest-800 rounded-lg font-medium transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                {!isAuthenticated && (
                  <div className="mt-8 pt-6 border-t border-border-light">
                    <button onClick={() => { openAuthModal('login'); closeMobileMenu(); }} className="btn btn-primary w-full">
                      Sign In
                    </button>
                    <button onClick={() => { openAuthModal('register'); closeMobileMenu(); }} className="btn btn-secondary w-full mt-3">
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
