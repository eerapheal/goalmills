'use client';

import React from 'react';
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

  return (
    <div
      onClick={handleClick}
      className={`group relative cursor-pointer rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isLive
          ? 'border-amber-500/40 bg-gradient-to-r from-[#0C1A30] via-[#0E203C] to-[#0C1A30] shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-400'
          : 'border-blue-500/15 bg-[#0A1424]/90 hover:border-blue-400/40 hover:bg-[#0E1D34]'
      }`}
    >
      {/* Ambient live glow */}
      {isLive && (
        <div className="absolute top-0 right-0 w-32 h-16 bg-amber-500/10 blur-2xl pointer-events-none -z-0" />
      )}

      {/* League Header */}
      {!hideLeague && (
        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2.5 text-xs">
          <div className="flex items-center space-x-2 truncate">
            {match?.league?.logo ? (
              <img
                src={match.league.logo}
                alt={match?.league?.name || 'League'}
                className="h-4 w-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-amber-400 text-xs">🏀</span>
            )}
            <span className="font-bold text-slate-300 group-hover:text-white truncate transition-colors">
              {match?.league?.name || 'Basketball League'}
            </span>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{getStatusDisplay()}</span>
            </span>
          ) : (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
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
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 relative z-10">
        {/* Home Team */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-900/80 border border-white/10 p-1 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400/40 transition-colors">
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
              <span className="text-[10px] font-black text-blue-400">
                {(match?.teams?.home?.name || 'HOM').slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-blue-300 transition-colors">
            {match?.teams?.home?.name || 'Home Team'}
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
            {isUpcoming ? 'VS' : `${homeScore} - ${awayScore}`}
          </span>
          {isLive && (
            <span className="text-[9px] font-bold text-amber-300/90 mt-0.5 animate-pulse">
              {shortStatus || 'LIVE'}
            </span>
          )}
          {isFinished && (
            <span className="text-[8px] font-bold uppercase text-slate-400 mt-0.5">
              FINAL
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 min-w-0 text-right">
          <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-blue-300 transition-colors">
            {match?.teams?.away?.name || 'Away Team'}
          </span>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-900/80 border border-white/10 p-1 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-400/40 transition-colors">
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
              <span className="text-[10px] font-black text-amber-400">
                {(match?.teams?.away?.name || 'AWY').slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
