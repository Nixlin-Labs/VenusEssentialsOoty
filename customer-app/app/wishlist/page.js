'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { useCart } from '@/lib/cartStore';
import { useWishlistStore } from '@/lib/wishlistStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function WishlistPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setProducts(data.data || []);
    } catch { 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (isAuthenticated) fetchWishlist(); 
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    toast('Removed from wishlist');
  };

  const handleMoveToCart = async (product) => {
    const variant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
    if (!variant || variant.stock === 0) { 
      toast.error('Product is out of stock'); 
      return; 
    }
    try {
      await api.post('/wishlist/move-to-cart', { productId: product._id, variantId: variant._id });
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      toast.success('Moved to cart!');
      openCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move to cart');
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const getImageUrl = (url) => (url ? `${API_URL}${url}` : null);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-surface pt-24">
        <div className="container-main py-12">
          {/* Page Header */}
          <div className="mb-10 flex flex-col gap-1 border-b border-outline-variant pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-sand">
                Account
              </p>
              <h1 className="mt-2 font-display text-4xl text-charcoal">My Wishlist</h1>
              <p className="mt-2 font-body text-sm text-on-surface-variant">
                {products.length} {products.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-body text-sm text-primary-container hover:underline"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
              Continue Shopping
            </Link>
          </div>

          <div className="py-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-48 rounded-xl bg-surface-container-low animate-pulse" />
                    <div className="h-4 w-3/4 rounded bg-surface-container-low animate-pulse" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low py-24 text-center"
              >
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '64px' }}>
                  favorite
                </span>
                <h2 className="mt-5 font-display text-2xl text-charcoal">Your wishlist is empty</h2>
                <p className="mx-auto mt-3 max-w-sm font-body text-sm leading-relaxed text-on-surface-variant">
                  Browse our collection and save your favorites here.
                </p>
                <Link
                  href="/shop"
                  className="mt-8 rounded-full bg-primary-container px-8 py-3 font-body text-sm text-white transition-colors hover:bg-secondary"
                >
                  Explore Products
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                  {products.map((product) => {
                    const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
                    const variant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
                    const price = variant?.offerPrice && variant.offerPrice < variant.price ? variant.offerPrice : variant?.price || 0;
                    const isOutOfStock = variant && variant.stock === 0;

                    return (
                      <motion.div 
                        key={product._id} 
                        layout 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        transition={{ duration: 0.3 }}
                        className="group flex flex-col"
                      >
                        <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low">
                          <Link href={`/products/${product.slug}`} className="block h-full w-full">
                            {primaryImage ? (
                              <img 
                                src={getImageUrl(primaryImage.url)} 
                                alt={product.name} 
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-surface-container">
                                <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>spa</span>
                              </div>
                            )}
                          </Link>
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-surface/50 flex items-center justify-center backdrop-blur-[2px]">
                              <span className="rounded-full bg-white px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-charcoal shadow-sm">Out of Stock</span>
                            </div>
                          )}
                          <button
                            onClick={() => handleRemove(product._id)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-on-surface-variant backdrop-blur-sm transition-colors hover:bg-white hover:text-error shadow-sm"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                          </button>
                        </div>
                        
                        <div className="flex flex-col flex-grow">
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-display text-base leading-snug text-primary transition-colors hover:text-primary-container">
                              {product.name}
                            </h3>
                          </Link>
                          {variant && <p className="mt-1 font-body text-xs text-on-surface-variant">{variant.name}</p>}
                          <p className="mt-2 font-body text-sm font-semibold text-primary">₹{price}</p>
                          
                          <button
                            onClick={() => handleMoveToCart(product)}
                            disabled={isOutOfStock}
                            className={`mt-4 w-full rounded-md py-2.5 font-body text-xs font-medium uppercase tracking-wider transition-colors ${
                              isOutOfStock ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary-container text-white hover:bg-secondary'
                            }`}
                          >
                            {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
