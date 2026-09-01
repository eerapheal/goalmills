'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { advancedCricketApi } from '../services/advancedCricketApi';
import {
  CricketEvent,
  CricketLeague,
  CricketTeam,
  CricketStanding,
  CricketPlayer,
} from '@goalmills/types';
import { CricketMatchCard } from './CricketMatchCard';
import { GoalmillsLoader } from './GoalmillsLoader';
import Link from 'next/link';

type CricketTab = 'live' | 'upcoming' | 'results' | 'standings' | 'series' | 'teams';
type FormatFilter = 'all' | 'international' | 'franchise' | 'domestic' | 'women';

export function CricketScreen() {
  const [activeTab, setActiveTab] = useState<CricketTab>('live');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [pulseNews, setPulseNews] = useState<
    { id?: string; _id?: string; tag: string; title: string; time: string }[]
  >([
    { id: 'cricket-1', tag: 'IPL 2026', title: 'Powerplay Analytics: Boundary percentages soar past 210 strike rate', time: '15m ago' },
    { id: 'cricket-2', tag: 'ICC RANKINGS', title: 'India retain #1 spot in ICC T20 World Championship rankings', time: '40m ago' },
    { id: 'cricket-3', tag: 'T20 CUP', title: 'Australia announce 15-man squad with surprise pace bowling inclusions', time: '1h ago' },
    { id: 'cricket-4', tag: 'BBL', title: 'Perth Scorchers vs Sydney Sixers: Tactical pitch report and keys to victory', time: '3h ago' },
    { id: 'cricket-5', tag: 'WOMEN', title: 'WPL playoffs set: High drama expected in knockout semifinals', time: '5h ago' },
  ]);

  useEffect(() => {
    async function loadCricketPulseNews() {
      try {
        const res = await fetch('/api/news?sport=cricket&limit=8');
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.news || data?.data;
          if (items && items.length > 0) {
            const formatted = items.map((item: any) => ({
              id: item._id || item.id,
              _id: item._id || item.id,
              tag: (item.competition || item.category || item.tags?.[0] || 'CRICKET').toUpperCase(),
              title: item.title,
              time: item.createdAt ? `${Math.max(1, Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 3600000))}h ago` : 'Recent',
            }));
            setPulseNews(formatted);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch cricket pulse news:', err);
      }
    }
    loadCricketPulseNews();
  }, []);

  useEffect(() => {
    if (pulseNews.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % pulseNews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [pulseNews.length]);

  const currentPulse = pulseNews[tickerIndex] || pulseNews[0];
  const pulseLink = currentPulse?.id || currentPulse?._id ? `/news/${currentPulse.id || currentPulse._id}` : '/news';

  const [liveMatches, setLiveMatches] = useState<CricketEvent[]>([]);
  const [fixtures, setFixtures] = useState<CricketEvent[]>([]);
  const [seriesList, setSeriesList] = useState<CricketLeague[]>([]);
  const [teamsList, setTeamsList] = useState<CricketTeam[]>([]);
  const [playersList, setPlayersList] = useState<CricketPlayer[]>([]);
  const [standingsTab, setStandingsTab] = useState<
    'IPL' | 'T20_WC' | 'BBL' | 'ICC_TEST' | 'ICC_ODI' | 'ICC_T20'
  >('IPL');
  const [standings, setStandings] = useState<Record<string, CricketStanding[]>>({});
  const [iccRankings, setIccRankings] = useState<any[]>([]);

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

  const fetchCricketData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'live') {
        const res = await advancedCricketApi.getLivescore({ timezone: 'GMT' });
        setLiveMatches(res.result || []);
      } else if (activeTab === 'upcoming' || activeTab === 'results') {
        const fromDate = selectedDate;
        const toDate = selectedDate;
        const res = await advancedCricketApi.getFixtures({
          from: fromDate,
          to: toDate,
          timezone: 'GMT',
        });
        setFixtures(res.result || []);
      } else if (activeTab === 'standings') {
        const [iplRank, t20WorldCupRank, bblRank, iccTest, iccOdi, iccT20] = await Promise.all([
          advancedCricketApi.getStandings({ leagueId: 9785 }).catch(() => ({ result: [] })),
          advancedCricketApi.getStandings({ leagueId: 9843 }).catch(() => ({ result: [] })),
          advancedCricketApi.getStandings({ leagueId: 9779 }).catch(() => ({ result: [] })),
          advancedCricketApi.getRankings('test', 'teams', 'men').catch(() => ({
            format: 'test' as const,
            category: 'teams' as const,
            gender: 'men' as const,
            rankings: [],
          })),
          advancedCricketApi.getRankings('odi', 'teams', 'men').catch(() => ({
            format: 'odi' as const,
            category: 'teams' as const,
            gender: 'men' as const,
            rankings: [],
          })),
          advancedCricketApi.getRankings('t20', 'teams', 'men').catch(() => ({
            format: 't20' as const,
            category: 'teams' as const,
            gender: 'men' as const,
            rankings: [],
          })),
        ]);

        setStandings({
          IPL:
            (iplRank as any)?.result?.total ||
            (Array.isArray(iplRank?.result) ? iplRank.result : []),
          T20_WC:
            (t20WorldCupRank as any)?.result?.total ||
            (Array.isArray(t20WorldCupRank?.result) ? t20WorldCupRank.result : []),
          BBL:
            (bblRank as any)?.result?.total ||
            (Array.isArray(bblRank?.result) ? bblRank.result : []),
        });

        setIccRankings([
          { key: 'ICC_TEST', title: 'ICC Test Rankings', data: iccTest.rankings || [] },
          { key: 'ICC_ODI', title: 'ICC ODI Rankings', data: iccOdi.rankings || [] },
          { key: 'ICC_T20', title: 'ICC T20I Rankings', data: iccT20.rankings || [] },
        ]);
      } else if (activeTab === 'series') {
        const res = await advancedCricketApi.getLeagues();
        setSeriesList(res.result || []);
      } else if (activeTab === 'teams') {
        const [teamsRes, playersRes] = await Promise.all([
          advancedCricketApi.getTeams().catch(() => ({ result: [] })),
          advancedCricketApi.getTrendingPlayers().catch(() => []),
        ]);
        setTeamsList(teamsRes.result || []);
        setPlayersList(playersRes || []);
      }
    } catch (err) {
      console.error('[Web CricketScreen] Error loading cricket data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchCricketData();
  }, [fetchCricketData]);

  // Filtering matches by format & search
  const currentMatchesList = useMemo(() => {
    let list: CricketEvent[] = [];
    if (activeTab === 'live') {
      list = liveMatches;
    } else if (activeTab === 'upcoming') {
      list = fixtures.filter(
        (m) => m.event_live !== '1' && m.event_status !== 'Finished' && m.event_status !== 'FT'
      );
    } else if (activeTab === 'results') {
      list = fixtures.filter((m) => m.event_status === 'Finished' || m.event_status === 'FT');
    }

    if (formatFilter !== 'all') {
      list = list.filter((m) => {
        const league = (m.league_name || '').toLowerCase();
        const type = (m.event_type || '').toLowerCase();
        if (formatFilter === 'international') {
          return (
            league.includes('icc') ||
            league.includes('international') ||
            type.includes('t20i') ||
            type.includes('odi') ||
            type.includes('test')
          );
        }
        if (formatFilter === 'franchise') {
          return (
            league.includes('ipl') ||
            league.includes('bbl') ||
            league.includes('psl') ||
            league.includes('hundred') ||
            league.includes('cpl') ||
            league.includes('sa20') ||
            league.includes('premier league')
          );
        }
        if (formatFilter === 'domestic') {
          return (
            league.includes('trophy') ||
            league.includes('shield') ||
            league.includes('cup') ||
            league.includes('championship')
          );
        }
        if (formatFilter === 'women') {
          return (
            league.includes('women') ||
            type.includes('women') ||
            (m.event_home_team || '').toLowerCase().includes('women')
          );
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          (m.event_home_team && m.event_home_team.toLowerCase().includes(q)) ||
          (m.event_away_team && m.event_away_team.toLowerCase().includes(q)) ||
          (m.league_name && m.league_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, liveMatches, fixtures, formatFilter, searchQuery]);

  // Group by league / tournament
  const leagueGroups = useMemo(() => {
    const groups: {
      [key: string]: { title: string; logo?: string; matches: CricketEvent[] };
    } = {};

    currentMatchesList.forEach((match) => {
      const title = match.league_name || 'Cricket Matches';
      if (!groups[title]) {
        groups[title] = {
          title,
          matches: [],
        };
      }
      groups[title].matches.push(match);
    });

    return Object.values(groups);
  }, [currentMatchesList]);

  const tabs: { id: CricketTab; label: string; icon: string }[] = [
    { id: 'live', label: 'Live Matches', icon: '🔴' },
    { id: 'upcoming', label: 'Upcoming', icon: '📅' },
    { id: 'results', label: 'Results', icon: '✅' },
    { id: 'standings', label: 'Standings & Rankings', icon: '🏆' },
    { id: 'series', label: 'Series', icon: '🏏' },
    { id: 'teams', label: 'Teams & Players', icon: '👥' },
  ];

  const formatFilters: { id: FormatFilter; label: string }[] = [
    { id: 'all', label: 'All Formats' },
    { id: 'international', label: 'ICC & International' },
    { id: 'franchise', label: 'T20 Franchise' },
    { id: 'domestic', label: 'Domestic' },
    { id: 'women', label: 'Women' },
  ];

  return (
    <div className="w-full space-y-3.5">
      {/* ─── TOP CRICKET PULSE WIRE TICKER ─── */}
      <div className="rounded-xl bg-[#0B172B]/90 border border-blue-500/25 p-2 sm:p-2.5 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="min-w-0 flex-1 flex items-center gap-2 text-xs">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-red-400 border border-red-500/20 font-bold uppercase text-[9px]">
              Hot
            </span>
            <Link
              href={pulseLink}
              className="text-white font-bold truncate text-xs hover:text-blue-400 hover:underline transition-colors flex-1"
            >
              {currentPulse?.title}
            </Link>
            <span className="text-slate-500 text-[10px] hidden sm:inline flex-shrink-0">
              • {currentPulse?.time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === 'live' ? 'upcoming' : 'live')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30"
          >
            {activeTab === 'live' ? '📅 Upcoming Fixtures' : '⚡ Live Cricket'}
          </button>
        </div>
      </div>

      {/* Smart Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#0B172B]/90 border border-blue-500/20 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <span className="text-sm">🏏</span>
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <span>Cricket LiveScore</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-mono font-bold">
                Ball-by-Ball
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Live overs, tournament tables, series summaries, and ICC world rankings
            </p>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <input
              type="text"
              placeholder="Search teams, series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-blue-500/20 bg-[#070E1A] px-2.5 py-1 pl-7 text-[11px] text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all shadow-inner h-7"
            />
            <span className="absolute left-2.5 top-1.5 text-[10px] text-slate-400">🔍</span>
          </div>

          <button
            onClick={fetchCricketData}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-[11px] hover:from-blue-400 hover:to-indigo-500 transition-all shadow-sm active:scale-95 disabled:opacity-50 h-7"
            title="Refresh on demand"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-150 flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-[#0B172B]/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Format Filter Pills for Matches */}
      {(activeTab === 'live' || activeTab === 'upcoming' || activeTab === 'results') && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {formatFilters.map((fmt) => {
            const isFmtActive = formatFilter === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={() => setFormatFilter(fmt.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  isFmtActive
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'bg-[#0B172B]/70 text-slate-400 border border-blue-500/15 hover:border-blue-400/30 hover:text-white'
                }`}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Date Strip for upcoming & results */}
      {activeTab !== 'live' &&
        activeTab !== 'standings' &&
        activeTab !== 'series' &&
        activeTab !== 'teams' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {dateStrip.map((item) => {
              const isSelected = selectedDate === item.iso;
              return (
                <button
                  key={item.iso}
                  onClick={() => setSelectedDate(item.iso)}
                  className={`flex min-w-[56px] sm:min-w-[64px] flex-col items-center rounded-lg p-1.5 transition-all duration-150 border ${
                    isSelected
                      ? 'border-blue-400 bg-blue-600/25 text-blue-300 shadow-md scale-[1.02]'
                      : 'border-blue-500/15 bg-[#0B172B]/70 text-slate-400 hover:border-blue-400/30 hover:text-white'
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase">{item.dayName}</span>
                  <span className="text-xs sm:text-sm font-black">{item.dayNumber}</span>
                </button>
              );
            })}
          </div>
        )}

      {/* Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-[#0A1424]/60 border border-blue-500/20">
          <GoalmillsLoader
            size="md"
            label="Cricket Desk"
            sublabel="Fetching live overs, wickets & tournament tables..."
          />
        </div>
      ) : activeTab === 'standings' ? (
        /* Standings & Rankings Hub */
        <div className="space-y-6">
          {/* Sub-selector for tournaments & ICC rankings */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'IPL', label: 'IPL Table' },
              { id: 'T20_WC', label: 'ICC T20 World Cup' },
              { id: 'BBL', label: 'Big Bash League' },
              { id: 'ICC_TEST', label: 'ICC Test Rankings' },
              { id: 'ICC_ODI', label: 'ICC ODI Rankings' },
              { id: 'ICC_T20', label: 'ICC T20I Rankings' },
            ].map((sub) => {
              const isSubActive = standingsTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setStandingsTab(sub.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSubActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-[#0B172B]/70 text-slate-300 border border-blue-500/15 hover:border-blue-400/30 hover:text-white'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* Standings Table View */}
          {standingsTab === 'IPL' || standingsTab === 'T20_WC' || standingsTab === 'BBL' ? (
            <div className="rounded-2xl border border-blue-500/20 bg-[#0A1424]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              <h2 className="mb-4 text-base font-black text-white flex items-center gap-2 uppercase tracking-tight">
                <span className="text-amber-400">🏆</span>
                <span>
                  {standingsTab === 'IPL'
                    ? 'Indian Premier League (IPL) Points Table'
                    : standingsTab === 'T20_WC'
                      ? 'ICC T20 World Cup Standings'
                      : 'Big Bash League (BBL) Standings'}
                </span>
              </h2>

              {!standings[standingsTab] || standings[standingsTab].length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  Standings for this tournament are currently syncing...
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                    <thead className="border-b border-white/10 text-[11px] uppercase font-black tracking-wider text-slate-400">
                      <tr>
                        <th className="py-3 px-2 text-center w-8">#</th>
                        <th className="py-3 px-3">Team</th>
                        <th className="py-3 px-2 text-center">P</th>
                        <th className="py-3 px-2 text-center">W</th>
                        <th className="py-3 px-2 text-center">L</th>
                        <th className="py-3 px-2 text-center">NR</th>
                        <th className="py-3 px-2 text-center font-mono">NRR</th>
                        <th className="py-3 px-3 text-right font-black text-amber-400">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {standings[standingsTab].map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-600/10 transition-colors">
                          <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                            {row.standing_place || idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                            <span className="text-amber-400">🛡️</span>
                            <span>{row.standing_team}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">{row.standing_MP || 0}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">
                            {row.standing_W || 0}
                          </td>
                          <td className="py-2.5 px-2 text-center text-red-400 font-bold">
                            {row.standing_L || 0}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-400">
                            {row.standing_NR || 0}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-300">
                            {row.standing_NRR || '0.00'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-amber-400 text-sm">
                            {row.standing_Pts || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* ICC Team Rankings Table */
            <div className="rounded-2xl border border-blue-500/20 bg-[#0A1424]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              <h2 className="mb-4 text-base font-black text-white flex items-center gap-2 uppercase tracking-tight">
                <span className="text-amber-400">🌍</span>
                <span>
                  {standingsTab === 'ICC_TEST'
                    ? 'Official ICC Men’s Test Team Rankings'
                    : standingsTab === 'ICC_ODI'
                      ? 'Official ICC Men’s ODI Team Rankings'
                      : 'Official ICC Men’s T20I Team Rankings'}
                </span>
              </h2>

              {(() => {
                const targetObj = iccRankings.find((r) => r.key === standingsTab);
                const data = targetObj?.data || [];
                if (data.length === 0) {
                  return (
                    <p className="text-sm text-slate-400 py-6 text-center">
                      ICC Rankings telemetry is loading...
                    </p>
                  );
                }
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                      <thead className="border-b border-white/10 text-[11px] uppercase font-black tracking-wider text-slate-400">
                        <tr>
                          <th className="py-3 px-2 text-center w-12">Rank</th>
                          <th className="py-3 px-3">Country / Team</th>
                          <th className="py-3 px-3 text-center">Rating Points</th>
                          <th className="py-3 px-3 text-right">ICC Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium">
                        {data.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-blue-600/10 transition-colors">
                            <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                              {item.rank || idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-white">
                              {item.country || item.team_name}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-300">
                              {item.points ? item.points.toLocaleString() : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-amber-400">
                              {item.rating || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : activeTab === 'series' ? (
        /* Series / Tournament Directory */
        <div className="space-y-4">
          <h2 className="text-base font-black text-white uppercase tracking-tight">Tournaments & International Tours</h2>
          {seriesList.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-[#0A1424]/80 p-8 text-center backdrop-blur-md">
              <span className="text-4xl">🏏</span>
              <h3 className="mt-3 text-base font-bold text-white">No Series Found</h3>
              <button
                onClick={fetchCricketData}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all shadow-md"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seriesList
                .filter(
                  (s) =>
                    !searchQuery ||
                    (s.league_name &&
                      s.league_name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((series) => (
                  <Link
                    key={series.league_key}
                    href={`/cricket/series/${series.league_key}`}
                    className="group rounded-2xl border border-blue-500/15 bg-[#0B172B]/80 p-5 hover:border-amber-400/40 hover:bg-[#0E203C] transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-400 text-lg">🏏</span>
                        <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                          Tournament
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {series.league_name}
                      </h3>
                      {series.country_name && (
                        <p className="text-xs text-slate-400 mt-1">{series.country_name}</p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span>View Fixtures & Standings</span>
                      <span className="text-amber-400 font-bold">&rarr;</span>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      ) : activeTab === 'teams' ? (
        /* Teams & Players Directory */
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight mb-3">Trending Cricketers & Profiles</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {playersList
                .filter(
                  (p) =>
                    !searchQuery ||
                    (p.player_name &&
                      p.player_name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((player) => (
                  <Link
                    key={player.player_key}
                    href={`/cricket/players/${player.player_key}`}
                    className="group rounded-2xl border border-blue-500/15 bg-[#0B172B]/80 p-4 hover:border-amber-400/40 hover:bg-[#0E203C] transition-all flex items-center space-x-3.5 shadow-lg"
                  >
                    <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {player.player_image ? (
                        <img
                          src={player.player_image}
                          alt={player.player_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-base font-black text-amber-400">
                          {player.player_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {player.player_name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {player.player_role || player.player_type || 'Cricket Star'}
                      </p>
                      <p className="text-[10px] text-amber-300 font-medium truncate mt-0.5">
                        {player.player_country || player.team_name}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight mb-3">Cricket Teams & Clubs</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teamsList
                .filter(
                  (t) =>
                    !searchQuery ||
                    (t.team_name && t.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((team) => (
                  <Link
                    key={team.team_key}
                    href={`/cricket/teams/${team.team_key}`}
                    className="group rounded-2xl border border-blue-500/15 bg-[#0B172B]/80 p-4 hover:border-amber-400/40 hover:bg-[#0E203C] transition-all flex items-center space-x-3.5 shadow-lg"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 p-1 flex items-center justify-center shrink-0">
                      {team.team_logo ? (
                        <img
                          src={team.team_logo}
                          alt={team.team_name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm font-black text-amber-400">
                          {team.team_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {team.team_name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        View Squad & Match Schedule &rarr;
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      ) : leagueGroups.length === 0 ? (
        /* Empty State */
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-[#0A1424]/80 p-8 text-center backdrop-blur-md">
          <span className="text-4xl">🏏</span>
          <h3 className="mt-3 text-base font-bold text-white">
            {activeTab === 'live' ? 'No Live Cricket Matches In-Play' : 'No Matches Found'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {activeTab === 'live'
              ? 'Check upcoming fixtures or pick another date from the calendar.'
              : 'Try selecting a different format filter or clearing search query.'}
          </p>
          <button
            onClick={fetchCricketData}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all shadow-md"
          >
            Refresh Feed
          </button>
        </div>
      ) : (
        /* Grouped Matches List */
        <div className="space-y-6">
          {leagueGroups.map((group) => (
            <div
              key={group.title}
              className="space-y-3 rounded-2xl border border-blue-500/20 bg-[#0A1424]/80 p-4 shadow-xl backdrop-blur-md"
            >
              {/* League Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400">🏏</span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-white">
                    {group.title}
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {group.matches.length} {group.matches.length === 1 ? 'Match' : 'Matches'}
                </span>
              </div>

              {/* Match Cards Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {group.matches.map((match) => (
                  <CricketMatchCard key={match.event_key} match={match} hideLeague />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
