'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 20 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const { data } = await adminApi.get(`/admin/newsletter/subscribers?${params}`);
      setSubscribers(data.data || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      toast.error('Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [search, status]);

  const handleToggle = async (sub) => {
    try {
      await adminApi.put(`/admin/newsletter/subscribers/${sub._id}/toggle`);
      toast.success(`Subscriber ${sub.isActive ? 'unsubscribed' : 'reactivated'}`);
      fetchSubscribers();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this subscriber?')) return;
    try {
      await adminApi.delete(`/admin/newsletter/subscribers/${id}`);
      toast.success('Subscriber deleted');
      fetchSubscribers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleExportCSV = () => {
    if (!subscribers.length) return;
    const rows = [
      ['Email', 'Status', 'Source', 'Subscribed At'],
      ...subscribers.map(s => [
        s.email,
        s.isActive ? 'Active' : 'Unsubscribed',
        s.source,
        new Date(s.createdAt).toLocaleDateString('en-IN'),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">Newsletter Subscribers</h2>
          <p className="text-sm text-muted">
            Manage email subscribers — {pagination.total} total
          </p>
        </div>
        <button onClick={handleExportCSV} className="admin-btn admin-btn-secondary flex items-center gap-2">
          ⬇️ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-input max-w-xs"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="admin-input w-44"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <span className="text-sm text-muted ml-auto">
          Showing {subscribers.length} of {pagination.total}
        </span>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><span className="spinner mx-auto" /></div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-muted text-sm">No subscribers found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Source</th>
                <th>Status</th>
                <th>Subscribed On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, idx) => (
                <tr key={sub._id}>
                  <td className="text-muted text-xs">{(currentPage - 1) * 20 + idx + 1}</td>
                  <td className="font-medium text-charcoal-900">{sub.email}</td>
                  <td>
                    <span className="text-xs bg-charcoal-50 text-charcoal-600 px-2 py-0.5 rounded capitalize">
                      {sub.source}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${sub.isActive ? 'bg-success-bg text-success' : 'bg-error-bg text-error'}`}>
                      {sub.isActive ? '✓ Active' : '✗ Unsubscribed'}
                    </span>
                  </td>
                  <td className="text-sm text-muted">
                    {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="space-x-3">
                    <button
                      onClick={() => handleToggle(sub)}
                      className={`text-sm hover:underline ${sub.isActive ? 'text-warning' : 'text-success'}`}
                    >
                      {sub.isActive ? 'Unsubscribe' : 'Reactivate'}
                    </button>
                    <button
                      onClick={() => handleDelete(sub._id)}
                      className="text-sm text-error hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1 || loading}
            className="admin-btn admin-btn-secondary py-1.5 px-4 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-forest-800 text-white'
                  : 'border border-border text-charcoal-600 hover:bg-charcoal-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === pagination.totalPages || loading}
            className="admin-btn admin-btn-secondary py-1.5 px-4 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
