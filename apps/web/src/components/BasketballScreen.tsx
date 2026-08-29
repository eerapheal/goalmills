'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BasketballMatchCard } from './BasketballMatchCard';
import { webBasketballApiService, ApiBasketballGameItem } from '../services/basketballApi';
import { GoalmillsLoader } from './GoalmillsLoader';
import { FiRefreshCw, FiSearch, FiCalendar, FiAward, FiActivity } from 'react-icons/fi';

type BasketballTab = 'live' | 'upcoming' | 'results' | 'standings';

export function BasketballScreen() {
  const [activeTab, setActiveTab] = useState<BasketballTab>('live');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<ApiBasketballGameItem[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  // 7-day date slider
  const dateStrip = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName =
        i === 0
          ? 'Today'
          : i === -1
            ? 'Yesterday'
            : i === 1
              ? 'Tomorrow'
              : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      dates.push({ iso, dayName, dayNumber });
    }
    return dates;
  }, []);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'standings') {
        const res = await webBasketballApiService.getStandings({
          league: 12, // NBA
          season: '2023-2024',
        });
        setStandings(res || []);
      } else {
        let raw: ApiBasketballGameItem[] = [];
        if (activeTab === 'live') {
          raw = await webBasketballApiService.getLiveGames();
        } else {
          raw = await webBasketballApiService.getGamesByDate(selectedDate);
        }
        setGames(raw || []);
      }
    } catch (err) {
      console.error('[Web BasketballScreen] Error loading games:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const filteredGames = useMemo(() => {
    let list = Array.isArray(games) ? games : [];

    if (activeTab === 'live') {
      list = list.filter((g) => {
        const short = g?.status?.short || '';
        return ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE'].includes(short);
      });
    } else if (activeTab === 'upcoming') {
      list = list.filter((g) => {
        const short = g?.status?.short || '';
        return !['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE', 'FT', 'AOT'].includes(short);
      });
    } else if (activeTab === 'results') {
      list = list.filter((g) => {
        const short = g?.status?.short || '';
        return ['FT', 'AOT'].includes(short);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          (g?.teams?.home?.name || '').toLowerCase().includes(q) ||
          (g?.teams?.away?.name || '').toLowerCase().includes(q) ||
          (g?.league?.name || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [games, activeTab, searchQuery]);

  // Group by league
  const leagueGroups = useMemo(() => {
    const groups: {
      [key: string]: { title: string; logo?: string; games: ApiBasketballGameItem[] };
    } = {};

    filteredGames.forEach((game) => {
      if (!game) return;
      const leagueTitle = game?.league?.name || 'Basketball Competitions';
      if (!groups[leagueTitle]) {
        groups[leagueTitle] = {
          title: leagueTitle,
          logo: game?.league?.logo,
          games: [],
        };
      }
      groups[leagueTitle].games.push(game);
    });

    return Object.values(groups);
  }, [filteredGames]);

  const tabs: { id: BasketballTab; label: string; icon: string; badge?: string }[] = [
    { id: 'live', label: 'Live Games', icon: '⚡', badge: 'Live' },
    { id: 'upcoming', label: 'Upcoming', icon: '📅' },
    { id: 'results', label: 'Results', icon: '✅' },
    { id: 'standings', label: 'Standings', icon: '🏆' },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Smart Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-[#0B172B]/90 border border-blue-500/20 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <span className="text-lg">🏀</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>Basketball LiveScore</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                Court Radar
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live quarters, shot telemetry, conference standings, and NBA scorelines
            </p>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-blue-500/20 bg-[#070E1A] px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
            />
            <FiSearch className="absolute left-3 top-2.5 text-xs text-slate-400" />
          </div>

          <button
            onClick={fetchGames}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-orange-400 transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            title="Refresh on demand"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400 shadow-lg shadow-blue-600/30 scale-[1.02]'
                  : 'bg-[#0B172B]/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 7-Day Date Slider (Hidden in Standings & Live modes) */}
      {activeTab !== 'standings' && activeTab !== 'live' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {dateStrip.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`flex min-w-[72px] sm:min-w-[80px] flex-col items-center rounded-2xl p-2.5 transition-all duration-200 border ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-orange-500/10 text-amber-300 shadow-lg shadow-amber-500/20 scale-[1.03]'
                    : 'border-blue-500/15 bg-[#0B172B]/70 text-slate-400 hover:border-blue-400/30 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{item.dayName}</span>
                <span className="text-base sm:text-lg font-black">{item.dayNumber}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content Feed */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-[#0A1424]/60 border border-blue-500/20">
          <GoalmillsLoader
            size="md"
            label="Basketball Desk"
            sublabel="Syncing live quarter scores & NBA telemetry..."
          />
        </div>
      ) : activeTab === 'standings' ? (
        /* Standings View */
        <div className="rounded-2xl border border-blue-500/20 bg-[#0A1424]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2 uppercase">
                <FiAward className="text-amber-400" />
                <span>NBA Standings & Conference Tables</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official win-loss percentages and playoff seeds
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
              2025/26 Season
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="border-b border-white/10 text-[11px] uppercase font-black tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-2 text-center w-8">#</th>
                  <th className="py-3 px-3">Franchise</th>
                  <th className="py-3 px-2 text-center">W</th>
                  <th className="py-3 px-2 text-center">L</th>
                  <th className="py-3 px-2 text-center">PCT</th>
                  <th className="py-3 px-2 text-center">GB</th>
                  <th className="py-3 px-3 text-right font-black text-amber-400">STRK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      Standings telemetry currently updating.
                    </td>
                  </tr>
                ) : (
                  standings.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-blue-600/10 transition-colors">
                      <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                        {row.position || idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2.5">
                        {row.team?.logo ? (
                          <img
                            src={row.team.logo}
                            alt={row.team?.name}
                            className="h-5 w-5 object-contain"
                          />
                        ) : (
                          <span className="text-amber-400">🏀</span>
                        )}
                        <span className="truncate">{row.team?.name || 'Team'}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">
                        {row.games?.win?.total ?? '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center text-red-400 font-bold">
                        {row.games?.lose?.total ?? '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                        {row.games?.win?.percentage ?? '.500'}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400">
                        {row.gamesBehind ?? '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-amber-400 text-xs">
                        {row.streak ? `W${row.streak}` : 'W1'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : leagueGroups.length === 0 ? (
        /* Empty State */
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-[#0A1424]/80 p-8 text-center backdrop-blur-md">
          <span className="text-4xl">🏀</span>
          <h3 className="mt-3 text-base font-bold text-white">
            {activeTab === 'live' ? 'No Live Basketball Games In-Play' : 'No Games Found'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {activeTab === 'live'
              ? 'Check upcoming games or select another date from the calendar.'
              : 'Try selecting a different date or search filter.'}
          </p>
          <button
            onClick={fetchGames}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all shadow-md"
          >
            Refresh Feed
          </button>
        </div>
      ) : (
        /* Grouped Games List */
        <div className="space-y-6">
          {leagueGroups.map((group) => (
            <div
              key={group.title}
              className="space-y-3 rounded-2xl border border-blue-500/20 bg-[#0A1424]/80 p-4 shadow-xl backdrop-blur-md"
            >
              {/* League Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400">🏀</span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-white">
                    {group.title}
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {group.games.length} {group.games.length === 1 ? 'Game' : 'Games'}
                </span>
              </div>

              {/* Match Cards Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {group.games.map((game) => (
                  <BasketballMatchCard key={game.id} match={game} hideLeague />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
