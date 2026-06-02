'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/authStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { toast } from 'sonner';

const initialAddressForm = {
  label: '',
  fullName: '',
  mobile: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

function FormField({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-widest text-outline">
        {label}
      </label>
      <input className="input-field" {...props} />
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-outline-variant bg-white p-6 shadow-card md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-surface-container pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>
            {icon}
          </span>
        </div>
        <h2 className="font-display text-2xl text-charcoal">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const addresses = useAuthStore((state) => state.addresses);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const fetchAddresses = useAuthStore((state) => state.fetchAddresses);
  const addAddress = useAuthStore((state) => state.addAddress);
  const updateAddress = useAuthStore((state) => state.updateAddress);
  const deleteAddress = useAuthStore((state) => state.deleteAddress);
  const logout = useAuthStore((state) => state.logout);
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Sign Out?',
      message: 'Are you sure you want to sign out of your Venus Essentials account?',
      confirmText: 'Yes, Sign Out',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (ok) {
      logout();
      toast.success('Signed out successfully');
    }
  };

  const handleDeleteAddress = async (id) => {
    const ok = await confirm({
      title: 'Delete Address?',
      message: 'Are you sure you want to delete this saved address?',
      confirmText: 'Delete',
      cancelText: 'Keep',
      variant: 'danger',
    });
    if (ok) {
      deleteAddress(id);
      toast.success('Address deleted successfully');
    }
  };

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    mobile: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        mobile: user.phone || user.mobile || '',
      });
    }
  }, [user]);

  const [profileSaved, setProfileSaved] = useState(false);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [editingAddressId, setEditingAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const setField = (setter) => (key) => (e) =>
    setter((prev) => ({ ...prev, [key]: e.target.value }));

  const setP = setField(setProfileForm);
  const setA = setField(setAddressForm);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const success = await updateProfile({
      name: profileForm.name,
      phone: profileForm.mobile
    });
    if (success) {
      setProfileSaved(true);
      toast.success('Profile updated successfully');
      setTimeout(() => setProfileSaved(false), 2500);
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleSubmitAddress = (e) => {
    e.preventDefault();
    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
      setEditingAddressId('');
    } else {
      addAddress(addressForm);
    }
    setAddressForm(initialAddressForm);
    setShowAddressForm(false);
  };

  const startEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const cancelAddress = () => {
    setAddressForm(initialAddressForm);
    setEditingAddressId('');
    setShowAddressForm(false);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-surface pt-24">
        <div className="container-main py-12">
          {/* Page header */}
          <div className="mb-10 flex flex-col gap-1 border-b border-outline-variant pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-sand">
                Account
              </p>
              <h1 className="mt-2 font-display text-4xl text-charcoal">
                {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'My Profile'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 font-body text-sm text-on-surface-variant hover:text-charcoal"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
                My Orders
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 font-body text-sm text-error hover:underline"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            {/* Basic Details */}
            <SectionCard title="Personal Details" icon="person">
              <form className="space-y-5" onSubmit={handleSaveProfile}>
                <FormField
                  label="Full Name"
                  type="text"
                  placeholder="Your name"
                  value={profileForm.name}
                  onChange={setP('name')}
                />
                <FormField
                  label="Email Address"
                  type="email"
                  placeholder="you@email.com"
                  value={profileForm.email}
                  onChange={setP('email')}
                />
                <FormField
                  label="Mobile Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={profileForm.mobile}
                  onChange={setP('mobile')}
                />
                <button
                  type="submit"
                  className="relative overflow-hidden rounded-lg bg-primary-container px-6 py-3 font-body text-sm text-white transition-colors hover:bg-secondary"
                >
                  <AnimatePresence mode="wait">
                    {profileSaved ? (
                      <motion.span
                        key="saved"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined filled" style={{ fontSize: '16px' }}>
                          check_circle
                        </span>
                        Saved!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="save"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                      >
                        Save Profile
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </form>
            </SectionCard>

            {/* Addresses */}
            <SectionCard title="Saved Addresses" icon="location_on">
              {/* Saved address list */}
              {addresses.length > 0 && (
                <div className="mb-5 space-y-3">
                  {addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-xl border border-outline-variant bg-surface-container-low p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded-full bg-secondary-container px-2.5 py-0.5 font-body text-[11px] font-semibold uppercase tracking-widest text-secondary">
                              {address.label || 'Address'}
                            </span>
                          </div>
                          <p className="font-body text-sm font-medium text-charcoal">
                            {address.fullName}
                          </p>
                          <p className="font-body text-sm text-on-surface-variant">
                            {address.mobile}
                          </p>
                          <p className="mt-1 font-body text-sm text-on-surface-variant">
                            {address.line1}
                            {address.line2 ? `, ${address.line2}` : ''}
                            {', '}{address.city}, {address.state} — {address.pincode}
                          </p>
                          <p className="font-body text-sm text-on-surface-variant">
                            {address.country}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => startEditAddress(address)}
                            className="rounded-md px-3 py-1.5 font-body text-xs text-primary-container transition-colors hover:bg-surface-container"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="rounded-md px-3 py-1.5 font-body text-xs text-error transition-colors hover:bg-error-container/30"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Toggle Add/Edit form */}
              {!showAddressForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant py-4 font-body text-sm text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_location_alt</span>
                  Add New Address
                </button>
              ) : (
                <AnimatePresence>
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-5"
                    onSubmit={handleSubmitAddress}
                  >
                    <p className="mb-4 font-display text-lg text-charcoal">
                      {editingAddressId ? 'Edit Address' : 'New Address'}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Label (Home / Office)" placeholder="Home" value={addressForm.label} onChange={setA('label')} />
                      <FormField label="Full Name" placeholder="Recipient name" value={addressForm.fullName} onChange={setA('fullName')} />
                      <FormField label="Mobile" type="tel" placeholder="+91 ..." value={addressForm.mobile} onChange={setA('mobile')} />
                      <FormField label="Address Line 1" placeholder="Street, flat no." value={addressForm.line1} onChange={setA('line1')} />
                      <div className="sm:col-span-2">
                        <FormField label="Address Line 2 (Optional)" placeholder="Landmark, area" value={addressForm.line2} onChange={setA('line2')} />
                      </div>
                      <FormField label="City" placeholder="City" value={addressForm.city} onChange={setA('city')} />
                      <FormField label="State" placeholder="State" value={addressForm.state} onChange={setA('state')} />
                      <FormField label="Pincode" placeholder="6-digit PIN" value={addressForm.pincode} onChange={setA('pincode')} />
                      <FormField label="Country" placeholder="India" value={addressForm.country} onChange={setA('country')} />
                    </div>
                    <div className="mt-5 flex gap-3">
                      <button
                        type="submit"
                        className="rounded-lg bg-primary-container px-5 py-2.5 font-body text-sm text-white transition-colors hover:bg-secondary"
                      >
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelAddress}
                        className="rounded-lg border border-outline-variant px-5 py-2.5 font-body text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                </AnimatePresence>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
