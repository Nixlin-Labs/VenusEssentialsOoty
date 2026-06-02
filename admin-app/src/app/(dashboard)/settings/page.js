'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Venus Essentials', storeEmail: '', storePhone: '', whatsapp: '', storeAddress: '',
    gstNumber: '', shippingFreeAbove: 500, shippingCharge: 50,
    gstPercentage: 18, currency: 'INR',
    socialMedia: { instagram: '', facebook: '', youtube: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get('/admin/settings').then(({ data }) => {
      if (data.data) setSettings({ ...settings, ...data.data });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put('/admin/settings', settings);
      toast.success('Settings saved');
    } catch (error) { toast.error('Save failed'); }
    setSaving(false);
  };

  if (loading) return <div className="admin-card p-12 text-center"><span className="spinner mx-auto" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-xl font-bold text-charcoal-900">Settings</h2><p className="text-sm text-muted">Store configuration</p></div>

      {/* Store Info */}
      <div className="admin-card space-y-4">
        <h3 className="text-base font-semibold text-charcoal-900">Store Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Store Name</label><input type="text" className="admin-input" value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">GST Number</label><input type="text" className="admin-input" value={settings.gstNumber} onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })} /></div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="admin-card space-y-4">
        <h3 className="text-base font-semibold text-charcoal-900">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Support Email</label><input type="email" className="admin-input" value={settings.storeEmail} onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Support Phone</label><input type="tel" className="admin-input" value={settings.storePhone} onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">WhatsApp Number</label><input type="tel" className="admin-input" value={settings.whatsapp || ''} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="e.g. +919876543210" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Physical Address</label><textarea rows="3" className="admin-input" value={settings.storeAddress || ''} onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })} /></div>
        </div>
      </div>

      {/* Shipping & Tax */}
      <div className="admin-card space-y-4">
        <h3 className="text-base font-semibold text-charcoal-900">Shipping & Tax</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Shipping Charge (₹)</label><input type="number" className="admin-input" value={settings.shippingCharge} onChange={(e) => setSettings({ ...settings, shippingCharge: Number(e.target.value) })} /></div>
          <div><label className="block text-sm font-medium mb-1">Free Shipping Above (₹)</label><input type="number" className="admin-input" value={settings.shippingFreeAbove} onChange={(e) => setSettings({ ...settings, shippingFreeAbove: Number(e.target.value) })} /></div>
          <div><label className="block text-sm font-medium mb-1">GST Percentage (%)</label><input type="number" className="admin-input" value={settings.gstPercentage} onChange={(e) => setSettings({ ...settings, gstPercentage: Number(e.target.value) })} /></div>
        </div>
      </div>

      {/* Social Media */}
      <div className="admin-card space-y-4">
        <h3 className="text-base font-semibold text-charcoal-900">Social Media Links</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Instagram</label><input type="url" className="admin-input" value={settings.socialMedia?.instagram || ''} onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, instagram: e.target.value } })} /></div>
          <div><label className="block text-sm font-medium mb-1">Facebook</label><input type="url" className="admin-input" value={settings.socialMedia?.facebook || ''} onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, facebook: e.target.value } })} /></div>
          <div><label className="block text-sm font-medium mb-1">YouTube</label><input type="url" className="admin-input" value={settings.socialMedia?.youtube || ''} onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, youtube: e.target.value } })} /></div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
        {saving ? <span className="spinner" /> : 'Save Settings'}
      </button>
    </div>
  );
}
