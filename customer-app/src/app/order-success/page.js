'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center"
      >
        <div className="card p-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-20 h-20 bg-success-bg rounded-full mx-auto flex items-center justify-center mb-6"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>

          <h1 className="font-display text-2xl font-bold text-forest-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-body mb-6">Thank you for shopping with Venus Essentials</p>

          {order && (
            <div className="bg-sand-50 rounded-lg p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Order Number</span>
                <span className="font-semibold text-charcoal-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total</span>
                <span className="font-semibold text-forest-800">₹{order.total?.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Payment</span>
                <span className="badge badge-success text-xs">Paid</span>
              </div>
            </div>
          )}

          <p className="text-sm text-muted mb-6">
            A confirmation email has been sent. You can track your order anytime.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/orders" className="btn btn-primary w-full">View My Orders</Link>
            <Link href="/shop" className="btn btn-secondary w-full">Continue Shopping</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
