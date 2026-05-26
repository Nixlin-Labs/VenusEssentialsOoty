'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await adminApi.get(`/admin/customers${params}`);
      setCustomers(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleBlock = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/customers/${id}/block`);
      toast.success(data.message);
      fetchCustomers();
      if (selectedCustomer?._id === id) {
        const { data: detail } = await adminApi.get(`/admin/customers/${id}`);
        setSelectedCustomer(detail.data.customer);
      }
    } catch (error) { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-charcoal-900">Customers</h2><p className="text-sm text-muted">Manage customer accounts</p></div>

      <div className="admin-card">
        <div className="flex gap-4">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()} placeholder="Search by name, email, or phone..." className="admin-input flex-1" />
          <button onClick={fetchCustomers} className="admin-btn admin-btn-secondary">Search</button>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="p-12 text-center"><span className="spinner mx-auto" /></div> : (
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td className="font-medium text-charcoal-900">{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`admin-badge ${c.isBlocked ? 'bg-error-bg text-error' : c.isVerified ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
                      {c.isBlocked ? 'Blocked' : c.isVerified ? 'Active' : 'Unverified'}
                    </span>
                  </td>
                  <td className="space-x-2">
                    <button onClick={async () => { const { data } = await adminApi.get(`/admin/customers/${c._id}`); setSelectedCustomer(data.data); }} className="text-sm text-info hover:underline">View</button>
                    <button onClick={() => handleBlock(c._id)} className={`text-sm hover:underline ${c.isBlocked ? 'text-success' : 'text-error'}`}>
                      {c.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-lg rounded-xl shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-border flex justify-between"><h3 className="text-lg font-bold">{selectedCustomer.customer?.name || selectedCustomer.name}</h3><button onClick={() => setSelectedCustomer(null)} className="text-xl text-muted">✕</button></div>
              <div className="p-6 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted block">Email</span>{selectedCustomer.customer?.email || selectedCustomer.email}</div>
                  <div><span className="text-muted block">Phone</span>{selectedCustomer.customer?.phone || selectedCustomer.phone || '—'}</div>
                  <div><span className="text-muted block">Joined</span>{new Date(selectedCustomer.customer?.createdAt || selectedCustomer.createdAt).toLocaleDateString('en-IN')}</div>
                  <div><span className="text-muted block">Status</span>{(selectedCustomer.customer || selectedCustomer).isBlocked ? 'Blocked' : 'Active'}</div>
                </div>
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                  <div>
                    <h4 className="font-semibold mt-4 mb-2">Recent Orders ({selectedCustomer.orders.length})</h4>
                    {selectedCustomer.orders.slice(0, 5).map((o) => (
                      <div key={o._id} className="flex justify-between py-2 border-b border-border-light">
                        <span>{o.orderNumber}</span>
                        <span className="font-medium">₹{o.total?.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
