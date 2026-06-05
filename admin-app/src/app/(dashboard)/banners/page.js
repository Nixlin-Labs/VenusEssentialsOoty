'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminApi from '@/lib/api';
import useConfirmStore from '@/store/useConfirmStore';
import ActionMenu from '@/components/ActionMenu';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', linkUrl: '', position: 'hero', sortOrder: 0, isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const confirm = useConfirmStore((state) => state.confirm);

  const fetchBanners = async () => {
    try { const { data } = await adminApi.get('/admin/banners'); setBanners(data.data || []); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const resetForm = () => { setFormData({ title: '', subtitle: '', linkUrl: '', position: 'hero', sortOrder: 0, isActive: true }); setImageFile(null); setShowForm(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editingId) { await adminApi.put(`/admin/banners/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Banner updated'); }
      else { await adminApi.post('/admin/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Banner created'); }
      resetForm(); fetchBanners();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (b) => { setFormData({ title: b.title, subtitle: b.subtitle || '', linkUrl: b.linkUrl || '', position: b.position, sortOrder: b.sortOrder || 0, isActive: b.isActive }); setEditingId(b._id); setShowForm(true); };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Banner',
      message: 'Are you sure you want to delete this banner permanently?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try { await adminApi.delete(`/admin/banners/${id}`); toast.success('Deleted'); fetchBanners(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-charcoal-900">Banners</h2><p className="text-sm text-muted">Manage hero banners and promotions</p></div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="admin-btn admin-btn-primary">{showForm ? 'Cancel' : '+ Add Banner'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card space-y-4">
          <h3 className="text-base font-semibold">{editingId ? 'Edit' : 'New'} Banner</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Title *</label><input type="text" className="admin-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Subtitle</label><input type="text" className="admin-input" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Link URL</label><input type="text" className="admin-input" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Position</label>
              <select className="admin-input" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}>
                <option value="hero">Hero</option><option value="promo">Promo</option><option value="category">Category</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Sort Order</label><input type="number" className="admin-input" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} /></div>
            <div><label className="block text-sm font-medium mb-1">Image</label><input type="file" accept="image/*" className="admin-input" onChange={(e) => setImageFile(e.target.files[0])} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-forest-800" />Active</label>
          <button type="submit" className="admin-btn admin-btn-primary">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-charcoal-50 rounded-xl animate-pulse" />) :
          banners.length === 0 ? <p className="text-muted col-span-full text-center py-12">No banners created yet</p> :
          banners.map((b) => (
            <div key={b._id} className="admin-card p-0 overflow-hidden">
              <div className="aspect-[16/9] bg-charcoal-50 relative">
                {b.image ? <Image src={`http://localhost:5000${b.image}`} alt={b.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>}
                <span className={`admin-badge absolute top-2 right-2 ${b.isActive ? 'bg-success-bg text-success' : 'bg-charcoal-50 text-charcoal-500'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-charcoal-900 text-sm">{b.title}</h4>
                <p className="text-xs text-muted mt-0.5">{b.position} · Order: {b.sortOrder}</p>
                <div className="flex justify-end mt-3">
                  <ActionMenu
                    label={`Open actions for ${b.title}`}
                    actions={[
                      { label: 'Edit', icon: FiEdit2, onClick: () => handleEdit(b) },
                      { label: 'Delete', icon: FiTrash2, danger: true, onClick: () => handleDelete(b._id) },
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
