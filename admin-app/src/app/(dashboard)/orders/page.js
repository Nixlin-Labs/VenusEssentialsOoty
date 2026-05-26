'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';

const statusColors = {
  placed: 'bg-info-bg text-info',
  confirmed: 'bg-info-bg text-info',
  packed: 'bg-warning-bg text-warning',
  dispatched: 'bg-warning-bg text-warning',
  delivered: 'bg-success-bg text-success',
  cancelled: 'bg-error-bg text-error',
  rejected: 'bg-error-bg text-error',
  refunded: 'bg-charcoal-50 text-charcoal-500',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await adminApi.get(`/admin/orders?${params.toString()}`);
      setOrders(data.data || []);
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatusUpdate = async (orderId) => {
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      await adminApi.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      setSelectedOrder(null);
      setNewStatus('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">Orders</h2>
          <p className="text-sm text-muted">Manage customer orders</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', 'placed', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`admin-btn text-xs ${statusFilter === status ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="admin-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><span className="spinner mx-auto" /></div>
        ) : (
          <table className="admin-table" id="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="font-medium text-charcoal-900">{order.orderNumber}</td>
                  <td>
                    <p className="text-sm">{order.user?.name || order.guestEmail}</p>
                    <p className="text-xs text-muted">{order.user?.phone}</p>
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td className="font-semibold">₹{order.total?.toFixed(0)}</td>
                  <td>
                    <span className={`admin-badge ${
                      order.paymentStatus === 'paid' ? 'bg-success-bg text-success' :
                      order.paymentStatus === 'refunded' ? 'bg-charcoal-50 text-charcoal-500' :
                      'bg-warning-bg text-warning'
                    }`}>{order.paymentStatus}</span>
                  </td>
                  <td>
                    <span className={`admin-badge ${statusColors[order.orderStatus] || ''}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button
                      onClick={() => { setSelectedOrder(order); setNewStatus(''); }}
                      className="text-sm text-info hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-xl max-h-[80vh] overflow-y-auto" id="order-detail-modal">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900">Order {selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-muted">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-xl text-muted hover:text-charcoal-900">✕</button>
              </div>

              <div className="p-6 space-y-4">
                {/* Items */}
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900 mb-2">Items</h4>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border-light">
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted">{item.variantName} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">₹{item.total?.toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="bg-charcoal-50 rounded-lg p-4 text-sm space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toFixed(0)}</span></div>
                  <div className="flex justify-between"><span>GST</span><span>₹{selectedOrder.gst?.total?.toFixed(0)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>₹{selectedOrder.shippingCharge?.toFixed(0)}</span></div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-success"><span>Discount</span><span>-₹{selectedOrder.discount?.toFixed(0)}</span></div>
                  )}
                  <hr className="border-border" />
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{selectedOrder.total?.toFixed(0)}</span></div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900 mb-2">Shipping Address</h4>
                  <div className="text-sm text-charcoal-700">
                    <p>{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                    <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900 mb-2">Update Status</h4>
                  <div className="flex gap-2">
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="admin-input flex-1" id="order-status-select">
                      <option value="">Select status...</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder._id)}
                      className="admin-btn admin-btn-primary"
                      disabled={!newStatus || updatingStatus}
                    >
                      {updatingStatus ? <span className="spinner" /> : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
