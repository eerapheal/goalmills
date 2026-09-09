'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { BasketballMatchCard } from './BasketballMatchCard';
import { basketballApi } from '../services/basketballApi';
import { BasketballEvent, BasketballStanding } from '@goalmills/types';
import { GoalmillsLoader } from './GoalmillsLoader';
import { getNewsUrl, slugify, basketballRoutes } from '@/lib/slugUtils';
import {
  FiRefreshCw,
  FiSearch,
  FiCalendar,
  FiAward,
  FiActivity,
  FiZap,
  FiTrendingUp,
  FiShield,
  FiSliders,
} from 'react-icons/fi';

export type BasketballTab = 'live' | 'upcoming' | 'results' | 'standings';

export const MAJOR_BASKETBALL_LEAGUES = [
  { id: 'all', name: 'All Competitions', country: 'Global', flag: '🌐' },
  { id: '766', name: 'NBA', country: 'USA', flag: '🇺🇸' },
  { id: '787', name: 'EuroLeague', country: 'Europe', flag: '🇪🇺' },
  { id: '782', name: 'Liga ACB', country: 'Spain', flag: '🇪🇸' },
  { id: '812', name: 'NCAA Basketball', country: 'USA', flag: '🇺🇸' },
  { id: '772', name: 'Lega Basket Serie A', country: 'Italy', flag: '🇮🇹' },
  { id: '779', name: 'BBL', country: 'Germany', flag: '🇩🇪' },
  { id: '788', name: 'EuroCup', country: 'Europe', flag: '🇪🇺' },
];

export function BasketballScreen() {
  const [activeTab, setActiveTab] = useState<BasketballTab>('live');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [games, setGames] = useState<BasketballEvent[]>([]);
  const [standings, setStandings] = useState<BasketballStanding[]>([]);

  // 7-day date strip slider (-3 days, today, +3 days)
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

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      if (activeTab === 'standings') {
        const leagueId = selectedLeague === 'all' ? 766 : Number(selectedLeague);
        const res = await basketballApi.getStandings({ leagueId });
        const list = res?.result?.total || (Array.isArray(res?.result) ? res.result : []);
        setStandings(list);
      } else if (activeTab === 'live') {
        const res = await basketballApi.getLivescore(
          selectedLeague !== 'all' ? { leagueId: Number(selectedLeague) } : {}
        );
        const list = Array.isArray(res?.result) ? res.result : [];
        setGames(list);
      } else {
        // Upcoming or Results
        const res = await basketballApi.getFixtures({
          from: selectedDate,
          to: selectedDate,
          ...(selectedLeague !== 'all' ? { leagueId: Number(selectedLeague) } : {}),
        });
        const list = Array.isArray(res?.result) ? res.result : [];
        setGames(list);
      }
    } catch (err) {
      console.error('[BasketballScreen] Error loading data:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [activeTab, selectedLeague, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling interval for live matches (every 15s)
  useEffect(() => {
    if (activeTab !== 'live') return;
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeTab, loadData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  };

  // Filtered games based on active tab and search query
  const filteredGames = useMemo(() => {
    let list = Array.isArray(games) ? games : [];

    if (activeTab === 'live') {
      list = list.filter((g) => {
        const status = g.event_status?.toLowerCase() || '';
        const quarter = g.event_quarter?.toLowerCase() || '';
        return (
          g.event_live === '1' ||
          status.includes('live') ||
          status.includes('quarter') ||
          status.includes('ot') ||
          status.includes('halftime') ||
          quarter.includes('quarter')
        );
      });
    } else if (activeTab === 'upcoming') {
      list = list.filter((g) => {
        const status = g.event_status?.toLowerCase() || '';
        return (
          status !== 'finished' &&
          status !== 'ft' &&
          status !== 'aot' &&
          g.event_live !== '1'
        );
      });
    } else if (activeTab === 'results') {
      list = list.filter((g) => {
        const status = g.event_status?.toLowerCase() || '';
        return status === 'finished' || status === 'ft' || status === 'aot';
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          (g.event_home_team || '').toLowerCase().includes(q) ||
          (g.event_away_team || '').toLowerCase().includes(q) ||
          (g.league_name || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [games, activeTab, searchQuery]);

  // Group games by league
  const groupedGames = useMemo(() => {
    const groups: { [key: string]: { leagueName: string; matches: BasketballEvent[] } } = {};
    filteredGames.forEach((m) => {
      const lName = m.league_name || 'Other Basketball Competitions';
      if (!groups[lName]) {
        groups[lName] = { leagueName: lName, matches: [] };
      }
      groups[lName].matches.push(m);
    });
    return Object.values(groups);
  }, [filteredGames]);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#060D18]/90 border border-white/5">
            {[
              { id: 'live', label: 'Live Games', icon: FiActivity, color: 'text-amber-400' },
              { id: 'upcoming', label: 'Upcoming', icon: FiCalendar, color: 'text-sky-400' },
              { id: 'results', label: 'Results', icon: FiAward, color: 'text-emerald-400' },
              { id: 'standings', label: 'Standings', icon: FiTrendingUp, color: 'text-purple-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as BasketballTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={isActive ? 'text-white' : tab.color} />
                  <span>{tab.label}</span>
                  {tab.id === 'live' && games.length > 0 && activeTab === 'live' && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold">
                      {games.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Live Data"
            >
              <FiRefreshCw className={`text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>
          </div>
        </div>

        {/* Date Strip Navigator (for Upcoming and Results) */}
        {(activeTab === 'upcoming' || activeTab === 'results') && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
            {dateStrip.map((item) => {
              const isSelected = selectedDate === item.iso;
              return (
                <button
                  key={item.iso}
                  onClick={() => setSelectedDate(item.iso)}
                  className={`flex flex-col items-center min-w-[70px] py-2 px-2.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider">{item.dayName}</span>
                  <span className="text-sm font-mono font-black">{item.dayNumber}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Competitions / Leagues Filter Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 flex-shrink-0">
            <FiSliders className="text-amber-400" /> Filter:
          </span>
          {MAJOR_BASKETBALL_LEAGUES.map((league) => {
            const isSelected = selectedLeague === league.id;
            return (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                    : 'bg-[#091529] text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
                }`}
              >
                <span>{league.flag}</span>
                <span>{league.name}</span>
              </button>
            );
          })}
        </div>

        {/* Live Search Filter */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search teams, conferences, leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#060D18]/90 border border-white/10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <GoalmillsLoader />
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase animate-pulse">
            Loading Live Basketball Intelligence...
          </p>
        </div>
      ) : activeTab === 'standings' ? (
        /* Standings View */
        <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiTrendingUp className="text-amber-400" />
              <span>Official Standings</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              {standings.length} Teams Listed
            </span>
          </div>

          {standings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No standings currently available for this league.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-3">Team</th>
                    <th className="py-3 px-2 text-center">P</th>
                    <th className="py-3 px-2 text-center">W</th>
                    <th className="py-3 px-2 text-center">L</th>
                    <th className="py-3 px-2 text-center">PCT</th>
                    <th className="py-3 px-2 text-center hidden sm:table-cell">F</th>
                    <th className="py-3 px-2 text-center hidden sm:table-cell">A</th>
                    <th className="py-3 px-2 text-center">Form / Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {standings.map((team, idx) => {
                    const teamSlug = basketballRoutes.teamFromName(
                      team.standing_team,
                      team.team_key
                    );
                    return (
                      <tr
                        key={team.team_key || idx}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="py-3 px-2 font-mono font-bold text-slate-400 group-hover:text-amber-400">
                          {team.standing_place || idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <Link
                            href={teamSlug}
                            className="font-bold text-white hover:text-amber-300 transition-colors flex items-center gap-2"
                          >
                            <span>{team.standing_team}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{team.standing_P}</td>
                        <td className="py-3 px-2 text-center font-mono text-emerald-400 font-bold">
                          {team.standing_W}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-rose-400">
                          {team.standing_L}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-amber-400">
                          {team.standing_PCT ||
                            (team.standing_P && Number(team.standing_P) > 0
                              ? (Number(team.standing_W) / Number(team.standing_P)).toFixed(3)
                              : '-')}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                          {team.standing_F}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                          {team.standing_A}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                          {team.league_round || team.standing_place_type || 'Regular'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : groupedGames.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-12 text-center shadow-xl space-y-3">
          <div className="text-4xl">🏀</div>
          <h4 className="text-base font-black text-white">
            {activeTab === 'live'
              ? 'No Live Games In-Play Right Now'
              : `No Matches Scheduled for ${selectedDate}`}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeTab === 'live'
              ? 'Check the Upcoming tab for upcoming tip-offs or select another date in Results.'
              : 'Try selecting a different competition or date using the calendar slider above.'}
          </p>
        </div>
      ) : (
        /* Matches Grid Grouped by Competition */
        <div className="space-y-6">
          {groupedGames.map((group) => (
            <div key={group.leagueName} className="space-y-3">
              {/* Competition Section Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">🏀</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {group.leagueName}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                    {group.matches.length}
                  </span>
                </div>
              </div>

              {/* Match Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.matches.map((match) => (
                  <BasketballMatchCard
                    key={match.event_key || match.home_team_key}
                    match={match}
                    hideLeague={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BasketballScreen;
