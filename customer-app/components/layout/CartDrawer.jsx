'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cartStore';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { formatINR } from '@/lib/data';
import { useAuthStore } from '@/lib/authStore';
import CustomSelect from '@/components/ui/CustomSelect';

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQty,
    updateVariant,
  } = useCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setCheckingOut(true);
    closeCart();
    router.push('/checkout/information');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] bg-black/50"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: 384, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 384, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col bg-surface shadow-botanical"
          >
            <div className="flex items-center justify-between border-b border-[#e4e2dd] px-6 py-5">
              <h2 className="font-display text-2xl text-charcoal">
                Your Cart{' '}
                <span className="font-body text-base font-normal text-[#727973]">
                  ({totalItems} items)
                </span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="text-2xl text-on-surface-variant hover:text-charcoal"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <>
                  <p className="py-12 text-center font-body text-on-surface-variant">
                    Your cart is empty. Discover our Nilgiri botanicals.
                  </p>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-primary-container py-4 font-body text-sm uppercase tracking-wider text-white transition-colors hover:bg-secondary"
                  >
                    Continue Shopping
                  </button>
                </>
              ) : (
                <ul className="space-y-0">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="border-b border-surface-container py-5"
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-2">
                            <div>
                              <p className="font-body text-[15px] font-medium text-charcoal">
                                {item.name}
                              </p>
                              {item.availableVariants && item.availableVariants.length > 0 ? (
                                <CustomSelect
                                  options={item.availableVariants.map(v => ({ label: v.name, value: v.name }))}
                                  value={item.variant}
                                  onChange={(val) => {
                                    const newVar = item.availableVariants.find(v => v.name === val);
                                    const newPrice = newVar?.offerPrice && newVar.offerPrice < newVar.price ? newVar.offerPrice : newVar?.price;
                                    updateVariant(item.id, val, newPrice);
                                  }}
                                  size="sm"
                                  className="mt-1 w-32"
                                />
                              ) : (
                                <p className="font-body text-[13px] text-[#727973]">
                                  {item.variant}
                                </p>
                              )}
                            </div>
                            <p className="shrink-0 font-body text-[15px] font-medium text-charcoal">
                              {formatINR(item.price * item.quantity)}
                            </p>
                          </div>
                          <div className="mt-3 flex items-end justify-between">
                            <QuantitySelector
                              size="sm"
                              quantity={item.quantity}
                              onDecrease={() =>
                                updateQty(item.id, item.quantity - 1)
                              }
                              onIncrease={() =>
                                updateQty(item.id, item.quantity + 1)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="font-body text-[13px] text-[#727973] underline hover:text-charcoal"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#e4e2dd] px-6 py-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-body text-base text-on-surface-variant">
                    Subtotal
                  </span>
                  <span className="font-bold text-[28px] text-charcoal">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <p className="mb-6 text-center font-body text-[13px] text-[#727973]">
                  Shipping and taxes calculated at checkout.
                </p>
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  disabled={checkingOut}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-primary-container py-4 font-body text-sm uppercase tracking-wider text-white transition-colors hover:bg-secondary disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {checkingOut ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Loading Checkout...
                    </>
                  ) : (
                    'Proceed to Checkout →'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full rounded-md border border-outline-variant py-4 font-body text-sm text-charcoal transition-colors hover:bg-surface-container"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
