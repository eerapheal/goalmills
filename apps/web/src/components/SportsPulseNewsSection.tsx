'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function SportsPulseNewsSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'football' | 'cricket' | 'basketball' | 'tennis'
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
      title: 'IPL 2025 Powerplay Analytics: Why Death-Over Strike Rates are Soaring Past 210',
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
      title: 'Grand Slam Surface Adjustments: Second-Serve Win Percentages & Rally Lengths',
      excerpt:
        'How top-ranked players adjust their court positioning and topspin RPM between hardcourt and clay.',
      category: 'tennis',
      categoryName: 'Tennis',
      readTime: '4 min read',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      date: '6 hrs ago',
      author: 'Court Vision',
      isHot: false,
    },
  ];

  const filteredArticles =
    activeCategory === 'all'
      ? trendingArticles
      : trendingArticles.filter((art) => art.category === activeCategory);

  return (
    <section className="relative bg-[#070b1e] py-16 md:py-24 border-t border-slate-800/80 text-white overflow-hidden">
      {/* Ambient Background Gradient Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-700/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Editorial & Video Spotlight
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              The Sports{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                Pulse & Headlines
              </span>
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-xl">
              Curated matchday analysis, statistical deep dives, and instant video recaps from
              around the sporting world.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
            {(['all', 'football', 'cricket', 'basketball', 'tennis'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                className="group block bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${article.tagColor}`}
                    >
                      {article.categoryName}
                    </span>
                    {article.isHot && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
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

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug mb-2">
                  {article.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">By {article.author}</span>
                  <span className="text-blue-400 group-hover:text-blue-300 font-bold inline-flex items-center gap-1">
                    Read Analysis
                    <svg
                      className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}

            <div className="pt-2 text-center">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-slate-200 hover:text-white hover:border-blue-500 transition-all hover:bg-slate-800"
              >
                <span>Browse All Sports News & Features</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column: Video Highlights Card & Pro VIP Alert Hub (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Highlights Spotlight Card */}
            <Link
              href="/highlights"
              className="group block relative bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Video Highlights
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">
                  Ultra HD
                </span>
              </div>

              {/* Simulated Video Player Banner */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 mb-4 flex items-center justify-center group-hover:border-blue-500/40 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="w-14 h-14 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300 z-10">
                  <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-10">
                  <span>Top Goals & Decisive Plays of the Week</span>
                  <span className="bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono">
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
            <div className="bg-gradient-to-br from-slate-900/90 via-blue-950/40 to-slate-900/90 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
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
                <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl p-3.5 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <svg
                    className="w-5 h-5 text-emerald-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
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
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all duration-300"
                  >
                    Get Matchday VIP Alerts (Free)
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
