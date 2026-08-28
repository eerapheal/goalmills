'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiShield,
  FiUser,
  FiMail,
  FiArrowRight,
  FiKey,
} from 'react-icons/fi';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  // Profile Info State
  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.name || '');
      setImage(session.user.image || '');
    } else if (session === null) {
      router.push('/signin');
    }
  }, [session, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setImage(data.url);
      setMessage({ text: 'Image uploaded! Remember to save changes.', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to upload image', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, image }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          name: username,
          image: image,
        },
      });

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      router.refresh();
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage({ text: '', type: '' });

    if (newPassword.length < 6) {
      setPwdMessage({ text: 'New password must be at least 6 characters long', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password');
      }

      setPwdMessage({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPwdMessage({ text: error.message || 'Error changing password', type: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-[100px] pb-16 text-white">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              My <span className="text-amber-400">Account</span>
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Manage your personal credentials, identity, and security preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider">
              {session.user.role || 'user'}
            </span>
            {session.user.role !== 'user' && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30 transition-colors"
              >
                <span>Workspace</span>
                <FiArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Profile & Identity */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FiUser size={16} />
                </div>
                <h2 className="text-base font-bold uppercase tracking-wider">Identity & Avatar</h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/15 bg-slate-900 group shadow-lg">
                    {image ? (
                      <Image src={image} alt="Profile" fill sizes="112px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-400 bg-slate-800">
                        {username?.charAt(0)?.toUpperCase() || 'GM'}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-[11px] font-bold uppercase">Change</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted">
                    {uploading ? 'Uploading image...' : 'Click avatar to upload photo'}
                  </p>
                </div>

                <div>
                  <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                      placeholder="Enter username"
                      required
                    />
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={session.user?.email || ''}
                      disabled
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-500 text-sm cursor-not-allowed"
                    />
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Managed by system administration</p>
                </div>

                {message.text && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-bold ${
                      message.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Security & Password Management */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <FiKey size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wider">Change Password</h2>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-11 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                      placeholder="••••••••"
                    />
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-11 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                      placeholder="At least 6 characters"
                    />
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                      placeholder="Re-enter new password"
                    />
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>

                {pwdMessage.text && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-bold ${
                      pwdMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {pwdMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {changingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>

            <div className="pt-3 border-t border-white/5 text-[11px] text-text-muted flex items-center gap-2">
              <FiShield className="text-amber-400" size={14} />
              <span>Passwords are encrypted using one-way bcrypt hashing.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
