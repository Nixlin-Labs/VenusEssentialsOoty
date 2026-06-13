'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';
import { toast } from 'sonner';

/* ─── helpers ─── */
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const imgUrl = (url) => (url ? `${API_URL}${url}` : '/placeholder-product.jpg');

const STATUS_STYLES = {
  pending_payment: { cls: 'bg-tertiary-fixed/60 text-tertiary',         icon: 'schedule'         },
  placed:          { cls: 'bg-blue-50 text-blue-700',                   icon: 'check_circle'      },
  confirmed:       { cls: 'bg-secondary-container text-secondary',       icon: 'thumb_up'          },
  packed:          { cls: 'bg-orange-50 text-orange-600',               icon: 'inventory_2'       },
  dispatched:      { cls: 'bg-purple-50 text-purple-700',               icon: 'local_shipping'    },
  delivered:       { cls: 'bg-primary/10 text-primary',                 icon: 'done_all'          },
  cancelled:       { cls: 'bg-error-container text-error',              icon: 'cancel'            },
  rejected:        { cls: 'bg-error-container text-error',              icon: 'block'             },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { cls: 'bg-surface-container text-outline', icon: 'info' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs font-semibold ${s.cls}`}>
      <span className="material-symbols-outlined filled" style={{ fontSize: '14px' }}>{s.icon}</span>
      {status?.replace('_', ' ')}
    </span>
  );
}

/* ─── Interactive star picker ─── */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} star`}
        >
          <span
            className={`material-symbols-outlined ${(hovered || value) >= n ? 'filled' : ''}`}
            style={{ fontSize: '32px', color: (hovered || value) >= n ? '#c6a983' : '#c2c8c2' }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─── Review Modal ─── */
function ReviewModal({ open, onClose, item, orderId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle]   = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setRating(0); setTitle(''); setComment(''); }
  }, [open, item]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a star rating'); return; }
    if (comment.trim().length < 10) { toast.error('Review must be at least 10 characters'); return; }
    setLoading(true);
    try {
      await api.post('/reviews', {
        productId: item.product,
        orderId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });
      toast.success('Review submitted! It will appear after moderation.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 48 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-x-0 bottom-0 z-[210] md:inset-0 md:flex md:items-center md:justify-center md:p-6"
          >
            <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
              {/* Handle */}
              <div className="w-12 h-1 rounded-full bg-outline-variant mx-auto mt-3 mb-1 md:hidden" />

              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-4 pb-4 border-b border-outline-variant/40">
                <div className="flex items-center gap-3">
                  {item?.image && (
                    <img
                      src={item.image.startsWith('http') ? item.image : imgUrl(item.image)}
                      alt={item.productName}
                      className="h-12 w-12 rounded-xl object-cover border border-outline-variant/30"
                    />
                  )}
                  <div>
                    <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-sand mb-0.5">
                      Write a Review
                    </p>
                    <h3 className="font-display text-lg text-charcoal leading-tight line-clamp-2">
                      {item?.productName}
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant">{item?.variantName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors shrink-0 ml-2"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {/* Star Rating */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-widest text-outline mb-3">
                    Your Rating *
                  </p>
                  <StarPicker value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <p className="mt-1.5 font-body text-xs text-on-surface-variant">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block font-body text-xs font-semibold uppercase tracking-widest text-outline mb-1.5">
                    Review Title <span className="normal-case font-normal text-outline/60">(optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="Sum up your experience in a sentence…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field w-full"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block font-body text-xs font-semibold uppercase tracking-widest text-outline mb-1.5">
                    Your Review *
                  </label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                    placeholder="What did you love? Would you recommend it? (min 10 characters)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field w-full resize-none"
                  />
                  <p className="mt-1 font-body text-[11px] text-on-surface-variant text-right">
                    {comment.length} / 1000
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !rating}
                  className="w-full rounded-xl bg-primary-container py-3.5 font-body text-sm font-semibold text-white transition-all hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  )}
                  {loading ? 'Submitting…' : 'Submit Review'}
                </button>
                <p className="text-center font-body text-xs text-on-surface-variant">
                  Reviews go through moderation before appearing publicly.
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Orders Page ─── */
export default function OrdersPage() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [expandedId, setExpandedId]   = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, item: null, orderId: null });
  const [reviewed, setReviewed]       = useState({}); // tracks submitted reviews in this session

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data.data || []);
    } catch {
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openReview = (item, orderId) =>
    setReviewModal({ open: true, item, orderId });

  const closeReview = () =>
    setReviewModal({ open: false, item: null, orderId: null });

  const markReviewed = (productId) =>
    setReviewed((prev) => ({ ...prev, [productId]: true }));

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      toast.loading('Downloading invoice...', { id: 'download-invoice' });
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Invoice downloaded', { id: 'download-invoice' });
    } catch (error) {
      toast.error('Failed to download invoice', { id: 'download-invoice' });
    }
  };

  const EmptySkeleton = () => (
    <div className="space-y-5">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-outline-variant bg-white p-6 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-4 w-32 bg-neutral-200 rounded" />
            <div className="h-6 w-20 bg-neutral-200 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-4">
                <div className="h-14 w-14 bg-neutral-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-3 w-1/2 bg-neutral-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-surface pt-24">
        <div className="container-main py-12">
          {/* Page Header */}
          <div className="mb-10 flex flex-col gap-1 border-b border-outline-variant pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-sand">Account</p>
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

          {/* Content */}
          {loading ? (
            <EmptySkeleton />
          ) : !orders.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low py-24 text-center"
            >
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '64px' }}>receipt_long</span>
              <h2 className="mt-5 font-display text-2xl text-charcoal">No orders yet</h2>
              <p className="mx-auto mt-3 max-w-sm font-body text-sm leading-relaxed text-on-surface-variant">
                Your order history will appear here once you&apos;ve made a purchase.
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
              {orders.map((order, i) => {
                const isExpanded = expandedId === order._id;
                const isDelivered = order.orderStatus === 'delivered';
                return (
                  <motion.article
                    key={order._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-card"
                  >
                    {/* Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container bg-surface-container-low px-6 py-4">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <div>
                          <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-outline">Order</p>
                          <p className="font-display text-base text-charcoal">{order.orderNumber}</p>
                        </div>
                        <div className="hidden h-7 w-px bg-outline-variant sm:block" />
                        <div>
                          <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-outline">Placed</p>
                          <p className="font-body text-sm text-on-surface-variant">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="hidden h-7 w-px bg-outline-variant sm:block" />
                        <div>
                          <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-outline">Total</p>
                          <p className="font-body text-sm font-semibold text-charcoal">₹{order.total?.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.orderStatus} />
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : order._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                            className="material-symbols-outlined text-[18px] text-on-surface-variant"
                          >
                            expand_more
                          </motion.span>
                        </button>
                      </div>
                    </div>

                    {/* Order items summary (always visible) */}
                    <div className="divide-y divide-surface-container px-6">
                      {order.items?.slice(0, isExpanded ? undefined : 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low">
                            {item.image ? (
                              <img
                                src={imgUrl(item.image)}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-outline text-[22px]">spa</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-[15px] font-medium text-charcoal line-clamp-1">{item.productName}</p>
                            <p className="font-body text-sm text-on-surface-variant">{item.variantName} · Qty {item.quantity}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="font-body text-sm font-semibold text-charcoal">₹{item.total?.toFixed(0)}</p>
                            {isDelivered && !reviewed[item.product] && (
                              <button
                                onClick={() => openReview(item, order._id)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-sand/60 bg-tertiary-fixed/30 px-3 py-1 font-body text-[11px] font-semibold text-tertiary hover:bg-sand/20 transition-colors"
                              >
                                <span className="material-symbols-outlined filled text-[13px]">star</span>
                                Write Review
                              </button>
                            )}
                            {isDelivered && reviewed[item.product] && (
                              <span className="inline-flex items-center gap-1 font-body text-[11px] text-secondary">
                                <span className="material-symbols-outlined filled text-[13px]">check_circle</span>
                                Review Submitted
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-surface-container"
                        >
                          <div className="px-6 py-5 grid md:grid-cols-2 gap-6">
                            {/* Shipping address */}
                            <div>
                              <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
                                Shipping To
                              </p>
                              <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 font-body text-sm text-on-surface-variant space-y-0.5">
                                <p className="font-semibold text-charcoal">{order.shippingAddress?.fullName}</p>
                                <p>{order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                <p>📞 {order.shippingAddress?.phone}</p>
                              </div>
                            </div>

                            {/* Price breakdown */}
                            <div>
                              <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
                                Price Breakdown
                              </p>
                              <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 space-y-1.5 font-body text-sm text-on-surface-variant">
                                <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal?.toFixed(0)}</span></div>
                                <div className="flex justify-between"><span>GST</span><span>₹{order.gst?.total?.toFixed(0)}</span></div>
                                <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCharge ? `₹${order.shippingCharge}` : 'Free'}</span></div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-secondary"><span>Discount</span><span>-₹{order.discount?.toFixed(0)}</span></div>
                                )}
                                <div className="border-t border-outline-variant pt-1.5 flex justify-between font-semibold text-charcoal">
                                  <span>Total</span><span>₹{order.total?.toFixed(0)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Tracking info (dispatched or beyond) */}
                            {['dispatched', 'delivered'].includes(order.orderStatus) && order.courierName && (
                              <div className="md:col-span-2">
                                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
                                  Tracking Info
                                </p>
                                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 flex items-center gap-4">
                                  <span className="material-symbols-outlined text-purple-600 text-[32px]">local_shipping</span>
                                  <div className="font-body">
                                    <p className="font-semibold text-charcoal">{order.courierName}</p>
                                    <p className="text-sm text-on-surface-variant">
                                      Tracking / Office No:&nbsp;
                                      <span className="font-semibold text-charcoal">{order.trackingNumber || '—'}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Status history */}
                            {order.statusHistory?.length > 0 && (
                              <div className="md:col-span-2">
                                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-outline mb-3">
                                  Order Timeline
                                </p>
                                <div className="space-y-2">
                                  {[...order.statusHistory].reverse().map((h, hi) => (
                                    <div key={hi} className="flex items-start gap-3">
                                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${hi === 0 ? 'bg-primary-container' : 'bg-outline-variant'}`} />
                                      <div>
                                        <p className="font-body text-sm font-medium text-charcoal capitalize">
                                          {h.status?.replace('_', ' ')}
                                        </p>
                                        {h.note && <p className="font-body text-xs text-on-surface-variant">{h.note}</p>}
                                        <p className="font-body text-[11px] text-outline mt-0.5">
                                          {new Date(h.timestamp).toLocaleString('en-IN')}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Download Invoice Button */}
                            {isDelivered && (
                              <div className="md:col-span-2 border-t border-surface-container pt-4">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-body text-sm text-charcoal transition-colors hover:border-primary hover:text-primary"
                                >
                                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                  Download Invoice
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Order footer */}
                    <div className="flex items-center justify-between border-t border-surface-container bg-surface-container-low px-6 py-3">
                      <div className="font-body text-xs text-on-surface-variant flex items-center gap-2">
                        <span>{order.items?.length} item(s)</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span>Payment: </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full capitalize font-semibold text-[10px] ${
                          order.paymentStatus === 'paid' ? 'bg-primary/10 text-primary' :
                          order.paymentStatus === 'failed' ? 'bg-error-container text-error' :
                          order.paymentStatus === 'refunded' ? 'bg-surface-container text-outline' :
                          'bg-tertiary-fixed/60 text-tertiary'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order._id)}
                        className="font-body text-xs text-primary-container hover:underline"
                      >
                        {isExpanded ? 'Show less' : 'View details'}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Review modal */}
      <ReviewModal
        open={reviewModal.open}
        onClose={closeReview}
        item={reviewModal.item}
        orderId={reviewModal.orderId}
        onSuccess={() => markReviewed(reviewModal.item?.product)}
      />

      <Footer />
    </ProtectedRoute>
  );
}
