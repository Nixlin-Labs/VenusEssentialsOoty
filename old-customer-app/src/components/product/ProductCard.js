'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import useAuthStore from '@/store/useAuthStore';

export default function ProductCard({ product, index = 0 }) {
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const variants = product.variants || [];
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0];

  const price = defaultVariant?.price || 0;
  const offerPrice = defaultVariant?.offerPrice;
  const effectivePrice = offerPrice && offerPrice < price ? offerPrice : price;
  const discount = offerPrice && offerPrice < price
    ? Math.round(((price - offerPrice) / price) * 100)
    : 0;

  const isWishlisted = isInWishlist(product._id);
  const isOutOfStock = defaultVariant && defaultVariant.stock === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant || isOutOfStock) return;
    const result = await addItem(product, defaultVariant, 1, isAuthenticated);
    if (result.success) {
      toast.success('Added to bag!');
      openCart();
    } else {
      toast.error(result.error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please sign in to add to wishlist');
      return;
    }
    const result = await toggleWishlist(product._id);
    if (result.success) {
      toast(result.action === 'added' ? '❤️ Added to wishlist' : 'Removed from wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/product/${product.slug}`} className="block group" id={`product-${product.slug}`}>
        <div className="card overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-square bg-sand-50 overflow-hidden">
            {primaryImage ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${primaryImage.url}`}
                alt={primaryImage.alt || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-sand-100">
                <span className="text-5xl opacity-30">🌿</span>
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <span className="badge badge-discount absolute top-3 left-3">-{discount}%</span>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-charcoal-900/50 flex items-center justify-center">
                <span className="badge bg-white text-charcoal-900 text-sm font-bold">Out of Stock</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleWishlistToggle}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  isWishlisted ? 'bg-error text-white' : 'bg-white text-charcoal-700 hover:bg-error hover:text-white'
                }`}
                aria-label="Toggle wishlist"
              >
                <svg width="16" height="16" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </motion.button>
            </div>

            {/* Add to Cart Button */}
            {!isOutOfStock && defaultVariant && (
              <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-forest-800/95 text-white py-3 text-sm font-semibold tracking-wide uppercase hover:bg-forest-700 transition-colors backdrop-blur-sm"
                >
                  Quick Add
                </button>
              </div>
            )}

            {/* Tags */}
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {product.isNewArrival && <span className="badge badge-primary text-[10px]">New</span>}
              {product.isBestSeller && <span className="badge badge-accent text-[10px]">Best Seller</span>}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {product.category && (
              <p className="text-[11px] text-muted uppercase tracking-wider mb-1">{product.category.name || product.category}</p>
            )}
            <h3 className="heading-card text-[15px] group-hover:text-forest-700 transition-colors line-clamp-2">
              {product.name}
            </h3>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill={i < Math.round(product.averageRating) ? '#D4A843' : '#D6D9D7'}>
                      <path d="M10 1l2.39 4.84L17.3 6.7l-3.65 3.56.86 5.03L10 13.02l-4.51 2.27.86-5.03L2.7 6.7l4.91-.86L10 1z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[11px] text-muted">({product.totalReviews})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mt-2">
              <span className="price-display text-base">₹{effectivePrice}</span>
              {discount > 0 && <span className="price-strike text-sm">₹{price}</span>}
            </div>

            {/* Weight Variants Indicator */}
            {variants.length > 1 && (
              <p className="text-[11px] text-muted mt-1.5">{variants.length} variants available</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
