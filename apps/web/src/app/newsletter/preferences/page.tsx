'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { FiMail, FiCheck, FiBell, FiCalendar, FiShield, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

function PreferencesContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState(emailParam);

  const [sports, setSports] = useState<string[]>(['football', 'cricket', 'basketball']);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [breakingAlerts, setBreakingAlerts] = useState(true);
  const [transfersOnly, setTransfersOnly] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      if (!token && !emailParam) {
        setLoading(false);
        return;
      }

      try {
        const queryParam = token ? `token=${encodeURIComponent(token)}` : `email=${encodeURIComponent(emailParam)}`;
        const res = await fetch(`/api/newsletter/preferences?${queryParam}`);
        const data = await res.json();

        if (data.success && data.subscriber) {
          setEmail(data.subscriber.email);
          if (data.subscriber.preferences) {
            setSports(data.subscriber.preferences.sports || ['football']);
            setFrequency(data.subscriber.preferences.frequency || 'daily');
            setBreakingAlerts(data.subscriber.preferences.breakingAlerts !== false);
            setTransfersOnly(data.subscriber.preferences.transfersOnly === true);
            setIsPaused(data.subscriber.preferences.isPaused === true);
          }
        }
      } catch (err) {
        console.error('Failed to load subscriber preferences:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [token, emailParam]);

  const toggleSport = (sport: string) => {
    if (sports.includes(sport)) {
      if (sports.length === 1) return; // keep at least 1
      setSports(sports.filter((s) => s !== sport));
    } else {
      setSports([...sports, sport]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/newsletter/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          preferences: {
            sports,
            frequency,
            breakingAlerts,
            transfersOnly,
            isPaused,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update preferences');
      }

      setSuccessMsg('Your newsletter preferences have been updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <GoalmillsLoader />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20">
            <FiMail size={22} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Newsletter <span className="text-amber-400">Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Customize your sports coverage, delivery frequency, and breaking alerts.
          </p>
          {email && (
            <p className="text-xs font-mono text-amber-400 bg-amber-500/10 py-1 px-3 rounded-full inline-block border border-amber-500/20">
              {email}
            </p>
          )}
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <FiCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
            <FiAlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Sports Coverage Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-200">
              Select Your Sports Coverage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'football', label: '⚽ Football', desc: 'UCL, EPL, La Liga' },
                { id: 'cricket', label: '🏏 Cricket', desc: 'IPL, Tests, T20' },
                { id: 'basketball', label: '🏀 Basketball', desc: 'NBA, EuroLeague' },
                { id: 'tennis', label: '🎾 Tennis', desc: 'Grand Slams, ATP' },
                { id: 'baseball', label: '⚾ Baseball', desc: 'MLB, World Classic' },
                { id: 'hockey', label: '🏒 Hockey', desc: 'NHL, Field Hockey' },
              ].map((sport) => {
                const isSelected = sports.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => toggleSport(sport.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-md'
                        : 'bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{sport.label}</span>
                      {isSelected && <FiCheck className="text-amber-400" size={14} />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{sport.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Frequency */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-200">
              Delivery Schedule
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'daily', label: 'Daily Digest', desc: '10:00 AM WAT' },
                { id: 'weekly', label: 'Weekly Roundup', desc: 'Every Monday' },
                { id: 'monthly', label: 'Monthly Recap', desc: '1st of Month' },
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFrequency(freq.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    frequency === freq.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{freq.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{freq.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Options */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-200">
              Specialized Alerts
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 cursor-pointer hover:border-white/20">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FiBell className="text-amber-400" /> Breaking Sports Flash Alerts
                  </span>
                  <p className="text-[11px] text-slate-400">Receive urgent breaking alerts for major match results and events</p>
                </div>
                <input
                  type="checkbox"
                  checked={breakingAlerts}
                  onChange={(e) => setBreakingAlerts(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 cursor-pointer hover:border-white/20">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FiShield className="text-blue-400" /> Pause All Emails (Vacation Mode)
                  </span>
                  <p className="text-[11px] text-slate-400">Temporarily pause newsletters without losing your subscription history</p>
                </div>
                <input
                  type="checkbox"
                  checked={isPaused}
                  onChange={(e) => setIsPaused(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <Link
              href={`/newsletter/unsubscribe?token=${token || ''}&email=${encodeURIComponent(email)}`}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Unsubscribe from all emails
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving Preferences...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewsletterPreferencesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Suspense
          fallback={
            <div className="min-h-[400px] flex items-center justify-center">
              <GoalmillsLoader />
            </div>
          }
        >
          <PreferencesContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
