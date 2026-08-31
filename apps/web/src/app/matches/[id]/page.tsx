'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import {
  FootballEvent,
  FootballH2HResponse,
  FootballOdds,
  FootballLiveOdd,
  FootballFullMatchOdds,
  FootballProbability,
  FootballVideo,
  FootballStanding,
  FootballCoach,
  FootballOfficial,
} from '@goalmills/types';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiActivity,
  FiTrendingUp,
  FiPieChart,
  FiVideo,
  FiAward,
  FiLayers,
  FiZap,
  FiShield,
} from 'react-icons/fi';

type DetailTab =
  | 'overview'
  | 'events'
  | 'lineups'
  | 'stats'
  | 'h2h'
  | 'odds'
  | 'probabilities'
  | 'highlights'
  | 'standings';

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = String(params?.id || '');

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [loading, setLoading] = useState(true);

  const [fixture, setFixture] = useState<FootballEvent | null>(null);
  const [h2h, setH2h] = useState<FootballH2HResponse['result'] | null>(null);
  const [odds, setOdds] = useState<FootballOdds[]>([]);
  const [liveOdds, setLiveOdds] = useState<FootballLiveOdd[]>([]);
  const [fullOdds, setFullOdds] = useState<FootballFullMatchOdds | null>(null);
  const [probabilities, setProbabilities] = useState<FootballProbability | null>(null);
  const [videos, setVideos] = useState<FootballVideo[]>([]);
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [coaches, setCoaches] = useState<FootballCoach[]>([]);
  const [officials, setOfficials] = useState<FootballOfficial[]>([]);

  const loadData = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      // 1. Fetch Fixture details
      const fixRes = await advancedFootballApi.getFixtures({
        matchId,
        withPlayerStats: '1',
      });

      const fix = fixRes?.result?.[0] || null;
      setFixture(fix);

      if (fix) {
        const homeKey = fix.home_team_key;
        const awayKey = fix.away_team_key;
        const leagueKey = fix.league_key;

        // 2. Fetch H2H, Odds, Probabilities, Videos, Standings in parallel
        const [h2hRes, oddsRes, liveOddsRes, fullOddsRes, probRes, videoRes, standRes, coachRes, officialRes] =
          await Promise.allSettled([
            homeKey && awayKey
              ? advancedFootballApi.getH2H(homeKey, awayKey)
              : Promise.resolve(null),
            advancedFootballApi.getOdds({ matchId }),
            advancedFootballApi.getLiveOdds({ matchId }),
            advancedFootballApi.getFullOdds({ matchId }),
            advancedFootballApi.getProbabilities({ matchId }),
            advancedFootballApi.getVideos(matchId),
            leagueKey ? advancedFootballApi.getStandings(leagueKey) : Promise.resolve(null),
            advancedFootballApi.getCoaches(),
            advancedFootballApi.getOfficials(),
          ]);

        if (h2hRes.status === 'fulfilled' && h2hRes.value?.result) {
          setH2h(h2hRes.value.result);
        }

        if (oddsRes.status === 'fulfilled' && oddsRes.value?.result) {
          const matchOdds = oddsRes.value.result[matchId] || [];
          setOdds(matchOdds);
        }

        if (liveOddsRes.status === 'fulfilled' && liveOddsRes.value?.result) {
          const matchLiveOdds = liveOddsRes.value.result[matchId] || [];
          setLiveOdds(matchLiveOdds);
        }

        if (fullOddsRes.status === 'fulfilled' && fullOddsRes.value?.result) {
          setFullOdds(fullOddsRes.value.result[matchId] || null);
        }

        if (probRes.status === 'fulfilled' && probRes.value?.result) {
          const prob = probRes.value.result.find((p) => p.event_key === matchId) || probRes.value.result[0] || null;
          setProbabilities(prob);
        }

        if (videoRes.status === 'fulfilled' && videoRes.value?.result) {
          setVideos(videoRes.value.result || []);
        }

        if (standRes.status === 'fulfilled' && standRes.value?.result) {
          const res = standRes.value.result;
          const table = Array.isArray(res) ? res : res.total || [];
          setStandings(table);
        }

        if (coachRes.status === 'fulfilled' && coachRes.value?.result) {
          setCoaches(coachRes.value.result || []);
        }

        if (officialRes.status === 'fulfilled' && officialRes.value?.result) {
          setOfficials(officialRes.value.result || []);
        }
      }
    } catch (err) {
      console.error('[Web Match Details] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refereeLink = useMemo(() => {
    if (!fixture?.event_referee || officials.length === 0) return '#';
    const idx = officials.findIndex(
      (o) => o.name.toLowerCase() === fixture.event_referee?.toLowerCase()
    );
    return `/officials/${idx !== -1 ? idx : 0}`;
  }, [fixture?.event_referee, officials]);

  const getCoachLink = useCallback((coachName: string) => {
    if (!coachName || coaches.length === 0) return '#';
    const idx = coaches.findIndex(
      (c) => c.coache.toLowerCase() === coachName.toLowerCase()
    );
    return `/coaches/${idx !== -1 ? idx : 0}`;
  }, [coaches]);

  const getPlayerLinkByName = useCallback((playerName: string) => {
    if (!playerName || !fixture?.lineups) return '#';
    const allPlayers = [
      ...(fixture.lineups.home_team?.starting_lineups || []),
      ...(fixture.lineups.home_team?.substitutes || []),
      ...(fixture.lineups.away_team?.starting_lineups || []),
      ...(fixture.lineups.away_team?.substitutes || []),
    ];
    const found = allPlayers.find(
      (p) => p.player.toLowerCase() === playerName.toLowerCase()
    );
    return found?.player_key ? `/players/${found.player_key}` : '#';
  }, [fixture]);

  const isLive =
    fixture?.event_live === '1' ||
    ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(fixture?.event_status || '') ||
    !isNaN(Number(fixture?.event_status));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080E18] pt-[100px] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-400">Loading GoalMills Match Center...</p>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="min-h-screen bg-[#080E18] pt-[100px] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl mb-4">
          ⚽
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Match Not Found</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          The requested fixture could not be loaded or is unavailable from the provider.
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
        >
          Return to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080E18] pt-[84px] pb-16 px-3 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl"
          >
            <FiArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
            >
              <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Match</span>
            </button>
          </div>
        </div>

        {/* Hero Score Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B1728] via-[#0E1E38] to-[#070F1E] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Subtle background stadium glow */}
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Competition Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-2">
            <div className="flex items-center gap-2.5">
              {fixture.league_logo ? (
                <img
                  src={fixture.league_logo}
                  alt={fixture.league_name}
                  className="h-6 w-6 object-contain"
                  onError={(e) => ((e.currentTarget as HTMLElement).style.display = 'none')}
                />
              ) : (
                <span className="text-base">🏆</span>
              )}
              <div>
                <span className="text-xs font-bold text-white">{fixture.league_name}</span>
                {fixture.league_round && (
                  <span className="text-[11px] text-slate-400 ml-2 font-mono">
                    • {fixture.league_round}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <FiCalendar size={13} /> {fixture.event_date}
              </span>
              {fixture.event_time && (
                <span className="text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 font-bold">
                  {fixture.event_time}
                </span>
              )}
            </div>
          </div>

          {/* Teams & Scoreboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-2">
            {/* Home Team */}
            <Link
              href={fixture.home_team_key ? `/teams/${fixture.home_team_key}` : '#'}
              className="group flex flex-col md:flex-row items-center gap-4 text-center md:text-left hover:opacity-90 transition-opacity"
            >
              <div className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-2xl bg-slate-900/80 border border-white/10 p-2.5 flex items-center justify-center shadow-lg group-hover:border-blue-400 transition-colors">
                {fixture.home_team_logo ? (
                  <img
                    src={fixture.home_team_logo}
                    alt={fixture.event_home_team}
                    className="h-full w-full object-contain"
                    onError={(e) => ((e.currentTarget as HTMLElement).style.display = 'none')}
                  />
                ) : (
                  <span className="text-3xl">🛡️</span>
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                  {fixture.event_home_team}
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Home Team
                </span>
              </div>
            </Link>

            {/* Score & Status Center */}
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="mb-2">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {fixture.event_status ? `${fixture.event_status}'` : 'LIVE IN PLAY'}
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                    {fixture.event_status || 'NOT STARTED'}
                  </span>
                )}
              </div>

              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono my-1">
                {fixture.event_final_result ||
                  fixture.event_ft_result ||
                  `${fixture.event_halftime_result || '0 - 0'}`}
              </div>

              {fixture.event_halftime_result && (
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  HT: {fixture.event_halftime_result}
                </span>
              )}

              {fixture.event_stadium && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 font-medium truncate max-w-[220px]">
                  <FiMapPin size={11} className="text-amber-400 shrink-0" />
                  <span className="truncate">{fixture.event_stadium}</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <Link
              href={fixture.away_team_key ? `/teams/${fixture.away_team_key}` : '#'}
              className="group flex flex-col md:flex-row-reverse items-center gap-4 text-center md:text-right hover:opacity-90 transition-opacity"
            >
              <div className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-2xl bg-slate-900/80 border border-white/10 p-2.5 flex items-center justify-center shadow-lg group-hover:border-blue-400 transition-colors">
                {fixture.away_team_logo ? (
                  <img
                    src={fixture.away_team_logo}
                    alt={fixture.event_away_team}
                    className="h-full w-full object-contain"
                    onError={(e) => ((e.currentTarget as HTMLElement).style.display = 'none')}
                  />
                ) : (
                  <span className="text-3xl">🛡️</span>
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                  {fixture.event_away_team}
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Away Team
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Dynamic Multi-Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 rounded-2xl bg-[#0B1526] p-1.5 border border-white/10 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: FiActivity },
            { id: 'events', label: 'Timeline', icon: FiZap },
            { id: 'lineups', label: 'Lineups', icon: FiLayers },
            { id: 'stats', label: 'Statistics', icon: FiPieChart },
            { id: 'h2h', label: 'H2H History', icon: FiTrendingUp },
            { id: 'odds', label: 'Odds Hub', icon: FiTrendingUp },
            { id: 'probabilities', label: 'AI Prediction', icon: FiAward },
            { id: 'highlights', label: 'Videos', icon: FiVideo },
            { id: 'standings', label: 'Standings', icon: FiShield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DetailTab)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
                <FiActivity className="text-amber-400" />
                <span>Match Information</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Competition</span>
                  <span className="font-bold text-white">{fixture.league_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Date & Kickoff</span>
                  <span className="font-bold text-white">
                    {fixture.event_date} • {fixture.event_time || 'TBA'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Venue / Stadium</span>
                  <span className="font-bold text-white">{fixture.event_stadium || 'Official Venue'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Match Referee</span>
                  <span className="font-bold text-white">
                    {fixture.event_referee ? (
                      <Link href={refereeLink} className="text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                        {fixture.event_referee}
                      </Link>
                    ) : (
                      'Official Referee'
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Home Formation</span>
                  <span className="font-bold text-amber-300 font-mono">
                    {fixture.event_home_formation || '4-3-3'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Away Formation</span>
                  <span className="font-bold text-amber-300 font-mono">
                    {fixture.event_away_formation || '4-2-3-1'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Odds & Win Probability Preview */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-400" />
                  <span>Win Probabilities & Market Odds</span>
                </h3>

                {probabilities ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>{fixture.event_home_team} ({probabilities.event_HW}%)</span>
                      <span>Draw ({probabilities.event_D}%)</span>
                      <span>{fixture.event_away_team} ({probabilities.event_AW}%)</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
                      <div style={{ width: `${probabilities.event_HW}%` }} className="bg-blue-500" />
                      <div style={{ width: `${probabilities.event_D}%` }} className="bg-slate-500" />
                      <div style={{ width: `${probabilities.event_AW}%` }} className="bg-amber-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                        <span className="text-slate-400">Over 2.5 Goals:</span>
                        <span className="font-bold text-emerald-400 ml-2">{probabilities.event_O}%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                        <span className="text-slate-400">Both Teams to Score:</span>
                        <span className="font-bold text-amber-400 ml-2">{probabilities.event_bts}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Detailed pre-match probability predictions available on the AI Prediction tab.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">Want full bookmaker comparisons?</span>
                <button
                  onClick={() => setActiveTab('odds')}
                  className="font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  View Odds Hub →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIMELINE / EVENTS */}
        {activeTab === 'events' && (
          <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <FiZap className="text-amber-400" />
              <span>Match Events & Goal Scorers</span>
            </h3>

            {(!fixture.goalscorers || fixture.goalscorers.length === 0) &&
            (!fixture.cards || fixture.cards.length === 0) &&
            (!fixture.substitutes || fixture.substitutes.length === 0) ? (
              <p className="text-center text-xs text-slate-400 py-10">
                No goals or disciplinary cards recorded yet for this fixture.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Goalscorers */}
                {fixture.goalscorers?.map((g, idx) => (
                  <div
                    key={`g-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400 font-mono w-10">
                        {g.time}&apos;
                      </span>
                      <span className="text-base">⚽</span>
                      <span className="font-bold text-white">
                        {g.home_scorer ? (
                          <Link href={getPlayerLinkByName(g.home_scorer)} className="hover:text-blue-400 transition-colors hover:underline">
                            {g.home_scorer}
                          </Link>
                        ) : g.away_scorer ? (
                          <Link href={getPlayerLinkByName(g.away_scorer)} className="hover:text-blue-400 transition-colors hover:underline">
                            {g.away_scorer}
                          </Link>
                        ) : null}
                      </span>
                    </div>
                    <span className="font-black font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {g.score}
                    </span>
                  </div>
                ))}

                {/* Cards */}
                {fixture.cards?.map((c, idx) => {
                  const isYellow = c.card.toLowerCase().includes('yellow');
                  return (
                    <div
                      key={`c-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-400 font-mono w-10">
                          {c.time}&apos;
                        </span>
                        <span
                          className={`inline-block h-4 w-3 rounded-sm ${
                            isYellow ? 'bg-amber-400 shadow-amber-500/50 shadow-sm' : 'bg-red-600 shadow-red-500/50 shadow-sm'
                          }`}
                        />
                        <span className="font-bold text-slate-200">
                          {c.home_fault ? (
                            <Link href={getPlayerLinkByName(c.home_fault)} className="hover:text-blue-400 transition-colors hover:underline">
                              {c.home_fault}
                            </Link>
                          ) : c.away_fault ? (
                            <Link href={getPlayerLinkByName(c.away_fault)} className="hover:text-blue-400 transition-colors hover:underline">
                              {c.away_fault}
                            </Link>
                          ) : null}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 capitalize">{c.card}</span>
                    </div>
                  );
                })}

                {/* Substitutes */}
                {fixture.substitutes?.map((s, idx) => {
                  const subIn = (s.home_scorer as any)?.in || (s.away_scorer as any)?.in || 'In';
                  const subOut = (s.home_scorer as any)?.out || (s.away_scorer as any)?.out || 'Out';
                  return (
                    <div
                      key={`s-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-400 font-mono w-10">
                          {s.time}&apos;
                        </span>
                        <span className="text-base">🔄</span>
                        <div>
                          <span className="font-bold text-emerald-400">
                            In:{' '}
                            <Link href={getPlayerLinkByName(subIn)} className="hover:text-emerald-300 transition-colors hover:underline">
                              {subIn}
                            </Link>
                          </span>
                          <span className="text-slate-400 ml-2">
                            Out:{' '}
                            <Link href={getPlayerLinkByName(subOut)} className="hover:text-rose-400 transition-colors hover:underline">
                              {subOut}
                            </Link>
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Sub</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LINEUPS */}
        {activeTab === 'lineups' && (
          <div className="space-y-6">
            {!fixture.lineups?.home_team?.starting_lineups?.length ? (
              <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-10 text-center text-xs text-slate-400">
                Lineups will be published approximately 60 minutes before kickoff.
              </div>
            ) : (
              <>
                {/* 2D Tactical Football Pitch */}
                <div className="relative min-h-[380px] rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-[#082318] to-[#0D3625] p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
                  <div className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

                  {/* Home Team Pitch Formation */}
                  <div>
                    <div className="mb-4 text-center text-xs font-black text-blue-300 uppercase tracking-wider">
                      {fixture.event_home_team} ({fixture.event_home_formation || 'Starting XI'})
                    </div>
                    <div className="flex flex-wrap justify-around gap-2">
                      {fixture.lineups.home_team.starting_lineups.map((p, idx) => (
                        <Link
                          href={p.player_key ? `/players/${p.player_key}` : '#'}
                          key={idx}
                          className="flex flex-col items-center group/player hover:opacity-80 transition-opacity"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-lg border border-white/30 group-hover/player:border-blue-300">
                            {p.player_number || idx + 1}
                          </div>
                          <span className="mt-1 text-[11px] font-bold text-white max-w-[70px] truncate text-center drop-shadow group-hover/player:text-blue-300">
                            {p.player.split(' ').pop()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Away Team Pitch Formation */}
                  <div className="mt-8">
                    <div className="flex flex-wrap justify-around gap-2 mb-4">
                      {fixture.lineups.away_team?.starting_lineups?.map((p, idx) => (
                        <Link
                          href={p.player_key ? `/players/${p.player_key}` : '#'}
                          key={idx}
                          className="flex flex-col items-center group/player hover:opacity-80 transition-opacity"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-black text-white shadow-lg border border-white/30 group-hover/player:border-amber-300">
                            {p.player_number || idx + 1}
                          </div>
                          <span className="mt-1 text-[11px] font-bold text-white max-w-[70px] truncate text-center drop-shadow group-hover/player:text-amber-300">
                            {p.player.split(' ').pop()}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="text-center text-xs font-black text-amber-300 uppercase tracking-wider">
                      {fixture.event_away_team} ({fixture.event_away_formation || 'Starting XI'})
                    </div>
                  </div>
                </div>

                {/* Substitutes & Coaches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-5 space-y-3">
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider border-b border-white/5 pb-2">
                      {fixture.event_home_team} Bench
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {fixture.lineups.home_team.substitutes.map((s, idx) => (
                        <li key={idx} className="flex justify-between py-1 border-b border-white/5 items-center">
                          {s.player_key ? (
                            <Link href={`/players/${s.player_key}`} className="hover:text-blue-400 transition-colors hover:underline">
                              {s.player}
                            </Link>
                          ) : (
                            <span>{s.player}</span>
                          )}
                          <span className="font-mono text-slate-400">#{s.player_number || '-'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-5 space-y-3">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider border-b border-white/5 pb-2">
                      {fixture.event_away_team} Bench
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {fixture.lineups.away_team?.substitutes?.map((s, idx) => (
                        <li key={idx} className="flex justify-between py-1 border-b border-white/5 items-center">
                          {s.player_key ? (
                            <Link href={`/players/${s.player_key}`} className="hover:text-amber-400 transition-colors hover:underline">
                              {s.player}
                            </Link>
                          ) : (
                            <span>{s.player}</span>
                          )}
                          <span className="font-mono text-slate-400">#{s.player_number || '-'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Coaches Section */}
                <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-5 space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                    Team Managers / Coaches
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400 block mb-1">Home Coach</span>
                      <Link
                        href={getCoachLink(fixture.lineups?.home_team?.coaches?.[0]?.coache || 'Pep Guardiola')}
                        className="font-bold text-white hover:text-blue-400 transition-colors hover:underline"
                      >
                        {fixture.lineups?.home_team?.coaches?.[0]?.coache || 'Pep Guardiola'}
                      </Link>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Away Coach</span>
                      <Link
                        href={getCoachLink(fixture.lineups?.away_team?.coaches?.[0]?.coache || 'Carlo Ancelotti')}
                        className="font-bold text-white hover:text-amber-400 transition-colors hover:underline"
                      >
                        {fixture.lineups?.away_team?.coaches?.[0]?.coache || 'Carlo Ancelotti'}
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: STATISTICS */}
        {activeTab === 'stats' && (
          <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <FiPieChart className="text-amber-400" />
              <span>Match Statistics</span>
            </h3>

            {!fixture.statistics || fixture.statistics.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">
                Detailed in-match statistics will be updated live during gameplay.
              </p>
            ) : (
              <div className="space-y-4">
                {fixture.statistics.map((st, idx) => {
                  const homeVal = parseFloat(st.home) || 0;
                  const awayVal = parseFloat(st.away) || 0;
                  const total = homeVal + awayVal || 1;
                  const homePercent = (homeVal / total) * 100;

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-blue-400 font-mono">{st.home}</span>
                        <span className="text-slate-300 uppercase tracking-wider text-[11px]">
                          {st.type}
                        </span>
                        <span className="text-amber-400 font-mono">{st.away}</span>
                      </div>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div style={{ width: `${homePercent}%` }} className="bg-blue-500" />
                        <div style={{ width: `${100 - homePercent}%` }} className="bg-amber-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: HEAD TO HEAD (H2H) */}
        {activeTab === 'h2h' && (
          <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <FiTrendingUp className="text-blue-400" />
              <span>Head to Head Encounters</span>
            </h3>

            {!h2h?.H2H?.length ? (
              <p className="text-center text-xs text-slate-400 py-10">
                No previous head-to-head match history found between these two teams.
              </p>
            ) : (
              <div className="space-y-3">
                {h2h.H2H.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all text-xs gap-2"
                  >
                    <div className="text-slate-400 font-mono text-[11px]">
                      {m.event_date} • {m.league_name}
                    </div>
                    <div className="flex items-center gap-3 font-bold text-white">
                      <span className={m.event_home_team === fixture.event_home_team ? 'text-blue-400' : ''}>
                        {m.event_home_team}
                      </span>
                      <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300 font-black">
                        {m.event_final_result || m.event_ft_result || 'VS'}
                      </span>
                      <span className={m.event_away_team === fixture.event_away_team ? 'text-amber-400' : ''}>
                        {m.event_away_team}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 capitalize">{m.event_status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ODDS HUB */}
        {activeTab === 'odds' && (
          <div className="space-y-6">
            {/* Live Odds if available */}
            {liveOdds.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-[#0A1D1C] p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 pb-3 flex items-center gap-2">
                  <FiZap className="text-emerald-400 animate-pulse" />
                  <span>Live In-Play Odds</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {liveOdds.map((lo, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex flex-col justify-between text-xs"
                    >
                      <span className="text-slate-400 text-[11px]">{lo.odd_name}</span>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-white">{lo.odd_type}</span>
                        <span className="font-black text-emerald-300 font-mono text-base">
                          {lo.odd_value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Pre-Match Odds */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
                <FiTrendingUp className="text-amber-400" />
                <span>Pre-Match 1X2 & Over/Under Markets</span>
              </h3>

              {odds.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-10">
                  Pre-match bookmaker odds have not opened yet for this match.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="border-b border-white/10 uppercase text-[11px] text-slate-400 font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Bookmaker</th>
                        <th className="py-2.5 px-3 text-center">1 (Home)</th>
                        <th className="py-2.5 px-3 text-center">X (Draw)</th>
                        <th className="py-2.5 px-3 text-center">2 (Away)</th>
                        <th className="py-2.5 px-3 text-center">Over 2.5</th>
                        <th className="py-2.5 px-3 text-center">Under 2.5</th>
                        <th className="py-2.5 px-3 text-center">BTS Yes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {odds.map((o, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 px-3 font-bold text-white font-sans">
                            {o.odd_bookmakers}
                          </td>
                          <td className="py-3 px-3 text-center text-blue-400 font-black">
                            {o.odd_1 || '-'}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-300 font-bold">
                            {o.odd_x || '-'}
                          </td>
                          <td className="py-3 px-3 text-center text-amber-400 font-black">
                            {o.odd_2 || '-'}
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-400">
                            {o['o+2.5'] || '-'}
                          </td>
                          <td className="py-3 px-3 text-center text-rose-400">
                            {o['u+2.5'] || '-'}
                          </td>
                          <td className="py-3 px-3 text-center text-amber-300">
                            {o.bts_yes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Full Odds Markets (Correct Score etc.) */}
            {fullOdds && (
              <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
                  <FiLayers className="text-amber-400" />
                  <span>Full Odds Market Breakdown</span>
                </h3>
                <div className="space-y-4">
                  {Object.entries(fullOdds).map(([marketName, marketData]) => (
                    <div key={marketName} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                      <h4 className="text-xs font-bold text-amber-300">{marketName}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(marketData).slice(0, 8).map(([outcome, bookies]) => {
                          const topBookie = Object.keys(bookies)[0];
                          const topOdds = bookies[topBookie];
                          return (
                            <div
                              key={outcome}
                              className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 flex justify-between items-center text-xs"
                            >
                              <span className="font-semibold text-white">{outcome}</span>
                              <span className="font-mono font-black text-amber-400">{topOdds}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: AI PROBABILITIES */}
        {activeTab === 'probabilities' && (
          <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-6 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <FiAward className="text-amber-400" />
              <span>GoalMills AI Prediction & Win Probability Matrix</span>
            </h3>

            {!probabilities ? (
              <p className="text-center text-xs text-slate-400 py-10">
                Probability algorithms are synthesizing pre-match form data. Check back shortly.
              </p>
            ) : (
              <div className="space-y-6">
                {/* 1X2 Probabilities Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span className="text-blue-400">{fixture.event_home_team}: {probabilities.event_HW}%</span>
                    <span className="text-slate-400">Draw: {probabilities.event_D}%</span>
                    <span className="text-amber-400">{fixture.event_away_team}: {probabilities.event_AW}%</span>
                  </div>
                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner">
                    <div style={{ width: `${probabilities.event_HW}%` }} className="bg-blue-500 transition-all duration-500" />
                    <div style={{ width: `${probabilities.event_D}%` }} className="bg-slate-500 transition-all duration-500" />
                    <div style={{ width: `${probabilities.event_AW}%` }} className="bg-amber-500 transition-all duration-500" />
                  </div>
                </div>

                {/* Matrix Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 text-center space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Over 2.5 Goals</span>
                    <div className="text-xl font-black text-emerald-400 font-mono">{probabilities.event_O}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 text-center space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Under 2.5 Goals</span>
                    <div className="text-xl font-black text-rose-400 font-mono">{probabilities.event_U}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 text-center space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Both Teams Score</span>
                    <div className="text-xl font-black text-amber-400 font-mono">{probabilities.event_bts}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 text-center space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Clean Sheet (OTS)</span>
                    <div className="text-xl font-black text-cyan-400 font-mono">{probabilities.event_ots}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: VIDEOS & HIGHLIGHTS */}
        {activeTab === 'highlights' && (
          <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <FiVideo className="text-amber-400" />
              <span>Official Video Highlights & Replays</span>
            </h3>

            {videos.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">
                Official highlights will be published shortly after the final whistle.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((vid, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-lg space-y-3 p-4"
                  >
                    <h4 className="text-xs font-bold text-white">{vid.video_title_full || vid.video_title}</h4>
                    {vid.video_url?.includes('embed') ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                        <iframe
                          src={vid.video_url}
                          className="w-full h-full"
                          allowFullScreen
                          title={vid.video_title}
                        />
                      </div>
                    ) : (
                      <a
                        href={vid.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                      >
                        <FiVideo /> Watch Highlight Clip
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: STANDINGS */}
        {activeTab === 'standings' && (
          <div className="rounded-2xl border border-white/10 bg-[#0B1526] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <FiShield className="text-amber-400" />
              <span>{fixture.league_name} Table</span>
            </h3>

            {standings.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">
                Standings data is currently not available for this competition.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-white/10 uppercase text-[11px] text-slate-400 font-mono">
                    <tr>
                      <th className="py-3 px-2">#</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-3 text-center">P</th>
                      <th className="py-3 px-3 text-center">W</th>
                      <th className="py-3 px-3 text-center">D</th>
                      <th className="py-3 px-3 text-center">L</th>
                      <th className="py-3 px-3 text-center">GD</th>
                      <th className="py-3 px-4 text-right">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {standings.map((row, index) => {
                      const isCurrent =
                        row.team_key === String(fixture.home_team_key) ||
                        row.team_key === String(fixture.away_team_key) ||
                        row.standing_team === fixture.event_home_team ||
                        row.standing_team === fixture.event_away_team;

                      return (
                        <tr
                          key={index}
                          className={isCurrent ? 'bg-amber-500/10' : 'hover:bg-white/5'}
                        >
                          <td className="py-3 px-2 font-bold text-slate-400">
                            {row.standing_place || index + 1}
                          </td>
                          <td className="py-3 px-4 font-bold text-white font-sans">
                            <span className={isCurrent ? 'text-amber-400 font-black' : ''}>
                              {row.standing_team}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">{row.standing_P || 0}</td>
                          <td className="py-3 px-3 text-center text-emerald-400">{row.standing_W || 0}</td>
                          <td className="py-3 px-3 text-center text-slate-400">{row.standing_D || 0}</td>
                          <td className="py-3 px-3 text-center text-rose-400">{row.standing_L || 0}</td>
                          <td className="py-3 px-3 text-center">{row.standing_GD || 0}</td>
                          <td className="py-3 px-4 text-right font-black text-amber-400">
                            {row.standing_PTS || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
