'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BasketballMatchCard } from './BasketballMatchCard';
import {
  webBasketballApiService,
  ApiBasketballGameItem,
} from '../services/basketballApi';

type BasketballTab = 'live' | 'upcoming' | 'results' | 'standings';

export function BasketballScreen() {
  const [activeTab, setActiveTab] = useState<BasketballTab>('live');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
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
        // NBA (League ID: 12) default standings
        const res = await webBasketballApiService.getStandings({
          league: 12,
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
    let list = games;

    if (activeTab === 'live') {
      list = list.filter((g) =>
        ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE'].includes(g.status.short)
      );
    } else if (activeTab === 'upcoming') {
      list = list.filter(
        (g) =>
          !['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE', 'FT', 'AOT'].includes(
            g.status.short
          )
      );
    } else if (activeTab === 'results') {
      list = list.filter((g) => ['FT', 'AOT'].includes(g.status.short));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.teams.home.name.toLowerCase().includes(q) ||
          g.teams.away.name.toLowerCase().includes(q) ||
          g.league.name.toLowerCase().includes(q)
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
      const leagueTitle = game.league.name || 'Other Competitions';
      if (!groups[leagueTitle]) {
        groups[leagueTitle] = {
          title: leagueTitle,
          logo: game.league.logo,
          games: [],
        };
      }
      groups[leagueTitle].games.push(game);
    });

    return Object.values(groups);
  }, [filteredGames]);

  const tabs: { id: BasketballTab; label: string; icon: string }[] = [
    { id: 'live', label: 'Live Games', icon: '🔴' },
    { id: 'upcoming', label: 'Upcoming', icon: '📅' },
    { id: 'results', label: 'Results', icon: '✅' },
    { id: 'standings', label: 'Standings', icon: '🏆' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Basketball LiveScore
          </h1>
          <p className="text-sm text-slate-400">
            Real-time NBA, EuroLeague, and international basketball fixtures & standings
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search teams or leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141C2B] px-4 py-2.5 pl-9 text-sm text-white placeholder-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <span className="absolute left-3 top-3 text-xs text-slate-400">🔍</span>
          </div>

          <button
            onClick={fetchGames}
            className="flex items-center space-x-2 rounded-xl border border-white/10 bg-[#1E293B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-95"
            title="Refresh on demand"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 overflow-x-auto border-b border-white/10 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                isActive
                  ? 'border border-orange-500/50 bg-[#1A2333] text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.2)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Strip */}
      {activeTab !== 'live' && activeTab !== 'standings' && (
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
          {dateStrip.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`flex min-w-[72px] flex-col items-center justify-center rounded-xl border p-2.5 transition ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500 text-slate-950 font-bold'
                    : 'border-white/10 bg-[#141C2B] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider">{item.dayName}</span>
                <span className={`text-base font-black ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                  {item.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading basketball data...</p>
        </div>
      ) : activeTab === 'standings' ? (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-bold text-white">NBA Standings</h2>
          {standings.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Standings data currently not available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-3 text-center">W</th>
                    <th className="py-3 px-3 text-center">L</th>
                    <th className="py-3 px-3 text-center">PCT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-3 px-2 font-bold text-slate-400">{row.position || idx + 1}</td>
                      <td className="flex items-center space-x-3 py-3 px-4 font-bold text-white">
                        {row.team?.logo && (
                          <img src={row.team.logo} alt={row.team.name} className="h-5 w-5 object-contain" />
                        )}
                        <span>{row.team?.name || 'Team'}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">{row.games?.win?.total ?? 0}</td>
                      <td className="py-3 px-3 text-center font-bold text-red-400">{row.games?.lose?.total ?? 0}</td>
                      <td className="py-3 px-3 text-center font-medium">{row.games?.win?.percentage ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : leagueGroups.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#141C2B] p-8 text-center">
          <span className="text-4xl">🏀</span>
          <h3 className="mt-3 text-base font-bold text-white">
            {activeTab === 'live' ? 'No Live Basketball Games' : 'No Games Found'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {activeTab === 'live'
              ? 'Check upcoming games or select another date from the calendar.'
              : 'Try searching for a different team or league.'}
          </p>
          <button
            onClick={fetchGames}
            className="mt-4 rounded-xl border border-white/10 bg-[#1E293B] px-4 py-2 text-xs font-bold text-orange-400 hover:bg-slate-700"
          >
            Refresh Feed
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {leagueGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <div className="flex items-center space-x-2">
                {group.logo ? (
                  <img src={group.logo} alt={group.title} className="h-5 w-5 object-contain" />
                ) : (
                  <span className="text-orange-400">🏀</span>
                )}
                <h2 className="text-sm font-bold text-slate-200">{group.title}</h2>
                <span className="text-xs text-slate-500">({group.games.length})</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
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
