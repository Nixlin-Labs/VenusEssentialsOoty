'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatINR } from '@/lib/data';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`).then(({ data }) => setOrder(data.data)).catch(() => {});
    }
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full bg-surface-container-low rounded-3xl shadow-card p-10 text-center border border-outline-variant"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-8"
          >
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px' }}>
              check_circle
            </span>
          </motion.div>

          <h1 className="font-display text-3xl text-charcoal mb-3">Order Placed!</h1>
          <p className="font-body text-[15px] text-on-surface-variant mb-8">
            Thank you for shopping with Venus Essentials. Your natural wellness journey begins here.
          </p>

          {order && (
            <div className="bg-white rounded-xl border border-surface-container p-6 text-left space-y-4 mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-surface-container">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-outline">Order No.</span>
                <span className="font-body text-sm font-medium text-charcoal">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-surface-container">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-outline">Total</span>
                <span className="font-body text-base font-bold text-primary">{formatINR(order.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-outline">Payment</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
                  <span className="material-symbols-outlined filled" style={{ fontSize: '14px' }}>check_circle</span>
                  Paid
                </span>
              </div>
            </div>
          )}

          <p className="font-body text-[13px] text-outline mb-8">
            A confirmation email has been sent. You can track your order anytime from your account.
          </p>

          <div className="flex flex-col gap-4">
            <Link 
              href="/orders" 
              className="w-full rounded-full bg-primary-container px-6 py-3.5 font-body text-sm text-white transition-colors hover:bg-secondary"
            >
              View My Orders
            </Link>
            <Link 
              href="/shop" 
              className="w-full rounded-full border border-outline-variant px-6 py-3.5 font-body text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-charcoal"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
