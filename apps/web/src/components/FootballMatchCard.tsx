'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
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

  const isUpcoming = !isLive && !isFinished;

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
    return 'vs';
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
      className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isLive
          ? 'border-emerald-500/40 bg-[#162234] shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : 'border-white/10 bg-[#141C2B] hover:border-white/20'
      }`}
    >
      {/* League Header */}
      {!hideLeague && (
        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2 text-xs">
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
              <span className="text-blue-400">🏆</span>
            )}
            <span className="font-semibold text-slate-400 truncate">
              {event.league_name || 'Football'}
            </span>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span>{statusDisplay}</span>
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

      {/* Match Body */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Home Team */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {event.home_team_logo ? (
            <img
              src={event.home_team_logo}
              alt={event.event_home_team}
              className="h-7 w-7 sm:h-9 sm:w-9 object-contain flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/5 text-xs text-slate-400 flex-shrink-0">
              🛡️
            </div>
          )}
          <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
            {event.event_home_team}
          </span>
        </div>

        {/* Center Score */}
        <div className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[70px] flex-shrink-0">
          {isUpcoming ? (
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-slate-300">
              {formattedKickoff}
            </span>
          ) : (
            <div className="rounded-lg bg-black/40 border border-white/5 px-2.5 py-0.5 sm:px-3 sm:py-1 text-center shadow-inner">
              <span
                className={`text-base sm:text-lg font-black tracking-wider ${
                  isLive ? 'text-emerald-400' : 'text-slate-100'
                }`}
              >
                {scoreDisplay}
              </span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 text-right min-w-0">
          <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
            {event.event_away_team}
          </span>
          {event.away_team_logo ? (
            <img
              src={event.away_team_logo}
              alt={event.event_away_team}
              className="h-7 w-7 sm:h-9 sm:w-9 object-contain flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/5 text-xs text-slate-400 flex-shrink-0">
              🛡️
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
