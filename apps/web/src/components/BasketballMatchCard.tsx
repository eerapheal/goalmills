'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BasketballEvent } from '@goalmills/types';
import { basketballRoutes, buildMatchSlug } from '@/lib/slugUtils';

interface BasketballMatchCardProps {
  match: BasketballEvent;
  onPress?: () => void;
  hideLeague?: boolean;
}

export function BasketballMatchCard({
  match,
  onPress,
  hideLeague = false,
}: BasketballMatchCardProps) {
  const router = useRouter();

  const isLive =
    match?.event_live === '1' ||
    match?.event_live === (1 as any) ||
    ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter', 'Overtime', 'Halftime', 'LIVE', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'HT'].includes(
      match?.event_status || match?.event_quarter || ''
    );

  const isFinished =
    match?.event_status?.toLowerCase() === 'finished' ||
    match?.event_status === 'FT' ||
    match?.event_status === 'AOT';

  const isUpcoming = !isLive && !isFinished;

  // Extract score parts from event_final_result ("114 - 107") or scores object
  const { homeScore, awayScore } = useMemo(() => {
    if (match?.event_final_result && match.event_final_result.includes('-')) {
      const parts = match.event_final_result.split('-');
      return {
        homeScore: parts[0]?.trim() || '0',
        awayScore: parts[1]?.trim() || '0',
      };
    }

    // Fallback: calculate from scores quarters if final is not yet populated
    if (match?.scores) {
      const quarters = ['1stQuarter', '2ndQuarter', '3rdQuarter', '4thQuarter', 'Overtime'] as const;
      let hTotal = 0;
      let aTotal = 0;
      let hasScores = false;

      quarters.forEach((q) => {
        const qArr = match.scores?.[q as keyof typeof match.scores];
        if (Array.isArray(qArr) && qArr[0]) {
          const h = parseInt(qArr[0].score_home || '0', 10);
          const a = parseInt(qArr[0].score_away || '0', 10);
          if (!isNaN(h) && !isNaN(a)) {
            hTotal += h;
            aTotal += a;
            hasScores = true;
          }
        }
      });

      if (hasScores) {
        return { homeScore: String(hTotal), awayScore: String(aTotal) };
      }
    }

    return { homeScore: '-', awayScore: '-' };
  }, [match?.event_final_result, match?.scores]);

  const statusDisplay = useMemo(() => {
    if (isLive) {
      const q = match?.event_quarter || match?.event_status || 'LIVE';
      return q.replace(/Quarter/i, 'Q').toUpperCase();
    }
    if (isFinished) {
      return match?.event_status === 'AOT' ? 'FT (OT)' : 'FINAL';
    }
    return match?.event_time?.slice(0, 5) || match?.event_date || 'TBD';
  }, [isLive, isFinished, match?.event_quarter, match?.event_status, match?.event_time, match?.event_date]);

  const matchSlug = useMemo(() => {
    return buildMatchSlug({
      event_home_team: match?.event_home_team,
      event_away_team: match?.event_away_team,
      event_date: match?.event_date,
      event_key: match?.event_key,
    });
  }, [match]);

  const handleClick = () => {
    if (onPress) {
      onPress();
    } else if (match?.event_key) {
      router.push(basketballRoutes.match(matchSlug));
    }
  };

  const homeName = match?.event_home_team || 'Home';
  const awayName = match?.event_away_team || 'Away';

  return (
    <div
      onClick={handleClick}
      className={`group relative cursor-pointer rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isLive
          ? 'border-amber-500/40 bg-gradient-to-br from-[#0B1526] via-[#0E1D38] to-[#0A1322] shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-400'
          : 'border-blue-500/20 bg-[#091322]/90 hover:border-blue-400/40 hover:bg-[#0C1A30]'
      }`}
    >
      {/* Ambient subtle glow for live games */}
      {isLive && (
        <div className="absolute top-0 right-0 w-32 h-16 bg-amber-500/10 blur-2xl pointer-events-none -z-0" />
      )}

      {/* League Header */}
      {!hideLeague && (
        <div className="mb-2.5 flex items-center justify-between border-b border-white/5 pb-2 text-xs">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="text-amber-400 text-xs">🏀</span>
            <span className="font-bold text-[11px] text-slate-300 group-hover:text-white truncate transition-colors">
              {match?.league_name || 'Basketball League'}
            </span>
            {match?.country_name && (
              <span className="text-[10px] text-slate-500 hidden sm:inline truncate">
                • {match.country_name}
              </span>
            )}
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{statusDisplay}</span>
            </span>
          ) : (
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                isFinished
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-500/20'
                  : 'bg-white/5 text-slate-300 border border-white/10'
              }`}
            >
              {statusDisplay}
            </span>
          )}
        </div>
      )}

      {/* Teams and Scores Grid */}
      <div className="space-y-2">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden group-hover:border-amber-400/40 transition-colors">
              {match?.event_home_team_logo ? (
                <img
                  src={match.event_home_team_logo}
                  alt={homeName}
                  className="h-full w-full object-contain p-0.5"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-slate-400">{homeName.charAt(0)}</span>
              )}
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white truncate transition-colors">
              {homeName}
            </span>
          </div>

          <span
            className={`font-mono font-black text-sm sm:text-base tabular-nums pl-2 ${
              isLive
                ? 'text-amber-400'
                : isFinished
                  ? Number(homeScore) > Number(awayScore)
                    ? 'text-white'
                    : 'text-slate-400'
                  : 'text-slate-500'
            }`}
          >
            {isUpcoming ? '-' : homeScore}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden group-hover:border-amber-400/40 transition-colors">
              {match?.event_away_team_logo ? (
                <img
                  src={match.event_away_team_logo}
                  alt={awayName}
                  className="h-full w-full object-contain p-0.5"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-slate-400">{awayName.charAt(0)}</span>
              )}
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white truncate transition-colors">
              {awayName}
            </span>
          </div>

          <span
            className={`font-mono font-black text-sm sm:text-base tabular-nums pl-2 ${
              isLive
                ? 'text-amber-400'
                : isFinished
                  ? Number(awayScore) > Number(homeScore)
                    ? 'text-white'
                    : 'text-slate-400'
                  : 'text-slate-500'
            }`}
          >
            {isUpcoming ? '-' : awayScore}
          </span>
        </div>
      </div>

      {/* Quarter Breakdown Mini-Tally (Shown on hover or live) */}
      {match?.scores && (isLive || isFinished) && (
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Quarters</span>
          <div className="flex items-center gap-2">
            {['1stQuarter', '2ndQuarter', '3rdQuarter', '4thQuarter'].map((q, idx) => {
              const qScore = match.scores?.[q as keyof typeof match.scores]?.[0];
              if (!qScore) return null;
              return (
                <span key={q} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                  Q{idx + 1}: {qScore.score_home}-{qScore.score_away}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info / SEO Link */}
      <div className="mt-2 flex items-center justify-end text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors">
        <span className="flex items-center gap-1 font-semibold">
          Game Center →
        </span>
      </div>
    </div>
  );
}

export default BasketballMatchCard;
