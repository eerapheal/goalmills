'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { OfficialMeta } from '@/lib/entityService';
import { OfficialImage } from '@/components/OfficialImage';
import {
  FiSearch,
  FiFilter,
  FiSliders,
  FiShield,
  FiAlertTriangle,
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';

interface OfficialsHubClientProps {
  initialOfficials: OfficialMeta[];
}

export const OfficialsHubClient: React.FC<OfficialsHubClientProps> = ({ initialOfficials }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [selectedStrictness, setSelectedStrictness] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'matches' | 'yellows' | 'reds' | 'fouls'>('matches');

  // Competitions tabs
  const competitionTabs = [
    { id: 'all', label: 'All Leagues' },
    { id: 'Premier League', label: 'Premier League' },
    { id: 'UEFA Champions League', label: 'Champions League' },
    { id: 'La Liga', label: 'La Liga' },
    { id: 'Serie A', label: 'Serie A' },
    { id: 'Bundesliga', label: 'Bundesliga' },
    { id: 'FIFA World Cup', label: 'FIFA Elite' },
  ];

  // Filter and sort officials
  const filteredOfficials = useMemo(() => {
    return initialOfficials
      .filter((official) => {
        const matchesSearch =
          official.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          official.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          official.competitions.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesComp =
          selectedComp === 'all' ||
          official.competitions.some((c) => c.toLowerCase().includes(selectedComp.toLowerCase()));

        const matchesStrictness =
          selectedStrictness === 'all' || official.strictnessRating === selectedStrictness;

        return matchesSearch && matchesComp && matchesStrictness;
      })
      .sort((a, b) => {
        if (sortBy === 'yellows') return b.yellowCardsPerGame - a.yellowCardsPerGame;
        if (sortBy === 'reds') return b.redCardsPerGame - a.redCardsPerGame;
        if (sortBy === 'fouls') return b.foulsPerGame - a.foulsPerGame;
        return b.matches - a.matches;
      });
  }, [initialOfficials, searchQuery, selectedComp, selectedStrictness, sortBy]);

  // Aggregate stats
  const totalMatches = useMemo(
    () => initialOfficials.reduce((acc, curr) => acc + curr.matches, 0),
    [initialOfficials]
  );
  const totalYellows = useMemo(
    () => initialOfficials.reduce((acc, curr) => acc + curr.yellowCardsTotal, 0),
    [initialOfficials]
  );
  const totalReds = useMemo(
    () => initialOfficials.reduce((acc, curr) => acc + curr.redCardsTotal, 0),
    [initialOfficials]
  );
  const avgYellowsPerGame = (totalYellows / Math.max(1, totalMatches)).toFixed(2);

  const getStrictnessBadge = (rating: OfficialMeta['strictnessRating']) => {
    switch (rating) {
      case 'High-Card Index':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Strict':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Balanced':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Permissive':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Hero Intelligence Header ────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B1728] via-[#0E1E38] to-[#070F1E] border border-blue-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-xs uppercase tracking-wider mb-4">
            <span>🚩</span>
            <span>MATCH OFFICIALS & DISCIPLINARY WIRE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            Elite Football Referees & Disciplinary Analytics
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Track foul tolerance, cards distributed per game, penalty award ratios, and VAR
            intervention precision for top FIFA Elite and top-flight European match officials.
          </p>
        </div>

        {/* Aggregate Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Officials Monitored
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {initialOfficials.length}
            </span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Matches Officiated
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-400">
              {totalMatches.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Yellow Cards Given
            </span>
            <span className="text-2xl sm:text-3xl font-black text-yellow-400">
              {totalYellows.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Avg Cards / Match
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {avgYellowsPerGame}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Controls: Search, Competition Tabs, Sort ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search referee by name, country, or league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1526] border border-blue-500/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Strictness Filter */}
            <div className="flex items-center gap-1.5 bg-[#0B1526] px-3 py-1.5 rounded-xl border border-blue-500/20 text-xs">
              <FiSliders className="text-amber-400" />
              <select
                value={selectedStrictness}
                onChange={(e) => setSelectedStrictness(e.target.value)}
                className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Strictness</option>
                <option value="Strict" className="bg-slate-900 text-white">Strict</option>
                <option value="Balanced" className="bg-slate-900 text-white">Balanced</option>
                <option value="Permissive" className="bg-slate-900 text-white">Permissive</option>
                <option value="High-Card Index" className="bg-slate-900 text-white">High-Card Index</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#0B1526] px-3 py-1.5 rounded-xl border border-blue-500/20 text-xs">
              <span className="text-slate-400 font-bold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer"
              >
                <option value="matches" className="bg-slate-900 text-white">Most Matches</option>
                <option value="yellows" className="bg-slate-900 text-white">Highest Yellows/Game</option>
                <option value="reds" className="bg-slate-900 text-white">Highest Reds/Game</option>
                <option value="fouls" className="bg-slate-900 text-white">Most Fouls/Game</option>
              </select>
            </div>
          </div>
        </div>

        {/* Competition Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {competitionTabs.map((tab) => {
            const isActive = selectedComp === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedComp(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-[#0B1526] text-slate-300 hover:text-white border border-white/5 hover:border-amber-500/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Officials Grid ──────────────────────────────────────────────────── */}
      {filteredOfficials.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#091529]/80 p-12 text-center">
          <FiAlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Match Officials Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            No referees match "{searchQuery}" under the selected filters. Try broadening your criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedComp('all');
              setSelectedStrictness('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOfficials.map((official) => (
            <div
              key={official.slug}
              className="group rounded-2xl bg-gradient-to-b from-[#0C192E] to-[#07101E] border border-blue-500/20 hover:border-amber-500/40 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Official Headshot & Header Meta */}
                <div className="flex items-start gap-4 mb-4">
                  <OfficialImage
                    src={official.photo}
                    name={official.name}
                    countryFlag={official.countryFlag}
                    size={64}
                    className="border-2 border-amber-500/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStrictnessBadge(
                          official.strictnessRating
                        )}`}
                      >
                        {official.strictnessRating}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        FIFA: {official.fifaBadgeSince}
                      </span>
                    </div>
                    <Link
                      href={`/football/officials/${official.slug}`}
                      className="text-base font-black text-white hover:text-amber-400 transition truncate block"
                    >
                      {official.name}
                    </Link>
                    <p className="text-xs text-slate-300 font-semibold truncate">
                      {official.country} • {official.age} yrs
                    </p>
                  </div>
                </div>

                {/* Primary Competitions Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {official.competitions.slice(0, 3).map((comp) => (
                    <span
                      key={comp}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-white/5 text-slate-300"
                    >
                      {comp}
                    </span>
                  ))}
                  {official.competitions.length > 3 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400">
                      +{official.competitions.length - 3}
                    </span>
                  )}
                </div>

                {/* Officiating Metrics Dashboard */}
                <div className="grid grid-cols-4 gap-2 bg-[#060D1A]/80 rounded-xl p-3 border border-white/5 mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Matches
                    </span>
                    <span className="text-sm font-black text-white">{official.matches}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-yellow-400 block font-semibold uppercase">
                      🟨/Game
                    </span>
                    <span className="text-sm font-black text-yellow-400">
                      {official.yellowCardsPerGame}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-red-400 block font-semibold uppercase">
                      🟥/Game
                    </span>
                    <span className="text-sm font-black text-red-400">
                      {official.redCardsPerGame}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-400 block font-semibold uppercase">
                      Fouls/G
                    </span>
                    <span className="text-sm font-black text-blue-400">
                      {official.foulsPerGame}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link to Full Profile */}
              <Link
                href={`/football/officials/${official.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/20 hover:bg-amber-500 text-blue-200 hover:text-slate-950 font-black text-xs uppercase tracking-wider border border-blue-500/30 hover:border-amber-400 transition-all shadow-md group/btn"
              >
                <span>Full Officiating Intel</span>
                <FiArrowRight
                  size={14}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
