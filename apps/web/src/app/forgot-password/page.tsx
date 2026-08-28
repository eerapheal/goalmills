'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiCheckCircle, FiExternalLink } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to process request');
      }

      setSubmitted(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pt-20">
      <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl animate-fade-in border border-white/10 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 mx-auto mb-3">
            GM
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Enter your registered email address to receive password reset instructions
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-4 text-xs sm:text-sm font-bold">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <FiCheckCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">Reset Link Ready</h3>
            <p className="text-xs text-slate-300">
              Password reset instructions have been generated for{' '}
              <span className="font-bold text-amber-400">{email}</span>.
            </p>

            {resetUrl && (
              <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl space-y-2 text-left">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
                  Quick Reset Access:
                </span>
                <Link
                  href={resetUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all w-full justify-center shadow-lg shadow-amber-500/20"
                >
                  <span>Proceed to Reset Password</span>
                  <FiExternalLink size={14} />
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                <FiArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                  placeholder="you@goalmills.com"
                />
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'Generating Reset Link...' : 'Send Reset Link'}
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
    </div>
  );
}
