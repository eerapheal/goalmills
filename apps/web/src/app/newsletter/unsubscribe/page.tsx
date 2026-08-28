'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiAlertCircle, FiMail, FiSliders, FiArrowLeft } from 'react-icons/fi';
import type { NewsletterFrequency } from '@goalmills/types';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState<NewsletterFrequency>('daily');
  const [selectedFrequency, setSelectedFrequency] = useState<NewsletterFrequency>('daily');
  const [status, setStatus] = useState<string>('active');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchInfo = async () => {
      try {
        const res = await fetch(`/api/newsletter/unsubscribe?token=${token}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setSubscriberEmail(data.data.email);
          setCurrentFrequency(data.data.frequency);
          setSelectedFrequency(data.data.frequency);
          setStatus(data.data.status);
        } else {
          setMessage({ text: data.message || 'Invalid unsubscribe token', type: 'error' });
        }
      } catch (err) {
        setMessage({ text: 'Failed to load subscription details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'unsubscribe' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('unsubscribed');
        setMessage({ text: data.message, type: 'success' });
      } else {
        setMessage({ text: data.message || 'Failed to unsubscribe', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateFrequency = async () => {
    if (!token) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'update_frequency',
          frequency: selectedFrequency,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('active');
        setCurrentFrequency(selectedFrequency);
        setMessage({ text: data.message, type: 'success' });
      } else {
        setMessage({ text: data.message || 'Failed to update preferences', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  if (!token) {
    return (
      <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-4 text-white">
        <FiAlertCircle className="mx-auto text-amber-400" size={40} />
        <h2 className="text-xl font-bold">Missing Token</h2>
        <p className="text-xs text-text-muted">
          No unsubscribe token provided. Please click the unsubscribe link directly in your newsletter email.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl text-center text-white space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold">Loading subscription preferences...</p>
      </div>
    );
  }

  return (
    <div className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-white animate-fade-in">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 mx-auto mb-3">
          GM
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Newsletter Preferences</h1>
        <p className="text-xs text-text-muted mt-1">
          Managing subscription for <span className="text-amber-400 font-bold">{subscriberEmail}</span>
        </p>
      </div>

      {message && (
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

      {/* Frequency Adjustment Option */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <FiSliders className="text-amber-400" size={16} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Change Delivery Frequency
          </h2>
        </div>
        <p className="text-[11px] text-slate-400">
          Too many emails? Instead of unsubscribing, you can switch to a Weekly or Monthly digest.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['daily', 'weekly', 'monthly'] as NewsletterFrequency[]).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setSelectedFrequency(freq)}
              className={`p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                selectedFrequency === freq
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={processing || (selectedFrequency === currentFrequency && status === 'active')}
          onClick={handleUpdateFrequency}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40"
        >
          {processing ? 'Updating...' : `Update to ${selectedFrequency.toUpperCase()} Digest`}
        </button>
      </div>

      {/* Unsubscribe Option */}
      <div className="pt-2 text-center space-y-3">
        {status === 'unsubscribed' ? (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-400">
            ✓ You are currently unsubscribed from all GoalMills digests.
          </div>
        ) : (
          <button
            type="button"
            disabled={processing}
            onClick={handleUnsubscribe}
            className="text-xs font-bold text-red-400 hover:text-red-300 underline transition-colors"
          >
            Unsubscribe completely from all GoalMills emails
          </button>
        )}
      </div>

      <div className="text-center pt-3 border-t border-white/10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft size={14} /> Back to Live Site
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pt-20">
      <Suspense fallback={<div className="text-white text-sm font-bold">Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
