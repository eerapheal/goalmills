'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FootballMatchCard, UnifiedWebMatchEvent } from './FootballMatchCard';
import {
  webApiFootballService,
  ApiFootballFixtureItem,
} from '../services/apiFootball';
import { GoalmillsLoader } from './GoalmillsLoader';
import { FiRefreshCw, FiSearch, FiCalendar, FiAward, FiActivity, FiZap } from 'react-icons/fi';

type FootballTab = 'live' | 'upcoming' | 'results' | 'standings';

export interface UnifiedWebStandingItem {
  rank: number | string;
  team_name: string;
  team_logo?: string;
  team_id?: number | string;
  played: number | string;
  win: number | string;
  draw: number | string;
  lose: number | string;
  goalsDiff: number | string;
  points: number | string;
}

export function FootballScreen() {
  const [activeTab, setActiveTab] = useState<FootballTab>('live');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fixtures, setFixtures] = useState<UnifiedWebMatchEvent[]>([]);
  const [standings, setStandings] = useState<UnifiedWebStandingItem[]>([]);

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

  const adaptFixture = (item: ApiFootballFixtureItem): UnifiedWebMatchEvent | null => {
    if (!item) return null;

    // Format 1: API-Sports / API-Football (item.fixture, item.teams)
    if (item.fixture) {
      const shortStatus = item.fixture.status?.short || '';
      const isLiveShort = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(shortStatus);
      const scoreStr =
        item.goals &&
        item.goals.home !== null &&
        item.goals.home !== undefined &&
        item.goals.away !== null &&
        item.goals.away !== undefined
          ? `${item.goals.home} - ${item.goals.away}`
          : undefined;

      const dateStr = item.fixture.date || '';

      return {
        event_key: item.fixture.id || String(Math.random()),
        event_date: dateStr.includes('T') ? dateStr.split('T')[0] : dateStr,
        event_time: dateStr.includes('T') ? dateStr.split('T')[1]?.slice(0, 5) || '' : '',
        event_status: shortStatus,
        event_live: isLiveShort ? '1' : '0',
        event_home_team: item.teams?.home?.name || 'Home',
        home_team_key: item.teams?.home?.id || '',
        home_team_logo: item.teams?.home?.logo,
        event_away_team: item.teams?.away?.name || 'Away',
        away_team_key: item.teams?.away?.id || '',
        away_team_logo: item.teams?.away?.logo,
        event_final_result: scoreStr,
        event_ft_result: scoreStr,
        league_name: item.league?.name || '',
        league_key: item.league?.id || '',
        league_logo: item.league?.logo,
        country_name: item.league?.country,
      };
    }

    // Format 2: AllSportsAPI (item.event_key, item.event_home_team)
    if (item.event_key || item.event_home_team) {
      return {
        event_key: item.event_key,
        event_date: item.event_date || '',
        event_time: item.event_time || '',
        event_status: item.event_status || '',
        event_live: item.event_live || '0',
        event_home_team: item.event_home_team || 'Home',
        home_team_key: item.home_team_key || '',
        home_team_logo: item.home_team_logo,
        event_away_team: item.event_away_team || 'Away',
        away_team_key: item.away_team_key || '',
        away_team_logo: item.away_team_logo,
        event_final_result: item.event_final_result || item.event_ft_result,
        event_ft_result: item.event_ft_result,
        league_name: item.league_name || '',
        league_key: item.league_key || '',
        league_logo: item.league_logo,
        country_name: item.country_name,
      };
    }

    return null;
  };

  const adaptStanding = (item: any): UnifiedWebStandingItem | null => {
    if (!item) return null;

    if (item.team && typeof item.team === 'object') {
      return {
        rank: item.rank || 1,
        team_name: item.team?.name || 'Team',
        team_logo: item.team?.logo || '',
        team_id: item.team?.id,
        played: item.all?.played ?? item.played ?? 0,
        win: item.all?.win ?? item.win ?? 0,
        draw: item.all?.draw ?? item.draw ?? 0,
        lose: item.all?.lose ?? item.lose ?? 0,
        goalsDiff: item.goalsDiff ?? 0,
        points: item.points ?? 0,
      };
    }

    if (item.standing_team || item.standing_place !== undefined) {
      return {
        rank: item.standing_place || item.standing_position || 1,
        team_name: item.standing_team || 'Team',
        team_logo: item.team_logo || item.team_badge || '',
        team_id: item.team_key || item.standing_team_id,
        played: item.standing_P ?? item.standing_played ?? 0,
        win: item.standing_W ?? item.standing_won ?? 0,
        draw: item.standing_D ?? item.standing_draw ?? 0,
        lose: item.standing_L ?? item.standing_lost ?? 0,
        goalsDiff: item.standing_GD ?? item.standing_gd ?? 0,
        points: item.standing_PTS ?? item.standing_pts ?? item.standing_points ?? 0,
      };
    }

    return null;
  };

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'standings') {
        const res = await webApiFootballService.getStandings({
          league: 39,
          season: new Date().getFullYear(),
        });

        let rawList: any[] = [];
        if (Array.isArray(res)) {
          if (res.length > 0 && res[0]?.league?.standings) {
            rawList = res[0].league.standings.flat();
          } else {
            rawList = res;
          }
        } else if (res && typeof res === 'object') {
          if (Array.isArray((res as any).total)) {
            rawList = (res as any).total;
          } else if (Array.isArray((res as any).result?.total)) {
            rawList = (res as any).result.total;
          } else if (Array.isArray((res as any).result)) {
            rawList = (res as any).result;
          }
        }

        const adapted = rawList
          .map(adaptStanding)
          .filter((s): s is UnifiedWebStandingItem => s !== null);

        setStandings(adapted);
      } else {
        let raw: ApiFootballFixtureItem[] = [];
        if (activeTab === 'live') {
          raw = await webApiFootballService.getLiveFixtures();
        } else {
          raw = await webApiFootballService.getFixturesByDate(selectedDate);
        }
        if (raw && Array.isArray(raw) && raw.length > 0) {
          const adapted = raw
            .map(adaptFixture)
            .filter((f): f is UnifiedWebMatchEvent => f !== null);
          setFixtures(adapted);
        } else {
          setFixtures([]);
        }
      }
    } catch (err) {
      console.error('[Web FootballScreen] Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate]);

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
        (f) => f && (f.event_status === 'Not Started' || f.event_status === 'NS' || f.event_status === 'TBA' || (f.event_live !== '1' && f.event_live !== 1 && f.event_status !== 'FT' && f.event_status !== 'Finished' && !f.event_final_result))
      );
    } else if (activeTab === 'results') {
      list = list.filter((f) => f && (f.event_status === 'FT' || f.event_status === 'Finished' || f.event_status === 'AET' || f.event_status === 'AP' || Boolean(f.event_final_result && f.event_final_result !== '-')));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.event_home_team.toLowerCase().includes(q) ||
          f.event_away_team.toLowerCase().includes(q) ||
          (f.league_name && f.league_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [fixtures, activeTab, searchQuery]);

  // Group by league
  const leagueGroups = useMemo(() => {
    const groups: {
      [key: string]: { title: string; logo?: string; matches: UnifiedWebMatchEvent[] };
    } = {};

    filteredFixtures.forEach((item) => {
      const leagueTitle = item.league_name || 'Other Matches';
      if (!groups[leagueTitle]) {
        groups[leagueTitle] = {
          title: leagueTitle,
          logo: item.league_logo,
          matches: [],
        };
      }
      groups[leagueTitle].matches.push(item);
    });

    return Object.values(groups);
  }, [filteredFixtures]);

  const tabs: { id: FootballTab; label: string; icon: string; badge?: string }[] = [
    { id: 'live', label: 'Live Matches', icon: '⚡', badge: 'Live' },
    { id: 'upcoming', label: 'Fixtures', icon: '📅' },
    { id: 'results', label: 'Results', icon: '✅' },
    { id: 'standings', label: 'Standings', icon: '🏆' },
  ];

  return (
    <div className="w-full space-y-3.5">
      {/* Smart Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#0B172B]/90 border border-blue-500/20 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <FiActivity className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <span>Football LiveScore</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-mono font-bold">
                Smart Engine
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Live match events, real-time scorelines, and league tables
            </p>
          </div>
        </div>

        {/* Search & Refresh Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-blue-500/20 bg-[#070E1A] px-2.5 py-1 pl-7 text-[11px] text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all shadow-inner h-7"
            />
            <FiSearch className="absolute left-2.5 top-2 text-[10px] text-slate-400" />
          </div>

          <button
            onClick={fetchMatches}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-[11px] hover:from-blue-400 hover:to-indigo-500 transition-all shadow-sm active:scale-95 disabled:opacity-50 h-7"
            title="Refresh on demand"
          >
            <FiRefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Module Tabs */}
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
              {tab.badge && (
                <span
                  className={`text-[8px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-blue-400 text-slate-950 font-black'
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

      {/* 7-Day Date Slider (Hidden in Standings & Live modes) */}
      {activeTab !== 'standings' && activeTab !== 'live' && (
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

      {/* Content Feed */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-[#0A1424]/60 border border-blue-500/20">
          <GoalmillsLoader size="lg" label="GoalMills Football" sublabel="Syncing live match telemetry..." />
        </div>
      ) : activeTab === 'standings' ? (
        <div className="rounded-2xl border border-blue-500/20 bg-[#0A1424]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2 uppercase">
                <FiAward className="text-amber-400" />
                <span>Premier League Table & Form</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official standings, goal differentials, and European qualification spots
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
                  <th className="py-3 px-3">Club</th>
                  <th className="py-3 px-2 text-center">PL</th>
                  <th className="py-3 px-2 text-center">W</th>
                  <th className="py-3 px-2 text-center">D</th>
                  <th className="py-3 px-2 text-center">L</th>
                  <th className="py-3 px-2 text-center font-semibold">GD</th>
                  <th className="py-3 px-3 text-right font-black text-amber-400">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      No standings telemetry available at this time.
                    </td>
                  </tr>
                ) : (
                  standings.map((row, index) => {
                    const rankNum = Number(row.rank);
                    const isUCL = rankNum <= 4;
                    const isUEL = rankNum === 5 || rankNum === 6;
                    const isRelegation = rankNum >= 18;

                    return (
                      <tr
                        key={row.team_id || index}
                        className="hover:bg-blue-600/10 transition-colors group"
                      >
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
                            {row.rank}
                          </span>
                        </td>
                        <td className="flex items-center space-x-2.5 py-2.5 px-3 font-bold text-white group-hover:text-blue-300 transition-colors">
                          {row.team_logo ? (
                            <img
                              src={row.team_logo}
                              alt={row.team_name}
                              className="h-5 w-5 object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xs text-blue-400">⚽</span>
                          )}
                          <span className="truncate">{row.team_name}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{row.played}</td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{row.win}</td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{row.draw}</td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{row.lose}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-200">
                          {row.goalsDiff}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-amber-400 text-sm">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : leagueGroups.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-[#0A1424]/80 p-8 text-center backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-3 shadow-inner">
            ⚽
          </div>
          <h3 className="text-base font-black text-white">
            {activeTab === 'live' ? 'No Live Matches In-Play' : 'No Fixtures Found'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {activeTab === 'live'
              ? 'Check upcoming games in the Fixtures tab or pick another date from the calendar.'
              : 'Try selecting a different date or clearing your search filter.'}
          </p>
          <button
            onClick={fetchMatches}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all shadow-md"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Reload Match Feed</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {leagueGroups.map((group) => (
            <div
              key={group.title}
              className="space-y-3 rounded-2xl border border-blue-500/20 bg-[#0A1424]/80 p-4 shadow-xl backdrop-blur-md"
            >
              {/* League Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  {group.logo ? (
                    <img src={group.logo} alt={group.title} className="h-5 w-5 object-contain" />
                  ) : (
                    <span className="text-amber-400 text-sm">🏆</span>
                  )}
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {group.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {group.matches.length} {group.matches.length === 1 ? 'Match' : 'Matches'}
                </span>
              </div>

              {/* Match Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.matches.map((match) => (
                  <FootballMatchCard key={match.event_key} event={match} hideLeague={true} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
