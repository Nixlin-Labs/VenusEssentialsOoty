'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminApi from '@/lib/api';
import useConfirmStore from '@/store/useConfirmStore';
import ActionMenu from '@/components/ActionMenu';

export default function AdminCmsPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', isActive: true });
  const confirm = useConfirmStore((state) => state.confirm);

  const fetchPages = async () => {
    try { const { data } = await adminApi.get('/admin/cms/pages'); setPages(data.data || []); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchPages(); }, []);

  const resetForm = () => { setFormData({ title: '', slug: '', content: '', isActive: true }); setShowForm(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await adminApi.put(`/admin/cms/pages/${editingId}`, formData); toast.success('Page updated'); }
      else { await adminApi.post('/admin/cms/pages', formData); toast.success('Page created'); }
      resetForm(); fetchPages();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (p) => { setFormData({ title: p.title, slug: p.slug, content: p.content, isActive: p.isActive }); setEditingId(p._id); setShowForm(true); };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Page',
      message: 'Are you sure you want to delete this static page permanently?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try { await adminApi.delete(`/admin/cms/pages/${id}`); toast.success('Deleted'); fetchPages(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-charcoal-900">CMS Pages</h2><p className="text-sm text-muted">Manage static pages</p></div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="admin-btn admin-btn-primary">{showForm ? 'Cancel' : '+ Create Page'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card space-y-4">
          <h3 className="text-base font-semibold">{editingId ? 'Edit' : 'New'} Page</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Title *</label><input type="text" className="admin-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Slug *</label><input type="text" className="admin-input" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Content (HTML) *</label><textarea className="admin-input font-mono text-xs" rows="12" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-forest-800" />Published</label>
          <button type="submit" className="admin-btn admin-btn-primary">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="p-12 text-center"><span className="spinner mx-auto" /></div> : (
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Updated</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium text-charcoal-900">{p.title}</td>
                  <td className="text-muted font-mono text-xs">/{p.slug}</td>
                  <td><span className={`admin-badge ${p.isActive ? 'bg-success-bg text-success' : 'bg-charcoal-50 text-charcoal-500'}`}>{p.isActive ? 'Published' : 'Draft'}</span></td>
                  <td className="text-xs text-muted">{new Date(p.updatedAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <ActionMenu
                      label={`Open actions for ${p.title}`}
                      actions={[
                        { label: 'Edit', icon: FiEdit2, onClick: () => handleEdit(p) },
                        { label: 'Delete', icon: FiTrash2, danger: true, onClick: () => handleDelete(p._id) },
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
