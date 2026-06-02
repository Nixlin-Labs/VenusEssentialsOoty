"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { navLinks } from "@/lib/data";
import { useCart } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { useSettingsStore } from "@/lib/settingsStore";
import api from "@/lib/api";

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16 16" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M6 6L5 3H2" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function MobileCategoriesAccordion({ categories, onSelectCategory }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-1 text-base text-left font-body text-on-surface-variant hover:text-charcoal"
      >
        <span>Categories</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="material-symbols-outlined text-[20px] text-on-surface-variant"
        >
          expand_more
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-2 flex flex-col gap-2.5 pb-2 border-l border-outline-variant pl-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/shop?category=${category.slug}`}
                  onClick={onSelectCategory}
                  className="text-sm transition-colors text-on-surface-variant hover:text-primary-container"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ activeLink }) {
  const pathname = usePathname();
  const router = useRouter();
  const openCart = useCart((state) => state.openCart);
  const cartItems = useCart((state) => state.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const logout = useAuthStore((state) => state.logout);
  const { settings } = useSettingsStore();
  const whatsappNumber = settings?.whatsapp || settings?.storePhone || "";

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const getImageUrl = (url) => (url ? `${API_URL}${url}` : null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data || []);
      } catch { /* silent */ }
    };
    fetchCategories();
  }, []);

  // Live search via API
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
      setSearchResults(data.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => setScrolled(y > 50));
    return () => unsub();
  }, [scrollY]);

  const isActive = (link) => {
    if (activeLink) return link.label === activeLink;
    if (link.label === "Categories" || link.href === "/shop")
      return pathname === "/shop";
    return pathname === link.href;
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(251,249,244,0.98)" : "transparent",
          boxShadow: scrolled ? "0 8px 40px rgba(45,71,57,0.06)" : "none",
        }}
      >
        <div className="flex items-center justify-between h-16 container-main md:h-20">
          <Link href="/" className="font-display text-[22px] text-charcoal">
            Venus Essentials
          </Link>

          <nav className="items-center hidden gap-8 lg:flex">
            {navLinks.map((link) =>
              link.label === "Categories" ? (
                <div key={link.label} className="relative group">
                  <Link
                    href="/shop"
                    className={`font-body text-sm text-on-surface-variant transition-colors hover:text-primary-container ${
                      isActive(link) ? "nav-link-active" : ""
                    }`}
                  >
                    Categories
                  </Link>
                  <div className="absolute left-0 z-50 invisible w-56 p-3 mt-2 transition-all duration-200 border rounded-lg opacity-0 top-full border-outline-variant bg-surface shadow-card group-hover:visible group-hover:opacity-100">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/shop?category=${category.slug}`}
                        className="block px-3 py-2 text-sm rounded-md text-on-surface-variant hover:bg-surface-container hover:text-primary-container"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-body text-sm text-on-surface-variant transition-colors hover:text-primary-container ${
                    isActive(link) ? "nav-link-active" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="text-on-surface-variant hover:text-charcoal"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <SearchIcon />
            </button>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  className="text-on-surface-variant hover:text-charcoal"
                  aria-label="Profile"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                >
                  <AccountIcon />
                </button>
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 z-50 w-48 p-2 mt-2 border rounded-lg top-full border-outline-variant bg-surface shadow-card"
                    >
                      <p className="border-b border-surface-container px-2 pb-2 text-xs text-[#727973]">
                        {user?.name || "Profile"}
                      </p>
                      <Link
                        href="/profile"
                        className="block px-2 py-2 mt-2 text-sm rounded-md text-on-surface-variant hover:bg-surface-container"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-2 py-2 text-sm rounded-md text-on-surface-variant hover:bg-surface-container"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-2 py-2 text-sm rounded-md text-on-surface-variant hover:bg-surface-container"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Wishlist
                      </Link>
                      <button
                        type="button"
                        className="w-full px-2 py-2 text-sm text-left rounded-md text-on-surface-variant hover:bg-surface-container"
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                className="text-on-surface-variant hover:text-charcoal"
                aria-label="Account"
                onClick={() => openAuthModal("login")}
              >
                <AccountIcon />
              </button>
            )}
            <button
              type="button"
              onClick={openCart}
              className="relative text-on-surface-variant hover:text-charcoal"
              aria-label="Open cart"
            >
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-[10px] font-medium text-white">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              type="button"
              className="text-charcoal lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[70] flex h-full w-72 flex-col bg-surface p-6 shadow-botanical"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-display">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl"
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    {link.label === "Categories" ? (
                      <MobileCategoriesAccordion
                        categories={categories}
                        onSelectCategory={() => setMobileOpen(false)}
                      />
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`font-body text-base ${
                          isActive(link)
                            ? "font-medium text-primary-container"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex flex-col bg-surface/98 backdrop-blur-md px-6 py-6"
          >
            {/* Search Header */}
            <div className="flex items-center justify-between pb-6 border-b container-main border-outline-variant">
              <Link href="/" className="text-xl font-display text-charcoal">
                Venus Ooty Essentials
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="flex items-center justify-center w-10 h-10 transition-colors rounded-full bg-surface-container hover:bg-surface-high"
                aria-label="Close search"
              >
                <span className="material-symbols-outlined text-charcoal">close</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="flex flex-col flex-1 w-full max-w-2xl pt-16 mx-auto container-main">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }
                }}
                className="relative"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Search for eucalyptus oil, soaps, skincare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 pl-2 pr-12 text-xl transition-colors bg-transparent border-0 border-b-2 outline-none border-outline-variant font-body text-charcoal placeholder:text-outline focus:border-primary"
                />
                <button
                  type="submit"
                  className="absolute transition-colors -translate-y-1/2 right-2 top-1/2 text-on-surface-variant hover:text-charcoal"
                >
                  <SearchIcon />
                </button>
              </form>

              {/* Search Results */}
              {searchQuery.trim() && (
                <>
                  {searchLoading ? (
                    <div className="flex justify-center mt-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-4 mt-8 border rounded-xl border-outline-variant bg-surface shadow-botanical-hover">
                      <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-[#727973] px-3">
                        Suggested Products
                      </p>
                      <div className="space-y-1">
                        {searchResults.map((p) => {
                          const imgUrl = p.images?.[0]?.url ? getImageUrl(p.images[0].url) : null;
                          const defaultVariant = p.variants?.find(v => v.isDefault) || p.variants?.[0];
                          const price = defaultVariant?.offerPrice || defaultVariant?.price || 0;
                          return (
                            <Link
                              key={p._id}
                              href={`/products/${p.slug}`}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setSearchResults([]);
                              }}
                              className="flex items-center gap-4 p-3 transition-colors rounded-lg hover:bg-surface-container"
                            >
                              {imgUrl ? (
                                <img src={imgUrl} alt={p.name} className="object-cover w-12 h-12 rounded-md" />
                              ) : (
                                <div className="w-12 h-12 rounded-md bg-surface-container flex items-center justify-center">
                                  <span className="material-symbols-outlined text-outline text-[20px]">spa</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate font-body text-charcoal">{p.name}</p>
                                <p className="text-xs font-body text-on-surface-variant">{p.category?.name}</p>
                              </div>
                              <span className="text-sm font-semibold font-body text-primary">₹{price}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-8 text-sm text-center font-body text-on-surface-variant">
                      No products found for &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
