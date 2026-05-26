'use client';

import { useState, useEffect } from 'react';
import adminApi from '@/lib/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await adminApi.get('/admin/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="stat-card h-24 bg-charcoal-50 rounded-xl" />
        ))}
      </div>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'bg-forest-50 text-forest-800' },
    { label: 'Monthly Revenue', value: `₹${(data?.monthlyRevenue || 0).toLocaleString('en-IN')}`, icon: '📈', color: 'bg-info-bg text-info' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: '🛒', color: 'bg-sand-50 text-sand-800' },
    { label: 'Monthly Orders', value: data?.monthlyOrders || 0, icon: '📦', color: 'bg-warning-bg text-warning' },
    { label: 'Total Customers', value: data?.totalCustomers || 0, icon: '👥', color: 'bg-forest-50 text-forest-800' },
    { label: 'Pending Orders', value: data?.pendingOrders || 0, icon: '⏳', color: 'bg-warning-bg text-warning' },
    { label: 'Low Stock Items', value: data?.lowStockCount || 0, icon: '⚠️', color: data?.lowStockCount > 0 ? 'bg-error-bg text-error' : 'bg-success-bg text-success' },
    { label: 'Pending Reviews', value: data?.pendingReviews || 0, icon: '⭐', color: 'bg-info-bg text-info' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="admin-card" id="recent-orders">
          <h3 className="text-base font-semibold text-charcoal-900 mb-4">Recent Orders</h3>
          {data?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div>
                    <p className="text-sm font-medium text-charcoal-900">{order.orderNumber}</p>
                    <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-charcoal-900">₹{order.total?.toFixed(0)}</p>
                    <span className={`admin-badge text-[10px] ${
                      order.orderStatus === 'delivered' ? 'bg-success-bg text-success' :
                      order.orderStatus === 'cancelled' ? 'bg-error-bg text-error' :
                      'bg-warning-bg text-warning'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">No recent orders</p>
          )}
        </div>

        {/* Top Products */}
        <div className="admin-card" id="top-products">
          <h3 className="text-base font-semibold text-charcoal-900 mb-4">Top Products</h3>
          {data?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((product, i) => (
                <div key={product._id} className="flex items-center gap-3 py-2 border-b border-border-light last:border-0">
                  <span className="text-sm font-bold text-charcoal-300 w-6">#{i + 1}</span>
                  <div className="w-10 h-10 bg-charcoal-50 rounded-lg flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={`http://localhost:5000${product.images[0].url}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-lg">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900 truncate">{product.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-forest-800">{product.totalSold} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">No sales data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
