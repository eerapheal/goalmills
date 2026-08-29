'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiMail,
  FiCheck,
  FiZap,
  FiAward,
  FiShield,
  FiClock,
  FiTrendingUp,
  FiArrowRight,
  FiStar,
  FiUsers,
  FiBookOpen,
  FiActivity,
  FiCheckCircle,
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';

interface TopicOption {
  id: string;
  name: string;
  desc: string;
  icon: string;
  subscribers: string;
}

const NEWSLETTER_CHANNELS: TopicOption[] = [
  {
    id: 'football',
    name: 'The Tactical Half-Space',
    desc: 'Premier League, Champions League, xG metrics & passing networks.',
    icon: '⚽',
    subscribers: '32.4K subs',
  },
  {
    id: 'transfers',
    name: 'Transfer Radar Pro',
    desc: 'Verified signings, release clause deadlines, and contract breakdowns.',
    icon: '🔄',
    subscribers: '28.1K subs',
  },
  {
    id: 'basketball',
    name: 'Court Pulse 24/7',
    desc: 'NBA playoff race, fourth-quarter clutch analytics & EuroLeague radar.',
    icon: '🏀',
    subscribers: '19.8K subs',
  },
  {
    id: 'cricket',
    name: 'The 22 Yards Report',
    desc: 'IPL squad intel, ICC World Cup analysis & ball-by-ball telemetry.',
    icon: '🏏',
    subscribers: '22.3K subs',
  },
];

const FREQUENCIES = [
  {
    id: 'daily',
    title: 'Daily Morning Intel',
    timing: 'Delivered at 07:00 GMT',
    desc: 'Lineup alerts, injury reports & yesterday box scores.',
    badge: 'Most Popular',
  },
  {
    id: 'weekly',
    title: 'Weekend Deep Dive',
    timing: 'Delivered Every Friday',
    desc: 'Comprehensive weekend fixtures & tactical previews.',
    badge: 'Weekly Edition',
  },
  {
    id: 'breaking',
    title: 'Real-Time Breaking Wire',
    timing: 'Instant Alerts',
    desc: 'Done deals, sudden manager sackings, and major VAR decisions.',
    badge: 'Breaking News',
  },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'football',
    'transfers',
  ]);
  const [frequency, setFrequency] = useState<string>('daily');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'sample' | 'benefits'>('sample');

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
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
          categories: selectedChannels,
          source: 'dedicated_newsletter_page',
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
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      setErrorMessage('Network error occurred. Please check your connection.');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-[#070E1A] text-white selection:bg-amber-500 selection:text-slate-950 pt-[100px] sm:pt-[105px] pb-24 relative overflow-hidden">
      {/* Ambient Radial Spotlights */}
      <div className="fixed top-0 left-1/4 h-[600px] w-[600px] bg-blue-600/10 blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 h-[600px] w-[600px] bg-amber-500/5 blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ─── LIVE NEWSLETTER PULSE TICKER ─── */}
        <div className="rounded-2xl bg-[#09162C] border border-blue-500/25 px-4 py-2.5 overflow-hidden shadow-lg flex items-center gap-3">
          <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            VIP DISPATCH
          </span>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <p className="text-xs text-slate-300 font-medium inline-block animate-marquee">
              📬 Delivered to 45,000+ Analysts, Scouts & Fans Daily • Zero Spam • 1-Click Unsubscribe • Real-Time Lineup & Tactical Intelligence
            </p>
          </div>
        </div>

        {/* ─── HERO HEADER BANNER ─── */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#08142A] via-[#0B1E3E] to-[#060D18] p-8 sm:p-12 shadow-2xl shadow-blue-950/50">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
              <FiMail className="text-amber-400" />
              <span>THE GOALMILLS INTELLIGENCE DISPATCH</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Smarter Sports Intel,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                Direct to Your Inbox
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Receive tactical breakdowns, verified transfer scoops, and confirmed matchday lineups
              before kickoff. Choose your sports channels and frequency below.
            </p>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscribers</span>
                <span className="text-xl font-black text-white">45,000+</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Open Rate</span>
                <span className="text-xl font-black text-amber-400">58.4%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Speed</span>
                <span className="text-xl font-black text-emerald-400">&lt; 60 Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── INTERACTIVE SUBSCRIPTION STUDIO & SAMPLE PREVIEW ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Area (7 Cols): Customizer Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-blue-500/20 bg-[#0B172B]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="text-amber-400">1.</span>
                  <span>Select Your Intelligence Channels</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize the specific sports streams you want in your daily briefing:
                </p>
              </div>

              {/* Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NEWSLETTER_CHANNELS.map((ch) => {
                  const isSelected = selectedChannels.includes(ch.id);
                  return (
                    <div
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#0E203C] border-amber-400/80 shadow-lg shadow-amber-500/10 scale-[1.01]'
                          : 'bg-[#070E1A] border-blue-500/15 hover:border-blue-400/30'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{ch.icon}</span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                                : 'border-white/20 bg-slate-900'
                            }`}
                          >
                            {isSelected && <FiCheck size={12} />}
                          </div>
                        </div>
                        <h3 className="text-sm font-bold text-white pt-1">{ch.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{ch.desc}</p>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold mt-3 block">
                        {ch.subscribers}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="text-amber-400">2.</span>
                    <span>Choose Delivery Frequency</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FREQUENCIES.map((freq) => {
                    const isSelected = frequency === freq.id;
                    return (
                      <div
                        key={freq.id}
                        onClick={() => setFrequency(freq.id)}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all ${
                          isSelected
                            ? 'bg-gradient-to-b from-blue-600/20 to-indigo-600/20 border-blue-400 shadow-md'
                            : 'bg-[#070E1A] border-blue-500/15 hover:border-blue-400/30'
                        }`}
                      >
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {freq.badge}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-2">{freq.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{freq.timing}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Input */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="text-amber-400">3.</span>
                    <span>Enter Your Email Address</span>
                  </h2>
                </div>

                {status === 'success' ? (
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-6 text-center space-y-3 animate-in fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
                      <FiCheckCircle />
                    </div>
                    <h3 className="text-lg font-black text-white">You&apos;re Officially Subscribed!</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      A welcome confirmation with today&apos;s 2 top Editor&apos;s Picks has been dispatched to{' '}
                      <span className="font-bold text-amber-300">{email}</span>.
                    </p>
                    <button
                      onClick={() => {
                        setStatus('idle');
                        setEmail('');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white"
                    >
                      Subscribe Another Email
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="e.g. analyst@club.com or fan@sports.com"
                        className="w-full bg-[#070E1A] border border-blue-500/25 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                      />
                    </div>

                    {/* Typo Correction Suggestion */}
                    {suggestedCorrection && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs flex items-center justify-between text-amber-300">
                        <span>Did you mean <strong>{suggestedCorrection}</strong>?</span>
                        <button
                          type="button"
                          onClick={() => handleApplySuggestion(suggestedCorrection)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-[11px]"
                        >
                          Use Suggestion
                        </button>
                      </div>
                    )}

                    {errorMessage && (
                      <p className="text-xs font-semibold text-rose-400">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all duration-300 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>{status === 'loading' ? 'Activating VIP Subscription...' : 'Subscribe To Free VIP Briefing'}</span>
                      <FiArrowRight />
                    </button>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1"><FiShield className="text-emerald-400" /> No spam ever</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><FiClock className="text-blue-400" /> Cancel in 1-click</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Area (5 Cols): Interactive Sample Newsletter Edition Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-blue-500/20 bg-[#0B172B]/90 p-6 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FiBookOpen className="text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Today&apos;s Morning Sample
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Preview
                </span>
              </div>

              {/* Sample Email Template Card */}
              <div className="rounded-2xl border border-blue-500/15 bg-[#070E1A] p-5 space-y-3.5 text-xs text-slate-300 shadow-inner">
                <div className="border-b border-white/10 pb-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-white">GOALMILLS MORNING BRIEF</span>
                  <span>Today • 07:00 GMT</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                    TACTICAL INTEL
                  </span>
                  <h4 className="text-sm font-black text-white mt-1">
                    How Arsenal&apos;s Midfield Overload Decided the London Derby
                  </h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Mikel Arteta shifted his number 8 into the half-space, generating a +1.42 xG advantage against low-block defenses...
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                    TRANSFER FLASH
                  </span>
                  <h4 className="text-sm font-black text-white mt-1">
                    Victor Osimhen €75M Clause Status
                  </h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Official payment structures registered with UEFA financial fair play monitors...
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>+ 4 More Match Previews</span>
                  <span className="text-amber-400 font-bold">Read Full &rarr;</span>
                </div>
              </div>

              {/* Guarantee Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <FiStar />
                  <span>The GoalMills Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We never sell or share your contact details. Your subscription is 100% free and you can adjust channels or cancel anytime with one click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
