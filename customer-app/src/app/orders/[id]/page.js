'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      toast.success('Order cancelled. Refund will be processed shortly.');
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order.invoiceNumber || order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Invoice download failed');
    }
  };

  const statusSteps = ['placed', 'confirmed', 'packed', 'dispatched', 'delivered'];

  if (loading) {
    return <div className="container-tight py-20 text-center"><div className="spinner mx-auto" /></div>;
  }

  if (!order) {
    return (
      <div className="container-tight py-20 text-center">
        <h2 className="heading-section">Order not found</h2>
        <Link href="/orders" className="btn btn-primary mt-4">Back to Orders</Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.orderStatus);
  const isCancelled = ['cancelled', 'rejected', 'refunded'].includes(order.orderStatus);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-forest-900 py-10">
        <div className="container-tight">
          <Link href="/orders" className="text-forest-300 text-sm hover:text-white transition-colors mb-3 inline-block">← Back to Orders</Link>
          <h1 className="font-display text-2xl font-bold text-white">Order {order.orderNumber}</h1>
          <p className="text-forest-200 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="container-tight py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Tracker */}
            {!isCancelled && (
              <div className="card p-6" id="order-tracker">
                <h3 className="heading-card mb-6">Order Status</h3>
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-charcoal-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-forest-600"
                    />
                  </div>
                  {statusSteps.map((step, i) => (
                    <div key={step} className="relative flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i <= currentStep ? 'bg-forest-600 text-white' : 'bg-charcoal-100 text-charcoal-400'
                      }`}>
                        {i <= currentStep ? '✓' : i + 1}
                      </div>
                      <span className={`text-[10px] mt-2 capitalize ${i <= currentStep ? 'text-forest-700 font-medium' : 'text-muted'}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Banner */}
            {isCancelled && (
              <div className="bg-error-bg border border-error/20 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="text-sm font-semibold text-error">Order {order.orderStatus}</p>
                  <p className="text-xs text-charcoal-600">{order.cancellationReason || 'This order has been cancelled'}</p>
                  {order.refundStatus === 'processed' && (
                    <p className="text-xs text-success mt-1">✓ Refund of ₹{order.refundAmount?.toFixed(0)} processed</p>
                  )}
                </div>
              </div>
            )}

            {/* Tracking Info */}
            {order.courierName && (
              <div className="card p-6">
                <h3 className="heading-card mb-3">Tracking Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted block">Courier</span><span className="font-medium">{order.courierName}</span></div>
                  {order.trackingNumber && <div><span className="text-muted block">Tracking #</span><span className="font-medium">{order.trackingNumber}</span></div>}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="card p-6">
              <h3 className="heading-card mb-4">Items ({order.items?.length})</h3>
              <div className="space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-border-light last:border-0">
                    <div className="w-16 h-16 bg-sand-50 rounded-lg flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal-900">{item.productName}</p>
                      <p className="text-xs text-muted">{item.variantName} · Qty: {item.quantity}</p>
                      {item.hsnCode && <p className="text-xs text-muted">HSN: {item.hsnCode}</p>}
                    </div>
                    <div className="text-right">
                      <p className="price-display text-sm">₹{item.total?.toFixed(0)}</p>
                      <p className="text-xs text-muted">₹{item.effectivePrice?.toFixed(0)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory?.length > 0 && (
              <div className="card p-6">
                <h3 className="heading-card mb-4">Timeline</h3>
                <div className="space-y-4">
                  {order.statusHistory.map((entry, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 bg-forest-500 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-charcoal-900 capitalize">{entry.status}</p>
                        {entry.note && <p className="text-xs text-muted">{entry.note}</p>}
                        <p className="text-xs text-charcoal-400 mt-0.5">
                          {new Date(entry.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="card p-6 sticky top-24">
              <h3 className="heading-card mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>₹{order.subtotal?.toFixed(0)}</span></div>
                {order.gst && (
                  <>
                    <div className="flex justify-between"><span className="text-muted">CGST</span><span>₹{order.gst.cgst?.toFixed(0)}</span></div>
                    <div className="flex justify-between"><span className="text-muted">SGST</span><span>₹{order.gst.sgst?.toFixed(0)}</span></div>
                  </>
                )}
                <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{order.shippingCharge > 0 ? `₹${order.shippingCharge.toFixed(0)}` : 'FREE'}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-₹{order.discount.toFixed(0)}</span></div>}
                <hr className="divider my-2" />
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{order.total?.toFixed(0)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted">Payment</span><span className={order.paymentStatus === 'paid' ? 'text-success font-medium' : 'text-warning'}>{order.paymentStatus}</span></div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                {['placed', 'confirmed', 'packed', 'dispatched', 'delivered'].includes(order.orderStatus) && (
                  <button onClick={handleDownloadInvoice} className="btn btn-secondary w-full btn-sm">
                    📄 Download Invoice
                  </button>
                )}
                {order.orderStatus && ['placed', 'confirmed'].includes(order.orderStatus) && (
                  <button onClick={handleCancel} disabled={cancelling} className="btn btn-ghost w-full btn-sm text-error hover:bg-error-bg">
                    {cancelling ? <span className="spinner" /> : '✕ Cancel Order'}
                  </button>
                )}
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="mt-6 pt-4 border-t border-border-light">
                  <h4 className="label mb-2">Delivery Address</h4>
                  <div className="text-sm text-charcoal-700 space-y-0.5">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
