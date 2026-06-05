'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiRefreshCcw,
  FiSave,
  FiShield,
  FiUpload,
  FiUser,
  FiX,
} from 'react-icons/fi';
import adminApi from '@/lib/api';
import useAdminAuthStore from '@/store/useAdminAuthStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getAvatarUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  return `${API_BASE}${url}`;
};

const EMPTY_PASSWORD = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const EMPTY_RESET = {
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

function PasswordInput({ label, value, onChange, required = true, pattern, title }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          className="admin-input pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={8}
          pattern={pattern}
          title={title}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible((next) => !next)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal-900"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const { user, setUser, logout } = useAdminAuthStore();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    role: '',
  });
  const [draftProfile, setDraftProfile] = useState(profile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD);
  const [changingPassword, setChangingPassword] = useState(false);
  const [resetForm, setResetForm] = useState(EMPTY_RESET);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    const nextProfile = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role || '',
    };
    setProfile(nextProfile);
    setDraftProfile(nextProfile);
    setAvatarPreview('');
    setAvatarFile(null);
    setResetForm((prev) => ({ ...prev, email: user.email || '' }));
  }, [user]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const passwordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$';
  const passwordTitle = 'Use at least 8 characters with uppercase, lowercase, number, and special character.';
  const roleLabel = profile.role ? profile.role.replace(/_/g, ' ') : '-';
  const initial = (editingProfile ? draftProfile.name : profile.name)?.trim()?.[0]?.toUpperCase() || 'A';
  const displayAvatar = useMemo(
    () => getAvatarUrl(avatarPreview || draftProfile.avatar || profile.avatar),
    [avatarPreview, draftProfile.avatar, profile.avatar]
  );

  const startEditing = () => {
    setDraftProfile(profile);
    setResetForm((prev) => ({ ...prev, email: profile.email }));
    setAvatarFile(null);
    setAvatarPreview('');
    setEditingProfile(true);
  };

  const cancelEditing = () => {
    setDraftProfile(profile);
    setResetForm((prev) => ({ ...prev, email: profile.email }));
    setAvatarFile(null);
    setAvatarPreview('');
    setEditingProfile(false);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('name', draftProfile.name.trim());
      fd.append('email', draftProfile.email.trim());
      fd.append('phone', draftProfile.phone.trim());
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await adminApi.put('/auth/profile', fd);
      setUser(data.data.user);
      setEditingProfile(false);
      setAvatarFile(null);
      setAvatarPreview('');
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await adminApi.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed. Please sign in again.');
      setPasswordForm(EMPTY_PASSWORD);
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setSendingOtp(true);
    try {
      await adminApi.post('/auth/admin/forgot-password', { email: resetForm.email.trim() });
      setOtpSent(true);
      toast.success('OTP sent to email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setResettingPassword(true);
    try {
      await adminApi.post('/auth/admin/reset-password', {
        email: resetForm.email.trim(),
        otp: resetForm.otp.trim(),
        newPassword: resetForm.newPassword,
      });
      toast.success('Password reset. Please sign in again.');
      setResetForm({ ...EMPTY_RESET, email: resetForm.email });
      setOtpSent(false);
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-charcoal-900">Admin Profile</h2>
        <p className="text-sm text-muted">Manage your account details and password security</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="admin-card h-fit space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-forest-100 text-3xl font-bold text-forest-800">
              {displayAvatar ? <Image src={displayAvatar} alt="" fill sizes="96px" unoptimized={displayAvatar.startsWith('blob:')} className="object-cover" /> : initial}
            </div>
            <h3 className="mt-3 font-semibold text-charcoal-900">{profile.name || 'Admin User'}</h3>
            <p className="text-sm text-muted">{profile.email}</p>
            <span className="admin-badge mt-3 bg-info-bg text-info capitalize">{roleLabel}</span>
          </div>
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center gap-2 text-charcoal-700">
              <FiShield className="text-muted" /> Role cannot be edited here
            </div>
            <div className="flex items-center gap-2 text-charcoal-700">
              <FiMail className="text-muted" /> OTP reset uses admin email
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <form onSubmit={handleProfileSubmit} className="admin-card space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiUser className="text-forest-800" />
                <h3 className="font-semibold text-charcoal-900">Profile Details</h3>
              </div>
              {!editingProfile ? (
                <button type="button" onClick={startEditing} className="admin-btn admin-btn-secondary inline-flex items-center gap-2">
                  <FiEdit2 size={15} /> Edit
                </button>
              ) : (
                <button type="button" onClick={cancelEditing} className="admin-btn admin-btn-secondary inline-flex items-center gap-2">
                  <FiX size={15} /> Cancel
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={draftProfile.name}
                  onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })}
                  disabled={!editingProfile}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="admin-input"
                  value={draftProfile.email}
                  onChange={(e) => {
                    setDraftProfile({ ...draftProfile, email: e.target.value });
                    setResetForm((prev) => ({ ...prev, email: e.target.value }));
                  }}
                  disabled={!editingProfile}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  className="admin-input"
                  value={draftProfile.phone}
                  onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  disabled={!editingProfile}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <input type="text" className="admin-input capitalize" value={roleLabel} disabled />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Profile Image</label>
                {editingProfile ? (
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded border border-dashed border-border px-4 py-3 hover:bg-charcoal-50">
                    <span className="flex items-center gap-2 text-sm text-charcoal-700">
                      <FiUpload className="text-muted" />
                      {avatarFile ? avatarFile.name : 'Choose an image file'}
                    </span>
                    <span className="text-xs text-muted">JPEG, PNG, WebP, AVIF</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    />
                  </label>
                ) : (
                  <p className="rounded border border-border bg-charcoal-50 px-3 py-2 text-sm text-muted">
                    Click Edit to upload a new profile image.
                  </p>
                )}
              </div>
            </div>

            {editingProfile && (
              <button type="submit" disabled={savingProfile} className="admin-btn admin-btn-primary inline-flex items-center gap-2">
                <FiSave size={15} /> {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            )}
          </form>

          <section className="admin-card space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiLock className="text-forest-800" />
                <h3 className="font-semibold text-charcoal-900">Change Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePassword((value) => !value)}
                className="admin-btn admin-btn-secondary inline-flex items-center gap-2"
              >
                {showChangePassword ? <FiX size={15} /> : <FiLock size={15} />}
                {showChangePassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showChangePassword && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <PasswordInput
                    label="Old Password"
                    value={passwordForm.currentPassword}
                    onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })}
                  />
                  <PasswordInput
                    label="New Password"
                    value={passwordForm.newPassword}
                    onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
                    pattern={passwordPattern}
                    title={passwordTitle}
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
                  />
                </div>
                <p className="text-xs text-muted">{passwordTitle}</p>
                <button type="submit" disabled={changingPassword} className="admin-btn admin-btn-primary inline-flex items-center gap-2">
                  <FiLock size={15} /> {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </section>

          <section className="admin-card space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiRefreshCcw className="text-forest-800" />
                <h3 className="font-semibold text-charcoal-900">Forgot Password OTP Reset</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword((value) => !value)}
                className="admin-btn admin-btn-secondary inline-flex items-center gap-2"
              >
                {showForgotPassword ? <FiX size={15} /> : <FiRefreshCcw size={15} />}
                {showForgotPassword ? 'Cancel' : 'Forgot Password'}
              </button>
            </div>

            {showForgotPassword && (
              <div className="space-y-5">
                <form onSubmit={handleSendOtp} className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Email for OTP</label>
                    <input
                      type="email"
                      className="admin-input"
                      value={resetForm.email}
                      onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" disabled={sendingOtp} className="admin-btn admin-btn-secondary self-end">
                    {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </form>

                <form onSubmit={handleResetPassword} className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="admin-input"
                      value={resetForm.otp}
                      onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value.replace(/\D/g, '') })}
                      placeholder="6 digit code"
                      required
                    />
                  </div>
                  <PasswordInput
                    label="New Password"
                    value={resetForm.newPassword}
                    onChange={(value) => setResetForm({ ...resetForm, newPassword: value })}
                    pattern={passwordPattern}
                    title={passwordTitle}
                  />
                  <PasswordInput
                    label="Confirm Password"
                    value={resetForm.confirmPassword}
                    onChange={(value) => setResetForm({ ...resetForm, confirmPassword: value })}
                  />
                  <div className="md:col-span-3">
                    <p className="mb-3 text-xs text-muted">OTP reset is limited to admin accounts and logs you out after password reset.</p>
                    <button type="submit" disabled={resettingPassword} className="admin-btn admin-btn-primary">
                      {resettingPassword ? 'Resetting...' : 'Verify OTP & Reset Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
