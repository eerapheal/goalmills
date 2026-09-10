'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cricketApi } from '@/services/cricketApi';
import { extractEventKeyFromSlug, cricketRoutes, slugify } from '@/lib/slugUtils';
import { BackButton } from '@/components/BackButton';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import {
  CricketEvent,
  CricketScorecardPlayer,
  CricketComment,
  CricketWicket,
  CricketLineupPlayer,
} from '@goalmills/types';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiActivity,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiAward,
  FiInfo,
  FiList,
} from 'react-icons/fi';

type MatchTab = 'scorecard' | 'commentary' | 'lineups' | 'wickets' | 'h2h' | 'odds' | 'info';

export default function CricketMatchSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';
  const eventKey = extractEventKeyFromSlug(slug);

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<CricketEvent | null>(null);
  const [h2hData, setH2HData] = useState<any>(null);
  const [oddsData, setOddsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<MatchTab>('scorecard');
  const [activeInnings, setActiveInnings] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatchData() {
      if (!eventKey) return;
      setLoading(true);
      setError(null);
      try {
        const matchItem = await cricketApi.getMatchById(eventKey);
        if (matchItem) {
          setMatch(matchItem);

          // If scorecard has innings, default to first innings
          if (matchItem.scorecard) {
            const inningsKeys = Object.keys(matchItem.scorecard);
            if (inningsKeys.length > 0) {
              setActiveInnings(inningsKeys[0]);
            }
          }

          // Parallel fetch H2H if team keys exist
          const hId = Number(matchItem.home_team_key);
          const aId = Number(matchItem.away_team_key);
          if (hId && aId) {
            cricketApi
              .getH2H({ firstTeamId: hId, secondTeamId: aId })
              .then((res) => setH2HData(res?.result))
              .catch(() => {});
          }

          // Parallel fetch Odds
          const mId = Number(matchItem.event_key);
          if (mId) {
            cricketApi
              .getOdds({ matchId: mId })
              .then((res) => {
                const results = res?.result;
                if (results && results[String(mId)]) {
                  setOddsData(results[String(mId)]);
                } else if (results) {
                  setOddsData(results);
                }
              })
              .catch(() => {});
          }
        } else {
          setError('Cricket match not found.');
        }
      } catch (err) {
        console.error('Error fetching cricket match details:', err);
        setError('Failed to load match details.');
      } finally {
        setLoading(false);
      }
    }

    loadMatchData();
  }, [eventKey]);

  const isLive =
    match?.event_live === '1' ||
    match?.event_live === (1 as any) ||
    match?.event_status?.toLowerCase().includes('live') ||
    match?.event_status?.toLowerCase().includes('innings') ||
    match?.event_status?.toLowerCase().includes('batting') ||
    match?.event_status?.toLowerCase().includes('break');

  const isFinished =
    match?.event_status?.toLowerCase() === 'finished' ||
    match?.event_status === 'FT' ||
    match?.event_status?.toLowerCase().includes('won') ||
    match?.event_status?.toLowerCase().includes('complete') ||
    match?.event_status?.toLowerCase().includes('draw') ||
    match?.event_status?.toLowerCase().includes('tied') ||
    match?.event_status?.toLowerCase().includes('abandoned');

  const homeName = match?.event_home_team || 'Home Team';
  const awayName = match?.event_away_team || 'Away Team';

  // JSON-LD structured data for Google SEO
  const jsonLd = useMemo(() => {
    if (!match) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${homeName} vs ${awayName}`,
      description: `${homeName} vs ${awayName} Cricket Live Score, Full Scorecard, Commentary, and Fall of Wickets for ${match.league_name || 'Cricket Tournament'}`,
      startDate: match.event_date_start
        ? `${match.event_date_start}T${match.event_time || '00:00:00'}`
        : undefined,
      sport: 'Cricket',
      homeTeam: {
        '@type': 'SportsTeam',
        name: homeName,
        logo: match.event_home_team_logo,
      },
      awayTeam: {
        '@type': 'SportsTeam',
        name: awayName,
        logo: match.event_away_team_logo,
      },
      location: {
        '@type': 'Place',
        name: match.event_stadium || match.country_name || 'International Cricket Stadium',
      },
    };
  }, [match, homeName, awayName]);

  // Scorecard innings list
  const availableInnings = useMemo(() => {
    if (!match?.scorecard) return [];
    return Object.keys(match.scorecard);
  }, [match?.scorecard]);

  // Current innings scorecard players separated by batsmen and bowlers
  const currentInningsPlayers = useMemo(() => {
    const inningsKey = activeInnings || availableInnings[0];
    if (!match?.scorecard || !inningsKey) return { batsmen: [], bowlers: [] };
    const players: CricketScorecardPlayer[] = match.scorecard[inningsKey] || [];
    const batsmen = players.filter((p) => p.type === 'Batsman');
    const bowlers = players.filter((p) => p.type === 'Bowler');
    return { batsmen, bowlers };
  }, [match?.scorecard, activeInnings, availableInnings]);

  // Current innings commentary list
  const currentComments = useMemo(() => {
    if (!match?.comments) return [];
    const inningsKey = activeInnings || availableInnings[0];
    if (inningsKey && match.comments[inningsKey]) {
      return match.comments[inningsKey];
    }
    // Fallback: combine all comments
    const all: CricketComment[] = [];
    Object.values(match.comments).forEach((list) => {
      if (Array.isArray(list)) all.push(...list);
    });
    return all;
  }, [match?.comments, activeInnings, availableInnings]);

  // Current innings wickets list
  const currentWickets = useMemo(() => {
    if (!match?.wickets) return [];
    const inningsKey = activeInnings || availableInnings[0];
    if (inningsKey && match.wickets[inningsKey]) {
      return match.wickets[inningsKey];
    }
    const all: CricketWicket[] = [];
    Object.values(match.wickets).forEach((list) => {
      if (Array.isArray(list)) all.push(...list);
    });
    return all;
  }, [match?.wickets, activeInnings, availableInnings]);

  // Current innings extras
  const currentExtras = useMemo(() => {
    if (!match?.extra) return null;
    const inningsKey = activeInnings || availableInnings[0];
    return inningsKey ? match.extra[inningsKey] : null;
  }, [match?.extra, activeInnings, availableInnings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center space-y-3">
        <GoalmillsLoader />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
          Loading Cricket Match Center & Scorecard...
        </p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center p-8 text-center">
        <span className="text-5xl mb-4">🏏</span>
        <h1 className="text-2xl font-black text-white mb-2">Match Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          {error || 'The requested cricket match could not be found or has not been scheduled yet.'}
        </p>
        <Link
          href="/cricket"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          Return to Cricket Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a1a] pt-[90px] pb-24 text-slate-200">
      {/* JSON-LD Script Tag for SEO */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Hero Header Scoreboard */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B1526] via-[#091222] to-[#070a1a] border-b border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back & Breadcrumb Bar */}
          <div className="flex items-center justify-between mb-6">
            <BackButton />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <span className="text-emerald-400">🏏</span>
              <span>{match.league_name || 'Cricket Series'}</span>
              {match.league_season && (
                <span className="text-slate-400">• {match.league_season}</span>
              )}
              {match.event_type && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-white font-mono">
                  {match.event_type}
                </span>
              )}
            </div>
          </div>

          {/* Marquee Scoreboard */}
          <div className="flex items-center justify-between gap-4 sm:gap-8 py-4">
            {/* Home Team */}
            <Link
              href={cricketRoutes.teamFromName(homeName, match.home_team_key)}
              className="flex flex-col items-center gap-3 flex-1 max-w-[220px] text-center group"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-[#0F1D38]/80 border border-white/10 p-2.5 flex items-center justify-center group-hover:border-emerald-400/50 group-hover:scale-105 transition-all shadow-xl">
                {match.event_home_team_logo ? (
                  <img
                    src={match.event_home_team_logo}
                    alt={homeName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-emerald-400">{homeName.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs sm:text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                {homeName}
              </span>
              {match.event_home_rr && (
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  RR: {match.event_home_rr}
                </span>
              )}
            </Link>

            {/* Live Center Scoreline */}
            <div className="flex flex-col items-center gap-2 text-center">
              {isLive ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  LIVE • {match.event_status || 'IN PLAY'}
                </span>
              ) : isFinished ? (
                <span className="px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                  MATCH RESULT
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold uppercase">
                  UPCOMING
                </span>
              )}

              {/* Innings scores */}
              <div className="text-2xl sm:text-4xl font-mono font-black text-white tracking-tight flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <span className="text-emerald-300">{match.event_home_final_result || '-'}</span>
                <span className="text-slate-600 text-lg sm:text-2xl font-sans">vs</span>
                <span className="text-sky-300">{match.event_away_final_result || '-'}</span>
              </div>

              {/* Status Info (e.g. "India won by 5 wickets") */}
              {match.event_status_info && (
                <p className="text-xs font-bold text-amber-300 max-w-xs mt-1 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                  {match.event_status_info}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1">
                <span>{match.event_date_start || match.event_date_stop || 'Date TBD'}</span>
                {match.event_time && <span>• {match.event_time}</span>}
              </div>
            </div>

            {/* Away Team */}
            <Link
              href={cricketRoutes.teamFromName(awayName, match.away_team_key)}
              className="flex flex-col items-center gap-3 flex-1 max-w-[220px] text-center group"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-[#0F1D38]/80 border border-white/10 p-2.5 flex items-center justify-center group-hover:border-emerald-400/50 group-hover:scale-105 transition-all shadow-xl">
                {match.event_away_team_logo ? (
                  <img
                    src={match.event_away_team_logo}
                    alt={awayName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-emerald-400">{awayName.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs sm:text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                {awayName}
              </span>
              {match.event_away_rr && (
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  RR: {match.event_away_rr}
                </span>
              )}
            </Link>
          </div>

          {/* Match Location & Context Badges */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            {match.event_stadium && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/5 font-semibold">
                <FiMapPin className="text-emerald-400" /> {match.event_stadium}
              </span>
            )}
            {match.country_name && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/5 font-semibold">
                🌐 {match.country_name}
              </span>
            )}
            {match.event_toss && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/5 font-semibold">
                🪙 {match.event_toss}
              </span>
            )}
            {match.event_man_of_match && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
                <FiAward className="text-amber-400" /> PoM: {match.event_man_of_match}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabbed Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-[#0A162B] border border-blue-500/20">
          {[
            { id: 'scorecard', label: 'Scorecard', icon: FiList },
            { id: 'commentary', label: 'Commentary', icon: FiActivity },
            { id: 'lineups', label: 'Lineups', icon: FiUsers },
            { id: 'wickets', label: 'Fall of Wickets', icon: FiTrendingUp },
            { id: 'h2h', label: 'Head to Head', icon: FiAward },
            { id: 'odds', label: 'Odds', icon: FiDollarSign },
            { id: 'info', label: 'Match Info', icon: FiInfo },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MatchTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. Scorecard Tab */}
        {activeTab === 'scorecard' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-6">
            {/* Innings Selector Ribbon */}
            {availableInnings.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                  Innings:
                </span>
                {availableInnings.map((inn) => {
                  const isSelected = (activeInnings || availableInnings[0]) === inn;
                  return (
                    <button
                      key={inn}
                      onClick={() => setActiveInnings(inn)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-black shadow-md font-black'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {inn.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Batsmen Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-emerald-400">🏏</span>
                <span>Batting Scorecard</span>
              </h4>

              {currentInningsPlayers.batsmen.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-2.5 px-3">Batter</th>
                        <th className="py-2.5 px-2">Dismissal</th>
                        <th className="py-2.5 px-2 text-right">R</th>
                        <th className="py-2.5 px-2 text-right">B</th>
                        <th className="py-2.5 px-2 text-right">4s</th>
                        <th className="py-2.5 px-2 text-right">6s</th>
                        <th className="py-2.5 px-3 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {currentInningsPlayers.batsmen.map((b, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 font-sans font-bold text-white">
                            {b.player}
                          </td>
                          <td className="py-2.5 px-2 font-sans text-slate-400 text-[11px]">
                            {b.status || 'not out'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-black text-emerald-400 text-sm">
                            {b.R}
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-300">{b.B}</td>
                          <td className="py-2.5 px-2 text-right text-slate-400">{b['4s']}</td>
                          <td className="py-2.5 px-2 text-right text-slate-400">{b['6s']}</td>
                          <td className="py-2.5 px-3 text-right text-amber-300 font-bold">
                            {b.SR || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">
                  Scorecard details will populate as players take the crease.
                </p>
              )}
            </div>

            {/* Extras Summary */}
            {currentExtras && (
              <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                  Extras ({currentExtras.text || 'b, lb, w, nb, p'}):
                </span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {currentExtras.total || '0'}
                </span>
              </div>
            )}

            {/* Bowlers Table */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-sky-400">🎯</span>
                <span>Bowling Figures</span>
              </h4>

              {currentInningsPlayers.bowlers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-2.5 px-3">Bowler</th>
                        <th className="py-2.5 px-2 text-right">O</th>
                        <th className="py-2.5 px-2 text-right">M</th>
                        <th className="py-2.5 px-2 text-right">R</th>
                        <th className="py-2.5 px-2 text-right font-black text-sky-400">W</th>
                        <th className="py-2.5 px-3 text-right">ECON</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {currentInningsPlayers.bowlers.map((bw, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 font-sans font-bold text-white">
                            {bw.player}
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-300">{bw.O || '-'}</td>
                          <td className="py-2.5 px-2 text-right text-slate-400">{bw.M || '0'}</td>
                          <td className="py-2.5 px-2 text-right text-slate-300">{bw.R || '0'}</td>
                          <td className="py-2.5 px-2 text-right font-black text-emerald-400 text-sm">
                            {bw.W || '0'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-amber-300 font-bold">
                            {bw.ER || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">
                  Bowling figures will display as overs are completed.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 2. Commentary Tab */}
        {activeTab === 'commentary' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiActivity className="text-emerald-400" />
              <span>Ball-by-Ball Live Commentary</span>
            </h3>

            {currentComments.length > 0 ? (
              <div className="space-y-3 pt-2">
                {currentComments.map((c, idx) => {
                  const isWicket = c.post?.toLowerCase().includes('out') || c.post?.toLowerCase().includes('wicket');
                  const isBoundary = c.post?.includes('FOUR') || c.post?.includes('SIX') || c.runs === '4' || c.runs === '6';

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isWicket
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : isBoundary
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-[#060D18]/70 border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono font-bold text-xs">
                            {c.overs || c.balls || `${idx + 1}`} ov
                          </span>
                          {c.runs && (
                            <span
                              className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs ${
                                isWicket
                                  ? 'bg-rose-500 text-white'
                                  : isBoundary
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {isWicket ? 'W' : `${c.runs} runs`}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{c.post}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                Live ball commentary stream will appear here when the match is underway.
              </p>
            )}
          </div>
        )}

        {/* 3. Lineups Tab */}
        {activeTab === 'lineups' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiUsers className="text-emerald-400" />
              <span>Starting XI Lineups</span>
            </h3>

            {match.lineups ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Home Lineup */}
                <div className="p-4 rounded-2xl bg-[#060D18]/80 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    {match.event_home_team_logo && (
                      <img
                        src={match.event_home_team_logo}
                        alt=""
                        className="w-5 h-5 object-contain"
                      />
                    )}
                    <span className="font-black text-sm text-white">{homeName}</span>
                  </div>
                  <ul className="divide-y divide-white/5 text-xs">
                    {match.lineups.home_team?.starting_lineups?.map((p, i) => (
                      <li key={i} className="py-2 flex items-center justify-between">
                        <span className="font-medium text-slate-200">{p.player}</span>
                        {p.player_country && (
                          <span className="text-[10px] text-slate-500 uppercase">
                            {p.player_country}
                          </span>
                        )}
                      </li>
                    )) || <li className="text-slate-500 py-2">Lineup announcement pending.</li>}
                  </ul>
                </div>

                {/* Away Lineup */}
                <div className="p-4 rounded-2xl bg-[#060D18]/80 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    {match.event_away_team_logo && (
                      <img
                        src={match.event_away_team_logo}
                        alt=""
                        className="w-5 h-5 object-contain"
                      />
                    )}
                    <span className="font-black text-sm text-white">{awayName}</span>
                  </div>
                  <ul className="divide-y divide-white/5 text-xs">
                    {match.lineups.away_team?.starting_lineups?.map((p, i) => (
                      <li key={i} className="py-2 flex items-center justify-between">
                        <span className="font-medium text-slate-200">{p.player}</span>
                        {p.player_country && (
                          <span className="text-[10px] text-slate-500 uppercase">
                            {p.player_country}
                          </span>
                        )}
                      </li>
                    )) || <li className="text-slate-500 py-2">Lineup announcement pending.</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                Official playing lineups are published closer to match toss.
              </p>
            )}
          </div>
        )}

        {/* 4. Fall of Wickets Tab */}
        {activeTab === 'wickets' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" />
              <span>Fall of Wickets Progression</span>
            </h3>

            {currentWickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                      <th className="py-3 px-3">Wkt</th>
                      <th className="py-3 px-3">Dismissed Batsman</th>
                      <th className="py-3 px-3">Team Score</th>
                      <th className="py-3 px-3">Over</th>
                      <th className="py-3 px-3">Bowler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-mono">
                    {currentWickets.map((w, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="py-3 px-3 font-sans font-bold text-rose-400">
                          #{i + 1}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-white">
                          {w.batsman}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-400 text-sm">
                          {w.score}
                        </td>
                        <td className="py-3 px-3 text-slate-300">{w.fall}</td>
                        <td className="py-3 px-3 font-sans text-slate-300">
                          {w.balwer || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                No wickets have fallen in this innings yet.
              </p>
            )}
          </div>
        )}

        {/* 5. Head to Head Tab */}
        {activeTab === 'h2h' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiAward className="text-amber-400" />
              <span>Head to Head Encounters</span>
            </h3>

            {h2hData?.H2H && Array.isArray(h2hData.H2H) && h2hData.H2H.length > 0 ? (
              <div className="space-y-3">
                {h2hData.H2H.map((pastMatch: CricketEvent, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#060D18]/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {pastMatch.league_name} • {pastMatch.event_date_start || pastMatch.event_date_stop}
                      </div>
                      <div className="font-bold text-white text-sm">
                        {pastMatch.event_home_team} vs {pastMatch.event_away_team}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-emerald-400">
                        {pastMatch.event_home_final_result || '-'} : {pastMatch.event_away_final_result || '-'}
                      </div>
                      {pastMatch.event_status_info && (
                        <div className="text-[11px] text-amber-300 font-medium">
                          {pastMatch.event_status_info}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                Historical head-to-head match records are currently unavailable for these teams.
              </p>
            )}
          </div>
        )}

        {/* 6. Betting Odds Tab */}
        {activeTab === 'odds' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiDollarSign className="text-emerald-400" />
              <span>Live Betting Markets & Odds</span>
            </h3>

            {oddsData && Object.keys(oddsData).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(oddsData).map(([marketName, outcomes]: [string, any], idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#060D18]/80 border border-white/5 space-y-3"
                  >
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      {marketName.replace(/_/g, ' ')}
                    </h4>
                    {typeof outcomes === 'object' && outcomes !== null && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Object.entries(outcomes).map(([outcome, bookmakers]: [string, any], bIdx) => (
                          <div
                            key={bIdx}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 text-center"
                          >
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">
                              {outcome}
                            </span>
                            <span className="text-sm font-mono font-black text-emerald-400">
                              {typeof bookmakers === 'object'
                                ? Object.values(bookmakers)[0] as string || '-'
                                : String(bookmakers)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                Odds markets are not currently posted for this fixture.
              </p>
            )}
          </div>
        )}

        {/* 7. Match Info Tab */}
        {activeTab === 'info' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiInfo className="text-sky-400" />
              <span>Match Information & Intelligence</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Competition</span>
                <span className="text-sm font-bold text-white">{match.league_name || 'Cricket Series'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Season / Round</span>
                <span className="text-sm font-bold text-white">
                  {match.league_season || '-'} • {match.league_round || 'Regular'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Venue / Stadium</span>
                <span className="text-sm font-bold text-white">{match.event_stadium || 'TBD'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Country</span>
                <span className="text-sm font-bold text-white">{match.country_name || 'Global'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Toss</span>
                <span className="text-sm font-bold text-amber-300">{match.event_toss || 'Toss not yet recorded'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Player of the Match</span>
                <span className="text-sm font-bold text-emerald-400">
                  {match.event_man_of_match || 'To be decided'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
