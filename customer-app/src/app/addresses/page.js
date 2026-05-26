'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function AddressesPage() {
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', landmark: '',
    city: '', state: '', pincode: '', type: 'home', isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) fetchAddresses(); }, [isAuthenticated]);

  const resetForm = () => {
    setFormData({ fullName: '', phone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', type: 'home', isDefault: false });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, formData);
        toast.success('Address updated');
      } else {
        await api.post('/addresses', formData);
        toast.success('Address added');
      }
      resetForm();
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (addr) => {
    setFormData({
      fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '', landmark: addr.landmark || '',
      city: addr.city, state: addr.state, pincode: addr.pincode,
      type: addr.type || 'home', isDefault: addr.isDefault,
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to set default');
    }
  };

  if (!isAuthenticated) {
    return <div className="container-tight py-20 text-center"><h2 className="heading-section">Please sign in</h2></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-forest-900 py-12">
        <div className="container-tight text-center">
          <h1 className="font-display text-3xl font-bold text-white">My Addresses</h1>
        </div>
      </div>

      <div className="container-tight py-10 max-w-3xl mx-auto">
        {/* Add Button */}
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary mb-6" id="add-address-btn">+ Add New Address</button>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4" id="address-form">
            <h3 className="heading-card">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label block mb-1">Full Name *</label><input type="text" className="input" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required /></div>
              <div><label className="label block mb-1">Phone *</label><input type="tel" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
              <div className="md:col-span-2"><label className="label block mb-1">Address Line 1 *</label><input type="text" className="input" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} required /></div>
              <div className="md:col-span-2"><label className="label block mb-1">Address Line 2</label><input type="text" className="input" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} /></div>
              <div><label className="label block mb-1">Landmark</label><input type="text" className="input" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} /></div>
              <div><label className="label block mb-1">City *</label><input type="text" className="input" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required /></div>
              <div><label className="label block mb-1">State *</label><input type="text" className="input" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required /></div>
              <div><label className="label block mb-1">Pincode *</label><input type="text" className="input" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} pattern="[0-9]{6}" required /></div>
            </div>
            <div className="flex items-center gap-4">
              <select className="input w-auto" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="home">🏠 Home</option>
                <option value="work">🏢 Work</option>
                <option value="other">📍 Other</option>
              </select>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="accent-forest-800" />
                Set as default
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'} Address</button>
              <button type="button" onClick={resetForm} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        )}

        {/* Addresses List */}
        {loading ? (
          <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16"><span className="text-5xl mb-4 block">📍</span><p className="heading-card text-charcoal-500">No addresses saved</p></div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr._id} className={`card p-5 ${addr.isDefault ? 'ring-2 ring-forest-500' : ''}`} id={`address-${addr._id}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-charcoal-900">{addr.fullName}</span>
                      <span className="badge badge-primary text-[10px]">{addr.type || 'home'}</span>
                      {addr.isDefault && <span className="badge badge-success text-[10px]">Default</span>}
                    </div>
                    <p className="text-sm text-charcoal-700">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-sm text-charcoal-700">{addr.addressLine2}</p>}
                    <p className="text-sm text-charcoal-700">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-xs text-muted mt-1">Phone: {addr.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr._id)} className="btn btn-ghost btn-sm text-xs">Set Default</button>
                    )}
                    <button onClick={() => handleEdit(addr)} className="btn btn-ghost btn-sm text-xs">Edit</button>
                    <button onClick={() => handleDelete(addr._id)} className="btn btn-ghost btn-sm text-xs text-error">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
