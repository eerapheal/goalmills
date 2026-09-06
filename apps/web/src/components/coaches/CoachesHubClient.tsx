'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CoachMeta, CLUBS_REGISTRY } from '@/lib/entityService';
import { CoachImage } from '@/components/CoachImage';
import {
  FiSearch,
  FiSliders,
  FiAward,
  FiActivity,
  FiArrowRight,
  FiTrendingUp,
  FiUsers,
  FiAlertTriangle,
} from 'react-icons/fi';

interface CoachesHubClientProps {
  initialCoaches: CoachMeta[];
}

export const CoachesHubClient: React.FC<CoachesHubClientProps> = ({ initialCoaches }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'winRate' | 'trophies' | 'matches'>('winRate');

  // Competition tabs
  const competitionTabs = [
    { id: 'all', label: 'All Leagues' },
    { id: 'premier-league', label: 'Premier League' },
    { id: 'la-liga', label: 'La Liga' },
    { id: 'serie-a', label: 'Serie A' },
    { id: 'bundesliga', label: 'Bundesliga' },
    { id: 'ligue-1', label: 'Ligue 1' },
  ];

  // Filter and sort coaches
  const filteredCoaches = useMemo(() => {
    return initialCoaches
      .filter((coach) => {
        const matchesSearch =
          coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coach.currentClubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coach.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coach.preferredFormation.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesComp =
          selectedComp === 'all' || coach.competitionSlug.toLowerCase() === selectedComp.toLowerCase();

        return matchesSearch && matchesComp;
      })
      .sort((a, b) => {
        if (sortBy === 'trophies') return b.trophiesCount - a.trophiesCount;
        if (sortBy === 'matches') return b.matchesManaged - a.matchesManaged;
        return b.winPercentage - a.winPercentage;
      });
  }, [initialCoaches, searchQuery, selectedComp, sortBy]);

  // Aggregate stats
  const totalTrophies = useMemo(
    () => initialCoaches.reduce((acc, curr) => acc + curr.trophiesCount, 0),
    [initialCoaches]
  );
  const avgWinRate = (
    initialCoaches.reduce((acc, curr) => acc + curr.winPercentage, 0) /
    Math.max(1, initialCoaches.length)
  ).toFixed(1);

  return (
    <div className="space-y-8">
      {/* ─── Hero Intelligence Header ────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B1728] via-[#0E1E38] to-[#070F1E] border border-blue-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-black text-xs uppercase tracking-wider mb-4">
            <span>🧑‍💼</span>
            <span>TACTICAL & MANAGERIAL HUB</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            World-Class Football Managers & Tactical Architects
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Analyze win percentages, preferred formations, pressing philosophies, and trophy cabinets
            for Europe’s premier football managers.
          </p>
        </div>

        {/* Aggregate Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Managers Profiled
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {initialCoaches.length}
            </span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Average Win Rate
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {avgWinRate}%
            </span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Combined Honours
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {totalTrophies} 🏆
            </span>
          </div>
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Primary System
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-400">
              Positional 4-3-3
            </span>
          </div>
        </div>
      </div>

      {/* ─── Controls: Search, Competition Filters, Sort ───────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search manager, club, nationality, or formation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1526] border border-blue-500/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-400 transition"
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

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0B1526] px-3 py-1.5 rounded-xl border border-blue-500/20 text-xs self-start md:self-auto">
            <span className="text-slate-400 font-bold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-blue-400 font-bold outline-none cursor-pointer"
            >
              <option value="winRate" className="bg-slate-900 text-white">Highest Win Rate %</option>
              <option value="trophies" className="bg-slate-900 text-white">Most Trophies</option>
              <option value="matches" className="bg-slate-900 text-white">Most Matches Managed</option>
            </select>
          </div>
        </div>

        {/* League Quick Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {competitionTabs.map((tab) => {
            const isActive = selectedComp === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedComp(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-[#0B1526] text-slate-300 hover:text-white border border-white/5 hover:border-blue-500/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Coaches Grid ────────────────────────────────────────────────────── */}
      {filteredCoaches.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#091529]/80 p-12 text-center">
          <FiAlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Managers Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            No football managers match "{searchQuery}" under the selected league filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedComp('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoaches.map((coach) => {
            const club = CLUBS_REGISTRY[coach.currentClubSlug];
            return (
              <div
                key={coach.slug}
                className="group rounded-2xl bg-gradient-to-b from-[#0C192E] to-[#07101E] border border-blue-500/20 hover:border-blue-400/40 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Coach Headshot & Header Meta */}
                  <div className="flex items-start gap-4 mb-4">
                    <CoachImage
                      src={coach.photo}
                      name={coach.name}
                      countryFlag={coach.countryFlag}
                      clubLogo={club?.logo}
                      size={68}
                      className="border-2 border-blue-500/30"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          🏆 {coach.trophiesCount} Honours
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {coach.age} yrs
                        </span>
                      </div>
                      <Link
                        href={`/football/coaches/${coach.slug}`}
                        className="text-base font-black text-white hover:text-blue-400 transition truncate block"
                      >
                        {coach.name}
                      </Link>
                      <p className="text-xs text-slate-300 font-semibold truncate">
                        {coach.currentClubName} • {coach.nationality}
                      </p>
                    </div>
                  </div>

                  {/* Tactical Formation Pill */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-white/5 text-blue-300 block truncate">
                      ⚙️ {coach.preferredFormation}
                    </span>
                  </div>

                  {/* Win Percentage Metric Bar */}
                  <div className="bg-[#060D1A]/80 rounded-xl p-3 border border-white/5 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">Career Win Rate</span>
                      <span className="text-emerald-400 font-black">{coach.winPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${coach.winPercentage}%` }}
                        className="bg-emerald-400 h-full rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Matches: {coach.matchesManaged}</span>
                      <span>Draw: {coach.drawPercentage}%</span>
                      <span>Loss: {coach.lossPercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Profile Link Action */}
                <Link
                  href={`/football/coaches/${coach.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-200 hover:text-white font-black text-xs uppercase tracking-wider border border-blue-500/30 hover:border-blue-400 transition-all shadow-md group/btn"
                >
                  <span>Tactical Profile & Honours</span>
                  <FiArrowRight
                    size={14}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
