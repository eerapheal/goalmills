'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function SportsIntelligenceSection() {
  const [votedMatch, setVotedMatch] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<{
    [key: string]: { home: number; draw: number; away: number };
  }>({
    'match-1': { home: 54, draw: 18, away: 28 },
  });
  const [activeFeatureTab, setActiveFeatureTab] = useState<'analytics' | 'alerts' | 'h2h' | 'odds'>(
    'analytics'
  );

  const handleVote = (matchId: string, choice: 'home' | 'draw' | 'away') => {
    if (votedMatch) return;
    setVotedMatch(choice);
    setVoteCounts((prev) => {
      const current = prev[matchId] || { home: 50, draw: 20, away: 30 };
      return {
        ...prev,
        [matchId]: {
          ...current,
          [choice]: current[choice] + 1,
        },
      };
    });
  };

  const currentVotes = voteCounts['match-1'];
  const totalVotes = currentVotes.home + currentVotes.draw + currentVotes.away;
  const homePct = Math.round((currentVotes.home / totalVotes) * 100);
  const drawPct = Math.round((currentVotes.draw / totalVotes) * 100);
  const awayPct = 100 - homePct - drawPct;

  const statsMetrics = [
    {
      value: '<0.8s',
      label: 'Score Latency',
      subtext: 'Ultra-fast sub-second websocket pipeline',
      icon: (
        <svg
          className="w-5 h-5 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      glow: 'from-amber-500/20 to-orange-500/5',
      borderColor: 'border-amber-500/30',
    },
    {
      value: '1,200+',
      label: 'Global Leagues',
      subtext: 'Covering Football, Cricket & Basketball',
      icon: (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      glow: 'from-blue-500/20 to-cyan-500/5',
      borderColor: 'border-blue-500/30',
    },
    {
      value: '98.4%',
      label: 'Data Accuracy',
      subtext: 'Verified official federation feeds',
      icon: (
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      glow: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
    },
    {
      value: '24/7',
      label: 'Live Coverage',
      subtext: 'Round-the-clock matchday telemetry',
      icon: (
        <svg
          className="w-5 h-5 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      glow: 'from-purple-500/20 to-pink-500/5',
      borderColor: 'border-purple-500/30',
    },
  ];

  const featureTabs = [
    {
      id: 'analytics' as const,
      title: 'AI Win Predictor',
      tag: 'Real-time Probabilities',
      description:
        'Advanced Monte Carlo match simulation models calibrated with historical form, expected goals (xG), team fitness, and tactical formations.',
      points: [
        'Live probability meters updated each minute',
        'Expected Goals (xG) & Shot Momentum',
        'Dangerous attacks & possession heatmaps',
      ],
      badge: 'AI Powered',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'alerts' as const,
      title: 'Sub-Second Alerts',
      tag: 'Zero Latency Pushes',
      description:
        'Receive instantaneous push updates for goals, red cards, cricket wickets, bowling spells, and NBA fourth-quarter clutch finishes.',
      points: [
        'Configurable favorite team notifications',
        'Sound alerts for penalty and VAR checks',
        'Cross-device instant web & mobile sync',
      ],
      badge: 'Instant',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'h2h' as const,
      title: 'Head-to-Head Matrix',
      tag: 'Deep Tactical Comparisons',
      description:
        'Detailed past meetings, referee bias statistics, home vs away scoring records, and team form trends across the last 10 seasons.',
      points: [
        'Form guide streak indicators (W-D-L)',
        'Clean sheet & BTTS (Both Teams To Score) %',
        'Player disciplinary records & card histories',
      ],
      badge: 'Pro Stats',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'odds' as const,
      title: 'Live Odds Tracker',
      tag: 'Market Shifts & Value',
      description:
        'Track real-time market movements, opening vs current betting lines, over/under spreads, and key match insights from global sportsbooks.',
      points: [
        'Real-time 1X2, Asian Handicap & Totals',
        'Odds movement trend charts',
        'Value indicator flags for smart insights',
      ],
      badge: 'Market Radar',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
  ];

  const currentTabDetails = featureTabs.find((t) => t.id === activeFeatureTab) || featureTabs[0];

  const topLeagues = [
    {
      name: 'Premier League',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      matches: '10 Fixtures',
      color: 'hover:border-purple-500/50',
    },
    {
      name: 'UEFA Champions League',
      flag: '⭐',
      matches: 'Elite Stage',
      color: 'hover:border-blue-500/50',
    },
    { name: 'La Liga', flag: '🇪🇸', matches: '10 Fixtures', color: 'hover:border-amber-500/50' },
    {
      name: 'NBA Basketball',
      flag: '🏀',
      matches: 'Live Tonight',
      color: 'hover:border-orange-500/50',
    },
    { name: 'IPL Cricket', flag: '🏏', matches: 'Matchday', color: 'hover:border-cyan-500/50' },
    {
      name: 'ATP & WTA Tour',
      flag: '🎾',
      matches: 'Grand Slam',
      color: 'hover:border-emerald-500/50',
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-[#0a0e27] via-slate-950 to-[#070b1e] py-16 md:py-24 border-t border-slate-800/80 overflow-hidden">
      {/* Ambient Background Glow Orbs */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            Next-Gen Sports Analytics Hub
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Engineered for True Fans &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300">
              Sports Analysts
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-300 leading-relaxed">
            GoalMills delivers real-time match telemetry, tactical player performance data, and
            intelligent win predictors across 1,200+ tournaments worldwide.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {statsMetrics.map((stat, idx) => (
            <div
              key={idx}
              className={`relative group bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 md:p-6 border ${stat.borderColor} hover:bg-slate-900/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/5`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.glow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  {stat.value}
                </span>
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-sm md:text-base font-bold text-slate-200">{stat.label}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Interactive Intelligence Studio & Fan Pulse Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left: Interactive Feature Matrix (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
              {featureTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeFeatureTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <span>{tab.title}</span>
                </button>
              ))}
            </div>

            <div className="pt-6 animate-fade-in">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  {currentTabDetails.tag}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${currentTabDetails.badgeColor}`}
                >
                  {currentTabDetails.badge}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-3">{currentTabDetails.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {currentTabDetails.description}
              </p>

              <div className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                {currentTabDetails.points.map((pt, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5"
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
                    </div>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Stream Sync
                </div>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Explore Deep Insights
                  <svg
                    className="w-3.5 h-3.5"
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
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Live Fan Pulse & Prediction Arena (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  Match Pulse of the Day
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                {totalVotes} Community Votes
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5">
              <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center justify-between">
                <span>UEFA Champions League</span>
                <span className="text-amber-400 font-bold">Today 20:00 GMT</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-center py-2">
                <div className="flex-1">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center font-bold text-white text-sm mb-1.5 shadow-md">
                    RMA
                  </div>
                  <p className="text-xs font-bold text-white">Real Madrid</p>
                </div>
                <div className="px-2">
                  <span className="text-sm font-black text-slate-500">VS</span>
                </div>
                <div className="flex-1">
                  <div className="w-10 h-10 mx-auto rounded-full bg-red-900/60 border border-red-700/50 flex items-center justify-center font-bold text-white text-sm mb-1.5 shadow-md">
                    MCI
                  </div>
                  <p className="text-xs font-bold text-white">Man City</p>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-200 mb-3">
              Who will triumph in tonight's clash?
            </h4>

            {/* Interactive Voting Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => handleVote('match-1', 'home')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${votedMatch === 'home'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                  }`}
              >
                <span>Madrid Win</span>
                <div className="text-[10px] opacity-80 mt-0.5 font-normal">({homePct}%)</div>
              </button>
              <button
                onClick={() => handleVote('match-1', 'draw')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${votedMatch === 'draw'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                  }`}
              >
                <span>Draw</span>
                <div className="text-[10px] opacity-80 mt-0.5 font-normal">({drawPct}%)</div>
              </button>
              <button
                onClick={() => handleVote('match-1', 'away')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${votedMatch === 'away'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                  }`}
              >
                <span>City Win</span>
                <div className="text-[10px] opacity-80 mt-0.5 font-normal">({awayPct}%)</div>
              </button>
            </div>

            {/* Progress Bar Visualization */}
            <div className="w-full bg-slate-800 rounded-full h-3 flex overflow-hidden p-0.5 gap-0.5 mb-3">
              <div
                style={{ width: `${homePct}%` }}
                className="bg-blue-500 h-full rounded-l-full transition-all duration-500"
                title={`Real Madrid: ${homePct}%`}
              />
              <div
                style={{ width: `${drawPct}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Draw: ${drawPct}%`}
              />
              <div
                style={{ width: `${awayPct}%` }}
                className="bg-cyan-400 h-full rounded-r-full transition-all duration-500"
                title={`Man City: ${awayPct}%`}
              />
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              {votedMatch
                ? '✓ Your prediction is recorded!'
                : 'Tap an outcome to register your fan prediction'}
            </p>
          </div>
        </div>

        {/* Top Competitions Ticker / Quick Badges */}
        <div className="border-t border-slate-800/80 pt-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="text-amber-400">🔥</span> Global Tournaments on GoalMills
            </h3>
            <span className="text-xs text-slate-400">
              Instant access to fixtures, standings & top scorers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topLeagues.map((league, idx) => (
              <div
                key={idx}
                className={`bg-slate-900/50 hover:bg-slate-850 border border-slate-800 rounded-xl p-3.5 transition-all duration-300 ${league.color} hover:shadow-lg group flex flex-col justify-between`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{league.flag}</span>
                  <span className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {league.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{league.matches}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
