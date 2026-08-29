'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiPlay, FiMail, FiArrowRight, FiClock, FiCheck } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';

export function SportsPulseNewsSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'football' | 'cricket' | 'basketball' | 'transfers'
  >('all');

  const [selectedTier, setSelectedTier] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, frequency: selectedTier, source: 'homepage_vip_hub' }),
      });

      if (res.ok) {
        setSubscribed(true);
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const trendingArticles = [
    {
      id: 'art-1',
      title: 'Champions League Quarterfinal Tactical Breakdown: High-Press vs Deep Block',
      excerpt:
        "How elite managers are manipulating midfield overloads and half-space runs in this year's knockout stages.",
      category: 'football',
      categoryName: 'Football',
      readTime: '4 min read',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      date: 'Today',
      author: 'Tactical Desk',
      isHot: true,
    },
    {
      id: 'art-2',
      title: 'IPL 2026 Powerplay Analytics: Why Death-Over Strike Rates are Soaring Past 210',
      excerpt:
        'An analytical deep dive into modern T20 boundary percentages and bowler release angle variations.',
      category: 'cricket',
      categoryName: 'Cricket',
      readTime: '5 min read',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      date: '2 hrs ago',
      author: 'Cricket Lab',
      isHot: false,
    },
    {
      id: 'art-3',
      title: 'NBA Playoff Race: Clutch Shooting Metrics & Fourth-Quarter Defensive Ratings',
      excerpt:
        'Analyzing the top 5 perimeter defenders shutting down scoring champions in the final two minutes.',
      category: 'basketball',
      categoryName: 'Basketball',
      readTime: '3 min read',
      tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      date: '4 hrs ago',
      author: 'Hoops Insider',
      isHot: true,
    },
    {
      id: 'art-4',
      title: 'European Transfer Window Intel: Contract Clauses & Imminent Moves',
      excerpt:
        'Behind-the-scenes breakdown of release clause deadlines and valuation models across top 5 leagues.',
      category: 'transfers',
      categoryName: 'Transfers',
      readTime: '4 min read',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      date: '6 hrs ago',
      author: 'Transfer Desk',
      isHot: false,
    },
  ];

  const filteredArticles =
    activeCategory === 'all'
      ? trendingArticles
      : trendingArticles.filter((art) => art.category === activeCategory);

  return (
    <section className="relative bg-[#070E1A] py-16 md:py-24 border-t border-blue-500/20 text-white overflow-hidden">
      {/* Ambient Background Gradient Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Editorial & Video Spotlight
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              The Sports{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                Pulse & Headlines
              </span>
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-300 max-w-xl">
              Curated matchday analysis, statistical deep dives, and instant video recaps from
              around the sporting world.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#091529] border border-blue-500/20 rounded-2xl shadow-xl">
            {(['all', 'football', 'cricket', 'basketball', 'transfers'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'all' ? 'All Pulse' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid: Left Articles / Right Spotlight & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Trending Articles Grid (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {filteredArticles.map((article) => (
              <Link
                href="/news"
                key={article.id}
                className="group block bg-[#0B172B]/80 hover:bg-[#0E203C] border border-blue-500/15 hover:border-amber-400/40 rounded-3xl p-5 md:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${article.tagColor}`}
                    >
                      {article.categoryName}
                    </span>
                    {article.isHot && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <span>🔥</span> Trending
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <span>🕒 {article.readTime}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug mb-2">
                  {article.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">By {article.author}</span>
                  <span className="text-amber-400 group-hover:text-amber-300 font-bold inline-flex items-center gap-1">
                    <span>Read Analysis</span>
                    <FiArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}

            <div className="pt-2 text-center">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <span>Browse All Sports News & Features</span>
                <FiArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Column: Video Highlights Card & Pro VIP Alert Hub (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Highlights Spotlight Card */}
            <Link
              href="/highlights"
              className="group block relative bg-gradient-to-br from-[#0B172B] via-[#0E203C] to-[#070E1A] border border-blue-500/25 hover:border-amber-400/40 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Video Highlights
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Ultra HD
                </span>
              </div>

              {/* Simulated Video Player Banner */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-blue-500/20 mb-4 flex items-center justify-center group-hover:border-amber-400/40 transition-colors shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 group-hover:from-amber-400 group-hover:to-orange-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transform group-hover:scale-110 transition-all duration-300 z-10 font-bold">
                  <FiPlay size={22} className="ml-1" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white z-10">
                  <span>Top Goals & Decisive Plays of the Week</span>
                  <span className="bg-black/80 px-2 py-0.5 rounded-md text-[10px] font-mono text-amber-300 border border-white/10">
                    08:42
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Missed the action? Watch official goals, highlight reels, and post-match breakdowns
                in crisp high definition.
              </p>
            </Link>

            {/* GoalMills VIP Alert Hub & Newsletter */}
            <div className="bg-[#0B172B]/90 backdrop-blur-xl border border-blue-500/25 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <FiMail size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">GoalMills Matchday VIP</h3>
                  <p className="text-[11px] text-slate-400">
                    Exclusive tactical previews & lineup alerts
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Get confirmed team lineups 60 minutes before kickoff, key injury updates, and AI
                value picks delivered to your inbox every morning.
              </p>

              {subscribed ? (
                <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-2xl p-3.5 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <FiCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>You&apos;re in! Check your inbox on matchdays for VIP alerts.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for free alerts..."
                      className="w-full bg-[#070E1A] border border-blue-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black uppercase tracking-wider py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Subscribing...' : 'Get Matchday VIP Alerts (Free)'}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    Zero spam. Unsubscribe anytime with 1 click.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
