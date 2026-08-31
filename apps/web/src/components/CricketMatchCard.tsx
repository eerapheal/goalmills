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
      className={`group relative cursor-pointer rounded-xl border p-2 sm:p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isLive
          ? 'border-blue-500/40 bg-gradient-to-r from-[#0C1A30] via-[#0E203C] to-[#0C1A30] shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-400'
          : 'border-blue-500/15 bg-[#0A1424]/90 hover:border-blue-400/40 hover:bg-[#0E1D34]'
      }`}
    >
      {/* Ambient subtle glow for live matches */}
      {isLive && (
        <div className="absolute top-0 right-0 w-32 h-16 bg-blue-500/10 blur-2xl pointer-events-none -z-0" />
      )}

      {/* League Header - Hidden on mobile viewports for clean look */}
      {!hideLeague && (
        <div className="hidden sm:flex mb-2 items-center justify-between border-b border-white/5 pb-1.5 text-xs">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="text-blue-400 text-xs">🏏</span>
            <Link
              href={match.league_key ? `/cricket/series/${match.league_key}` : `/cricket`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-[11px] text-slate-300 hover:text-white transition-colors truncate"
            >
              {match.league_name || 'Cricket Tournament'}
            </Link>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1 rounded-full border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-300 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>LIVE</span>
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
      <div className="flex items-center justify-between gap-1.5 sm:gap-3 relative z-10">
        {/* Home Team */}
        <div className="flex flex-1 items-center space-x-1.5 sm:space-x-2 min-w-0">
          <div className="flex h-5.5 w-5.5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded bg-slate-900/80 border border-white/10 p-0.5 overflow-hidden shadow-inner group-hover:border-blue-400/40 transition-colors">
            {match.event_away_team_logo && !homeImgError ? (
              <img
                src={match.event_home_team_logo}
                alt={homeName}
                className="h-full w-full object-contain"
                onError={() => setHomeImgError(true)}
              />
            ) : (
              <span className="text-[8px] sm:text-[10px] font-black text-blue-400">{homeName.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-blue-300 truncate block transition-colors">
              {homeName}
            </span>
            {match.event_home_final_result ? (
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-[10px] sm:text-xs font-black text-blue-400 tabular-nums">
                  {match.event_home_final_result}
                </span>
                {match.event_home_rr && (
                  <span className="hidden sm:inline text-[9px] text-slate-400 font-medium">
                    (RR: {match.event_home_rr})
                  </span>
                )}
              </div>
            ) : isUpcoming ? (
              <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">Yet to bat</span>
            ) : null}
          </div>
        </div>

        {/* Center Status / Time Pill */}
        <div className="mx-1 sm:mx-1.5 flex flex-col items-center justify-center shrink-0 min-w-[46px] sm:min-w-[58px] px-1 sm:px-2 py-0.5 rounded bg-[#091220] sm:bg-slate-950/90 border border-blue-500/30 text-center shadow-inner">
          {isUpcoming ? (
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">
              {formattedTime}
            </span>
          ) : isLive ? (
            <div className="text-center">
              <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-blue-400 block leading-tight">
                INNINGS
              </span>
              <span className="text-[6px] sm:text-[7px] font-bold text-blue-300 uppercase tracking-widest hidden sm:block">
                LIVE OVERS
              </span>
            </div>
          ) : (
            <span className="text-[8px] sm:text-[9px] font-black uppercase text-blue-300 tracking-wider">
              RESULT
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-1 items-center justify-end space-x-1.5 sm:space-x-2 min-w-0 text-right">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-blue-300 truncate block transition-colors">
              {awayName}
            </span>
            {match.event_away_final_result ? (
              <div className="flex items-baseline justify-end space-x-1 mt-0.5">
                <span className="text-[10px] sm:text-xs font-black text-blue-400 tabular-nums">
                  {match.event_away_final_result}
                </span>
                {match.event_away_rr && (
                  <span className="hidden sm:inline text-[9px] text-slate-400 font-medium">
                    (RR: {match.event_away_rr})
                  </span>
                )}
              </div>
            ) : isUpcoming ? (
              <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">Yet to bat</span>
            ) : null}
          </div>
          <div className="flex h-5.5 w-5.5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded bg-slate-900/80 border border-white/10 p-0.5 overflow-hidden shadow-inner group-hover:border-blue-400/40 transition-colors">
            {match.event_away_team_logo && !awayImgError ? (
              <img
                src={match.event_away_team_logo}
                alt={awayName}
                className="h-full w-full object-contain"
                onError={() => setAwayImgError(true)}
              />
            ) : (
              <span className="text-[8px] sm:text-[10px] font-black text-blue-400">{awayName.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Match Result / Status Footer */}
      {(match.event_status_info || (match.event_status && match.event_status !== 'Finished' && match.event_status !== 'FT')) && (
        <div className="hidden sm:flex mt-2.5 pt-2 border-t border-white/5 items-center justify-between text-[11px] text-slate-300">
          <span className="font-semibold text-blue-300 truncate">
            {match.event_status_info || match.event_status}
          </span>
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
