'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buildMatchSlug, footballRoutes, slugify } from '@/lib/slugUtils';

export interface UnifiedWebMatchEvent {
  event_key: string | number;
  event_date?: string;
  event_time?: string;
  event_status?: string;
  event_live?: string | number;
  event_home_team: string;
  home_team_key?: string | number;
  home_team_logo?: string;
  event_away_team: string;
  away_team_key?: string | number;
  away_team_logo?: string;
  event_final_result?: string;
  event_ft_result?: string;
  league_name?: string;
  league_key?: string | number;
  league_logo?: string;
  country_name?: string;
}

interface FootballMatchCardProps {
  event: UnifiedWebMatchEvent;
  onPress?: () => void;
  hideLeague?: boolean;
}

export function FootballMatchCard({ event, onPress, hideLeague = false }: FootballMatchCardProps) {
  const router = useRouter();

  const isLive =
    event.event_live === '1' ||
    event.event_live === 1 ||
    event.event_status === '1H' ||
    event.event_status === '2H' ||
    event.event_status === 'HT' ||
    event.event_status === 'ET' ||
    event.event_status === 'P' ||
    event.event_status === 'LIVE';

  const isFinished =
    event.event_status?.toLowerCase() === 'finished' ||
    event.event_status === 'FT' ||
    event.event_status === 'AET' ||
    event.event_status === 'AP' ||
    event.event_status === 'PEN';

  const formattedKickoff = useMemo(() => {
    if (!event.event_time && !event.event_date) return 'TBD';
    if (event.event_time) {
      return event.event_time.slice(0, 5);
    }
    return event.event_date;
  }, [event.event_time, event.event_date]);

  const statusDisplay = useMemo(() => {
    if (isLive) {
      if (event.event_status === 'HT') return 'HT';
      if (!isNaN(Number(event.event_status))) return `${event.event_status}'`;
      return 'LIVE';
    }
    if (isFinished) {
      return event.event_status === 'Finished' ? 'FT' : event.event_status || 'FT';
    }
    return formattedKickoff;
  }, [isLive, isFinished, event.event_status, formattedKickoff]);

  const scoreDisplay = useMemo(() => {
    if (isFinished || isLive) {
      if (event.event_final_result && event.event_final_result !== '-') {
        return event.event_final_result;
      }
      if (event.event_ft_result && event.event_ft_result !== '-') {
        return event.event_ft_result;
      }
      return '0 - 0';
    }
    return 'VS';
  }, [isFinished, isLive, event.event_final_result, event.event_ft_result]);

  const matchSlug = useMemo(() => buildMatchSlug(event), [event]);

  const handleClick = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(footballRoutes.match(matchSlug));
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
            {event.league_logo ? (
              <img
                src={event.league_logo}
                alt={event.league_name || 'League'}
                className="h-3.5 w-3.5 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-blue-400 text-xs">⚽</span>
            )}
            <span className="font-bold text-[11px] text-slate-300 group-hover:text-white transition-colors truncate">
              {event.league_name || 'Football Match'}
            </span>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1 rounded-full border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-300 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
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

      {/* Match Body */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-3 relative z-10">
        {/* Home Team */}
        <Link
          href={footballRoutes.teamFromName(event.event_home_team)}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 hover:text-blue-400 transition-colors"
        >
          <div className="h-5.5 w-5.5 sm:h-7 sm:w-7 rounded bg-slate-900/80 border border-white/10 p-0.5 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400/40 transition-colors">
            {event.home_team_logo ? (
              <img
                src={event.home_team_logo}
                alt={event.event_home_team}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-[7px] sm:text-[9px] font-black text-blue-400">
                {event.event_home_team.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <span className="font-bold text-[11px] sm:text-xs text-white truncate group-hover:text-blue-300 transition-colors">
            {event.event_home_team}
          </span>
        </Link>

        {/* Score / VS Center Badge */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-1 sm:gap-0 px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-[#091220] sm:bg-slate-950/90 border border-blue-500/30 flex-shrink-0 min-w-[50px] sm:min-w-[60px] text-center shadow-inner group-hover:border-blue-400/60 transition-colors">
          <span
            className={`font-black tracking-tight leading-none text-xs sm:text-base ${
              isLive
                ? 'text-sm sm:text-base text-blue-400'
                : isFinished
                  ? 'text-sm sm:text-base text-white'
                  : 'text-xs text-blue-300'
            }`}
          >
            {scoreDisplay}
          </span>
          <span className={`text-[8px] font-bold uppercase sm:mt-0.5 ${
            isLive ? 'text-blue-300' : 'text-slate-400'
          }`}>
            {statusDisplay}
          </span>
        </div>

        {/* Away Team */}
        <Link
          href={footballRoutes.teamFromName(event.event_away_team)}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-end space-x-1.5 sm:space-x-2 min-w-0 text-right hover:text-blue-400 transition-colors"
        >
          <span className="font-bold text-[11px] sm:text-xs text-white truncate group-hover:text-blue-300 transition-colors">
            {event.event_away_team}
          </span>
          <div className="h-5.5 w-5.5 sm:h-7 sm:w-7 rounded bg-slate-900/80 border border-white/10 p-0.5 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400/40 transition-colors">
            {event.away_team_logo ? (
              <img
                src={event.away_team_logo}
                alt={event.event_away_team}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-[7px] sm:text-[9px] font-black text-blue-400">
                {event.event_away_team.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

