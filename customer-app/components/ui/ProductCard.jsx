'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cartStore';
import QuantitySelector from '@/components/ui/QuantitySelector';

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
          className="material-symbols-outlined filled text-sand"
          style={{ fontSize: '14px' }}
        >
          star
        </span>
      ))}
      {hasHalf && (
        <span className="material-symbols-outlined text-sand" style={{ fontSize: '14px' }}>
          star_half
        </span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <span
          key={`e-${i}`}
          className="material-symbols-outlined text-sand"
          style={{ fontSize: '14px', opacity: 0.3 }}
        >
          star
        </span>
      ))}
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="ml-1.5 font-body text-[11px] text-outline">({reviewCount})</span>
      )}
    </div>
  );
}

export default function ProductCard({ product, variant = 'default', index = 0 }) {
  const { addItem, openCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const [modalVariant, setModalVariant] = useState(defaultVariant);
  const [modalQuantity, setModalQuantity] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const imageUrl = product.images?.[0]?.url ? `${API_URL}${product.images[0].url}` : '/placeholder-product.jpg';

  const price = defaultVariant?.offerPrice && defaultVariant.offerPrice < defaultVariant.price
    ? defaultVariant.offerPrice
    : defaultVariant?.price || 0;

  const isOutOfStock = defaultVariant?.stock === 0;

  const handleQuickAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    setModalVariant(defaultVariant);
    setModalQuantity(1);
    setShowModal(true);
  };

  const handleConfirmAdd = () => {
    if (!modalVariant || modalVariant.stock === 0) return;
    setIsAdding(true);

    const activePrice = modalVariant.offerPrice && modalVariant.offerPrice < modalVariant.price
      ? modalVariant.offerPrice
      : modalVariant.price || 0;

    addItem({
      productId: product._id || product.id,
      name: product.name,
      variant: modalVariant.name || '',
      price: activePrice,
      quantity: modalQuantity,
      image: imageUrl,
      availableVariants: product.variants || [],
    });

    setTimeout(() => {
      setIsAdding(false);
      setShowModal(false);
      openCart();
    }, 600);
  };

  const badgeText = product.isNewArrival ? 'New Arrival' : product.isBestSeller ? 'Best Seller' : null;

  // Selected Variant Price in Modal
  const modalPrice = modalVariant?.offerPrice && modalVariant.offerPrice < modalVariant.price
    ? modalVariant.offerPrice
    : modalVariant?.price || 0;

  if (variant === 'collection') {
    const isNewArrival = product.isNewArrival;
    const badgeClass = isNewArrival
      ? 'bg-secondary-container/90 text-on-secondary-container border border-secondary/10'
      : 'bg-tertiary-container/90 text-on-tertiary-container border border-tertiary/10';

    return (
      <>
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          className="group flex cursor-pointer flex-col items-center text-center w-full"
        >
          <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface-container-low transition-all duration-500 hover:shadow-botanical-hover border border-outline-variant/20">
            {badgeText && (
              <div
                className={`absolute left-3.5 top-3.5 z-10 rounded-full px-3 py-1 font-body text-[9px] font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm ${badgeClass}`}
              >
                {badgeText}
              </div>
            )}
            <Link href={`/products/${product.slug}`} className="block h-full w-full">
              <img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            </Link>

            {/* Quick Add Button - Always Visible, Icon Only */}
            <button
              type="button"
              onClick={handleQuickAddClick}
              disabled={isOutOfStock}
              className={`absolute bottom-3.5 right-3.5 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-300 active:scale-90 ${
                isOutOfStock
                  ? 'bg-surface/50 text-outline-variant/45 border border-outline-variant/10 cursor-not-allowed'
                  : 'bg-surface/95 hover:bg-primary text-primary hover:text-on-primary border border-outline-variant/25'
              }`}
              aria-label="Quick add to cart"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isOutOfStock ? 'block' : 'shopping_bag'}
              </span>
            </button>
          </div>

          <StarRating rating={product.averageRating} reviewCount={product.totalReviews} centered />

          <Link href={`/products/${product.slug}`} className="block w-full">
            <h3 className="font-display text-lg text-primary transition-colors duration-300 hover:text-primary-container line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {defaultVariant?.name && (
            <p className="mt-0.5 font-body text-xs text-on-surface-variant">{defaultVariant.name}</p>
          )}
          <p className="mt-1.5 font-body text-sm font-semibold text-primary">₹{price}</p>
        </motion.article>

        {/* Quantity Select Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-outline-variant/40 shadow-botanical-hover p-6 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                {/* Product Summary */}
                <div className="flex gap-4 border-b border-outline-variant/30 pb-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low">
                    <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    {badgeText && (
                      <span className="self-start mb-1 rounded-full bg-tertiary-container/80 px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wider text-on-tertiary-container">
                        {badgeText}
                      </span>
                    )}
                    <h3 className="font-display text-lg text-primary leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    {product.averageRating > 0 && (
                      <div className="mt-1 flex items-center gap-1.5 text-sand scale-90 origin-left">
                        <StarRating rating={product.averageRating} reviewCount={product.totalReviews} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Variant & Qty Panel */}
                <div className="py-5">
                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="font-display text-2xl text-charcoal">₹{modalPrice}</span>
                    {modalVariant?.offerPrice && modalVariant.offerPrice < modalVariant.price && (
                      <span className="font-body text-xs text-on-surface-variant line-through">
                        ₹{modalVariant.price}
                      </span>
                    )}
                    <span className="ml-auto font-body text-xs text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] filled">
                        {modalVariant?.stock > 0 ? 'check_circle' : 'error'}
                      </span>
                      {modalVariant?.stock > 0 ? `${modalVariant.stock} in stock` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Variants Selector */}
                  {product.variants && product.variants.length > 1 && (
                    <div className="mb-5">
                      <p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-wider text-outline">
                        Variant / Size
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.filter(v => v.isActive !== false).map((variant) => (
                          <button
                            key={variant._id || variant.id}
                            type="button"
                            onClick={() => {
                              setModalVariant(variant);
                              setModalQuantity(1);
                            }}
                            disabled={variant.stock === 0}
                            className={`rounded-lg px-3.5 py-1.5 font-body text-xs transition-all duration-200 text-left ${
                              modalVariant?._id === variant._id || modalVariant?.id === variant.id
                                ? 'border border-primary bg-primary text-on-primary shadow-sm'
                                : variant.stock === 0
                                  ? 'border border-outline-variant/10 text-outline-variant/40 cursor-not-allowed opacity-30 line-through'
                                  : 'border border-outline-variant text-on-surface-variant hover:border-secondary'
                            }`}
                          >
                            <span className="font-medium block">{variant.name}</span>
                            {variant.weight && (
                              <span className="block text-[9px] opacity-70">
                                {variant.weight.value}{variant.weight.unit}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div>
                    <p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-wider text-outline">
                      Select Quantity
                    </p>
                    <div className="flex items-center gap-4">
                      <QuantitySelector
                        quantity={modalQuantity}
                        onDecrease={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        onIncrease={() => setModalQuantity(Math.min(modalQuantity + 1, modalVariant?.stock || 10))}
                      />
                      <span className="font-body text-xs text-on-surface-variant">
                        Subtotal: <strong className="text-primary font-semibold">₹{modalPrice * modalQuantity}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-auto pt-4 border-t border-outline-variant/20 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-outline-variant py-2.5 font-body text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAdd}
                    disabled={modalVariant?.stock === 0 || isAdding}
                    className={`flex-[2] rounded-xl py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
                      modalVariant?.stock === 0 || isAdding
                        ? 'bg-outline-variant text-on-surface-variant/40 cursor-not-allowed shadow-none'
                        : 'bg-primary hover:bg-primary-container active:scale-98'
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                        Add To Bag · ₹{modalPrice * modalQuantity}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Default Variant
  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group flex flex-col w-full h-full bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/10 transition-all duration-300 hover:shadow-botanical hover:-translate-y-0.5"
      >
        <div className="relative mb-3.5 aspect-square overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/15">
          {badgeText && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-tertiary-container/95 px-2.5 py-0.5 font-body text-[8px] font-semibold uppercase tracking-wider text-on-tertiary-container backdrop-blur-md shadow-sm">
              {badgeText}
            </span>
          )}
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
              loading="lazy"
            />
          </Link>

          {/* Quick Add Button - Always Visible, Icon Only (Desktop and Mobile) */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            disabled={isOutOfStock}
            className={`absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-300 active:scale-90 ${
              isOutOfStock
                ? 'bg-surface/50 text-outline-variant/45 border border-outline-variant/10 cursor-not-allowed'
                : 'bg-surface/95 hover:bg-primary text-primary hover:text-on-primary border border-outline-variant/25'
            }`}
            aria-label="Quick add to cart"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isOutOfStock ? 'block' : 'shopping_bag'}
            </span>
          </button>
        </div>

        <div className="flex flex-grow flex-col px-1">
          <StarRating rating={product.averageRating} reviewCount={product.totalReviews} />

          <div className="flex items-start justify-between gap-3 mt-0.5">
            <Link href={`/products/${product.slug}`} className="flex-1">
              <h3 className="font-display text-sm md:text-base leading-snug text-primary transition-colors duration-300 hover:text-primary-container line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <span className="shrink-0 font-body text-sm font-semibold text-primary mt-0.5">
              ₹{price}
            </span>
          </div>

          {defaultVariant?.name && (
            <p className="mt-1 font-body text-[11px] text-on-surface-variant">{defaultVariant.name}</p>
          )}
        </div>
      </motion.article>

      {/* Quantity Select Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-outline-variant/40 shadow-botanical-hover p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              {/* Product Summary */}
              <div className="flex gap-4 border-b border-outline-variant/30 pb-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low">
                  <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  {badgeText && (
                    <span className="self-start mb-1 rounded-full bg-tertiary-container/80 px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wider text-on-tertiary-container">
                      {badgeText}
                    </span>
                  )}
                  <h3 className="font-display text-lg text-primary leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  {product.averageRating > 0 && (
                    <div className="mt-1 flex items-center gap-1.5 text-sand scale-90 origin-left">
                      <StarRating rating={product.averageRating} reviewCount={product.totalReviews} />
                    </div>
                  )}
                </div>
              </div>

              {/* Variant & Qty Panel */}
              <div className="py-5">
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-display text-2xl text-charcoal">₹{modalPrice}</span>
                  {modalVariant?.offerPrice && modalVariant.offerPrice < modalVariant.price && (
                    <span className="font-body text-xs text-on-surface-variant line-through">
                      ₹{modalVariant.price}
                    </span>
                  )}
                  <span className="ml-auto font-body text-xs text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] filled">
                      {modalVariant?.stock > 0 ? 'check_circle' : 'error'}
                    </span>
                    {modalVariant?.stock > 0 ? `${modalVariant.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>

                {/* Variants Selector */}
                {product.variants && product.variants.length > 1 && (
                  <div className="mb-5">
                    <p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-wider text-outline">
                      Variant / Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.filter(v => v.isActive !== false).map((variant) => (
                        <button
                          key={variant._id || variant.id}
                          type="button"
                          onClick={() => {
                            setModalVariant(variant);
                            setModalQuantity(1);
                          }}
                          disabled={variant.stock === 0}
                          className={`rounded-lg px-3.5 py-1.5 font-body text-xs transition-all duration-200 text-left ${
                            modalVariant?._id === variant._id || modalVariant?.id === variant.id
                              ? 'border border-primary bg-primary text-on-primary shadow-sm'
                              : variant.stock === 0
                                ? 'border border-outline-variant/10 text-outline-variant/40 cursor-not-allowed opacity-30 line-through'
                                : 'border border-outline-variant text-on-surface-variant hover:border-secondary'
                          }`}
                        >
                          <span className="font-medium block">{variant.name}</span>
                          {variant.weight && (
                            <span className="block text-[9px] opacity-70">
                              {variant.weight.value}{variant.weight.unit}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div>
                  <p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-wider text-outline">
                    Select Quantity
                  </p>
                  <div className="flex items-center gap-4">
                    <QuantitySelector
                      quantity={modalQuantity}
                      onDecrease={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      onIncrease={() => setModalQuantity(Math.min(modalQuantity + 1, modalVariant?.stock || 10))}
                    />
                    <span className="font-body text-xs text-on-surface-variant">
                      Subtotal: <strong className="text-primary font-semibold">₹{modalPrice * modalQuantity}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="mt-auto pt-4 border-t border-outline-variant/20 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-outline-variant py-2.5 font-body text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  disabled={modalVariant?.stock === 0 || isAdding}
                  className={`flex-[2] rounded-xl py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
                    modalVariant?.stock === 0 || isAdding
                      ? 'bg-outline-variant text-on-surface-variant/40 cursor-not-allowed shadow-none'
                      : 'bg-primary hover:bg-primary-container active:scale-98'
                  }`}
                >
                  {isAdding ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                      Add To Bag · ₹{modalPrice * modalQuantity}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ProductCardSkeleton({ variant = 'default' }) {
  if (variant === 'collection') {
    return (
      <div className="animate-pulse flex flex-col items-center text-center w-full">
        <div className="relative mb-5 aspect-[4/5] w-full rounded-2xl bg-neutral-200" />
        <div className="h-3 w-20 bg-neutral-200 rounded mb-3" />
        <div className="h-5 w-2/3 bg-neutral-200 rounded mb-2" />
        <div className="h-3 w-1/3 bg-neutral-200 rounded mb-2" />
        <div className="h-4 w-12 bg-neutral-200 rounded" />
      </div>
    );
  }

  return (
    <div className="animate-pulse flex flex-col w-full h-full bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/10">
      <div className="relative mb-4 aspect-square rounded-xl bg-neutral-200" />
      <div className="flex flex-grow flex-col gap-2 px-1">
        <div className="h-3 w-16 bg-neutral-200 rounded mb-1" />
        <div className="flex items-start justify-between gap-4">
          <div className="h-4 w-2/3 bg-neutral-200 rounded" />
          <div className="h-4 w-10 bg-neutral-200 rounded" />
        </div>
        <div className="h-3 w-1/3 bg-neutral-200 rounded mt-1" />
      </div>
    </div>
  );
}
