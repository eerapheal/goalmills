'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { basketballApi } from '@/services/basketballApi';
import { extractEventKeyFromSlug, basketballRoutes, slugify } from '@/lib/slugUtils';
import { BackButton } from '@/components/BackButton';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { BasketballEvent } from '@goalmills/types';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiActivity,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiChevronRight,
  FiAward,
} from 'react-icons/fi';

type MatchTab = 'boxscore' | 'stats' | 'lineups' | 'players' | 'h2h' | 'odds';

export default function BasketballMatchSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';
  const eventKey = extractEventKeyFromSlug(slug);

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<BasketballEvent | null>(null);
  const [h2hData, setH2HData] = useState<any>(null);
  const [oddsData, setOddsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<MatchTab>('boxscore');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatchData() {
      if (!eventKey) return;
      setLoading(true);
      setError(null);
      try {
        const matchItem = await basketballApi.getGameById(eventKey);
        if (matchItem) {
          setMatch(matchItem);

          // If home and away team IDs exist, fetch H2H in parallel
          const hId = Number(matchItem.home_team_key);
          const aId = Number(matchItem.away_team_key);
          if (hId && aId) {
            basketballApi
              .getH2H({ firstTeamId: hId, secondTeamId: aId })
              .then((res) => setH2HData(res?.result))
              .catch(() => {});
          }

          // Fetch Odds
          const mId = Number(matchItem.event_key);
          if (mId) {
            basketballApi
              .getOdds({ matchId: mId })
              .then((res) => setOddsData(res?.result))
              .catch(() => {});
          }
        } else {
          setError('Basketball game not found.');
        }
      } catch (err) {
        console.error('Error fetching game details:', err);
        setError('Failed to load game details.');
      } finally {
        setLoading(false);
      }
    }

    loadMatchData();
  }, [eventKey]);

  const isLive =
    match?.event_live === '1' ||
    match?.event_live === (1 as any) ||
    [
      '1st Quarter',
      '2nd Quarter',
      '3rd Quarter',
      '4th Quarter',
      'Overtime',
      'Halftime',
      'LIVE',
      'Q1',
      'Q2',
      'Q3',
      'Q4',
      'OT',
    ].includes(match?.event_status || match?.event_quarter || '');

  const isFinished =
    match?.event_status?.toLowerCase() === 'finished' ||
    match?.event_status === 'FT' ||
    match?.event_status === 'AOT';

  // Extract score parts from event_final_result ("114 - 107") or scores object
  const { homeScore, awayScore } = useMemo(() => {
    if (match?.event_final_result && match.event_final_result.includes('-')) {
      const parts = match.event_final_result.split('-');
      return {
        homeScore: parts[0]?.trim() || '0',
        awayScore: parts[1]?.trim() || '0',
      };
    }
    return { homeScore: '-', awayScore: '-' };
  }, [match?.event_final_result]);

  const homeName = match?.event_home_team || 'Home Team';
  const awayName = match?.event_away_team || 'Away Team';

  // JSON-LD structured data for Google SEO
  const jsonLd = useMemo(() => {
    if (!match) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${homeName} vs ${awayName}`,
      description: `${homeName} vs ${awayName} Live Score, Quarter Box Scores and Player Stats for ${match.league_name || 'Basketball'}`,
      startDate: match.event_date
        ? `${match.event_date}T${match.event_time || '00:00:00'}`
        : undefined,
      sport: 'Basketball',
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
        name: match.country_name || 'Global Arena',
      },
    };
  }, [match, homeName, awayName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center space-y-3">
        <GoalmillsLoader />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
          Loading Game Center & Box Score...
        </p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center p-8 text-center">
        <span className="text-5xl mb-4">🏀</span>
        <h1 className="text-2xl font-black text-white mb-2">Game Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          {error ||
            'The requested basketball game could not be found or has not been scheduled yet.'}
        </p>
        <Link
          href="/basketball"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          Return to Basketball Hub
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-wider">
              <span className="text-amber-400">🏀</span>
              <span>{match.league_name || 'Basketball'}</span>
              {match.league_season && (
                <span className="text-slate-400">• {match.league_season}</span>
              )}
            </div>
          </div>

          {/* Marquee Scoreboard */}
          <div className="flex items-center justify-between gap-4 sm:gap-8 py-4">
            {/* Home Team */}
            <Link
              href={basketballRoutes.teamFromName(homeName, match.home_team_key)}
              className="flex flex-col items-center gap-3 flex-1 max-w-[220px] text-center group"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-[#0F1D38]/80 border border-white/10 p-2.5 flex items-center justify-center group-hover:border-amber-400/50 group-hover:scale-105 transition-all shadow-xl">
                {match.event_home_team_logo ? (
                  <img
                    src={match.event_home_team_logo}
                    alt={homeName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-amber-400">{homeName.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs sm:text-base font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                {homeName}
              </span>
            </Link>

            {/* Live Center Scoreline */}
            <div className="flex flex-col items-center gap-2 text-center">
              {isLive ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  LIVE • {match.event_quarter || match.event_status || 'IN PLAY'}
                </span>
              ) : isFinished ? (
                <span className="px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                  FINAL {match.event_status === 'AOT' ? '(OT)' : ''}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold uppercase">
                  SCHEDULED
                </span>
              )}

              <div className="text-3xl sm:text-6xl font-mono font-black text-white tracking-tight flex items-center gap-3">
                <span>{homeScore}</span>
                <span className="text-slate-600 text-2xl sm:text-4xl">:</span>
                <span>{awayScore}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1">
                <span>{match.event_date}</span>
                {match.event_time && <span>• {match.event_time}</span>}
              </div>
            </div>

            {/* Away Team */}
            <Link
              href={basketballRoutes.teamFromName(awayName, match.away_team_key)}
              className="flex flex-col items-center gap-3 flex-1 max-w-[220px] text-center group"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-[#0F1D38]/80 border border-white/10 p-2.5 flex items-center justify-center group-hover:border-amber-400/50 group-hover:scale-105 transition-all shadow-xl">
                {match.event_away_team_logo ? (
                  <img
                    src={match.event_away_team_logo}
                    alt={awayName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-amber-400">{awayName.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs sm:text-base font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                {awayName}
              </span>
            </Link>
          </div>

          {/* Match Location & Badges */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            {match.country_name && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/5 font-semibold">
                <FiMapPin className="text-amber-400" /> {match.country_name}
              </span>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/5 font-semibold">
              <FiCalendar className="text-sky-400" /> {match.event_date}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabbed Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-[#0A162B] border border-blue-500/20">
          {[
            { id: 'boxscore', label: 'Quarter Box Score' },
            { id: 'stats', label: 'Team Stats' },
            { id: 'lineups', label: 'Lineups' },
            { id: 'players', label: 'Player Stats' },
            { id: 'h2h', label: 'Head to Head' },
            { id: 'odds', label: 'Odds' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MatchTab)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 1. Box Score Tab (Quarter by Quarter Breakdown) */}
        {activeTab === 'boxscore' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiAward className="text-amber-400" />
              <span>Quarter by Quarter Breakdown</span>
            </h3>

            {match.scores ? (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                      <th className="py-3 px-3 text-left">Team</th>
                      <th className="py-3 px-2">Q1</th>
                      <th className="py-3 px-2">Q2</th>
                      <th className="py-3 px-2">Q3</th>
                      <th className="py-3 px-2">Q4</th>
                      {match.scores.Overtime && <th className="py-3 px-2 text-amber-400">OT</th>}
                      <th className="py-3 px-3 font-black text-white">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-sm font-bold">
                    {/* Home Team */}
                    <tr className="hover:bg-white/5">
                      <td className="py-3 px-3 text-left font-sans font-bold text-white flex items-center gap-2">
                        {match.event_home_team_logo && (
                          <img
                            src={match.event_home_team_logo}
                            alt=""
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span>{homeName}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {match.scores['1stQuarter']?.[0]?.score_home || '-'}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {match.scores['2ndQuarter']?.[0]?.score_home || '-'}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {match.scores['3rdQuarter']?.[0]?.score_home || '-'}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {match.scores['4thQuarter']?.[0]?.score_home || '-'}
                      </td>
                      {match.scores.Overtime && (
                        <td className="py-3 px-2 text-amber-400">
                          {match.scores.Overtime?.[0]?.score_home || '-'}
                        </td>
                      )}
                      <td className="py-3 px-3 font-black text-amber-400 text-base">{homeScore}</td>
                    </tr>
                    {/* Away Team */}
                    <tr className="hover:bg-white/5">
                      <td className="py-3 px-3 text-left font-sans font-bold text-white flex items-center gap-2">
                        {match.event_away_team_logo && (
                          <img
                            src={match.event_away_team_logo}
                            alt=""
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span>{awayName}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {match.scores['1stQuarter']?.[0]?.score_away || '-'}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {match.scores['2ndQuarter']?.[0]?.score_away || '-'}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {match.scores['3rdQuarter']?.[0]?.score_away || '-'}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {match.scores['4thQuarter']?.[0]?.score_away || '-'}
                      </td>
                      {match.scores.Overtime && (
                        <td className="py-3 px-2 text-amber-400">
                          {match.scores.Overtime?.[0]?.score_away || '-'}
                        </td>
                      )}
                      <td className="py-3 px-3 font-black text-amber-400 text-base">{awayScore}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Quarter by quarter scores will populate as the game unfolds.
              </p>
            )}
          </div>
        )}

        {/* 2. Team Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiActivity className="text-amber-400" />
              <span>Team Performance Metrics</span>
            </h3>

            {match.statistics && match.statistics.length > 0 ? (
              <div className="space-y-4 pt-2">
                {match.statistics.map((stat, idx) => {
                  const homeVal = parseFloat(stat.home) || 0;
                  const awayVal = parseFloat(stat.away) || 0;
                  const total = homeVal + awayVal || 1;
                  const homePct = Math.round((homeVal / total) * 100);
                  const awayPct = 100 - homePct;

                  return (
                    <div key={idx} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="font-mono text-white text-sm">{stat.home}</span>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400">
                          {stat.type}
                        </span>
                        <span className="font-mono text-white text-sm">{stat.away}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 flex overflow-hidden">
                        <div
                          className="bg-amber-500 transition-all duration-500"
                          style={{ width: `${homePct}%` }}
                        />
                        <div
                          className="bg-blue-600 transition-all duration-500"
                          style={{ width: `${awayPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Detailed game statistics will be available during and after the match.
              </p>
            )}
          </div>
        )}

        {/* 3. Lineups Tab */}
        {activeTab === 'lineups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Home Lineup */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 shadow-xl space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>🏠</span> {homeName} Lineup
              </h4>
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                  Starting Five
                </span>
                <div className="space-y-2 text-xs">
                  {match.lineups?.home_team?.starting_lineups?.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                    >
                      <span className="font-bold text-white">{p.player}</span>
                      <span className="text-[10px] text-slate-400">
                        {p.player_position || 'STARTER'}
                      </span>
                    </div>
                  )) || <p className="text-slate-500 text-xs">Starting lineup not yet submitted</p>}
                </div>

                {match.lineups?.home_team?.substitutes && (
                  <>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block pt-2">
                      Substitutes / Bench
                    </span>
                    <div className="space-y-2 text-xs">
                      {match.lineups.home_team.substitutes.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                        >
                          <span className="text-slate-300">{p.player}</span>
                          <span className="text-[10px] text-slate-500">BENCH</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Away Lineup */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 shadow-xl space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>✈️</span> {awayName} Lineup
              </h4>
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                  Starting Five
                </span>
                <div className="space-y-2 text-xs">
                  {match.lineups?.away_team?.starting_lineups?.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                    >
                      <span className="font-bold text-white">{p.player}</span>
                      <span className="text-[10px] text-slate-400">
                        {p.player_position || 'STARTER'}
                      </span>
                    </div>
                  )) || <p className="text-slate-500 text-xs">Starting lineup not yet submitted</p>}
                </div>

                {match.lineups?.away_team?.substitutes && (
                  <>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block pt-2">
                      Substitutes / Bench
                    </span>
                    <div className="space-y-2 text-xs">
                      {match.lineups.away_team.substitutes.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                        >
                          <span className="text-slate-300">{p.player}</span>
                          <span className="text-[10px] text-slate-500">BENCH</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Player Stats Tab */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            {/* Home Player Stats */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 shadow-xl space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>🏀</span> {homeName} Box Score
              </h4>
              {match.player_statistics?.home_team &&
              match.player_statistics.home_team.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-slate-400 uppercase font-sans font-black">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-2 text-center">PTS</th>
                        <th className="py-2.5 px-2 text-center">REB</th>
                        <th className="py-2.5 px-2 text-center">AST</th>
                        <th className="py-2.5 px-2 text-center">BLK</th>
                        <th className="py-2.5 px-2 text-center">STL</th>
                        <th className="py-2.5 px-2 text-center">MIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {match.player_statistics.home_team.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 font-sans font-bold text-white">{p.player}</td>
                          <td className="py-2.5 px-2 text-center font-black text-amber-400">
                            {p.player_points}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">
                            {p.player_total_rebounds}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">
                            {p.player_assists}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">
                            {p.player_blocks}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">
                            {p.player_steals}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-400">
                            {p.player_minutes}&apos;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Individual player box scores not yet available.
                </p>
              )}
            </div>

            {/* Away Player Stats */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 shadow-xl space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>🏀</span> {awayName} Box Score
              </h4>
              {match.player_statistics?.away_team &&
              match.player_statistics.away_team.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-slate-400 uppercase font-sans font-black">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-2 text-center">PTS</th>
                        <th className="py-2.5 px-2 text-center">REB</th>
                        <th className="py-2.5 px-2 text-center">AST</th>
                        <th className="py-2.5 px-2 text-center">BLK</th>
                        <th className="py-2.5 px-2 text-center">STL</th>
                        <th className="py-2.5 px-2 text-center">MIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {match.player_statistics.away_team.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 font-sans font-bold text-white">{p.player}</td>
                          <td className="py-2.5 px-2 text-center font-black text-amber-400">
                            {p.player_points}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">
                            {p.player_total_rebounds}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">
                            {p.player_assists}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">
                            {p.player_blocks}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-300">
                            {p.player_steals}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-400">
                            {p.player_minutes}&apos;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Individual player box scores not yet available.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5. Head to Head Tab */}
        {activeTab === 'h2h' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiTrendingUp className="text-amber-400" />
              <span>Head-to-Head History</span>
            </h3>
            {h2hData?.H2H && h2hData.H2H.length > 0 ? (
              <div className="space-y-3">
                {h2hData.H2H.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[10px]">
                        {item.event_date}
                      </span>
                      <span className="text-slate-400 font-semibold">• {item.league_name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white text-right">
                        {item.event_home_team}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#060D18] font-mono font-black text-amber-400">
                        {item.event_final_result}
                      </span>
                      <span className="font-bold text-white text-left">{item.event_away_team}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Historical matchups between these two clubs are currently being compiled.
              </p>
            )}
          </div>
        )}

        {/* 6. Odds Tab */}
        {activeTab === 'odds' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiDollarSign className="text-emerald-400" />
              <span>Market Odds & Probabilities</span>
            </h3>

            {oddsData && Object.keys(oddsData).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(oddsData).map(([marketKey, marketVal]: [string, any]) => (
                  <div
                    key={marketKey}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3"
                  >
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      {marketKey}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(marketVal).map(([subKey, subVal]: [string, any]) => (
                        <div
                          key={subKey}
                          className="p-2.5 rounded-xl bg-[#060D18] border border-white/5 flex items-center justify-between"
                        >
                          <span className="text-slate-400 text-xs">{subKey}</span>
                          <span className="font-mono font-black text-emerald-400 text-sm">
                            {typeof subVal === 'object'
                              ? (Object.values(subVal)[0] as any)
                              : String(subVal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Real-time betting markets and lines will update closer to tip-off.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
