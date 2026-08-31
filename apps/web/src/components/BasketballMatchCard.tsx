'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiBasketballGameItem } from '../services/basketballApi';

interface BasketballMatchCardProps {
  match: ApiBasketballGameItem;
  onPress?: () => void;
  hideLeague?: boolean;
}

export function BasketballMatchCard({
  match,
  onPress,
  hideLeague = false,
}: BasketballMatchCardProps) {
  const router = useRouter();

  const shortStatus = match?.status?.short || '';
  const isLive = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE'].includes(shortStatus);
  const isFinished = ['FT', 'AOT'].includes(shortStatus);
  const isUpcoming = !isLive && !isFinished;

  const handleClick = () => {
    if (onPress) {
      onPress();
    } else if (match?.id) {
      router.push(`/basketball/matches/${match.id}`);
    }
  };

  const getStatusDisplay = () => {
    if (isLive) {
      if (match?.status?.timer) return `${shortStatus} ${match.status.timer}`;
      return shortStatus || 'LIVE';
    }
    if (isFinished) {
      return shortStatus === 'AOT' ? 'FT (OT)' : 'FT';
    }
    return match?.time || 'TBD';
  };

  const homeScore = match?.scores?.home?.total ?? 0;
  const awayScore = match?.scores?.away?.total ?? 0;

  const homeName = match?.teams?.home?.name || 'Home';
  const awayName = match?.teams?.away?.name || 'Away';

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
            {match?.league?.logo ? (
              <img
                src={match.league.logo}
                alt={match?.league?.name || 'League'}
                className="h-3.5 w-3.5 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-blue-400 text-xs">🏀</span>
            )}
            <span className="font-bold text-[11px] text-slate-300 group-hover:text-white truncate transition-colors">
              {match?.league?.name || 'Basketball League'}
            </span>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1 rounded-full border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-300 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>{getStatusDisplay()}</span>
            </span>
          ) : (
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                isFinished
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-500/20'
                  : 'bg-white/5 text-slate-300 border border-white/10'
              }`}
            >
              {getStatusDisplay()}
            </span>
          )}
        </div>
      )}

      {/* Teams & Scores */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-3 relative z-10">
        {/* Home Team */}
        <Link
          href={match?.teams?.home?.id ? `/basketball/teams/${match.teams.home.id}` : '#'}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 hover:text-blue-400 transition-colors"
        >
          <div className="h-5.5 w-5.5 sm:h-7 sm:w-7 rounded bg-slate-900/80 border border-white/10 p-0.5 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400/40 transition-colors">
            {match?.teams?.home?.logo ? (
              <img
                src={match.teams.home.logo}
                alt={match?.teams?.home?.name || 'Home'}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-[7px] sm:text-[9px] font-black text-blue-400">
                {(match?.teams?.home?.name || 'HOM').slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <span className="font-bold text-[11px] sm:text-xs text-white truncate group-hover:text-blue-300 transition-colors">
            {homeName}
          </span>
        </Link>

        {/* Score & VS Pill */}
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
            {isUpcoming ? 'VS' : `${homeScore} - ${awayScore}`}
          </span>
          <span className={`text-[8px] font-bold uppercase sm:mt-0.5 ${
            isLive ? 'text-blue-300' : 'text-slate-400'
          }`}>
            {getStatusDisplay()}
          </span>
        </div>

        {/* Away Team */}
        <Link
          href={match?.teams?.away?.id ? `/basketball/teams/${match.teams.away.id}` : '#'}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-end space-x-1.5 sm:space-x-2 min-w-0 text-right hover:text-blue-400 transition-colors"
        >
          <span className="font-bold text-[11px] sm:text-xs text-white truncate group-hover:text-blue-300 transition-colors">
            {awayName}
          </span>
          <div className="h-5.5 w-5.5 sm:h-7 sm:w-7 rounded bg-slate-900/80 border border-white/10 p-0.5 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400/40 transition-colors">
            {match?.teams?.away?.logo ? (
              <img
                src={match.teams.away.logo}
                alt={match?.teams?.away?.name || 'Away'}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-[7px] sm:text-[9px] font-black text-blue-400">
                {(match?.teams?.away?.name || 'AWY').slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
