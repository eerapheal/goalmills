'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface TopicOption {
  id: string;
  label: string;
  icon: string;
}

interface FrequencyOption {
  id: 'daily' | 'weekly' | 'monthly' | 'all';
  label: string;
  sublabel: string;
  badge?: string;
}

const TOPICS: TopicOption[] = [
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'basketball', label: 'Basketball (NBA)', icon: '🏀' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'transfers', label: 'Transfers & Deals', icon: '🔄' },
  { id: 'tactics', label: 'Tactics & Analytics', icon: '📊' },
  { id: 'vip-alerts', label: 'Matchday Alerts', icon: '⚡' },
];

const FREQUENCIES: FrequencyOption[] = [
  {
    id: 'daily',
    label: 'Daily Morning Intel',
    sublabel: '10:00 AM WAT • Key lineups & match previews',
    badge: 'Popular',
  },
  {
    id: 'weekly',
    label: 'Weekend Edition',
    sublabel: 'Every Friday • Deep tactical breakdowns & previews',
  },
  {
    id: 'all',
    label: 'Real-time Pulse',
    sublabel: 'Instant breaking transfer & injury bulletins',
  },
];

export function NewsletterSubscriptionSection() {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'football',
    'transfers',
    'tactics',
  ]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleApplySuggestion = (suggestion: string) => {
    setEmail(suggestion);
    setSuggestedCorrection(null);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setSuggestedCorrection(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          frequency,
          categories: selectedTopics,
          source: 'homepage_newsletter_section',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.hasTypo && data.suggestedCorrection) {
          setSuggestedCorrection(data.suggestedCorrection);
          setErrorMessage(data.message || `Did you mean ${data.suggestedCorrection}?`);
        } else {
          setErrorMessage(data.message || 'Unable to subscribe. Please try again.');
        }
        setStatus('error');
        return;
      }

      setSuccessMessage(data.message || 'You are now subscribed to GoalMills Sports Intelligence!');
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'A network error occurred. Please check your connection.');
      setStatus('error');
    }
  };

  const resetForm = () => {
    setEmail('');
    setStatus('idle');
    setErrorMessage('');
    setSuggestedCorrection(null);
  };

  return (
    <section
      id="newsletter-section"
      className="relative overflow-hidden bg-gradient-to-b from-[#0a0e27] via-slate-950 to-[#070a1a] py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10"
    >
      {/* Background Decorative Glow Elements */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/15 rounded-full blur-[120px] opacity-70" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-[450px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] opacity-60" />
      <div className="pointer-events-none absolute top-1/3 left-10 w-[350px] h-[300px] bg-cyan-500/10 rounded-full blur-[90px] opacity-50" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-4 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>GoalMills Sports Intelligence Dispatch</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Curated Match Intel & Analytics,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
              Straight to Your Inbox.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Join over <strong className="text-white font-bold">45,000+</strong> sports analysts,
            bettors, and passionate fans receiving verified team lineups, tactical xG breakdowns,
            and transfer exclusives every morning at 10:00 AM WAT.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 hover:border-blue-500/40 transition-all duration-300 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Border Gradient Highlight */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-amber-400" />

          {status === 'success' ? (
            /* SUCCESS STATE */
            <div className="py-8 text-center max-w-xl mx-auto space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white mb-2">You&apos;re On the VIP List!</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{successMessage}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <span>📬 Sent to:</span>
                  <span className="font-mono text-cyan-300 font-bold">{email}</span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Frequency:</span>
                  <span className="font-bold text-amber-300 capitalize">{frequency} Digest</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Selected Topics:</span>
                  <span className="font-bold text-blue-300">
                    {selectedTopics.length > 0
                      ? selectedTopics.join(', ')
                      : 'All Sports Coverage'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                >
                  Subscribe Another Email
                </button>
                <Link
                  href="/news"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all text-center shadow-lg shadow-blue-600/30"
                >
                  Explore Today&apos;s Stories →
                </Link>
              </div>
            </div>
          ) : (
            /* FORM & PREFERENCES STATE */
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Topics Customization */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    Customize Your Sports & Analytics Topics
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {selectedTopics.length} selected
                  </span>
                </label>

                <div className="flex flex-wrap gap-2.5">
                  {TOPICS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                      <button
                        type="button"
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`group px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                            : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{topic.icon}</span>
                        <span>{topic.label}</span>
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5 text-blue-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Frequency Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    2
                  </span>
                  Select Delivery Frequency
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {FREQUENCIES.map((freq) => {
                    const isSelected = frequency === freq.id;
                    return (
                      <div
                        key={freq.id}
                        onClick={() => setFrequency(freq.id)}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative ${
                          isSelected
                            ? 'bg-gradient-to-b from-blue-950/50 to-slate-900 border-blue-500/80 shadow-lg shadow-blue-600/10'
                            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        {freq.badge && (
                          <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {freq.badge}
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {freq.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal pl-6">
                          {freq.sublabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Email Input & Call To Action */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    3
                  </span>
                  Your Email Address
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage('');
                        if (suggestedCorrection) setSuggestedCorrection(null);
                      }}
                      placeholder="e.g. alex.ferguson@sportsmedia.com"
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-extrabold shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        <span>Verifying & Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Sports Intel Free</span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Typo Suggestion Helper */}
                {suggestedCorrection && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span>💡</span>
                      <span>
                        Did you mean{' '}
                        <strong className="underline text-amber-200 font-mono">
                          {suggestedCorrection}
                        </strong>
                        ?
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplySuggestion(suggestedCorrection)}
                      className="px-3 py-1 bg-amber-500 text-black font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors"
                    >
                      Use Suggestion
                    </button>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && !suggestedCorrection && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Trust Indicators & Security Badges */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    100% Free Forever
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Zero Spam Guarantee
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    1-Click Instant Unsubscribe
                  </span>
                </div>
                <div className="text-slate-400">
                  Published daily from Lagos, WAT by GoalMills Sports Media.
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
