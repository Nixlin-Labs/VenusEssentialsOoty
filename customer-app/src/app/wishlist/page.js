'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { toggleWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setProducts(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) fetchWishlist(); }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    toast('Removed from wishlist');
  };

  const handleMoveToCart = async (product) => {
    const variant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
    if (!variant || variant.stock === 0) { toast.error('Product is out of stock'); return; }
    try {
      await api.post('/wishlist/move-to-cart', { productId: product._id, variantId: variant._id });
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      toast.success('Moved to cart!');
      openCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-tight py-20 text-center">
        <span className="text-5xl mb-4 block">❤️</span>
        <h2 className="heading-section">Please sign in to view your wishlist</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-forest-900 py-12">
        <div className="container-tight text-center">
          <h1 className="font-display text-3xl font-bold text-white">My Wishlist</h1>
          <p className="text-forest-200 text-sm mt-2">{products.length} {products.length === 1 ? 'item' : 'items'} saved</p>
        </div>
      </div>

      <div className="container-wide py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3"><div className="skeleton aspect-square rounded-lg" /><div className="skeleton h-4 w-3/4 rounded" /></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">💚</span>
            <p className="heading-card text-charcoal-500">Your wishlist is empty</p>
            <p className="text-sm text-muted mt-2">Browse our collection and save your favorites</p>
            <Link href="/shop" className="btn btn-primary mt-6">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            <AnimatePresence>
              {products.map((product) => {
                const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
                const variant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
                const price = variant?.offerPrice && variant.offerPrice < variant.price ? variant.offerPrice : variant?.price || 0;
                const isOutOfStock = variant && variant.stock === 0;

                return (
                  <motion.div key={product._id} layout exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                    <div className="card overflow-hidden group">
                      <Link href={`/product/${product.slug}`} className="block">
                        <div className="aspect-square bg-sand-50 overflow-hidden relative">
                          {primaryImage ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${primaryImage.url}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><span className="text-5xl opacity-30">🌿</span></div>
                          )}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-charcoal-900/50 flex items-center justify-center">
                              <span className="badge bg-white text-charcoal-900 text-sm font-bold">Out of Stock</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <h3 className="heading-card text-sm line-clamp-2 mb-1">{product.name}</h3>
                        {variant && <p className="text-xs text-muted">{variant.name}</p>}
                        <p className="price-display text-base mt-2">₹{price}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleMoveToCart(product)}
                            disabled={isOutOfStock}
                            className="btn btn-primary btn-sm flex-1 disabled:opacity-50 text-xs"
                          >
                            {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                          </button>
                          <button onClick={() => handleRemove(product._id)} className="btn btn-ghost btn-sm btn-icon text-error">
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
