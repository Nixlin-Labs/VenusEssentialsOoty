'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cartStore';

function StarRating({ rating, reviewCount, centered = false }) {
  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) % 1 !== 0;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

  return (
    <div
      className={`mb-2 flex items-center gap-1 text-sand ${
        centered ? 'justify-center' : 'justify-start'
      }`}
    >
      {[...Array(fullStars)].map((_, i) => (
        <span
          key={`f-${i}`}
          className="material-symbols-outlined filled"
          style={{ fontSize: '15px' }}
        >
          star
        </span>
      ))}
      {hasHalf && (
        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
          star_half
        </span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <span
          key={`e-${i}`}
          className="material-symbols-outlined"
          style={{ fontSize: '15px', opacity: 0.35 }}
        >
          star
        </span>
      ))}
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="ml-1 font-body text-xs text-outline">({reviewCount})</span>
      )}
    </div>
  );
}

export default function ProductCard({ product, variant = 'default', index = 0 }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const imageUrl = product.images?.[0]?.url ? `${API_URL}${product.images[0].url}` : '/placeholder-product.jpg';
  
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
  const price = defaultVariant?.offerPrice && defaultVariant.offerPrice < defaultVariant.price 
    ? defaultVariant.offerPrice 
    : defaultVariant?.price || 0;
  
  const isOutOfStock = defaultVariant?.stock === 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    addItem({
      productId: product._id || product.id,
      name: product.name,
      variant: defaultVariant?.name || '',
      price: price,
      quantity: 1,
      image: imageUrl,
      availableVariants: product.variants || [],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const badgeText = product.isNewArrival ? 'New Arrival' : product.isBestSeller ? 'Best Seller' : null;

  if (variant === 'collection') {
    const isNewArrival = product.isNewArrival;
    const badgeClass = isNewArrival
      ? 'bg-secondary-container/90 text-on-secondary-container'
      : 'bg-tertiary-container/90 text-on-tertiary-container';

    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.5 }}
        className="group flex cursor-pointer flex-col items-center text-center"
      >
        <div className="relative mb-5 aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-container-low transition-shadow duration-500 hover:shadow-botanical-hover">
          {badgeText && (
            <div
              className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm ${badgeClass}`}
            >
              {badgeText}
            </div>
          )}
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
          </Link>
          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full bg-gradient-to-t from-surface/90 to-transparent p-4 transition-transform duration-300 ease-out group-hover:translate-y-0">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`w-full rounded-full py-3 font-body text-sm font-medium shadow-sm transition-colors ${
                isOutOfStock ? 'bg-outline text-surface cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-container'
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined filled" style={{ fontSize: '16px' }}>
                      check
                    </span>
                    Added!
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {isOutOfStock ? 'Out of Stock' : 'Quick Add'}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <StarRating rating={product.averageRating} reviewCount={product.totalReviews} centered />

        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-display text-xl text-primary transition-colors hover:text-primary-container">
            {product.name}
          </h3>
        </Link>
        {defaultVariant?.name && (
          <p className="mt-1 font-body text-sm text-on-surface-variant">{defaultVariant.name}</p>
        )}
        <p className="mt-2 font-body text-sm font-semibold text-primary">₹{price}</p>
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group flex flex-col"
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-surface-container-low">
        {badgeText && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-tertiary-container/90 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-widest text-on-tertiary-container backdrop-blur-sm">
            {badgeText}
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {/* Desktop Quick Add hover overlay */}
        <div className="hidden md:block absolute inset-x-0 bottom-0 z-10 translate-y-full p-3 transition-transform duration-300 ease-out group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full rounded-lg py-2.5 font-body text-xs font-medium uppercase tracking-wider backdrop-blur-sm transition-colors ${
              isOutOfStock ? 'bg-outline text-surface cursor-not-allowed' : 'bg-primary/90 text-white hover:bg-primary'
            }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined filled" style={{ fontSize: '14px' }}>
                    check
                  </span>
                  Added
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {isOutOfStock ? 'Out of Stock' : 'Quick Add'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile circular Quick Add button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          className={`md:hidden absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-xs transition-all active:scale-95 ${
            isOutOfStock 
              ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-secondary'
          }`}
          aria-label="Quick add to cart"
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="material-symbols-outlined text-[18px]"
              >
                check
              </motion.span>
            ) : (
              <motion.span 
                key="cart" 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="material-symbols-outlined text-[18px]"
              >
                {isOutOfStock ? 'block' : 'shopping_bag'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="flex flex-grow flex-col">
        <StarRating rating={product.averageRating} reviewCount={product.totalReviews} />

        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-display text-base leading-snug text-primary transition-colors hover:text-primary-container">
              {product.name}
            </h3>
          </Link>
          <span className="shrink-0 font-body text-sm font-semibold text-primary-container">
            ₹{price}
          </span>
        </div>

        {defaultVariant?.name && (
          <p className="mt-1 font-body text-xs text-on-surface-variant">{defaultVariant.name}</p>
        )}
      </div>
    </motion.article>
  );
}
