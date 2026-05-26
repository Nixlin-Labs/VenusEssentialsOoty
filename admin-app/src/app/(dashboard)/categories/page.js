'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';
import useFileViewerStore from '@/store/useFileViewerStore';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', sortOrder: 0, isActive: true, isHomeView: false, homeViewOption: '0', image: null, existingImage: null });
  const { openViewer } = useFileViewerStore();
  const getImageUrl = (url) => url ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` : '';

  const fetchCategories = async () => {
    try {
      const { data } = await adminApi.get('/admin/categories');
      setCategories(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('sortOrder', formData.sortOrder);
      data.append('isActive', formData.isActive);
      data.append('homeViewOption', formData.homeViewOption);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingId) {
        await adminApi.put(`/admin/categories/${editingId}`, data);
        toast.success('Category updated');
      } else {
        await adminApi.post('/admin/categories', data);
        toast.success('Category created');
      }
      setShowForm(false); setEditingId(null);
      setFormData({ name: '', description: '', sortOrder: 0, isActive: true, isHomeView: false, homeViewOption: '0', image: null, existingImage: null });
      fetchCategories();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0, isActive: cat.isActive, isHomeView: cat.isHomeView || false, homeViewOption: cat.homeViewOption || '0', image: null, existingImage: cat.image?.url || null });
    setEditingId(cat._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await adminApi.delete(`/admin/categories/${id}`); toast.success('Category deleted'); fetchCategories(); }
    catch (error) { toast.error(error.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-charcoal-900">Categories</h2><p className="text-sm text-muted">Manage product categories</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', description: '', sortOrder: 0, isActive: true, isHomeView: false, homeViewOption: '0', image: null, existingImage: null }); }} className="admin-btn admin-btn-primary">
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card space-y-4">
          <h3 className="text-base font-semibold">{editingId ? 'Edit' : 'New'} Category</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" className="admin-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Sort Order</label><input type="number" className="admin-input" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea className="admin-input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex items-center gap-4">
                {formData.existingImage && !formData.image && (
                  <img 
                    src={getImageUrl(formData.existingImage)} 
                    alt="Current" 
                    className="w-16 h-16 object-cover rounded cursor-pointer border border-border" 
                    onClick={() => openViewer(getImageUrl(formData.existingImage))}
                    title="Click to view full size"
                  />
                )}
                {formData.image && (
                  <img 
                    src={URL.createObjectURL(formData.image)} 
                    alt="New" 
                    className="w-16 h-16 object-cover rounded border border-border" 
                  />
                )}
                <input type="file" className="admin-input flex-1" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-forest-800" />Active
            </label>
            <label className="flex items-center gap-2">
              Dropdown:
              <select className="admin-input py-1 px-2" value={formData.homeViewOption} onChange={(e) => setFormData({ ...formData, homeViewOption: e.target.value })}>
                <option value="0">Don't show in Home Page</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </label>
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="p-12 text-center"><span className="spinner mx-auto" /></div> : (
          <table className="admin-table">
            <thead><tr><th>Sl.No</th><th>Image</th><th>Name</th>
            {/* <th>Slug</th> */}
            <th>Products</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.sortOrder}</td>
                  <td>
                    {cat.image?.url ? (
                      <img 
                        src={getImageUrl(cat.image.url)} 
                        alt={cat.name} 
                        className="w-10 h-10 object-cover rounded cursor-pointer border border-border"
                        onClick={() => openViewer(getImageUrl(cat.image.url))}
                        title="Click to view full size"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">No img</div>
                    )}
                  </td>
                  <td className="font-medium text-charcoal-900">{cat.name}</td>
                  {/* <td className="text-muted">{cat.slug}</td> */}
                  <td>{cat.productCount || 0}</td>
                  <td>{cat.sortOrder}</td>
                  <td><span className={`admin-badge ${cat.isActive ? 'bg-success-bg text-success' : 'bg-charcoal-50 text-charcoal-500'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="space-x-2">
                    <button onClick={() => handleEdit(cat)} className="text-sm text-info hover:underline">Edit</button>
                    <button onClick={() => handleDelete(cat._id)} className="text-sm text-error hover:underline">Delete</button>
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
