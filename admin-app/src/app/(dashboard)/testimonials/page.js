'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';
import useConfirmStore from '@/store/useConfirmStore';
import CustomDropdown from '@/components/CustomDropdown';
import { FiEdit2, FiEye, FiEyeOff, FiSearch, FiTrash2 } from 'react-icons/fi';
import ActionMenu from '@/components/ActionMenu';

const EMPTY_FORM = { name: '', location: '', text: '', rating: 5, isActive: true, sortOrder: 0 };

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active', icon: '🟢' },
  { label: 'Hidden', value: 'hidden', icon: '🔴' }
];

const RATING_OPTIONS = [
  { label: 'All Ratings', value: '' },
  { label: '5 Stars', value: '5', icon: '★' },
  { label: '4 Stars', value: '4', icon: '★' },
  { label: '3 Stars', value: '3', icon: '★' },
  { label: '2 Stars', value: '2', icon: '★' },
  { label: '1 Star', value: '1', icon: '★' }
];

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-xl transition-colors ${star <= value ? 'text-warning' : 'text-charcoal-200 hover:text-warning'}`}
          title={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const confirm = useConfirmStore((state) => state.confirm);

  // Filter & Pagination states
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/testimonials');
      setTestimonials(data.data || []);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Filtered testimonials (client-side)
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = t.name?.toLowerCase().includes(query);
        const matchText = t.text?.toLowerCase().includes(query);
        const matchLocation = t.location?.toLowerCase().includes(query);
        if (!matchName && !matchText && !matchLocation) return false;
      }
      // 2. Status Filter
      if (statusFilter) {
        if (statusFilter === 'active' && !t.isActive) return false;
        if (statusFilter === 'hidden' && t.isActive) return false;
      }
      // 3. Rating Filter
      if (ratingFilter) {
        if (t.rating !== Number(ratingFilter)) return false;
      }
      return true;
    });
  }, [testimonials, search, statusFilter, ratingFilter]);

  // Pagination calculations (client-side)
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredTestimonials.length / ITEMS_PER_PAGE);
  const paginatedTestimonials = useMemo(() => {
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    return filteredTestimonials.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredTestimonials, page]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditingId(t._id);
    setForm({
      name: t.name,
      location: t.location || '',
      text: t.text,
      rating: t.rating,
      isActive: t.isActive,
      sortOrder: t.sortOrder ?? 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      toast.error('Name and testimonial text are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.put(`/admin/testimonials/${editingId}`, form);
        toast.success('Testimonial updated');
      } else {
        await adminApi.post('/admin/testimonials', form);
        toast.success('Testimonial created');
      }
      setShowForm(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await adminApi.patch(`/admin/testimonials/${id}/toggle`);
      toast.success(data.message);
      fetchTestimonials();
    } catch {
      toast.error('Toggle failed');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Testimonial',
      message: 'Are you sure you want to permanently delete this testimonial?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await adminApi.delete(`/admin/testimonials/${id}`);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">Testimonials</h2>
          <p className="text-sm text-muted">Manage customer testimonials displayed on the homepage</p>
        </div>
        <button onClick={openCreate} className="admin-btn admin-btn-primary text-sm">
          + Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-charcoal-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, location or quote..."
                className="admin-input pl-10 w-full"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">
                <FiSearch size={18} />
              </span>
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-charcoal-700 mb-1">Status</label>
            <CustomDropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              placeholder="All Statuses"
            />
          </div>

          {/* Rating Filter */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-charcoal-700 mb-1">Rating</label>
            <CustomDropdown
              options={RATING_OPTIONS}
              value={ratingFilter}
              onChange={(val) => {
                setRatingFilter(val);
                setPage(1);
              }}
              placeholder="All Ratings"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex gap-2 w-full h-[40px]">
            <button onClick={handleSearch} className="admin-btn admin-btn-secondary flex-1 h-full cursor-pointer">
              Search
            </button>
            <button
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setStatusFilter('');
                setRatingFilter('');
                setPage(1);
              }}
              className="admin-btn admin-btn-secondary px-3 h-full cursor-pointer"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-charcoal-900">
                {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted hover:text-charcoal-900 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1">
                  Customer Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="admin-input w-full"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="admin-input w-full"
                  placeholder="e.g. Bangalore"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              {/* Testimonial Text */}
              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1">
                  Testimonial <span className="text-error">*</span>
                </label>
                <textarea
                  className="admin-input w-full resize-none"
                  rows={4}
                  placeholder="What the customer said..."
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                />
                <p className="text-xs text-muted mt-1">{form.text.length}/1000 characters</p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1.5">Rating</label>
                <StarPicker value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
              </div>

              {/* Sort Order & Active */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-charcoal-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="admin-input w-full"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-charcoal-700 cursor-pointer">
                    Active (visible on site)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="admin-btn admin-btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary text-sm disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="admin-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="spinner mx-auto" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-medium text-charcoal-700">No testimonials yet</p>
            <p className="text-sm mt-1">Click "Add Testimonial" to get started</p>
          </div>
        ) : paginatedTestimonials.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-medium text-charcoal-700">No matching testimonials</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Customer</th>
                    <th style={{ width: '15%' }}>Location</th>
                    <th style={{ width: '40%' }}>Testimonial</th>
                    <th style={{ width: '10%' }} className="text-center">Rating</th>
                    <th style={{ width: '8%' }} className="text-center">Order</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '2%' }} className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTestimonials.map((t) => (
                    <tr key={t._id} className={!t.isActive ? 'opacity-60' : ''}>
                      <td>
                        <div className="font-semibold text-charcoal-900">{t.name}</div>
                        <div className="text-[10px] text-muted">{new Date(t.createdAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="text-sm">{t.location || '—'}</td>
                      <td>
                        <p className="text-sm text-charcoal-700 italic line-clamp-2" title={t.text}>
                          &ldquo;{t.text}&rdquo;
                        </p>
                      </td>
                      <td>
                        <div className="flex justify-center text-warning text-sm">
                          {[...Array(t.rating)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-center text-sm font-medium">{t.sortOrder || '—'}</td>
                      <td>
                        <span className={`admin-badge text-[10px] ${
                          t.isActive ? 'bg-success-bg text-success' : 'bg-charcoal-100 text-charcoal-500'
                        }`}>
                          {t.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <ActionMenu
                          label={`Open actions for ${t.name}`}
                          actions={[
                            { label: 'Edit', icon: FiEdit2, onClick: () => openEdit(t) },
                            {
                              label: t.isActive ? 'Hide' : 'Show',
                              icon: t.isActive ? FiEyeOff : FiEye,
                              success: !t.isActive,
                              onClick: () => handleToggle(t._id),
                            },
                            { label: 'Delete', icon: FiTrash2, danger: true, onClick: () => handleDelete(t._id) },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-charcoal-50/20">
                <p className="text-sm text-muted">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="admin-btn admin-btn-secondary text-xs py-1 px-3 disabled:opacity-40 cursor-pointer"
                  >← Prev</button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="admin-btn admin-btn-secondary text-xs py-1 px-3 disabled:opacity-40 cursor-pointer"
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
