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
      className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isLive
          ? 'border-amber-500/40 bg-[#1A2333] shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          : 'border-white/10 bg-[#141C2B] hover:border-white/20'
      }`}
    >
      {/* Series/Tournament Header */}
      {!hideLeague && (
        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2 text-xs">
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-2 truncate"
          >
            <span className="text-amber-400">🏏</span>
            {match.event_type && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/20">
                {match.event_type}
              </span>
            )}
            <Link
              href={`/cricket/series/${match.league_key}`}
              className="font-semibold text-slate-400 hover:text-white truncate transition-colors"
            >
              {match.league_name || 'Cricket Series'}
            </Link>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              <span>LIVE</span>
            </span>
          ) : (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isFinished ? 'bg-slate-700/50 text-slate-400' : 'bg-white/5 text-slate-300'
              }`}
            >
              {statusDisplay}
            </span>
          )}
        </div>
      )}

      {/* Teams and Scores Grid */}
      <div className="flex items-center justify-between gap-2">
        {/* Home Team */}
        <div className="flex flex-1 items-center space-x-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 p-1 border border-white/10 overflow-hidden">
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
            <span className="text-sm font-bold text-slate-100 line-clamp-1 block">
              {homeName}
            </span>
            {match.event_home_final_result ? (
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xs font-black text-amber-400 tabular-nums">
                  {match.event_home_final_result}
                </span>
                {match.event_home_rr && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    (RR: {match.event_home_rr})
                  </span>
                )}
              </div>
            ) : isUpcoming ? (
              <span className="text-[10px] text-slate-500 font-medium">Yet to bat</span>
            ) : null}
          </div>
        </div>

        {/* Center Status / Time */}
        <div className="mx-2 flex flex-col items-center justify-center shrink-0 min-w-[50px]">
          {isUpcoming ? (
            <span className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
              {formattedTime}
            </span>
          ) : isLive ? (
            <div className="rounded bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-center">
              <span className="text-[11px] font-black tracking-wider text-amber-400">
                INNINGS
              </span>
            </div>
          ) : (
            <div className="rounded bg-black/30 px-2.5 py-1 text-center">
              <span className="text-xs font-bold text-slate-400">VS</span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-1 items-center justify-end space-x-3 text-right min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold text-slate-100 line-clamp-1 block">
              {awayName}
            </span>
            {match.event_away_final_result ? (
              <div className="flex items-baseline justify-end space-x-1.5 mt-0.5">
                {match.event_away_rr && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    (RR: {match.event_away_rr})
                  </span>
                )}
                <span className="text-xs font-black text-amber-400 tabular-nums">
                  {match.event_away_final_result}
                </span>
              </div>
            ) : isUpcoming ? (
              <span className="text-[10px] text-slate-500 font-medium">Yet to bat</span>
            ) : null}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 p-1 border border-white/10 overflow-hidden">
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

      {/* Match Status / Toss / Outcome Information Bar */}
      {match.event_status_info && (
        <div className="mt-3 pt-2 border-t border-white/5">
          <p
            className={`text-xs font-semibold text-center truncate ${
              isLive ? 'text-amber-400 animate-pulse' : 'text-slate-400'
            }`}
          >
            {match.event_status_info}
          </p>
        </div>
      )}
    </div>
  );
}
