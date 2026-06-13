'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartStore';
import { formatINR } from '@/lib/data';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  shippingNote,
  total,
}) {
  const coupon = useCart((state) => state.coupon);
  const setCoupon = useCart((state) => state.setCoupon);
  const rawSubtotal = useCart((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    try {
      const { data } = await api.post('/checkout/apply-coupon', {
        code: couponCodeInput.trim().toUpperCase(),
        subtotal: rawSubtotal,
      });

      if (data?.data?.coupon) {
        setCoupon(data.data.coupon);
        setCouponCodeInput('');
        toast.success(`Coupon "${data.data.coupon.code}" applied successfully!`);
      } else {
        toast.error('Failed to apply coupon');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired coupon code');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await api.post('/checkout/remove-coupon');
      setCoupon(null);
      toast.success('Coupon removed');
    } catch {
      setCoupon(null);
    }
  };

  // Compute values locally to show immediate feedback
  const discountAmount = coupon
    ? coupon.type === 'flat'
      ? coupon.value
      : (rawSubtotal * coupon.value) / 100
    : 0;

  // If freeShipping flag is true, shipping is free (0)
  const isFreeShipping = coupon?.freeShipping || rawSubtotal >= 500;
  const shippingVal = isFreeShipping ? 0 : 150;

  const calculatedTotal = Math.max(0, rawSubtotal - discountAmount + (shippingNote ? 0 : shippingVal));

  return (
    <div className="rounded-xl bg-surface-container p-6">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.name + '-' + item.variant} className="flex gap-4">
            <div className="relative shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="h-14 w-14 rounded-md object-cover"
              />
              {item.quantity > 1 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#727973] text-[10px] text-white">
                  {item.quantity}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-medium text-charcoal">{item.name}</p>
              <p className="font-body text-xs text-[#727973]">{item.variant}</p>
            </div>
            <p className="shrink-0 font-body text-sm font-medium text-charcoal">
              {item.price}
            </p>
          </li>
        ))}
      </ul>

      <div className="my-6 border-t border-[#e4e2dd]" />

      {/* Coupon Application Box */}
      <div className="flex flex-col gap-2">
        {coupon ? (
          <div className="flex items-center justify-between bg-forest-50/70 border border-forest-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-forest-700 text-[18px]">sell</span>
              <div>
                <p className="font-body text-xs font-semibold text-forest-800 uppercase tracking-wider">
                  {coupon.code}
                </p>
                <p className="font-body text-[11px] text-[#727973]">
                  {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                  {coupon.freeShipping ? ' + Free Shipping' : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs font-semibold text-red-600 hover:text-red-800 font-body"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Discount code"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              className="flex-1 rounded-md border border-[#e4e2dd] bg-white px-4 py-2 font-body text-sm outline-none focus:border-primary-container uppercase"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isApplying}
              className="rounded-md bg-[#e4e2dd] px-4 py-2 font-body text-sm text-charcoal hover:bg-surface-high disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px]"
            >
              {isApplying ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-charcoal border-t-transparent" /> : 'Apply'}
            </button>
          </div>
        )}
      </div>

      <div className="my-6 border-t border-[#e4e2dd]" />

      <div className="space-y-2 font-body text-sm">
        <div className="flex justify-between text-on-surface-variant">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        
        {coupon && (
          <div className="flex justify-between text-forest-800 font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">sell</span>
              Discount ({coupon.code})
            </span>
            <span>-{formatINR(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-on-surface-variant">
          <span>Shipping</span>
          <span className={shippingNote ? 'text-[#727973]' : ''}>
            {shippingNote ? shippingNote : formatINR(shippingVal)}
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-[#e4e2dd]" />

      <div className="flex items-center justify-between">
        <span className="font-body text-base text-charcoal">Total</span>
        <span className="font-display text-[28px] text-charcoal">
          {formatINR(calculatedTotal)}
        </span>
      </div>
    </div>
  );
}
