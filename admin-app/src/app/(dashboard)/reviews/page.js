'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FiCheckCircle, FiThumbsDown, FiTrash2, FiRotateCcw } from 'react-icons/fi';
import adminApi from '@/lib/api';
import useConfirmStore from '@/store/useConfirmStore';
import ActionMenu from '@/components/ActionMenu';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const confirm = useConfirmStore((state) => state.confirm);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await adminApi.get(`/admin/reviews${params}`);
      setReviews(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [statusFilter]);

  // Uses PUT /admin/reviews/:id/moderate with { action } in body
  const handleModerate = async (id, action) => {
    try {
      await adminApi.put(`/admin/reviews/${id}/moderate`, { action });
      toast.success(`Review ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchReviews();
    } catch (error) { toast.error('Action failed'); }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review permanently?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try { await adminApi.delete(`/admin/reviews/${id}`); toast.success('Review deleted'); fetchReviews(); }
    catch { toast.error('Delete failed'); }
  };

  const statusConfig = {
    approved: { label: 'Approved', cls: 'bg-success-bg text-success' },
    rejected: { label: 'Rejected', cls: 'bg-error-bg text-error' },
    pending: { label: 'Pending', cls: 'bg-warning-bg text-warning' },
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-charcoal-900">Reviews</h2><p className="text-sm text-muted">Moderate customer reviews — only approved reviews appear on the storefront</p></div>

      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`admin-btn text-xs capitalize ${statusFilter === s ? 'admin-btn-primary' : 'admin-btn-secondary'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="admin-card p-12 text-center"><span className="spinner mx-auto" /></div>
        ) : reviews.length === 0 ? (
          <div className="admin-card p-12 text-center text-muted">No reviews found</div>
        ) : reviews.map((r) => (
          <div key={r._id} className="admin-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < r.rating ? 'text-warning' : 'text-charcoal-200'}`}>★</span>
                    ))}
                  </div>
                  <span className={`admin-badge text-[10px] ${statusConfig[r.status]?.cls || 'bg-warning-bg text-warning'}`}>
                    {statusConfig[r.status]?.label || r.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-charcoal-900">{r.title || 'No title'}</p>
                <p className="text-sm text-charcoal-700 mt-1">{r.comment}</p>
                {r.status === 'rejected' && r.rejectionReason && (
                  <p className="text-xs text-error mt-1 italic">Rejection reason: {r.rejectionReason}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                  <span>By: {r.user?.name || 'Anonymous'}</span>
                  <span>Product: {r.product?.name || '—'}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <ActionMenu
                label={`Open actions for review ${r.title || r._id}`}
                actions={[
                  ...(r.status !== 'approved' ? [
                    { label: 'Approve', icon: FiCheckCircle, success: true, onClick: () => handleModerate(r._id, 'approve') },
                  ] : []),
                  ...(r.status !== 'rejected' ? [
                    { label: 'Reject', icon: FiThumbsDown, danger: true, onClick: () => handleModerate(r._id, 'reject') },
                  ] : []),
                  ...(r.status === 'rejected' ? [
                    { label: 'Re-approve', icon: FiRotateCcw, success: true, onClick: () => handleModerate(r._id, 'approve') },
                  ] : []),
                  { label: 'Delete', icon: FiTrash2, danger: true, onClick: () => handleDelete(r._id) },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
