'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PlayerMeta } from '@/lib/entityService';
import { PlayerImage } from './PlayerImage';
import { PlayerComparisonModal } from './PlayerComparisonModal';
import {
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiAward,
  FiActivity,
  FiArrowRight,
  FiX,
  FiCheck,
  FiPlus,
  FiChevronDown,
} from 'react-icons/fi';
import { FaFire, FaTrophy, FaMedal } from 'react-icons/fa6';

interface PlayersHubClientProps {
  initialPlayers: PlayerMeta[];
}

type PositionCategory = 'all' | 'forward' | 'midfielder' | 'defender-gk';
type SortOption = 'market-value' | 'goals' | 'assists' | 'rating' | 'age-young' | 'age-old';

export function PlayersHubClient({ initialPlayers }: PlayersHubClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<PositionCategory>('all');
  const [competitionFilter, setCompetitionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('market-value');

  // Compare selection state (max 2 players)
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Helper to parse market value (e.g. "€180.00M" -> 180)
  const parseMarketValue = (val: string) => {
    const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    return num;
  };

  // Extract unique competition list
  const competitionList = useMemo(() => {
    const set = new Set<string>();
    initialPlayers.forEach((p) => {
      if (p.competitionSlug) set.add(p.competitionSlug);
    });
    return Array.from(set);
  }, [initialPlayers]);

  // Filter & Sort Logic
  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return initialPlayers
      .filter((player) => {
        // Search filter
        if (q) {
          const matchName = player.name.toLowerCase().includes(q);
          const matchClub = player.clubName.toLowerCase().includes(q);
          const matchNat = player.nationality.toLowerCase().includes(q);
          const matchPos = player.position.toLowerCase().includes(q);
          if (!matchName && !matchClub && !matchNat && !matchPos) return false;
        }

        // Position category filter
        if (positionFilter !== 'all') {
          const pos = player.position.toLowerCase();
          if (positionFilter === 'forward') {
            if (!pos.includes('striker') && !pos.includes('winger') && !pos.includes('forward'))
              return false;
          } else if (positionFilter === 'midfielder') {
            if (!pos.includes('midfield')) return false;
          } else if (positionFilter === 'defender-gk') {
            if (!pos.includes('back') && !pos.includes('defender') && !pos.includes('goalkeeper'))
              return false;
          }
        }

        // Competition filter
        if (competitionFilter !== 'all') {
          if (player.competitionSlug !== competitionFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'market-value') {
          return parseMarketValue(b.marketValue) - parseMarketValue(a.marketValue);
        }
        if (sortBy === 'goals') {
          return b.seasonStats.goals - a.seasonStats.goals;
        }
        if (sortBy === 'assists') {
          return b.seasonStats.assists - a.seasonStats.assists;
        }
        if (sortBy === 'rating') {
          return b.seasonStats.rating - a.seasonStats.rating;
        }
        if (sortBy === 'age-young') {
          return a.age - b.age;
        }
        if (sortBy === 'age-old') {
          return b.age - a.age;
        }
        return 0;
      });
  }, [initialPlayers, searchQuery, positionFilter, competitionFilter, sortBy]);

  // Spotlight leaders for top widgets
  const topGoalscorers = useMemo(() => {
    return [...initialPlayers]
      .sort((a, b) => b.seasonStats.goals - a.seasonStats.goals)
      .slice(0, 3);
  }, [initialPlayers]);

  const topPlaymakers = useMemo(() => {
    return [...initialPlayers]
      .sort((a, b) => b.seasonStats.assists - a.seasonStats.assists)
      .slice(0, 3);
  }, [initialPlayers]);

  const topRated = useMemo(() => {
    return [...initialPlayers]
      .sort((a, b) => b.seasonStats.rating - a.seasonStats.rating)
      .slice(0, 3);
  }, [initialPlayers]);

  // Toggle compare
  const toggleCompare = (slug: string) => {
    if (compareSlugs.includes(slug)) {
      setCompareSlugs(compareSlugs.filter((s) => s !== slug));
    } else {
      if (compareSlugs.length >= 2) {
        setCompareSlugs([compareSlugs[1], slug]);
      } else {
        setCompareSlugs([...compareSlugs, slug]);
      }
    }
  };

  const selectedPlayerA = initialPlayers.find((p) => p.slug === compareSlugs[0]);
  const selectedPlayerB = initialPlayers.find((p) => p.slug === compareSlugs[1]);

  return (
    <div className="space-y-8">
      {/* ─── SPOTLIGHT PERFORMANCE LEADERS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Golden Boot Leaders */}
        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-[#0F1E38]/90 to-[#0A1324]/90 p-4 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400">
              <FaTrophy />
              <span>Top Goalscorers</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Golden Boot
            </span>
          </div>
          <div className="space-y-2">
            {topGoalscorers.map((p, idx) => (
              <Link
                key={p.slug}
                href={`/players/${p.slug}`}
                className="group flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-amber-400 font-mono w-4">
                    #{idx + 1}
                  </span>
                  <PlayerImage src={p.photo} alt={p.name} size={32} rounded="rounded-lg" />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {p.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">{p.clubName}</p>
                  </div>
                </div>
                <div className="text-right pl-2 shrink-0">
                  <span className="text-xs font-black text-amber-400">{p.seasonStats.goals}</span>
                  <span className="text-[9px] text-slate-500 block">Goals</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Playmaker Maestro */}
        <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-[#0B1E34]/90 to-[#071322]/90 p-4 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-400">
              <FaMedal />
              <span>Assist Kings</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Playmaker
            </span>
          </div>
          <div className="space-y-2">
            {topPlaymakers.map((p, idx) => (
              <Link
                key={p.slug}
                href={`/players/${p.slug}`}
                className="group flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-cyan-400 font-mono w-4">
                    #{idx + 1}
                  </span>
                  <PlayerImage src={p.photo} alt={p.name} size={32} rounded="rounded-lg" />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {p.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">{p.clubName}</p>
                  </div>
                </div>
                <div className="text-right pl-2 shrink-0">
                  <span className="text-xs font-black text-cyan-400">{p.seasonStats.assists}</span>
                  <span className="text-[9px] text-slate-500 block">Assists</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Form Kings */}
        <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-[#0C1B33]/90 to-[#07101E]/90 p-4 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-400">
              <FaFire />
              <span>Highest Rated</span>
            </div>
            <span className="text-[10px] text-blue-300 font-mono font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Rating
            </span>
          </div>
          <div className="space-y-2">
            {topRated.map((p, idx) => (
              <Link
                key={p.slug}
                href={`/players/${p.slug}`}
                className="group flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-blue-500/10 border border-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-blue-400 font-mono w-4">
                    #{idx + 1}
                  </span>
                  <PlayerImage src={p.photo} alt={p.name} size={32} rounded="rounded-lg" />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                      {p.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">{p.clubName}</p>
                  </div>
                </div>
                <div className="text-right pl-2 shrink-0">
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    {p.seasonStats.rating.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-500 block">Rating</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DIRECTORY CONTROLS & FILTERS ─── */}
      <div className="space-y-4 rounded-3xl bg-[#091528]/80 border border-blue-500/20 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Live Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FiSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search footballers by name, club, nationality, or position..."
              className="w-full bg-[#050C18] border border-white/10 hover:border-blue-500/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl pl-10 pr-9 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* League Dropdown & Sort Selector */}
          <div className="flex items-center gap-3">
            {/* League selector */}
            <div className="relative">
              <select
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
                className="appearance-none bg-[#050C18] border border-white/10 text-xs font-bold text-slate-200 rounded-xl px-3.5 py-2.5 pr-8 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
              >
                <option value="all">All Leagues</option>
                {competitionList.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/-/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
            </div>

            {/* Sort selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-[#050C18] border border-white/10 text-xs font-bold text-slate-200 rounded-xl px-3.5 py-2.5 pr-8 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
              >
                <option value="market-value">Market Value (High to Low)</option>
                <option value="goals">Most Goals</option>
                <option value="assists">Most Assists</option>
                <option value="rating">Highest Match Rating</option>
                <option value="age-young">Youngest First</option>
                <option value="age-old">Most Experienced</option>
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
            </div>
          </div>
        </div>

        {/* Position Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {[
            { key: 'all', label: 'All Positions', count: initialPlayers.length },
            {
              key: 'forward',
              label: 'Forwards & Strikers',
              count: initialPlayers.filter((p) =>
                /striker|winger|forward/i.test(p.position)
              ).length,
            },
            {
              key: 'midfielder',
              label: 'Midfielders',
              count: initialPlayers.filter((p) => /midfield/i.test(p.position)).length,
            },
            {
              key: 'defender-gk',
              label: 'Defenders & Keepers',
              count: initialPlayers.filter((p) =>
                /back|defender|goalkeeper/i.test(p.position)
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPositionFilter(tab.key as PositionCategory)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                positionFilter === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-[#050C18] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── ACTIVE RESULTS COUNT ─── */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="font-semibold">
          Showing <span className="text-white font-black">{filteredPlayers.length}</span> players
        </span>
        {(searchQuery || positionFilter !== 'all' || competitionFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setPositionFilter('all');
              setCompetitionFilter('all');
              setSortBy('market-value');
            }}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <FiX size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* ─── PLAYERS GRID ─── */}
      {filteredPlayers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0A1424]/60 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-400">
            <FiSearch size={22} />
          </div>
          <h3 className="text-sm font-bold text-white">No footballers found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn&apos;t find any players matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setPositionFilter('all');
              setCompetitionFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => {
            const isCompared = compareSlugs.includes(player.slug);

            return (
              <div
                key={player.slug}
                className={`group relative flex flex-col justify-between rounded-3xl border transition-all duration-300 p-4 sm:p-5 overflow-hidden shadow-lg ${
                  isCompared
                    ? 'border-blue-500 bg-[#0C1E3C] shadow-blue-500/20'
                    : 'border-white/10 bg-gradient-to-b from-[#0B172B]/90 to-[#070F1E]/95 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10'
                }`}
              >
                {/* Header: Photo + Number + Market Value */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="relative">
                      <PlayerImage
                        src={player.photo}
                        alt={player.name}
                        flag={player.countryFlag}
                        size={60}
                        rounded="rounded-2xl"
                      />
                      <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-slate-900 border border-blue-500/40 text-[10px] font-black text-blue-300 flex items-center justify-center font-mono shadow-md">
                        #{player.number}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {player.marketValue}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {player.age} yrs • {player.height}
                      </span>
                    </div>
                  </div>

                  {/* Player Name & Position */}
                  <div className="space-y-0.5">
                    <Link
                      href={`/players/${player.slug}`}
                      className="block text-sm font-extrabold text-white group-hover:text-blue-300 transition-colors truncate"
                    >
                      {player.name}
                    </Link>
                    <p className="text-xs font-bold text-blue-400 truncate">
                      {player.position}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 pt-0.5">
                      <span>{player.countryFlag}</span>
                      <span>{player.clubName}</span>
                    </p>
                  </div>

                  {/* 2025/2026 Key Season Stats Card */}
                  <div className="mt-3.5 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                    <div className="p-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-black text-white block">
                        {player.seasonStats.goals}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                        Goals
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-black text-white block">
                        {player.seasonStats.assists}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                        Assists
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-black text-emerald-400 block font-mono">
                        {player.seasonStats.rating.toFixed(2)}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                        Rating
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Compare Checkbox + Profile CTA */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCompare(player.slug)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                      isCompared
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {isCompared ? <FiCheck size={11} /> : <FiPlus size={11} />}
                    <span>{isCompared ? 'Compared' : 'Compare'}</span>
                  </button>

                  <Link
                    href={`/players/${player.slug}`}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group/link"
                  >
                    <span>Scouting Intel</span>
                    <FiArrowRight
                      size={12}
                      className="group-hover/link:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── FLOATING COMPARISON DRAWER BAR ─── */}
      {compareSlugs.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 max-w-xl mx-auto px-4 animate-bounce-short">
          <div className="rounded-2xl bg-[#09152B]/95 border border-blue-500/40 p-3.5 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 text-xs font-black">
                {compareSlugs.length}/2
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Compare Players</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                  {selectedPlayerA?.name}
                  {selectedPlayerB ? ` vs ${selectedPlayerB.name}` : ' (select 1 more)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompareSlugs([])}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={compareSlugs.length < 2}
                onClick={() => setShowCompareModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Compare Now</span>
                <FiArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── COMPARISON MODAL ─── */}
      {showCompareModal && selectedPlayerA && selectedPlayerB && (
        <PlayerComparisonModal
          playerA={selectedPlayerA}
          playerB={selectedPlayerB}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}
