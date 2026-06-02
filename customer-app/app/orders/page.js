'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/authStore';
import { formatINR } from '@/lib/data';

function StatusBadge({ status }) {
  const styles = {
    'Processing': 'bg-tertiary-fixed/60 text-tertiary',
    'Shipped':    'bg-secondary-container text-secondary',
    'Delivered':  'bg-primary/10 text-primary',
    'Cancelled':  'bg-error-container text-error',
  };
  const icons = {
    'Processing': 'hourglass_empty',
    'Shipped':    'local_shipping',
    'Delivered':  'check_circle',
    'Cancelled':  'cancel',
  };
  const cls = styles[status] || 'bg-surface-container text-on-surface-variant';
  const icon = icons[status] || 'info';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs font-semibold ${cls}`}>
      <span className="material-symbols-outlined filled" style={{ fontSize: '14px' }}>{icon}</span>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const orders = useAuthStore((state) => state.orders);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-surface pt-24">
        <div className="container-main py-12">
          {/* Page Header */}
          <div className="mb-10 flex flex-col gap-1 border-b border-outline-variant pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-sand">
                Account
              </p>
              <h1 className="mt-2 font-display text-4xl text-charcoal">My Orders</h1>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-body text-sm text-primary-container hover:underline"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
              Continue Shopping
            </Link>
          </div>

          {/* Empty state */}
          {!orders.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low py-24 text-center"
            >
              <span
                className="material-symbols-outlined text-outline"
                style={{ fontSize: '64px' }}
              >
                receipt_long
              </span>
              <h2 className="mt-5 font-display text-2xl text-charcoal">No orders yet</h2>
              <p className="mx-auto mt-3 max-w-sm font-body text-sm leading-relaxed text-on-surface-variant">
                Your order history will appear here once you&apos;ve made a purchase from our
                Nilgiri botanicals collection.
              </p>
              <Link
                href="/shop"
                className="mt-8 rounded-full bg-primary-container px-8 py-3 font-body text-sm text-white transition-colors hover:bg-secondary"
              >
                Explore Products
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {orders.map((order, i) => (
                <motion.article
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-card"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container bg-surface-container-low px-6 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-outline">
                          Order ID
                        </p>
                        <p className="font-display text-base text-charcoal">{order.id}</p>
                      </div>
                      <div className="hidden h-8 w-px bg-outline-variant sm:block" />
                      <div>
                        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-outline">
                          Placed On
                        </p>
                        <p className="font-body text-sm text-on-surface-variant">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Order items */}
                  <div className="divide-y divide-surface-container px-6">
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.id}`}
                        className="flex items-center gap-4 py-4"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-[15px] font-medium text-charcoal line-clamp-1">
                            {item.name}
                          </p>
                          <p className="font-body text-sm text-on-surface-variant">
                            {item.variant} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 font-body text-sm font-semibold text-charcoal">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order footer */}
                  <div className="flex items-center justify-between border-t border-surface-container bg-surface-container-low px-6 py-4">
                    <p className="font-body text-sm text-on-surface-variant">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </p>
                    <p className="font-display text-xl text-charcoal">
                      {formatINR(order.total)}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
