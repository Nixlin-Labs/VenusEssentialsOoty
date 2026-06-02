'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';

const EMPTY_FORM = { name: '', location: '', text: '', rating: 5, isActive: true, sortOrder: 0 };

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

  useEffect(() => { fetchTestimonials(); }, []);

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
    if (!confirm('Delete this testimonial permanently?')) return;
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
      <div className="space-y-3">
        {loading ? (
          <div className="admin-card p-12 text-center">
            <span className="spinner mx-auto" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="admin-card p-12 text-center text-muted">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-medium text-charcoal-700">No testimonials yet</p>
            <p className="text-sm mt-1">Click "Add Testimonial" to get started</p>
          </div>
        ) : (
          testimonials.map((t) => (
            <div
              key={t._id}
              className={`admin-card transition-opacity ${!t.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Stars */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < t.rating ? 'text-warning' : 'text-charcoal-200'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span
                      className={`admin-badge text-[10px] ${
                        t.isActive
                          ? 'bg-success-bg text-success'
                          : 'bg-charcoal-100 text-charcoal-500'
                      }`}
                    >
                      {t.isActive ? 'Active' : 'Hidden'}
                    </span>
                    {t.sortOrder > 0 && (
                      <span className="text-[10px] text-muted">Order: {t.sortOrder}</span>
                    )}
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-charcoal-700 italic line-clamp-2">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs font-semibold text-charcoal-900">{t.name}</p>
                    {t.location && (
                      <>
                        <span className="text-charcoal-300">·</span>
                        <p className="text-xs text-muted">{t.location}</p>
                      </>
                    )}
                    <span className="text-charcoal-300">·</span>
                    <p className="text-xs text-muted">
                      {new Date(t.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(t)}
                    className="admin-btn admin-btn-secondary text-xs py-1.5 px-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(t._id)}
                    className="admin-btn admin-btn-secondary text-xs py-1.5 px-3"
                  >
                    {t.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="text-xs text-error hover:underline text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
