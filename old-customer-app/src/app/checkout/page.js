'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import useUIStore from '@/store/useUIStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart, getItemCount } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Guest form
  const [guestInfo, setGuestInfo] = useState({
    email: '', fullName: '', phone: '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/addresses').then(({ data }) => {
        setAddresses(data.data || []);
        const defaultAddr = (data.data || []).find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr._id);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (items.length === 0) return;
    const fetchSummary = async () => {
      try {
        const payload = isAuthenticated
          ? { addressId: selectedAddress, couponCode: appliedCoupon?.code }
          : {
            guestEmail: guestInfo.email,
            shippingAddress: {
              fullName: guestInfo.fullName, phone: guestInfo.phone,
              addressLine1: guestInfo.addressLine1, addressLine2: guestInfo.addressLine2,
              city: guestInfo.city, state: guestInfo.state, pincode: guestInfo.pincode,
            },
            items: items.map((i) => ({ productId: i.product?._id || i.productId, variantId: i.variant?._id || i.variantId, quantity: i.quantity })),
          };
        const { data } = await api.post('/checkout/summary', payload);
        setSummary(data.data);
      } catch (error) {
        console.error('Summary error:', error);
      }
    };
    const timer = setTimeout(fetchSummary, 500);
    return () => clearTimeout(timer);
  }, [selectedAddress, appliedCoupon, items, guestInfo.pincode]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.post('/checkout/apply-coupon', {
        code: couponCode, subtotal: getSubtotal(),
      });
      setAppliedCoupon(data.data);
      toast.success(`Coupon applied! Save ₹${data.data.discount}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      // Validate guest fields
      if (!guestInfo.email || !guestInfo.fullName || !guestInfo.phone || !guestInfo.addressLine1 || !guestInfo.city || !guestInfo.state || !guestInfo.pincode) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else {
      if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    }

    setProcessing(true);
    try {
      const payload = isAuthenticated
        ? { addressId: selectedAddress, couponCode: appliedCoupon?.code }
        : {
          guestEmail: guestInfo.email,
          shippingAddress: {
            fullName: guestInfo.fullName, phone: guestInfo.phone,
            addressLine1: guestInfo.addressLine1, addressLine2: guestInfo.addressLine2,
            city: guestInfo.city, state: guestInfo.state, pincode: guestInfo.pincode,
          },
          items: items.map((i) => ({
            productId: i.product?._id || i.productId,
            variantId: i.variant?._id || i.variantId,
            quantity: i.quantity,
          })),
          couponCode: appliedCoupon?.code,
        };

      const { data } = await api.post('/checkout/create-order', payload);
      const order = data.data;

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.razorpayOrder.amount,
        currency: 'INR',
        name: 'Venus Essentials',
        description: `Order ${order.orderNumber}`,
        order_id: order.razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              orderId: order._id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart(isAuthenticated);
            toast.success('Order placed successfully!');
            router.push(`/order-success?id=${order._id}`);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: isAuthenticated ? user?.name : guestInfo.fullName,
          email: isAuthenticated ? user?.email : guestInfo.email,
          contact: isAuthenticated ? user?.phone : guestInfo.phone,
        },
        theme: { color: '#2D4739' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order creation failed');
    } finally {
      setProcessing(false);
    }
  };

  if (getItemCount() === 0) {
    return (
      <div className="container-tight py-20 text-center">
        <span className="text-5xl mb-4 block">🛒</span>
        <h2 className="heading-section">Your bag is empty</h2>
        <a href="/shop" className="btn btn-primary mt-6">Continue Shopping</a>
      </div>
    );
  }

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <div className="bg-background min-h-screen">
        <div className="bg-forest-900 py-8">
          <div className="container-tight text-center">
            <h1 className="font-display text-2xl font-bold text-white">Checkout</h1>
          </div>
        </div>

        <div className="container-tight py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Shipping */}
            <div className="lg:col-span-2 space-y-6">
              {!isAuthenticated ? (
                <>
                  {/* Guest Info */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="heading-card">Contact & Shipping</h2>
                      <button onClick={() => openAuthModal('login')} className="text-sm text-forest-700 font-semibold hover:underline">
                        Have an account? Sign In
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2"><label className="label block mb-1">Email *</label><input type="email" className="input" value={guestInfo.email} onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })} id="checkout-email" /></div>
                      <div><label className="label block mb-1">Full Name *</label><input type="text" className="input" value={guestInfo.fullName} onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })} /></div>
                      <div><label className="label block mb-1">Phone *</label><input type="tel" className="input" value={guestInfo.phone} onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })} /></div>
                      <div className="md:col-span-2"><label className="label block mb-1">Address Line 1 *</label><input type="text" className="input" value={guestInfo.addressLine1} onChange={(e) => setGuestInfo({ ...guestInfo, addressLine1: e.target.value })} /></div>
                      <div className="md:col-span-2"><label className="label block mb-1">Address Line 2</label><input type="text" className="input" value={guestInfo.addressLine2} onChange={(e) => setGuestInfo({ ...guestInfo, addressLine2: e.target.value })} /></div>
                      <div><label className="label block mb-1">City *</label><input type="text" className="input" value={guestInfo.city} onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })} /></div>
                      <div><label className="label block mb-1">State *</label><input type="text" className="input" value={guestInfo.state} onChange={(e) => setGuestInfo({ ...guestInfo, state: e.target.value })} /></div>
                      <div><label className="label block mb-1">Pincode *</label><input type="text" className="input" value={guestInfo.pincode} onChange={(e) => setGuestInfo({ ...guestInfo, pincode: e.target.value })} pattern="[0-9]{6}" /></div>
                    </div>
                  </div>
                </>
              ) : (
                /* Saved Addresses */
                <div className="card p-6">
                  <h2 className="heading-card mb-4">Delivery Address</h2>
                  {addresses.length === 0 ? (
                    <p className="text-sm text-muted">No saved addresses. <a href="/addresses" className="text-forest-700 font-semibold">Add one</a></p>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <label
                          key={addr._id}
                          className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedAddress === addr._id ? 'border-forest-800 bg-forest-50' : 'border-border hover:border-forest-300'
                          }`}
                        >
                          <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} className="sr-only" />
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-charcoal-900">{addr.fullName}</p>
                              <p className="text-sm text-charcoal-700 mt-1">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className="text-xs text-muted mt-1">Phone: {addr.phone}</p>
                            </div>
                            {addr.isDefault && <span className="badge badge-primary text-[10px]">Default</span>}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Coupon */}
              <div className="card p-6">
                <h2 className="heading-card mb-4">Coupon Code</h2>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-success-bg p-3 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-success">✓ {appliedCoupon.code} applied</p>
                      <p className="text-xs text-muted">You save ₹{appliedCoupon.discount}</p>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-xs text-error hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="input flex-1" placeholder="Enter coupon code" id="coupon-input" />
                    <button onClick={handleApplyCoupon} className="btn btn-secondary">Apply</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Summary */}
            <div>
              <div className="card p-6 sticky top-24">
                <h2 className="heading-card mb-4">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item, idx) => {
                    const variant = item.variant || {};
                    const price = variant.offerPrice && variant.offerPrice < variant.price ? variant.offerPrice : variant.price;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sand-50 rounded-md flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.product.images[0].url}`} alt="" className="w-full h-full object-cover rounded-md" />
                          ) : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal-900 truncate">{item.product?.name}</p>
                          <p className="text-xs text-muted">{variant.name} × {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold">₹{(price * item.quantity).toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>

                <hr className="divider my-4" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>₹{(summary?.subtotal || getSubtotal()).toFixed(0)}</span></div>
                  {summary?.gst && (
                    <div className="flex justify-between"><span className="text-muted">GST ({summary.gstPercentage}%)</span><span>₹{summary.gst.total?.toFixed(0)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{(summary?.shippingCharge || 0) > 0 ? `₹${summary.shippingCharge.toFixed(0)}` : <span className="text-success font-medium">FREE</span>}</span></div>
                  {summary?.discount > 0 && (
                    <div className="flex justify-between text-success"><span>Discount</span><span>-₹{summary.discount.toFixed(0)}</span></div>
                  )}
                </div>

                <hr className="divider my-4" />
                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-charcoal-900">Total</span>
                  <span className="price-display text-xl">₹{(summary?.total || getSubtotal()).toFixed(0)}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || (isAuthenticated && !selectedAddress)}
                  className="btn btn-primary w-full btn-lg disabled:opacity-50"
                  id="place-order-btn"
                >
                  {processing ? <span className="spinner" /> : 'Pay & Place Order'}
                </button>

                <p className="text-xs text-center text-muted mt-3">
                  🔒 Secured by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
