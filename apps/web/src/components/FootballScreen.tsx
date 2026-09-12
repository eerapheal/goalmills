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
  { id: 'all', name: 'All Competitions', country: 'Global', flag: '🌐' },
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
  const [refreshing, setRefreshing] = useState(false);
  const [competitions, setCompetitions] = useState(MAJOR_LEAGUES);

  const [fixtures, setFixtures] = useState<UnifiedWebMatchEvent[]>([]);
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
  const [probabilities, setProbabilities] = useState<FootballProbability[]>([]);
  const [standingView, setStandingView] = useState<'total' | 'home' | 'away'>('total');

  // Dynamically load active leagues if available
  useEffect(() => {
    advancedFootballApi
      .getLeagues()
      .then((res) => {
        if (Array.isArray(res?.result)) {
          const activeLeagues = res.result;
          const priorityKeywords = ['Premier', 'Champions', 'Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'AFCON', 'Cup'];
          const matched = activeLeagues
            .filter((l: any) => priorityKeywords.some((k) => (l.league_name || '').toLowerCase().includes(k.toLowerCase())))
            .slice(0, 10)
            .map((l: any) => ({
              id: String(l.league_key),
              name: l.league_name,
              country: l.country_name || 'Football',
              flag: '⚽',
              logo: l.league_logo,
            }));

          const existingIds = new Set(MAJOR_LEAGUES.map((c) => c.id));
          const additions = matched.filter((m: any) => !existingIds.has(m.id));
          if (additions.length > 0) {
            setCompetitions([...MAJOR_LEAGUES, ...additions]);
          }
        }
      })
      .catch(() => {});
  }, []);

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

  const fetchMatches = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
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
      if (!isBackground) setLoading(false);
    }
  }, [activeTab, selectedLeague, selectedDate, standingView]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Polling interval for live matches (every 15s)
  useEffect(() => {
    if (activeTab !== 'live') return;
    const interval = setInterval(() => {
      fetchMatches(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeTab, fetchMatches]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchMatches(false);
    setRefreshing(false);
  };

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
      const matchLeague = competitions.find((c) => c.id === selectedLeague);
      list = list.filter((f) => {
        if (f.league_key && String(f.league_key) === selectedLeague) return true;
        if (matchLeague) {
          const lName = (f.league_name || '').toLowerCase();
          return lName.includes(matchLeague.name.toLowerCase());
        }
        return false;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          (f.event_home_team || '').toLowerCase().includes(q) ||
          (f.event_away_team || '').toLowerCase().includes(q) ||
          (f.league_name || '').toLowerCase().includes(q) ||
          ((f as any).event_stadium || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [fixtures, activeTab, searchQuery, selectedLeague, competitions]);

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

  const tabs = [
    { id: 'live', label: 'Live', icon: FiActivity, color: 'text-red-500' },
    { id: 'upcoming', label: 'Upcoming', icon: FiCalendar, color: 'text-sky-400' },
    { id: 'results', label: 'Results', icon: FiAward, color: 'text-yellow-400' },
    { id: 'standings', label: 'Table', icon: FiTrendingUp, color: 'text-blue-400' },
    { id: 'topscorers', label: 'Top Scorers', icon: FiShield, color: 'text-yellow-400' },
    { id: 'predictions', label: 'ODDS', icon: FiZap, color: 'text-red-400' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Controls Header */}
      <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#060D18]/90 border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FootballTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={isActive ? 'text-white' : tab.color} />
                  <span>{tab.label}</span>
                  {tab.id === 'live' && fixtures.length > 0 && activeTab === 'live' && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold animate-pulse">
                      {fixtures.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Live Scores"
            >
              <FiRefreshCw className={`text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>
          </div>
        </div>

        {/* Date Strip Navigator (for Upcoming, Results, Predictions) */}
        {(activeTab === 'upcoming' || activeTab === 'results' || activeTab === 'predictions') && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
            {dateStrip.map((item) => {
              const isSelected = selectedDate === item.iso;
              return (
                <button
                  key={item.iso}
                  onClick={() => setSelectedDate(item.iso)}
                  className={`flex flex-col items-center min-w-[70px] py-2 px-2.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-md shadow-blue-500/20'
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 flex-shrink-0">
            <FiSliders className="text-blue-400" /> Filter:
          </span>
          {competitions.map((league) => {
            const isSelected = selectedLeague === league.id;
            return (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
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
            placeholder="Search teams, tournament, stadium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#060D18]/90 border border-white/10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-colors"
          />
        </div>
      </div>

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
                      <th className="py-3 px-2 text-center text-blue-400">W</th>
                      <th className="py-3 px-2 text-center text-slate-400">D</th>
                      <th className="py-3 px-2 text-center text-red-400">L</th>
                      <th className="py-3 px-2 text-center">GD</th>
                      <th className="py-3 px-3 text-right font-black text-yellow-400">PTS</th>
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
                                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                      : isRelegation
                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
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
                            <td className="py-2.5 px-2 text-center text-blue-400 font-bold">{row.standing_W}</td>
                            <td className="py-2.5 px-2 text-center text-slate-400">{row.standing_D}</td>
                            <td className="py-2.5 px-2 text-center text-red-400">{row.standing_L}</td>
                            <td className="py-2.5 px-2 text-center">{row.standing_GD}</td>
                            <td className="py-2.5 px-3 text-right font-black text-yellow-400">
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
                <FiAward className="text-yellow-400" />
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
                        <span className="w-6 text-center font-mono font-black text-yellow-400 text-sm">
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
                          <h4 className="text-xs font-bold text-white group-hover:text-yellow-300 transition-colors">
                            {s.player_name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{s.team_name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-yellow-400 font-mono">
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
                <FiTrendingUp className="text-yellow-400" />
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
                        <span className="text-yellow-400 font-bold">{prob.event_time}</span>
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
                          <span className="text-yellow-400">Draw {prob.event_D}%</span>
                          <span className="text-red-400">{prob.event_AW}%</span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div style={{ width: `${prob.event_HW}%` }} className="bg-blue-500" />
                          <div style={{ width: `${prob.event_D}%` }} className="bg-yellow-500" />
                          <div style={{ width: `${prob.event_AW}%` }} className="bg-red-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 flex justify-between">
                          <span className="text-slate-400">Over 2.5:</span>
                          <span className="font-bold text-yellow-400">{prob.event_O}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 flex justify-between">
                          <span className="text-slate-400">Both Score:</span>
                          <span className="font-bold text-red-400">{prob.event_bts}%</span>
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
