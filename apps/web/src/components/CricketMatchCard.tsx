'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CricketEvent } from '@goalmills/types';

interface CricketMatchCardProps {
  match: CricketEvent;
  onPress?: () => void;
  hideLeague?: boolean;
}

export function CricketMatchCard({ match, onPress, hideLeague = false }: CricketMatchCardProps) {
  const router = useRouter();
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);

  const isLive = match.event_live === '1' || match.event_status?.toLowerCase().includes('live');
  const isFinished =
    match.event_status === 'Finished' ||
    match.event_status === 'FT' ||
    match.event_status?.toLowerCase().includes('won') ||
    match.event_status?.toLowerCase().includes('complete');
  const isUpcoming = !isLive && !isFinished;

  const homeName = match.event_home_team || 'TBC';
  const awayName = match.event_away_team || 'TBC';

  const formattedTime = useMemo(() => {
    if (match.event_time) return match.event_time.slice(0, 5);
    return match.event_date_start || 'TBD';
  }, [match.event_time, match.event_date_start]);

  const statusDisplay = useMemo(() => {
    if (isLive) return 'LIVE';
    if (isFinished) return 'FT';
    return formattedTime;
  }, [isLive, isFinished, formattedTime]);

  const handleClick = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/cricket/matches/${match.event_key}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative cursor-pointer rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isLive
          ? 'border-amber-500/40 bg-gradient-to-r from-[#0C1A30] via-[#0E203C] to-[#0C1A30] shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-400'
          : 'border-blue-500/15 bg-[#0A1424]/90 hover:border-blue-400/40 hover:bg-[#0E1D34]'
      }`}
    >
      {/* Ambient glow for live games */}
      {isLive && (
        <div className="absolute top-0 right-0 w-32 h-16 bg-amber-500/10 blur-2xl pointer-events-none -z-0" />
      )}

      {/* Series/Tournament Header */}
      {!hideLeague && (
        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2.5 text-xs">
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-2 truncate"
          >
            <span className="text-amber-400">🏏</span>
            {match.event_type && (
              <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-300 border border-blue-500/20">
                {match.event_type}
              </span>
            )}
            <Link
              href={`/cricket/series/${match.league_key}`}
              className="font-bold text-slate-300 hover:text-amber-300 truncate transition-colors"
            >
              {match.league_name || 'Cricket Tournament'}
            </Link>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>LIVE</span>
            </span>
          ) : (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
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
      <div className="flex items-center justify-between gap-3 relative z-10">
        {/* Home Team */}
        <div className="flex flex-1 items-center space-x-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 border border-white/10 p-1 overflow-hidden shadow-inner group-hover:border-blue-400/40 transition-colors">
            {match.event_home_team_logo && !homeImgError ? (
              <img
                src={match.event_home_team_logo}
                alt={homeName}
                className="h-full w-full object-contain"
                onError={() => setHomeImgError(true)}
              />
            ) : (
              <span className="text-xs font-black text-amber-400">{homeName.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 truncate block transition-colors">
              {homeName}
            </span>
            {match.event_home_final_result ? (
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-black text-amber-400 tabular-nums">
                  {match.event_home_final_result}
                </span>
                {match.event_home_rr && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    (RR: {match.event_home_rr})
                  </span>
                )}
              </div>
            ) : isUpcoming ? (
              <span className="text-[10px] text-slate-400 font-medium">Yet to bat</span>
            ) : null}
          </div>
        </div>

        {/* Center Status / Time Pill */}
        <div className="mx-2 flex flex-col items-center justify-center shrink-0 min-w-[58px] sm:min-w-[68px] px-2.5 py-1 rounded-xl bg-slate-950/90 border border-amber-500/30 text-center shadow-inner">
          {isUpcoming ? (
            <span className="text-xs font-black text-slate-300">
              {formattedTime}
            </span>
          ) : isLive ? (
            <div className="text-center">
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-amber-400 block leading-tight">
                INNINGS
              </span>
              <span className="text-[8px] font-bold text-amber-300 uppercase tracking-widest">
                BALL BY BALL
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">
              RESULT
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-1 items-center justify-end space-x-3 min-w-0 text-right">
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 truncate block transition-colors">
              {awayName}
            </span>
            {match.event_away_final_result ? (
              <div className="flex items-baseline justify-end space-x-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-black text-amber-400 tabular-nums">
                  {match.event_away_final_result}
                </span>
                {match.event_away_rr && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    (RR: {match.event_away_rr})
                  </span>
                )}
              </div>
            ) : isUpcoming ? (
              <span className="text-[10px] text-slate-400 font-medium">Yet to bat</span>
            ) : null}
          </div>
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 border border-white/10 p-1 overflow-hidden shadow-inner group-hover:border-blue-400/40 transition-colors">
            {match.event_away_team_logo && !awayImgError ? (
              <img
                src={match.event_away_team_logo}
                alt={awayName}
                className="h-full w-full object-contain"
                onError={() => setAwayImgError(true)}
              />
            ) : (
              <span className="text-xs font-black text-amber-400">{awayName.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Match Result / Status Footer */}
      {match.event_status && match.event_status !== 'Finished' && match.event_status !== 'FT' && (
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
          <span className="font-semibold text-amber-300 truncate">{match.event_status}</span>
          {match.event_toss && (
            <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
              🪙 {match.event_toss}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
