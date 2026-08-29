'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft, FiKey } from 'react-icons/fi';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Please provide a valid reset token');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl animate-fade-in border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 mx-auto mb-3">
          GM
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Create New Password
        </h2>
        <p className="text-xs text-text-muted mt-1">Set a secure new password for your account</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-4 text-xs sm:text-sm font-bold">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <FiCheckCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-white">Password Reset Successfully!</h3>
          <p className="text-xs text-slate-300">
            Your password has been updated. Redirecting to sign in page...
          </p>
          <div className="pt-3">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all w-full shadow-lg shadow-amber-500/20"
            >
              Sign In Now &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!initialToken && (
            <div>
              <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
                Reset Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                  placeholder="Paste reset token here"
                />
                <FiKey
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-900/80 border border-white/15 rounded-xl pl-10 pr-11 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                placeholder="At least 6 characters"
              />
              <FiLock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-900/80 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                placeholder="Re-enter new password"
              />
              <FiLock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? 'Resetting Password...' : 'Save New Password'}
          </button>

          <div className="text-center mt-4 pt-3 border-t border-white/10">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pt-20">
      <Suspense
        fallback={<div className="text-white text-sm font-bold">Loading reset form...</div>}
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
