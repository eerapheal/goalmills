'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FootballMatchCard, UnifiedWebMatchEvent } from './FootballMatchCard';
import {
  webApiFootballService,
  ApiFootballFixtureItem,
} from '../services/apiFootball';
import { GoalmillsLoader } from './GoalmillsLoader';

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

    // Format 1: API-Sports / API-Football (item.team, item.all, item.rank)
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

    // Format 2: AllSportsAPI (item.standing_team, item.standing_place, item.team_logo)
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

  // On-demand fetch (NO auto-refresh intervals)
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
      list = list.filter((f) => f.event_live === '1');
    } else if (activeTab === 'upcoming') {
      list = list.filter(
        (f) => f.event_live !== '1' && f.event_status !== 'FT' && f.event_status !== 'Finished'
      );
    } else if (activeTab === 'results') {
      list = list.filter((f) => f.event_status === 'FT' || f.event_status === 'Finished');
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

  const tabs: { id: FootballTab; label: string; icon: string }[] = [
    { id: 'live', label: 'Live Matches', icon: '🔴' },
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
            Football LiveScore
          </h1>
          <p className="text-sm text-slate-400">
            Real-time fixtures, live match events, lineups, and league tables
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
              className="w-full rounded-xl border border-white/10 bg-[#141C2B] px-4 py-2.5 pl-9 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="absolute left-3 top-3 text-xs text-slate-400">🔍</span>
          </div>

          <button
            onClick={fetchMatches}
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
                  ? 'border border-emerald-500/50 bg-[#162234] text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 7-Day Date Slider (Hidden in Standings & Live modes) */}
      {activeTab !== 'standings' && activeTab !== 'live' && (
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {dateStrip.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`flex min-w-[72px] flex-col items-center rounded-2xl p-2.5 transition-all ${
                  isSelected
                    ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-950'
                    : 'border border-white/5 bg-[#141C2B] text-slate-400 hover:bg-[#1E293B] hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-semibold">{item.dayName}</span>
                <span className="text-lg font-black">{item.dayNumber}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content Feed */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <GoalmillsLoader size="lg" label="GoalMills Football" sublabel="Loading football updates..." />
        </div>
      ) : activeTab === 'standings' ? (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-bold text-white">League Table Standings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-4">Club</th>
                  <th className="py-3 px-3 text-center">PL</th>
                  <th className="py-3 px-3 text-center">W</th>
                  <th className="py-3 px-3 text-center">D</th>
                  <th className="py-3 px-3 text-center">L</th>
                  <th className="py-3 px-3 text-center">GD</th>
                  <th className="py-3 px-4 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No standings data available at this time.
                    </td>
                  </tr>
                ) : (
                  standings.map((row, index) => (
                    <tr key={row.team_id || index} className="hover:bg-white/5">
                      <td className="py-3 px-2 font-bold text-slate-400">{row.rank}</td>
                      <td className="flex items-center space-x-3 py-3 px-4 font-bold text-white">
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
                          <span className="text-xs">⚽</span>
                        )}
                        <span>{row.team_name}</span>
                      </td>
                      <td className="py-3 px-3 text-center">{row.played}</td>
                      <td className="py-3 px-3 text-center">{row.win}</td>
                      <td className="py-3 px-3 text-center">{row.draw}</td>
                      <td className="py-3 px-3 text-center">{row.lose}</td>
                      <td className="py-3 px-3 text-center font-medium">{row.goalsDiff}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-400">
                        {row.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : leagueGroups.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#141C2B] p-8 text-center">
          <span className="text-4xl">⚽</span>
          <h3 className="mt-3 text-base font-bold text-white">
            {activeTab === 'live' ? 'No Live Matches Ongoing' : 'No Matches Found'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {activeTab === 'live'
              ? 'Check upcoming games or select another date from the calendar.'
              : 'Try searching for a different team or league.'}
          </p>
          <button
            onClick={fetchMatches}
            className="mt-4 rounded-xl border border-white/10 bg-[#1E293B] px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-slate-700"
          >
            Refresh Feed
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {leagueGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              {/* League Header */}
              <div className="flex items-center space-x-2">
                {group.logo ? (
                  <img src={group.logo} alt={group.title} className="h-5 w-5 object-contain" />
                ) : (
                  <span className="text-blue-400">🏆</span>
                )}
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {group.title}
                </span>
              </div>

              {/* Match Cards */}
              <div className="space-y-2">
                {group.matches.map((match) => (
                  <FootballMatchCard key={match.event_key} event={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
