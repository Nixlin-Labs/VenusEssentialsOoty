'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isReadFilter, setIsReadFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 15 });
      if (search) params.set('search', search);
      if (isReadFilter) params.set('isRead', isReadFilter);
      const { data } = await adminApi.get(`/admin/enquiries?${params}`);
      setEnquiries(data.data || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      toast.error('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, isReadFilter]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);
  useEffect(() => { setCurrentPage(1); }, [search, isReadFilter]);

  const handleToggleRead = async (enquiry, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await adminApi.put(`/admin/enquiries/${enquiry._id}/read`);
      const updated = res.data.data;
      toast.success(res.data.message || `Marked as ${updated.isRead ? 'read' : 'unread'}`);
      if (selectedEnquiry && selectedEnquiry._id === updated._id) {
        setSelectedEnquiry(updated);
      }
      fetchEnquiries();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Permanently delete this enquiry?')) return;
    try {
      await adminApi.delete(`/admin/enquiries/${id}`);
      toast.success('Enquiry deleted');
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry(null);
      }
      fetchEnquiries();
    } catch {
      toast.error('Delete failed');
    }
  };

  const openEnquiry = async (enquiry) => {
    setSelectedEnquiry(enquiry);
    if (!enquiry.isRead) {
      try {
        const res = await adminApi.put(`/admin/enquiries/${enquiry._id}/read`);
        setSelectedEnquiry(res.data.data);
        fetchEnquiries();
      } catch (err) {
        console.error('Failed to auto-mark as read', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">Enquiries</h2>
          <p className="text-sm text-muted">Manage customer contact messages</p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* Left pane: List */}
        <div className="w-1/2 admin-card p-0 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-border flex gap-3 items-center bg-surface-50 shrink-0">
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input flex-1"
            />
            <select
              value={isReadFilter}
              onChange={e => setIsReadFilter(e.target.value)}
              className="admin-input w-32"
            >
              <option value="">All</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center"><span className="spinner mx-auto" /></div>
            ) : enquiries.length === 0 ? (
              <div className="p-12 text-center text-muted">No enquiries found.</div>
            ) : (
              <ul className="divide-y divide-border">
                {enquiries.map((enq) => (
                  <li
                    key={enq._id}
                    onClick={() => openEnquiry(enq)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-forest-50 ${
                      selectedEnquiry?._id === enq._id ? 'bg-forest-50 border-l-4 border-forest-800' : 'border-l-4 border-transparent'
                    } ${!enq.isRead ? 'font-semibold' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-charcoal-900 truncate pr-4">{enq.subject}</span>
                      <span className="text-xs text-muted whitespace-nowrap">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-charcoal-600 truncate pr-4">{enq.name}</div>
                      {!enq.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-border flex items-center justify-between bg-surface-50 shrink-0">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1 || loading}
                className="text-sm px-2 py-1 text-charcoal-600 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-muted">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === pagination.totalPages || loading}
                className="text-sm px-2 py-1 text-charcoal-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right pane: Details */}
        <div className="w-1/2 admin-card p-0 flex flex-col bg-white overflow-hidden relative">
          {selectedEnquiry ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border bg-surface-50 shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-charcoal-900">{selectedEnquiry.subject}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleToggleRead(selectedEnquiry, e)}
                      className="text-sm text-charcoal-600 hover:text-charcoal-900 px-3 py-1.5 border border-border rounded transition-colors bg-white"
                    >
                      Mark as {selectedEnquiry.isRead ? 'Unread' : 'Read'}
                    </button>
                    <button
                      onClick={(e) => handleDelete(selectedEnquiry._id, e)}
                      className="text-sm text-error hover:bg-error-bg px-3 py-1.5 border border-error/20 rounded transition-colors bg-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted mb-0.5">From</p>
                    <p className="font-medium text-charcoal-900">{selectedEnquiry.name}</p>
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-forest-700 hover:underline">
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  <div className="text-right">
                    <p className="text-muted mb-0.5">Received</p>
                    <p className="text-charcoal-900">
                      {new Date(selectedEnquiry.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-muted text-sm mb-3">Message:</p>
                <div className="text-charcoal-800 whitespace-pre-wrap font-body leading-relaxed">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <span className="text-4xl mb-3">✉️</span>
              <p>Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
