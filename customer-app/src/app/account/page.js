'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import useAuthStore from '@/store/useAuthStore';
import useUIStore from '@/store/useUIStore';

export default function AccountPage() {
  const { user, updateProfile, isAuthenticated, logout } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container-tight py-20 text-center">
        <span className="text-5xl mb-4 block">🔐</span>
        <h2 className="heading-section">Please sign in</h2>
        <button onClick={() => openAuthModal('login')} className="btn btn-primary mt-6">Sign In</button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated');
      setEditing(false);
    } else {
      toast.error(result.error || 'Update failed');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-forest-900 py-12">
        <div className="container-tight text-center">
          <div className="w-20 h-20 bg-forest-700 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-display font-bold">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">{user?.name}</h1>
          <p className="text-forest-200 text-sm mt-1">{user?.email}</p>
        </div>
      </div>

      <div className="container-tight py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/orders', icon: '📦', label: 'My Orders' },
              { href: '/addresses', icon: '📍', label: 'Addresses' },
              { href: '/wishlist', icon: '❤️', label: 'Wishlist' },
              { href: '/shop', icon: '🛒', label: 'Shop' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="card p-4 text-center hover:shadow-card-hover transition-shadow">
                <span className="text-2xl mb-2 block">{link.icon}</span>
                <p className="text-sm font-medium text-charcoal-900">{link.label}</p>
              </a>
            ))}
          </div>

          {/* Profile Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-card">Personal Information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">Edit</button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="label block mb-1.5">Full Name</label>
                  <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="label block mb-1.5">Email</label>
                  <input type="email" className="input bg-sand-50 cursor-not-allowed" value={user?.email} disabled />
                  <p className="text-xs text-muted mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="label block mb-1.5">Phone</label>
                  <input type="tel" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                    {saving ? <span className="spinner" /> : 'Save Changes'}
                  </button>
                  <button onClick={() => { setEditing(false); setFormData({ name: user?.name, phone: user?.phone }); }} className="btn btn-ghost">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border-light">
                  <span className="text-muted">Name</span><span className="font-medium text-charcoal-900">{user?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-light">
                  <span className="text-muted">Email</span><span className="font-medium text-charcoal-900">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-light">
                  <span className="text-muted">Phone</span><span className="font-medium text-charcoal-900">{user?.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted">Member Since</span>
                  <span className="font-medium text-charcoal-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-error/20">
            <h3 className="heading-card text-error mb-3">Sign Out</h3>
            <p className="text-sm text-muted mb-4">You can sign back in anytime.</p>
            <button onClick={logout} className="btn btn-ghost text-error hover:bg-error-bg btn-sm">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
