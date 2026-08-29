'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface UnifiedWebMatchEvent {
  event_key: string | number;
  event_date?: string;
  event_time?: string;
  event_status?: string;
  event_live?: string;
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

  const handleClick = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/matches/${event.event_key}`);
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
      {/* Ambient subtle glow for live matches */}
      {isLive && (
        <div className="absolute top-0 right-0 w-32 h-16 bg-amber-500/10 blur-2xl pointer-events-none -z-0" />
      )}

      {/* League Header */}
      {!hideLeague && (
        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2.5 text-xs">
          <div className="flex items-center space-x-2 truncate">
            {event.league_logo ? (
              <img
                src={event.league_logo}
                alt={event.league_name || 'League'}
                className="h-4 w-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-amber-400 text-xs">⚽</span>
            )}
            <span className="font-bold text-slate-300 group-hover:text-white transition-colors truncate">
              {event.league_name || 'Football Match'}
            </span>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{statusDisplay}</span>
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

      {/* Match Body */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 relative z-10">
        {/* Home Team */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-900/80 border border-white/10 p-1 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400/40 transition-colors">
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
              <span className="text-[10px] font-black text-blue-400">
                {event.event_home_team.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-blue-300 transition-colors">
            {event.event_home_team}
          </span>
        </div>

        {/* Score & VS Pill */}
        <div className="flex flex-col items-center justify-center px-2.5 sm:px-3.5 py-1 rounded-xl bg-slate-950/90 border border-amber-500/30 min-w-[62px] sm:min-w-[74px] text-center shadow-inner">
          <span
            className={`font-black tracking-tight leading-none ${
              isLive
                ? 'text-base sm:text-lg text-amber-400'
                : isFinished
                  ? 'text-base sm:text-lg text-white'
                  : 'text-xs sm:text-sm text-slate-400'
            }`}
          >
            {scoreDisplay}
          </span>
          {isLive && (
            <span className="text-[9px] font-bold text-amber-300/90 mt-0.5 animate-pulse">
              LIVE
            </span>
          )}
          {isFinished && (
            <span className="text-[8px] font-bold uppercase text-slate-400 mt-0.5">
              Full Time
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 min-w-0 text-right">
          <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-blue-300 transition-colors">
            {event.event_away_team}
          </span>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-900/80 border border-white/10 p-1 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400/40 transition-colors">
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
              <span className="text-[10px] font-black text-amber-400">
                {event.event_away_team.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
