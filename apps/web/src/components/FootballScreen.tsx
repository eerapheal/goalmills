'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FootballMatchCard, UnifiedWebMatchEvent } from './FootballMatchCard';
import { advancedFootballApi } from '../services/advancedFootballApi';
import {
  FootballStanding,
  FootballTopscorer,
  FootballProbability,
  FootballCountry,
  FootballLeague,
} from '@goalmills/types';
import { GoalmillsLoader } from './GoalmillsLoader';
import { footballRoutes } from '@/lib/slugUtils';
import {
  FiRefreshCw,
  FiSearch,
  FiCalendar,
  FiAward,
  FiActivity,
  FiZap,
  FiTrendingUp,
  FiShield,
  FiChevronRight,
  FiSliders,
} from 'react-icons/fi';
import Link from 'next/link';

export type FootballTab = 'live' | 'upcoming' | 'results' | 'standings' | 'topscorers' | 'predictions';

export const MAJOR_LEAGUES = [
  { id: '152', name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/152_premier-league.png' },
  { id: '3', name: 'Champions League', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/3_uefa_champions_league.png' },
  { id: '302', name: 'La Liga', country: 'Spain', flag: '🇪🇸', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/302_la-liga.png' },
  { id: '207', name: 'Serie A', country: 'Italy', flag: '🇮🇹', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/207_serie-a.png' },
  { id: '175', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/175_bundesliga.png' },
  { id: '168', name: 'Ligue 1', country: 'France', flag: '🇫🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/168_ligue-1.png' },
  { id: '4', name: 'Europa League', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/4_uefa-europa-league.png' },
  { id: '6', name: 'AFCON', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/6_africa-cup-of-nations.png' },
  { id: '28', name: 'FIFA World Cup', country: 'International', flag: '🌐', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/28_fifa-world-cup.png' },
  { id: '1', name: 'UEFA EURO', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/1_european-championship.png' },
  { id: '17', name: 'Copa América', country: 'S. America', flag: '🌎', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/17_copa-america.png' },
  { id: '5', name: 'Nations League', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/5_uefa-nations-league.png' },
  { id: '146', name: 'FA Cup', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/146_fa-cup.png' },
  { id: '19', name: 'CAF CL', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/19_caf-champions-league.png' },
  { id: '13', name: 'Libertadores', country: 'S. America', flag: '🌎', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/13_copa-libertadores.png' },
  { id: '278', name: 'Saudi Pro League', country: 'Saudi Arabia', flag: '🇸🇦', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/278_pro-league.png' },
  { id: '244', name: 'Eredivisie', country: 'Netherlands', flag: '🇳🇱', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/244_eredivisie.png' },
  { id: '266', name: 'Liga Portugal', country: 'Portugal', flag: '🇵🇹', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/266_liga-portugal.png' },
  { id: '322', name: 'Süper Lig', country: 'Turkey', flag: '🇹🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/322_super-lig.png' },
  { id: '99', name: 'Brasileirão', country: 'Brazil', flag: '🇧🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/99_serie-a.png' },
];

export function FootballScreen() {
  const [activeTab, setActiveTab] = useState<FootballTab>('live');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [fixtures, setFixtures] = useState<UnifiedWebMatchEvent[]>([]);
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
  const [probabilities, setProbabilities] = useState<FootballProbability[]>([]);
  const [standingView, setStandingView] = useState<'total' | 'home' | 'away'>('total');

  // 7-day date slider (3 days before, today, 3 days after)
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

  const adaptMatch = (f: any): UnifiedWebMatchEvent => {
    const isLive =
      f.event_live === '1' ||
      f.event_live === 1 ||
      ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(f.event_status || '') ||
      !isNaN(Number(f.event_status));

    return {
      event_key: f.event_key || f.id,
      event_date: f.event_date,
      event_time: f.event_time,
      event_status: f.event_status || (isLive ? 'LIVE' : 'FT'),
      event_live: isLive ? '1' : '0',
      event_home_team: f.event_home_team || f.homeTeam || 'Home',
      home_team_key: f.home_team_key,
      home_team_logo: f.home_team_logo,
      event_away_team: f.event_away_team || f.awayTeam || 'Away',
      away_team_key: f.away_team_key,
      away_team_logo: f.away_team_logo,
      event_final_result: f.event_final_result || f.event_ft_result,
      event_ft_result: f.event_ft_result,
      league_name: f.league_name || 'League',
      league_key: f.league_key,
      league_logo: f.league_logo,
      country_name: f.country_name,
    };
  };

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const targetLeague = selectedLeague === 'all' ? '152' : selectedLeague;

      if (activeTab === 'standings') {
        const res = await advancedFootballApi.getStandings(targetLeague);
        if (res?.result) {
          const resObj = res.result as any;
          const table = resObj[standingView] || resObj.total || (Array.isArray(resObj) ? resObj : []);
          setStandings(Array.isArray(table) ? table : []);
        } else {
          setStandings([]);
        }
      } else if (activeTab === 'topscorers') {
        const res = await advancedFootballApi.getTopscorers(targetLeague);
        setTopscorers(res?.result || []);
      } else if (activeTab === 'predictions') {
        const res = await advancedFootballApi.getProbabilities({
          from: selectedDate,
          to: selectedDate,
          leagueId: targetLeague,
        });
        setProbabilities(res?.result || []);
      } else if (activeTab === 'live') {
        const res = await advancedFootballApi.getLivescore();
        const raw = res?.result || [];
        setFixtures(raw.map(adaptMatch));
      } else {
        // 'upcoming' or 'results'
        const res = await advancedFootballApi.getFixtures({
          from: selectedDate,
          to: selectedDate,
          leagueId: selectedLeague !== 'all' ? selectedLeague : undefined,
        });
        const raw = res?.result || [];
        setFixtures(raw.map(adaptMatch));
      }
    } catch (err) {
      console.error('[Web FootballScreen] Error loading football telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedLeague, selectedDate, standingView]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const filteredFixtures = useMemo(() => {
    let list = fixtures;

    if (activeTab === 'live') {
      list = list.filter(
        (f) =>
          f &&
          (f.event_live === '1' ||
            f.event_live === 1 ||
            (Boolean(f.event_status) &&
              !['Finished', 'FT', 'Cancelled', 'Postponed', 'Not Started', 'NS'].includes(
                f.event_status as string
              )))
      );
    } else if (activeTab === 'upcoming') {
      list = list.filter(
        (f) =>
          f &&
          (f.event_status === 'Not Started' ||
            f.event_status === 'NS' ||
            f.event_status === 'TBA' ||
            (f.event_live !== '1' &&
              f.event_live !== 1 &&
              f.event_status !== 'FT' &&
              f.event_status !== 'Finished' &&
              !f.event_final_result))
      );
    } else if (activeTab === 'results') {
      list = list.filter(
        (f) =>
          f &&
          (f.event_status === 'FT' ||
            f.event_status === 'Finished' ||
            f.event_status === 'AET' ||
            f.event_status === 'AP' ||
            Boolean(f.event_final_result && f.event_final_result !== '-'))
      );
    }

    if (selectedLeague !== 'all') {
      list = list.filter((f) => String(f.league_key) === String(selectedLeague));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.event_home_team?.toLowerCase().includes(q) ||
          f.event_away_team?.toLowerCase().includes(q) ||
          (f.league_name && f.league_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [fixtures, activeTab, searchQuery, selectedLeague]);

  // Group fixtures by competition
  const leagueGroups = useMemo(() => {
    const groups: {
      [key: string]: { title: string; logo?: string; league_key?: string | number; matches: UnifiedWebMatchEvent[] };
    } = {};

    filteredFixtures.forEach((item) => {
      const leagueTitle = item.league_name || 'Other Matches';
      if (!groups[leagueTitle]) {
        groups[leagueTitle] = {
          title: leagueTitle,
          logo: item.league_logo,
          league_key: item.league_key,
          matches: [],
        };
      }
      groups[leagueTitle].matches.push(item);
    });

    const MAJOR_LEAGUE_IDS = ['152', '3', '302', '207', '175', '168'];

    return Object.values(groups).sort((a, b) => {
      const aKeyStr = String(a.league_key || '');
      const bKeyStr = String(b.league_key || '');

      const aIdx = MAJOR_LEAGUE_IDS.indexOf(aKeyStr);
      const bIdx = MAJOR_LEAGUE_IDS.indexOf(bKeyStr);

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [filteredFixtures]);

  const tabs: { id: FootballTab; label: string; icon: string; badge?: string }[] = [
    { id: 'live', label: 'Live Matches', icon: '⚡', badge: 'In-Play' },
    { id: 'upcoming', label: 'Fixtures', icon: '📅' },
    { id: 'results', label: 'Results', icon: '✅' },
    { id: 'standings', label: 'Tables', icon: '🏆' },
    { id: 'topscorers', label: 'Top Scorers', icon: '👟' },
    { id: 'predictions', label: 'AI Odds & Form', icon: '🤖' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Smart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#0B172B]/90 border border-blue-500/20 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <FiActivity className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>Football Telemetry</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Live match events, multi-bookmaker odds, AI predictions, and tables
            </p>
          </div>
        </div>

        {/* Search & Refresh Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Search team or competition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-blue-500/20 bg-[#070E1A] px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all shadow-inner h-8"
            />
            <FiSearch className="absolute left-2.5 top-2.5 text-xs text-slate-400" />
          </div>

          <button
            onClick={fetchMatches}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs hover:from-blue-400 hover:to-indigo-500 transition-all shadow-md active:scale-95 disabled:opacity-50 h-8"
            title="Refresh on demand"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Major Competition Quick Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedLeague('all')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            selectedLeague === 'all'
              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 scale-[1.02]'
              : 'bg-[#0B1526] text-slate-300 hover:text-white hover:bg-white/5 border-white/5'
          }`}
        >
          <span>🌍</span>
          <span>All Leagues</span>
        </button>
        {MAJOR_LEAGUES.map((leg) => {
          const isSelected = selectedLeague === leg.id;
          return (
            <button
              key={leg.id}
              onClick={() => setSelectedLeague(leg.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 scale-[1.02]'
                  : 'bg-[#0B1526] text-slate-300 hover:text-white hover:bg-white/5 border-white/5'
              }`}
            >
              <span>{leg.flag}</span>
              <span>{leg.name}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Module Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 border-b border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-150 flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-[#0B172B]/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 7-Day Date Slider (Upcoming & Results & Predictions) */}
      {(activeTab === 'upcoming' || activeTab === 'results' || activeTab === 'predictions') && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {dateStrip.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`flex min-w-[62px] sm:min-w-[70px] flex-col items-center rounded-xl p-2 transition-all duration-150 border ${
                  isSelected
                    ? 'border-blue-400 bg-blue-600/30 text-blue-200 shadow-md scale-[1.02]'
                    : 'border-white/5 bg-[#0B172B]/80 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="text-[9px] font-bold uppercase">{item.dayName}</span>
                <span className="text-xs sm:text-sm font-black font-mono">{item.dayNumber}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-[#0A1424]/60 border border-blue-500/20">
          <GoalmillsLoader size="lg" label="GoalMills Football" sublabel="Syncing live match telemetry..." />
        </div>
      ) : (
        <>
          {/* TAB: STANDINGS */}
          {activeTab === 'standings' && (
            <div className="rounded-2xl border border-blue-500/20 bg-[#0A1424]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2 uppercase">
                    <FiAward className="text-amber-400" />
                    <span>Official League Table & Standings</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Updated standings, goal differentials, and points
                  </p>
                </div>

                {/* Total / Home / Away Split Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-white/10">
                  {(['total', 'home', 'away'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setStandingView(view)}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all ${
                        standingView === view
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300 font-mono">
                  <thead className="border-b border-white/10 text-[11px] uppercase font-black tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3 px-2 text-center w-8">#</th>
                      <th className="py-3 px-3 font-sans">Club</th>
                      <th className="py-3 px-2 text-center">PL</th>
                      <th className="py-3 px-2 text-center text-emerald-400">W</th>
                      <th className="py-3 px-2 text-center text-slate-400">D</th>
                      <th className="py-3 px-2 text-center text-rose-400">L</th>
                      <th className="py-3 px-2 text-center">GD</th>
                      <th className="py-3 px-3 text-right font-black text-amber-400">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {standings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 text-xs font-sans">
                          No standings telemetry available for this competition.
                        </td>
                      </tr>
                    ) : (
                      standings.map((row, index) => {
                        const rankNum = Number(row.standing_place);
                        const isUCL = rankNum <= 4;
                        const isUEL = rankNum === 5 || rankNum === 6;
                        const isRelegation = rankNum >= 18;

                        return (
                          <tr key={index} className="hover:bg-blue-600/10 transition-colors">
                            <td className="py-2.5 px-2 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                                  isUCL
                                    ? 'bg-blue-600/30 text-blue-300 border border-blue-400/40'
                                    : isUEL
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : isRelegation
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : 'text-slate-400'
                                }`}
                              >
                                {row.standing_place}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-white font-sans">
                              <Link
                                href={row.team_key ? `/teams/${row.team_key}` : '#'}
                                className="hover:text-blue-300 transition-colors"
                              >
                                {row.standing_team}
                              </Link>
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-300">{row.standing_P}</td>
                            <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">{row.standing_W}</td>
                            <td className="py-2.5 px-2 text-center text-slate-400">{row.standing_D}</td>
                            <td className="py-2.5 px-2 text-center text-rose-400">{row.standing_L}</td>
                            <td className="py-2.5 px-2 text-center">{row.standing_GD}</td>
                            <td className="py-2.5 px-3 text-right font-black text-amber-400">
                              {row.standing_PTS}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TOP SCORERS */}
          {activeTab === 'topscorers' && (
            <div className="rounded-2xl border border-blue-500/20 bg-[#0A1424]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 uppercase border-b border-white/10 pb-3">
                <FiAward className="text-amber-400" />
                <span>Golden Boot & Top Goal Scorers</span>
              </h3>

              {topscorers.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-10">
                  No top scorer stats available for this competition.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topscorers.map((s, idx) => (
                    <Link
                      key={idx}
                      href={s.player_key ? `/players/${s.player_key}` : '#'}
                      className="p-4 rounded-2xl bg-[#0B1526] border border-white/10 hover:border-blue-400/40 transition-all flex items-center justify-between shadow-md group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-mono font-black text-amber-400 text-sm">
                          #{s.player_place || idx + 1}
                        </span>
                        <div className="h-11 w-11 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center p-1">
                          {s.player_image ? (
                            <img src={s.player_image} alt={s.player_name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            {s.player_name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{s.team_name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400 font-mono">
                          {s.goals} ⚽
                        </span>
                        {s.penalty_goals && s.penalty_goals !== '0' && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            ({s.penalty_goals} pens)
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: AI PREDICTIONS & ODDS */}
          {activeTab === 'predictions' && (
            <div className="rounded-2xl border border-blue-500/20 bg-[#0A1424]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 uppercase border-b border-white/10 pb-3">
                <FiTrendingUp className="text-amber-400" />
                <span>AI Match Predictions & Win Probabilities</span>
              </h3>

              {probabilities.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-10">
                  No probability forecast available for the selected date and competition.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {probabilities.map((prob, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#0B1526] border border-white/10 space-y-3 shadow-md"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">{prob.league_name}</span>
                        <span className="text-amber-400 font-bold">{prob.event_time}</span>
                      </div>

                      <div className="flex justify-between items-center font-bold text-xs text-white">
                        <span>{prob.event_home_team}</span>
                        <span className="text-slate-500">VS</span>
                        <span>{prob.event_away_team}</span>
                      </div>

                      {/* Probabilities Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono font-bold text-slate-300">
                          <span className="text-blue-400">{prob.event_HW}%</span>
                          <span className="text-slate-400">Draw {prob.event_D}%</span>
                          <span className="text-amber-400">{prob.event_AW}%</span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div style={{ width: `${prob.event_HW}%` }} className="bg-blue-500" />
                          <div style={{ width: `${prob.event_D}%` }} className="bg-slate-500" />
                          <div style={{ width: `${prob.event_AW}%` }} className="bg-amber-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 flex justify-between">
                          <span className="text-slate-400">Over 2.5:</span>
                          <span className="font-bold text-emerald-400">{prob.event_O}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 flex justify-between">
                          <span className="text-slate-400">Both Score:</span>
                          <span className="font-bold text-amber-400">{prob.event_bts}%</span>
                        </div>
                      </div>

                      <Link
                        href={footballRoutes.matchFromEvent(prob)}
                        className="block text-center py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 transition-all mt-2"
                      >
                        View Match Center & Full Odds →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: FIXTURES / LIVE / RESULTS */}
          {(activeTab === 'live' || activeTab === 'upcoming' || activeTab === 'results') && (
            <div className="space-y-6">
              {leagueGroups.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-12 text-center space-y-2">
                  <div className="text-4xl mb-2">⚽</div>
                  <h4 className="text-sm font-bold text-white">No Fixtures Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {activeTab === 'live'
                      ? 'No live matches in progress at the moment. Check upcoming fixtures.'
                      : 'No matches scheduled for the selected date.'}
                  </p>
                </div>
              ) : (
                leagueGroups.map((group, gIdx) => (
                  <div
                    key={gIdx}
                    className="rounded-2xl border border-blue-500/20 bg-[#0A1424]/90 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        {group.logo ? (
                          <img src={group.logo} alt={group.title} className="h-5 w-5 object-contain" />
                        ) : (
                          <span className="text-base">🏆</span>
                        )}
                        <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                          {group.title}
                        </h3>
                      </div>
                      {group.league_key && (
                        <Link
                          href={`/leagues/${group.league_key}`}
                          className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <span>League Table</span>
                          <FiChevronRight size={12} />
                        </Link>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.matches.map((m, mIdx) => (
                        <FootballMatchCard key={m.event_key || mIdx} event={m} hideLeague />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
