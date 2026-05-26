'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import useUIStore from '@/store/useUIStore';

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&limit=8`);
        setResults(data.data || []);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[250]" onClick={closeSearch} />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[251] bg-surface shadow-xl"
            id="search-modal"
          >
            <div className="container-wide py-6">
              <div className="relative max-w-2xl mx-auto">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for coffee, tea, essential oils..."
                  className="w-full pl-12 pr-12 py-4 text-lg border-b-2 border-forest-800 bg-transparent outline-none placeholder:text-charcoal-300"
                  id="search-input"
                />
                <button onClick={closeSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal-900">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Results */}
              {query.length >= 2 && (
                <div className="max-w-2xl mx-auto mt-6 max-h-[60vh] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8"><div className="spinner mx-auto" /></div>
                  ) : results.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted">No results for "{query}"</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {results.map((product) => {
                        const img = product.images?.[0];
                        const variant = product.variants?.[0];
                        const price = variant?.offerPrice && variant.offerPrice < variant.price ? variant.offerPrice : variant?.price;
                        return (
                          <Link
                            key={product._id}
                            href={`/product/${product.slug}`}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-sand-50 transition-colors"
                            onClick={closeSearch}
                          >
                            <div className="w-12 h-12 bg-sand-100 rounded-md flex-shrink-0 overflow-hidden">
                              {img ? (
                                <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img.url}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-charcoal-900 truncate">{product.name}</p>
                              <p className="text-xs text-muted">{product.category?.name}</p>
                            </div>
                            {price && <span className="price-display text-sm">₹{price}</span>}
                          </Link>
                        );
                      })}
                      <div className="pt-4 text-center">
                        <Link href={`/shop?q=${encodeURIComponent(query)}`} className="btn btn-ghost btn-sm" onClick={closeSearch}>
                          View all results →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
