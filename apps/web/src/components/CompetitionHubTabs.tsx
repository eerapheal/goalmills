'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { FootballMatchCard, UnifiedWebMatchEvent } from './FootballMatchCard';
import { FootballStandingsTable } from './FootballStandingsTable';
import { FootballTopScorers } from './FootballTopScorers';
import { GoalmillsLoader } from './GoalmillsLoader';
import { footballRoutes, slugify, buildMatchSlug } from '@/lib/slugUtils';
import type {
  FootballStanding,
  FootballTopscorer,
  FootballEvent,
  FootballTeam,
} from '@goalmills/types';

export type CompHubTab = 'live' | 'fixtures' | 'results' | 'table' | 'stats';

interface CompetitionHubTabsProps {
  competitionId: number;
  competitionSlug: string;
  competitionName: string;
  hasGroups?: boolean;
  hasKnockout?: boolean;
}

export function CompetitionHubTabs({
  competitionId,
  competitionSlug,
  competitionName,
  hasGroups = false,
  hasKnockout = false,
}: CompetitionHubTabsProps) {
  const [activeTab, setActiveTab] = useState<CompHubTab>('table');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Data states
  const [fixtures, setFixtures] = useState<FootballEvent[]>([]);
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
  const [teams, setTeams] = useState<FootballTeam[]>([]);
  const [standingView, setStandingView] = useState<'total' | 'home' | 'away'>('total');

  // Date strip
  const dateStrip = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === -1 ? 'Yesterday' : i === 1 ? 'Tomorrow'
        : d.toLocaleDateString('en-US', { weekday: 'short' });
      dates.push({ iso, dayName, dayNumber: d.getDate() });
    }
    return dates;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'table') {
        const res = await advancedFootballApi.getStandings(competitionId);
        if (res?.result) {
          const resObj = res.result as any;
          const table = resObj[standingView] || resObj.total || (Array.isArray(resObj) ? resObj : []);
          setStandings(table);
        }
      } else if (activeTab === 'stats') {
        const res = await advancedFootballApi.getTopscorers(competitionId);
        setTopscorers(res?.result || []);
      } else if (activeTab === 'live') {
        const res = await advancedFootballApi.getLivescore({ leagueId: competitionId });
        setFixtures(res?.result || []);
      } else {
        // fixtures or results
        const res = await advancedFootballApi.getFixtures({
          from: selectedDate,
          to: selectedDate,
          leagueId: competitionId,
        });
        setFixtures(res?.result || []);
      }
    } catch (err) {
      console.error('[CompHubTabs] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, competitionId, selectedDate, standingView]);

  // Fetch teams for the "all teams" list
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await advancedFootballApi.getTeams({ leagueId: competitionId });
        setTeams(res?.result || []);
      } catch {}
    };
    fetchTeams();
  }, [competitionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredFixtures = useMemo(() => {
    let list = fixtures;
    if (activeTab === 'live') {
      list = list.filter(f =>
        String(f.event_live) === '1' ||
        (f.event_status && !['Finished', 'FT', 'Cancelled', 'Postponed', 'Not Started', 'NS'].includes(f.event_status as string))
      );
    } else if (activeTab === 'fixtures') {
      list = list.filter(f =>
        f.event_status === 'Not Started' || f.event_status === 'NS' || f.event_status === 'TBA' ||
        (String(f.event_live) !== '1' && f.event_status !== 'FT' && f.event_status !== 'Finished' && !f.event_final_result)
      );
    } else if (activeTab === 'results') {
      list = list.filter(f =>
        f.event_status === 'FT' || f.event_status === 'Finished' || f.event_status === 'AET' || f.event_status === 'AP' ||
        Boolean(f.event_final_result && f.event_final_result !== '-')
      );
    }
    return list;
  }, [fixtures, activeTab]);

  // Detect group stage standings (if standings have "group_name" field)
  const standingsByGroup = useMemo(() => {
    if (!hasGroups || standings.length === 0) return null;
    const groups: Record<string, FootballStanding[]> = {};
    for (const s of standings) {
      const groupName = (s as any).league_round || (s as any).group_name || '';
      if (groupName) {
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(s);
      }
    }
    return Object.keys(groups).length > 1 ? groups : null;
  }, [standings, hasGroups]);

  const tabs: { id: CompHubTab; label: string; icon: string; badge?: string }[] = [
    { id: 'live', label: 'Live', icon: '⚡', badge: 'In-Play' },
    { id: 'fixtures', label: 'Fixtures', icon: '📅' },
    { id: 'results', label: 'Results', icon: '✅' },
    { id: 'table', label: 'Table', icon: '🏆' },
    { id: 'stats', label: 'Stats', icon: '📊' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/20'
                : 'bg-[#0B1526] text-slate-300 hover:text-white hover:bg-white/5 border-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && activeTab === tab.id && (
              <span className="px-1.5 py-0.5 bg-red-500/30 text-red-300 text-[9px] font-bold rounded-full">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Date Strip (for fixtures/results tabs) */}
      {(activeTab === 'fixtures' || activeTab === 'results') && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {dateStrip.map(d => (
            <button
              key={d.iso}
              onClick={() => setSelectedDate(d.iso)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold transition-all border min-w-[60px] ${
                selectedDate === d.iso
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                  : 'bg-[#0B1526] text-slate-400 hover:text-white border-white/5'
              }`}
            >
              <span className="text-[10px]">{d.dayName}</span>
              <span className="text-sm font-black">{d.dayNumber}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <GoalmillsLoader />
        </div>
      ) : (
        <>
          {/* Live / Fixtures / Results */}
          {(activeTab === 'live' || activeTab === 'fixtures' || activeTab === 'results') && (
            <div className="space-y-3">
              {filteredFixtures.length > 0 ? (
                filteredFixtures.map((match, i) => (
                  <Link
                    key={`${match.event_key}-${i}`}
                    href={footballRoutes.matchFromEvent(match)}
                    className="block"
                  >
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0B1526]/50 border border-white/5 hover:border-blue-500/30 transition-all">
                      {/* Date/Time */}
                      <div className="text-center w-14 shrink-0">
                        {String(match.event_live) === '1' ? (
                          <span className="text-[10px] font-black text-red-400 uppercase animate-pulse">
                            {match.event_status}&apos;
                          </span>
                        ) : (
                          <>
                            <div className="text-[10px] text-slate-500">
                              {new Date(match.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-amber-400 font-bold">{match.event_time}</div>
                          </>
                        )}
                      </div>

                      {/* Teams */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {match.home_team_logo && <img src={match.home_team_logo} className="w-5 h-5 object-contain" alt="" />}
                          <span
                            className="text-xs font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = footballRoutes.teamFromName(match.event_home_team || ''); }}
                          >
                            {match.event_home_team}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {match.away_team_logo && <img src={match.away_team_logo} className="w-5 h-5 object-contain" alt="" />}
                          <span
                            className="text-xs font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = footballRoutes.teamFromName(match.event_away_team || ''); }}
                          >
                            {match.event_away_team}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      {(match.event_final_result || match.event_ft_result) && (
                        <div className="px-3 py-1.5 bg-white/5 rounded-xl font-mono font-bold text-white text-xs shrink-0">
                          {match.event_final_result || match.event_ft_result}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center text-slate-400 py-12 text-sm">
                  {activeTab === 'live' ? 'No live matches right now.' : `No ${activeTab} found for this date.`}
                </div>
              )}
            </div>
          )}

          {/* Table */}
          {activeTab === 'table' && (
            <div className="space-y-6">
              {/* View Selector */}
              <div className="flex items-center gap-2">
                {(['total', 'home', 'away'] as const).map(view => (
                  <button
                    key={view}
                    onClick={() => setStandingView(view)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      standingView === view
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-[#0B1526] text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>

              {standingsByGroup ? (
                // Group Stage Tables
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(standingsByGroup).sort().map(([groupName, groupStandings]) => (
                    <div key={groupName} className="rounded-2xl border border-white/10 bg-[#0B1526]/50 overflow-hidden">
                      <div className="px-4 py-2 bg-blue-600/10 border-b border-white/5">
                        <h4 className="text-xs font-black text-white uppercase">{groupName}</h4>
                      </div>
                      <FootballStandingsTable standings={groupStandings} leagueId={competitionId} compact />
                    </div>
                  ))}
                </div>
              ) : standings.length > 0 ? (
                <FootballStandingsTable standings={standings} leagueId={competitionId} />
              ) : (
                <div className="text-center text-slate-400 py-12 text-sm">No standings data available.</div>
              )}
            </div>
          )}

          {/* Stats (Top Scorers) */}
          {activeTab === 'stats' && (
            <div>
              {topscorers.length > 0 ? (
                <FootballTopScorers scorers={topscorers} />
              ) : (
                <div className="text-center text-slate-400 py-12 text-sm">No top scorer data available.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* All Teams in Competition */}
      {teams.length > 0 && (
        <section className="pt-6 border-t border-white/10">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🏟️</span> All {competitionName} Teams ({teams.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {teams.map(t => (
              <Link
                key={t.team_key}
                href={footballRoutes.teamFromName(t.team_name)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0B1526]/50 border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 p-1 flex items-center justify-center shrink-0">
                  {t.team_logo ? (
                    <img src={t.team_logo} alt={t.team_name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-white">{t.team_name[0]}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                  {t.team_name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
