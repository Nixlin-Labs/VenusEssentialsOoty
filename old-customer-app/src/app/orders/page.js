'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = statusFilter ? `?status=${statusFilter}` : '';
        const { data } = await api.get(`/orders${params}`);
        setOrders(data.data || []);
      } catch (error) {
        console.error('Orders fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, statusFilter]);

  const statusColors = {
    placed: 'badge-primary',
    confirmed: 'badge-primary',
    packed: 'badge-accent',
    dispatched: 'badge-accent',
    delivered: 'badge-success',
    cancelled: 'badge-error',
    refunded: 'badge-error',
  };

  if (!isAuthenticated) {
    return (
      <div className="container-tight py-20 text-center">
        <span className="text-5xl mb-4 block">🔐</span>
        <h2 className="heading-section">Please sign in to view your orders</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-forest-900 py-12">
        <div className="container-tight text-center">
          <h1 className="font-display text-3xl font-bold text-white">My Orders</h1>
          <p className="text-forest-200 text-sm mt-2">Track and manage your orders</p>
        </div>
      </div>

      <div className="container-tight py-10">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {['', 'placed', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
            >
              {status || 'All Orders'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">📦</span>
            <p className="heading-card text-charcoal-500">No orders found</p>
            <Link href="/shop" className="btn btn-primary mt-6">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order._id} href={`/orders/${order._id}`} className="block" id={`order-${order.orderNumber}`}>
                <div className="card p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-charcoal-900">{order.orderNumber}</span>
                        <span className={`badge ${statusColors[order.orderStatus] || 'badge-primary'}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                      </p>
                      {order.items?.slice(0, 3).map((item, i) => (
                        <p key={i} className="text-sm text-charcoal-700 mt-1 truncate">
                          {item.productName} — {item.variantName} × {item.quantity}
                        </p>
                      ))}
                      {(order.items?.length || 0) > 3 && (
                        <p className="text-xs text-muted mt-1">+{order.items.length - 3} more items</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="price-display text-lg">₹{order.total?.toFixed(0)}</p>
                      <p className="text-xs text-muted mt-1">
                        {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
