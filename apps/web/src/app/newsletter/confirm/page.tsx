'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiAlertCircle, FiArrowRight, FiShield } from 'react-icons/fi';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage('Missing confirmation token in URL.');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const res = await fetch(`/api/newsletter/confirm?token=${token}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(true);
          setEmail(data.data.email);
          setMessage(data.message || 'Subscription confirmed successfully!');
        } else {
          setSuccess(false);
          setMessage(data.message || 'Invalid or expired confirmation link.');
        }
      } catch (err) {
        setSuccess(false);
        setMessage('An error occurred while confirming your subscription.');
      } finally {
        setLoading(false);
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-5 text-white animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20 mx-auto">
        <FiShield size={28} />
      </div>

      {loading ? (
        <div className="space-y-3 py-4">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-bold">Verifying your email...</h2>
          <p className="text-xs text-text-muted">Connecting with GoalMills Deliverability Gate</p>
        </div>
      ) : success ? (
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Subscription Confirmed!</h1>
            <p className="text-xs text-emerald-400 font-bold mt-1">Verified: {email}</p>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Your email has been confirmed. You will now receive curated 10:00 AM matchday briefs, breaking news alerts, and editor picks.
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              <span>Explore Live Matchday News</span>
              <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            <FiAlertCircle size={22} />
          </div>
          <h1 className="text-xl font-bold">Verification Failed</h1>
          <p className="text-xs text-text-muted leading-relaxed">{message}</p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConfirmSubscriptionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pt-20">
      <Suspense fallback={<div className="text-white text-sm font-bold">Loading confirmation...</div>}>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}
