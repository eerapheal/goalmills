'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { extractEventKeyFromSlug, footballRoutes, slugify } from '@/lib/slugUtils';
import { BackButton } from '@/components/BackButton';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import type { FootballEvent } from '@goalmills/types';

export default function FootballMatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const eventKey = extractEventKeyFromSlug(slug);

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<FootballEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        setLoading(true);
        // Fetch fixture by match ID
        const res = await advancedFootballApi.getFixtures({ matchId: eventKey });
        if (res?.result && Array.isArray(res.result) && res.result.length > 0) {
          setMatch(res.result[0]);
        } else {
          setError('Match not found');
        }
      } catch (err) {
        console.error('Error loading match:', err);
        setError('Failed to load match data');
      } finally {
        setLoading(false);
      }
    };

    if (eventKey) loadMatch();
  }, [eventKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex items-center justify-center">
        <GoalmillsLoader />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Match Not Found</h1>
        <p className="text-slate-400 mb-6">{error || 'This match could not be loaded.'}</p>
        <BackButton className="mt-4" />
      </div>
    );
  }

  const isLive =
    match.event_live === '1' ||
    ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(match.event_status || '') ||
    !isNaN(Number(match.event_status));

  const isFinished = match.event_status === 'Finished' || match.event_status === 'FT' || match.event_status === 'AET';

  const homeTeamSlug = slugify(match.event_home_team || '');
  const awayTeamSlug = slugify(match.event_away_team || '');

  return (
    <div className="min-h-screen bg-[#070a1a] pt-[90px] pb-20">
      {/* Match Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B1526] to-[#070a1a] border-b border-white/5 py-8 px-4">
        <BackButton className="absolute top-4 left-4 z-20" />

        {/* League Info Bar */}
        <div className="max-w-4xl mx-auto text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider">
            {match.league_logo && (
              <img src={match.league_logo} alt="" className="w-4 h-4 object-contain" />
            )}
            <span>{match.league_name}</span>
            {match.league_round && <span className="text-slate-400">• {match.league_round}</span>}
          </div>
        </div>

        {/* Scoreboard */}
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 sm:gap-8">
          {/* Home Team */}
          <Link
            href={footballRoutes.teamFromName(match.event_home_team || '')}
            className="flex flex-col items-center gap-3 flex-1 max-w-[200px] group"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center group-hover:border-blue-400 transition-colors">
              {match.home_team_logo ? (
                <img src={match.home_team_logo} alt={match.event_home_team} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl font-black text-white">{(match.event_home_team || 'H')[0]}</span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-white text-center group-hover:text-blue-400 transition-colors">
              {match.event_home_team}
            </span>
          </Link>

          {/* Score */}
          <div className="flex flex-col items-center gap-2">
            {isLive && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black uppercase animate-pulse">
                LIVE {match.event_status}&apos;
              </span>
            )}
            <div className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono">
              {match.event_final_result || match.event_ft_result || '- : -'}
            </div>
            {match.event_halftime_result && (
              <span className="text-[10px] text-slate-400">HT: {match.event_halftime_result}</span>
            )}
            {!isLive && !isFinished && (
              <span className="text-xs text-amber-400 font-bold">
                {match.event_date} • {match.event_time}
              </span>
            )}
            {isFinished && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                Full Time
              </span>
            )}
          </div>

          {/* Away Team */}
          <Link
            href={footballRoutes.teamFromName(match.event_away_team || '')}
            className="flex flex-col items-center gap-3 flex-1 max-w-[200px] group"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center group-hover:border-blue-400 transition-colors">
              {match.away_team_logo ? (
                <img src={match.away_team_logo} alt={match.event_away_team} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl font-black text-white">{(match.event_away_team || 'A')[0]}</span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-white text-center group-hover:text-blue-400 transition-colors">
              {match.event_away_team}
            </span>
          </Link>
        </div>

        {/* Match Info Badges */}
        <div className="max-w-4xl mx-auto mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-400">
          {match.event_stadium && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
              🏟️ {match.event_stadium}
            </span>
          )}
          {match.event_referee && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
              🟨 {match.event_referee}
            </span>
          )}
          {match.country_name && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
              📍 {match.country_name}
            </span>
          )}
        </div>
      </div>

      {/* Match Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Goal Scorers */}
        {match.goalscorers && match.goalscorers.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-[#0B1526]/50 p-5 space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>⚽</span> Goals
            </h3>
            <div className="space-y-2">
              {match.goalscorers.map((goal: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono font-bold w-8">{goal.time}&apos;</span>
                    <Link
                      href={footballRoutes.playerFromName(goal.home_scorer || goal.away_scorer || '')}
                      className="text-white hover:text-blue-400 font-bold transition-colors"
                    >
                      {goal.home_scorer || goal.away_scorer}
                    </Link>
                    {goal.home_assist && (
                      <span className="text-slate-400">
                        (assist:{' '}
                        <Link href={footballRoutes.playerFromName(goal.home_assist)} className="hover:text-blue-400 transition-colors">
                          {goal.home_assist}
                        </Link>
                        )
                      </span>
                    )}
                    {goal.away_assist && (
                      <span className="text-slate-400">
                        (assist:{' '}
                        <Link href={footballRoutes.playerFromName(goal.away_assist)} className="hover:text-blue-400 transition-colors">
                          {goal.away_assist}
                        </Link>
                        )
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 font-mono">{goal.score}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cards */}
        {match.cards && match.cards.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-[#0B1526]/50 p-5 space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>🟨</span> Cards
            </h3>
            <div className="space-y-2">
              {match.cards.map((card: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="font-mono font-bold text-slate-400 w-8">{card.time}&apos;</span>
                  <span className={`w-3 h-4 rounded-sm ${card.card === 'yellow card' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                  <Link
                    href={footballRoutes.playerFromName(card.home_fault || card.away_fault || '')}
                    className="text-white hover:text-blue-400 font-bold transition-colors"
                  >
                    {card.home_fault || card.away_fault}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lineups */}
        {match.lineups && (match.lineups.home_team || match.lineups.away_team) && (
          <section className="rounded-2xl border border-white/10 bg-[#0B1526]/50 p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Lineups
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Lineup */}
              {match.lineups.home_team && (
                <div>
                  <h4 className="text-xs font-bold text-blue-400 mb-3 uppercase">{match.event_home_team} Starting XI</h4>
                  <div className="space-y-1.5">
                    {(match.lineups.home_team.starting_lineups || []).map((p: any, i: number) => (
                      <Link
                        key={i}
                        href={footballRoutes.playerFromName(p.player || '')}
                        className="flex items-center gap-2 text-xs text-white hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                      >
                        <span className="text-slate-500 font-mono w-6">{p.player_number}</span>
                        <span className="font-bold">{p.player}</span>
                        {p.player_position && <span className="text-slate-500 text-[10px]">({p.player_position})</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Away Team Lineup */}
              {match.lineups.away_team && (
                <div>
                  <h4 className="text-xs font-bold text-amber-400 mb-3 uppercase">{match.event_away_team} Starting XI</h4>
                  <div className="space-y-1.5">
                    {(match.lineups.away_team.starting_lineups || []).map((p: any, i: number) => (
                      <Link
                        key={i}
                        href={footballRoutes.playerFromName(p.player || '')}
                        className="flex items-center gap-2 text-xs text-white hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                      >
                        <span className="text-slate-500 font-mono w-6">{p.player_number}</span>
                        <span className="font-bold">{p.player}</span>
                        {p.player_position && <span className="text-slate-500 text-[10px]">({p.player_position})</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Match Statistics */}
        {match.statistics && match.statistics.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-[#0B1526]/50 p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>📊</span> Match Statistics
            </h3>
            <div className="space-y-3">
              {match.statistics.map((stat: any, i: number) => {
                const homeVal = parseInt(stat.home || '0');
                const awayVal = parseInt(stat.away || '0');
                const total = homeVal + awayVal || 1;
                const homePercent = (homeVal / total) * 100;
                const awayPercent = (awayVal / total) * 100;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-bold">{stat.home}</span>
                      <span className="text-slate-400 text-[10px] uppercase">{stat.type}</span>
                      <span className="text-white font-bold">{stat.away}</span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
                      <div className="bg-blue-500 rounded-l-full" style={{ width: `${homePercent}%` }} />
                      <div className="bg-amber-500 rounded-r-full" style={{ width: `${awayPercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
