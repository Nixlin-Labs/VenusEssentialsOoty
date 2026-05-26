'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '',
    validFrom: '', validUntil: '', maxUsage: '', isActive: true,
  });

  const fetchCoupons = async () => {
    try { const { data } = await adminApi.get('/admin/coupons'); setCoupons(data.data || []); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => {
    setFormData({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', validFrom: '', validUntil: '', maxUsage: '', isActive: true });
    setShowForm(false); setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, discountValue: Number(formData.discountValue), minOrderAmount: Number(formData.minOrderAmount) || 0, maxDiscount: Number(formData.maxDiscount) || undefined, maxUsage: Number(formData.maxUsage) || undefined };
      if (editingId) { await adminApi.put(`/admin/coupons/${editingId}`, payload); toast.success('Coupon updated'); }
      else { await adminApi.post('/admin/coupons', payload); toast.success('Coupon created'); }
      resetForm(); fetchCoupons();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (c) => {
    setFormData({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxDiscount: c.maxDiscount || '',
      validFrom: c.validFrom?.split('T')[0] || '', validUntil: c.validUntil?.split('T')[0] || '',
      maxUsage: c.maxUsage || '', isActive: c.isActive,
    });
    setEditingId(c._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await adminApi.delete(`/admin/coupons/${id}`); toast.success('Coupon deleted'); fetchCoupons(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-charcoal-900">Coupons</h2><p className="text-sm text-muted">Manage discount codes</p></div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="admin-btn admin-btn-primary">{showForm ? 'Cancel' : '+ Create Coupon'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card space-y-4">
          <h3 className="text-base font-semibold">{editingId ? 'Edit' : 'New'} Coupon</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Code *</label><input type="text" className="admin-input font-mono uppercase" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Type</label>
              <select className="admin-input" value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}>
                <option value="percentage">Percentage (%)</option><option value="flat">Flat (₹)</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Value *</label><input type="number" className="admin-input" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Min Order (₹)</label><input type="number" className="admin-input" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Max Discount (₹)</label><input type="number" className="admin-input" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Max Usage</label><input type="number" className="admin-input" value={formData.maxUsage} onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Valid From</label><input type="date" className="admin-input" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Valid Until</label><input type="date" className="admin-input" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-forest-800" />Active</label>
          <button type="submit" className="admin-btn admin-btn-primary">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="p-12 text-center"><span className="spinner mx-auto" /></div> : coupons.length === 0 ? <div className="p-12 text-center text-muted">No coupons created yet</div> : (
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Usage</th><th>Validity</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="font-mono font-bold text-charcoal-900">{c.code}</td>
                  <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}{c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}</td>
                  <td>{c.minOrderAmount ? `₹${c.minOrderAmount}` : '—'}</td>
                  <td>{c.usedCount || 0}{c.maxUsage ? ` / ${c.maxUsage}` : ''}</td>
                  <td className="text-xs text-muted">
                    {c.validFrom ? new Date(c.validFrom).toLocaleDateString('en-IN') : '—'} → {c.validUntil ? new Date(c.validUntil).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td><span className={`admin-badge ${c.isActive ? 'bg-success-bg text-success' : 'bg-charcoal-50 text-charcoal-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="space-x-2">
                    <button onClick={() => handleEdit(c)} className="text-sm text-info hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c._id)} className="text-sm text-error hover:underline">Delete</button>
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
