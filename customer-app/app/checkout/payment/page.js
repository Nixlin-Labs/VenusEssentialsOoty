'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import OrderSummary from '@/components/checkout/OrderSummary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/authStore';
import { useCart } from '@/lib/cartStore';
import { formatINR } from '@/lib/data';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const user = useAuthStore((state) => state.user);
  const addresses = useAuthStore((state) => state.addresses);
  const selectedAddressId = useAuthStore((state) => state.selectedAddressId);
  const cartItems = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId || a._id === selectedAddressId) || addresses[0];

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  const checkoutItems = cartItems.map((item) => ({
    name: item.name,
    variant: item.variant,
    price: formatINR(item.price * item.quantity),
    image: item.image,
    quantity: item.quantity,
  }));

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create order via backend
      const payload = {
        addressId: selectedAddress._id || selectedAddress.id,
      };

      const { data } = await api.post('/checkout/create-order', payload);
      const order = data.data;

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
            clearCart();
            toast.success('Order placed successfully!');
            router.push(`/order-success?id=${order._id}`);
          } catch (error) {
            toast.error('Payment verification failed');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || user?.mobile || '',
        },
        theme: {
          color: '#2d4739', // primary color
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setError('Payment cancelled. Please try again.');
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay checkout script not loaded');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment initiation failed');
      console.log(err.response);
      
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-surface pt-20 md:pt-24">
        <div className="container-main py-8">
          <nav className="mb-8 font-body text-[13px] text-[#727973]">
            <span>Cart</span>
            <span className="mx-2">›</span>
            <span>Information</span>
            <span className="mx-2">›</span>
            <span>Shipping</span>
            <span className="mx-2">›</span>
            <span className="font-medium text-charcoal">Payment</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[58%_42%]">
            <div>
              <div className="mb-8 overflow-hidden rounded-lg border border-[#e4e2dd] bg-white">
                {[
                  { label: 'Contact', value: user?.email || 'customer@example.com' },
                  {
                    label: 'Ship to',
                    value: selectedAddress
                      ? `${selectedAddress.fullName || user?.name}, ${selectedAddress.line1}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`
                      : 'No address selected',
                  },
                  { label: 'Method', value: `Standard Shipping · ${formatINR(shipping)}` },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-start justify-between px-5 py-4 ${
                      i > 0 ? 'border-t border-surface-container' : ''
                    }`}
                  >
                    <div>
                      <p className="font-body text-xs text-[#727973]">{row.label}</p>
                      <p className="font-body text-sm text-charcoal">{row.value}</p>
                    </div>
                    <Link
                      href="/checkout/information"
                      className="font-body text-[13px] text-primary-container hover:underline"
                    >
                      Change
                    </Link>
                  </div>
                ))}
              </div>

              <section className="mb-8">
                <h2 className="font-display text-[28px] text-charcoal">Payment</h2>
                <p className="mt-1 font-body text-sm text-[#727973]">
                  All transactions are secure and encrypted through Razorpay.
                </p>

                <div className="mt-6 overflow-hidden rounded-lg border border-[#e4e2dd] bg-white p-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="h-8 w-8 text-blue-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-body font-medium text-charcoal">Secure Online Payment</p>
                        <p className="font-body text-sm text-[#727973] mt-1">
                          Pay using your credit card, debit card, UPI, or net banking through India&apos;s most trusted payment gateway.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="font-body text-sm text-red-700">{error}</p>
                  </div>
                )}
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl text-charcoal">Billing Address</h2>
                <p className="mt-1 font-body text-sm text-[#727973]">
                  Your billing address will be the same as your shipping address.
                </p>
                <div className="mt-4 overflow-hidden rounded-lg border border-[#e4e2dd] bg-white p-4">
                  <p className="font-body text-sm text-charcoal">
                    {selectedAddress
                      ? `${selectedAddress.fullName || user?.name}, ${selectedAddress.line1}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`
                      : 'Please select a shipping address first'}
                  </p>
                </div>
              </section>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/checkout/information"
                  className="font-body text-sm text-primary-container hover:underline"
                >
                  ‹ Return to shipping
                </Link>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedAddress || cartItems.length === 0}
                  className={`rounded-md px-8 py-3 font-body text-sm text-white transition-all ${
                    isProcessing || !selectedAddress || cartItems.length === 0
                      ? 'cursor-not-allowed bg-outline-variant opacity-60'
                      : 'bg-primary-container hover:bg-secondary'
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </button>
              </div>
            </div>

            <div>
              <OrderSummary
                items={checkoutItems}
                subtotal={formatINR(subtotal)}
                shipping={formatINR(shipping)}
                total={formatINR(total)}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </ProtectedRoute>
  );
}
