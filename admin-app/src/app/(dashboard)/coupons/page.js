'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminApi from '@/lib/api';
import useConfirmStore from '@/store/useConfirmStore';
import ActionMenu from '@/components/ActionMenu';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    startsAt: '',
    expiresAt: '',
    usageLimit: '',
    isActive: true,
  });
  const confirm = useConfirmStore((state) => state.confirm);

  const fetchCoupons = async () => {
    try {
      const { data } = await adminApi.get('/admin/coupons');
      setCoupons(data.data || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrderValue: '',
      maxDiscount: '',
      startsAt: '',
      expiresAt: '',
      usageLimit: '',
      isActive: true,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: Number(formData.value),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt) : undefined,
        expiresAt: new Date(formData.expiresAt),
      };

      if (editingId) {
        await adminApi.put(`/admin/coupons/${editingId}`, payload);
        toast.success('Coupon updated');
      } else {
        await adminApi.post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (c) => {
    setFormData({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderValue: c.minOrderValue || '',
      maxDiscount: c.maxDiscount || '',
      startsAt: c.startsAt?.split('T')[0] || '',
      expiresAt: c.expiresAt?.split('T')[0] || '',
      usageLimit: c.usageLimit || '',
      isActive: c.isActive,
    });
    setEditingId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Coupon',
      message: 'Are you sure you want to delete this coupon permanently?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await adminApi.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">Coupons</h2>
          <p className="text-sm text-muted">Manage discount codes</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          className="admin-btn admin-btn-primary"
        >
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card space-y-4">
          <h3 className="text-base font-semibold">{editingId ? 'Edit' : 'New'} Coupon</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                className="admin-input font-mono uppercase"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="admin-input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Fixed Price (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value *</label>
              <input
                type="number"
                className="admin-input"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order (₹)</label>
              <input
                type="number"
                className="admin-input"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
              <input
                type="number"
                className="admin-input"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                disabled={formData.type === 'flat'}
                placeholder={formData.type === 'flat' ? 'N/A' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Usage Limit</label>
              <input
                type="number"
                className="admin-input"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid From</label>
              <input
                type="date"
                className="admin-input"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until *</label>
              <input
                type="date"
                className="admin-input"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="admin-input"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="admin-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="spinner mx-auto" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-muted">No coupons created yet</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Validity</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="font-mono font-bold text-charcoal-900">{c.code}</td>
                  <td>
                    {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                    {c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}
                  </td>
                  <td>{c.minOrderValue ? `₹${c.minOrderValue}` : '—'}</td>
                  <td>
                    {c.usedCount || 0}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="text-xs text-muted">
                    {c.startsAt ? new Date(c.startsAt).toLocaleDateString('en-IN') : '—'} →{' '}
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        c.isActive ? 'bg-success-bg text-success' : 'bg-charcoal-50 text-charcoal-500'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <ActionMenu
                      label={`Open actions for ${c.code}`}
                      actions={[
                        { label: 'Edit', icon: FiEdit2, onClick: () => handleEdit(c) },
                        { label: 'Delete', icon: FiTrash2, danger: true, onClick: () => handleDelete(c._id) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
