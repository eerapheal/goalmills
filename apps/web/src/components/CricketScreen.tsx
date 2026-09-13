'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { CricketMatchCard } from './CricketMatchCard';
import { cricketApi } from '../services/cricketApi';
import { CricketEvent, CricketStanding } from '@goalmills/types';
import { GoalmillsLoader } from './GoalmillsLoader';
import { cricketRoutes } from '@/lib/slugUtils';
import {
  FiRefreshCw,
  FiSearch,
  FiCalendar,
  FiAward,
  FiActivity,
  FiTrendingUp,
  FiSliders,
} from 'react-icons/fi';

export type CricketTab = 'live' | 'upcoming' | 'results' | 'standings';

export const MAJOR_CRICKET_LEAGUES = [
  { id: 'all', name: 'All Competitions', country: 'Global', flag: '🌐' },
  { id: '745', name: 'IPL', country: 'India', flag: '🇮🇳' },
  { id: '729', name: 'PSL', country: 'Pakistan', flag: '🇵🇰' },
  { id: '13464', name: 'Big Bash League', country: 'Australia', flag: '🇦🇺' },
  { id: '7735', name: 'Caribbean Premier League', country: 'West Indies', flag: '🌴' },
  { id: '9897', name: 'The Hundred', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: '8459', name: 'SA20', country: 'South Africa', flag: '🇿🇦' },
  { id: '8453', name: 'BPL', country: 'Bangladesh', flag: '🇧🇩' },
  { id: '732', name: 'CSA T20', country: 'South Africa', flag: '🇿🇦' },
];

export function CricketScreen() {
  const [activeTab, setActiveTab] = useState<CricketTab>('live');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [competitions, setCompetitions] = useState(MAJOR_CRICKET_LEAGUES);

  const [matches, setMatches] = useState<CricketEvent[]>([]);
  const [standings, setStandings] = useState<CricketStanding[]>([]);

  // Dynamically load additional active leagues from AllSportsAPI
  useEffect(() => {
    cricketApi
      .getLeagues()
      .then((res) => {
        if (Array.isArray(res?.result)) {
          const activeLeagues = res.result;
          const priorityKeywords = ['Premier League', 'Super League', 'Big Bash', 'World Cup', 'T20', 'Hundred', 'Championship'];
          const matched = activeLeagues
            .filter((l) => priorityKeywords.some((k) => (l.league_name || '').toLowerCase().includes(k.toLowerCase())))
            .slice(0, 8)
            .map((l) => ({
              id: String(l.league_key),
              name: l.league_name,
              country: l.country_name || 'Cricket',
              flag: '🏏',
            }));

          // Merge without duplicates
          const existingIds = new Set(MAJOR_CRICKET_LEAGUES.map((c) => c.id));
          const additions = matched.filter((m) => !existingIds.has(m.id));
          if (additions.length > 0) {
            setCompetitions([...MAJOR_CRICKET_LEAGUES, ...additions]);
          }
        }
      })
      .catch(() => {});
  }, []);

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
        const leagueId = selectedLeague === 'all' || isNaN(Number(selectedLeague)) ? 732 : Number(selectedLeague);
        const res = await cricketApi.getStandings({ leagueId });
        let list = res?.result?.total || (Array.isArray(res?.result) ? res.result : []);
        if (list.length === 0 && selectedLeague === 'all') {
          const altRes = await cricketApi.getStandings({ leagueId: 745 });
          list = altRes?.result?.total || (Array.isArray(altRes?.result) ? altRes.result : []);
        }
        setStandings(list);
      } else if (activeTab === 'live') {
        const leagueIdParam = selectedLeague !== 'all' && !isNaN(Number(selectedLeague)) ? Number(selectedLeague) : undefined;
        const res = await cricketApi.getLivescore(leagueIdParam ? { leagueId: leagueIdParam } : {});
        const list = Array.isArray(res?.result) ? res.result : [];
        setMatches(list);
      } else {
        // Upcoming or Results
        const leagueIdParam = selectedLeague !== 'all' && !isNaN(Number(selectedLeague)) ? Number(selectedLeague) : undefined;
        const res = await cricketApi.getFixtures({
          from: selectedDate,
          to: selectedDate,
          ...(leagueIdParam ? { leagueId: leagueIdParam } : {}),
        });
        const list = Array.isArray(res?.result) ? res.result : [];
        setMatches(list);
      }
    } catch (err) {
      console.error('[CricketScreen] Error loading data:', err);
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

  // Filtered matches based on active tab, league filter, and search query
  const filteredMatches = useMemo(() => {
    let list = Array.isArray(matches) ? matches : [];

    if (activeTab === 'live') {
      list = list.filter((m) => {
        const status = m.event_status?.toLowerCase() || '';
        return (
          m.event_live === '1' ||
          status.includes('live') ||
          status.includes('innings') ||
          status.includes('batting') ||
          status.includes('bowling') ||
          status.includes('break') ||
          status.includes('drinks') ||
          status.includes('tea') ||
          status.includes('lunch')
        );
      });
    } else if (activeTab === 'upcoming') {
      list = list.filter((m) => {
        const status = m.event_status?.toLowerCase() || '';
        return (
          status !== 'finished' &&
          status !== 'ft' &&
          !status.includes('won') &&
          !status.includes('complete') &&
          !status.includes('abandoned') &&
          m.event_live !== '1'
        );
      });
    } else if (activeTab === 'results') {
      list = list.filter((m) => {
        const status = m.event_status?.toLowerCase() || '';
        return (
          status === 'finished' ||
          status === 'ft' ||
          status.includes('won') ||
          status.includes('complete') ||
          status.includes('draw') ||
          status.includes('abandoned')
        );
      });
    }

    if (selectedLeague !== 'all') {
      const matchLeague = competitions.find((c) => c.id === selectedLeague);
      list = list.filter((m) => {
        if (m.league_key && String(m.league_key) === selectedLeague) return true;
        if (matchLeague) {
          const lName = (m.league_name || '').toLowerCase();
          return lName.includes(matchLeague.name.toLowerCase());
        }
        return false;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          (m.event_home_team || '').toLowerCase().includes(q) ||
          (m.event_away_team || '').toLowerCase().includes(q) ||
          (m.league_name || '').toLowerCase().includes(q) ||
          (m.event_stadium || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [matches, activeTab, selectedLeague, searchQuery]);

  // Group matches by tournament/league
  const groupedMatches = useMemo(() => {
    const groups: { [key: string]: { leagueName: string; matches: CricketEvent[] } } = {};
    filteredMatches.forEach((m) => {
      const lName = m.league_name || 'International & Domestic Fixtures';
      if (!groups[lName]) {
        groups[lName] = { leagueName: lName, matches: [] };
      }
      groups[lName].matches.push(m);
    });
    return Object.values(groups);
  }, [filteredMatches]);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="rounded-3xl border border-red-500/25 bg-[#170B10]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#060D18]/90 border border-white/5">
            {[
              { id: 'live', label: 'Live Matches', icon: FiActivity, color: 'text-red-500' },
              { id: 'upcoming', label: 'Upcoming', icon: FiCalendar, color: 'text-sky-400' },
              { id: 'results', label: 'Results', icon: FiAward, color: 'text-yellow-400' },
              { id: 'standings', label: 'Points Table', icon: FiTrendingUp, color: 'text-yellow-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CricketTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={isActive ? 'text-white' : tab.color} />
                  <span>{tab.label}</span>
                  {tab.id === 'live' && matches.length > 0 && activeTab === 'live' && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold animate-pulse">
                      {matches.length}
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
              title="Refresh Live Scores"
            >
              <FiRefreshCw className={`text-red-400 ${refreshing ? 'animate-spin' : ''}`} />
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
                      ? 'bg-red-600/20 border-red-500/50 text-red-300 shadow-md'
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
            <FiSliders className="text-yellow-400" /> Filter:
          </span>
          {competitions.map((league) => {
            const isSelected = selectedLeague === league.id;
            return (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-black'
                    : 'bg-[#180C12] text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
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
            placeholder="Search teams, tournament, stadium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#060D18]/90 border border-white/10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-red-400/50 transition-colors"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <GoalmillsLoader />
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase animate-pulse">
            Loading Live Cricket Intelligence...
          </p>
        </div>
      ) : activeTab === 'standings' ? (
        /* Standings / Points Table View */
        <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiTrendingUp className="text-yellow-400" />
              <span>Official Points Table</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              {standings.length} Teams Listed
            </span>
          </div>

          {standings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No standings currently available for this tournament. Select another competition from the filter ribbon.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-3">Team</th>
                    <th className="py-3 px-2 text-center">P</th>
                    <th className="py-3 px-2 text-center text-red-400">W</th>
                    <th className="py-3 px-2 text-center text-rose-400">L</th>
                    <th className="py-3 px-2 text-center">NR/T</th>
                    <th className="py-3 px-2 text-center font-bold text-yellow-400">PTS</th>
                    <th className="py-3 px-2 text-center hidden sm:table-cell">NRR</th>
                    <th className="py-3 px-2 text-center hidden md:table-cell">Stage / Group</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {standings.map((team, idx) => {
                    const teamSlug = cricketRoutes.teamFromName(
                      team.standing_team,
                      team.team_key
                    );
                    return (
                      <tr
                        key={team.team_key || idx}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="py-3 px-2 font-mono font-bold text-slate-400 group-hover:text-yellow-400">
                          {team.standing_place || idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <Link
                            href={teamSlug}
                            className="font-bold text-white hover:text-red-400 transition-colors flex items-center gap-2"
                          >
                            <span>{team.standing_team}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{team.standing_MP || '0'}</td>
                        <td className="py-3 px-2 text-center font-mono text-red-400 font-bold">
                          {team.standing_W || '0'}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-rose-400">
                          {team.standing_L || '0'}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-400">
                          {team.standing_NR || '0'}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-black text-yellow-400 text-sm">
                          {team.standing_Pts || '0'}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300 hidden sm:table-cell">
                          {team.standing_NRR || '-'}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[10px] text-slate-400 truncate max-w-[120px] hidden md:table-cell">
                          {team.league_round || team.standing_place_type || 'Group Stage'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : groupedMatches.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-12 text-center shadow-xl space-y-3">
          <div className="text-4xl">🏏</div>
          <h4 className="text-base font-black text-white">
            {activeTab === 'live'
              ? 'No Live Cricket Matches In-Play Right Now'
              : `No Matches Scheduled for ${selectedDate}`}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeTab === 'live'
              ? 'Check the Upcoming tab for upcoming fixtures or select another date in Results.'
              : 'Try selecting a different tournament or date using the calendar slider above.'}
          </p>
        </div>
      ) : (
        /* Matches Grid Grouped by Competition */
        <div className="space-y-6">
          {groupedMatches.map((group) => (
            <div key={group.leagueName} className="space-y-3">
              {/* Competition Section Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">🏏</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {group.leagueName}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 font-bold border border-red-500/20">
                    {group.matches.length}
                  </span>
                </div>
              </div>

              {/* Match Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.matches.map((match) => (
                  <CricketMatchCard
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

export default CricketScreen;
