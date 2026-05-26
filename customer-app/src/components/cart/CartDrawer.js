'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[200]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-surface z-[201] shadow-2xl flex flex-col"
            id="cart-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900">Your Bag</h2>
                <p className="text-xs text-muted mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
              </div>
              <button onClick={closeCart} className="btn-ghost btn-icon" aria-label="Close cart">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="heading-card text-charcoal-500">Your bag is empty</p>
                  <p className="text-sm text-muted mt-2">Explore our heritage collection</p>
                  <Link href="/shop" className="btn btn-primary mt-6" onClick={closeCart}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                items.map((item, idx) => {
                  const product = item.product || {};
                  const variant = item.variant || {};
                  const variantId = variant._id || item.variantId;
                  const effectivePrice = variant.offerPrice && variant.offerPrice < variant.price
                    ? variant.offerPrice : variant.price;
                  const primaryImage = product.images?.[0]?.url;

                  return (
                    <motion.div
                      key={variantId || idx}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-3 bg-sand-50 rounded-lg"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-sand-100 rounded-md flex-shrink-0 overflow-hidden">
                        {primaryImage ? (
                          <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${primaryImage}`} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-charcoal-900 truncate">{product.name}</h4>
                        <p className="text-xs text-muted">{variant.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="price-display text-sm">₹{effectivePrice}</span>
                          {variant.offerPrice && variant.offerPrice < variant.price && (
                            <span className="price-strike text-xs">₹{variant.price}</span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-0 border border-border rounded-md overflow-hidden">
                            <button
                              onClick={() => {
                                if (item.quantity <= 1) removeItem(variantId, isAuthenticated);
                                else updateQuantity(variantId, item.quantity - 1, isAuthenticated);
                              }}
                              className="w-7 h-7 flex items-center justify-center text-charcoal-600 hover:bg-sand-100 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(variantId, item.quantity + 1, isAuthenticated)}
                              className="w-7 h-7 flex items-center justify-center text-charcoal-600 hover:bg-sand-100 transition-colors"
                              disabled={item.quantity >= (variant.stock || 10)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(variantId, isAuthenticated)}
                            className="text-xs text-muted hover:text-error transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border-light p-5 bg-cream-50 space-y-4">
                {/* Free shipping notice */}
                {subtotal < 500 ? (
                  <div className="flex items-center gap-2 text-xs text-forest-700 bg-forest-50 p-3 rounded-lg">
                    <span>🚚</span>
                    <span>Add ₹{(500 - subtotal).toFixed(0)} more for <strong>free shipping</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-success bg-success-bg p-3 rounded-lg">
                    <span>✓</span>
                    <span>You qualify for <strong>free shipping!</strong></span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-700">Subtotal</span>
                  <span className="price-display text-lg">₹{subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted">Tax and shipping calculated at checkout</p>
                <Link
                  href="/checkout"
                  className="btn btn-primary w-full btn-lg"
                  onClick={closeCart}
                  id="checkout-btn"
                >
                  Proceed to Checkout
                </Link>
                <button onClick={closeCart} className="btn btn-ghost w-full text-sm">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
