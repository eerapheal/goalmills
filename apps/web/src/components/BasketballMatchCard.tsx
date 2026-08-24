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

  const isLive = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE'].includes(
    match.status.short
  );
  const isFinished = ['FT', 'AOT'].includes(match.status.short);
  const isUpcoming = !isLive && !isFinished;

  const handleClick = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/basketball/matches/${match.id}`);
    }
  };

  const getStatusDisplay = () => {
    if (isLive) {
      if (match.status.timer) return `${match.status.short} ${match.status.timer}`;
      return match.status.short || 'LIVE';
    }
    if (isFinished) {
      return match.status.short === 'AOT' ? 'FT (OT)' : 'FT';
    }
    return match.time || 'TBD';
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isLive
          ? 'border-orange-500/40 bg-[#1A2333] shadow-[0_0_15px_rgba(249,115,22,0.15)]'
          : 'border-white/10 bg-[#141C2B] hover:border-white/20'
      }`}
    >
      {/* League Header */}
      {!hideLeague && (
        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2 text-xs">
          <div className="flex items-center space-x-2 truncate">
            {match.league.logo ? (
              <img
                src={match.league.logo}
                alt={match.league.name}
                className="h-4 w-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-orange-400">🏀</span>
            )}
            <span className="font-semibold text-slate-400 truncate">
              {match.league.name}
            </span>
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
              <span>{getStatusDisplay()}</span>
            </span>
          ) : (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isFinished
                  ? 'bg-slate-700/50 text-slate-400'
                  : 'bg-white/5 text-slate-300'
              }`}
            >
              {getStatusDisplay()}
            </span>
          )}
        </div>
      )}

      {/* Teams & Scores */}
      <div className="space-y-2.5">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            {match.teams.home.logo ? (
              <img
                src={match.teams.home.logo}
                alt={match.teams.home.name}
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-sm">🛡️</span>
            )}
            <span className="text-sm font-bold text-slate-100 truncate">
              {match.teams.home.name}
            </span>
          </div>
          <span
            className={`text-base font-extrabold ${
              isLive
                ? 'text-orange-400'
                : isFinished &&
                  (match.scores.home.total || 0) > (match.scores.away.total || 0)
                ? 'text-white'
                : 'text-slate-400'
            }`}
          >
            {isUpcoming ? '-' : match.scores.home.total ?? 0}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            {match.teams.away.logo ? (
              <img
                src={match.teams.away.logo}
                alt={match.teams.away.name}
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-sm">🛡️</span>
            )}
            <span className="text-sm font-bold text-slate-100 truncate">
              {match.teams.away.name}
            </span>
          </div>
          <span
            className={`text-base font-extrabold ${
              isLive
                ? 'text-orange-400'
                : isFinished &&
                  (match.scores.away.total || 0) > (match.scores.home.total || 0)
                ? 'text-white'
                : 'text-slate-400'
            }`}
          >
            {isUpcoming ? '-' : match.scores.away.total ?? 0}
          </span>
        </div>
      </div>

      {/* Quarters breakdown */}
      {!isUpcoming && (
        <div className="mt-3 flex items-center justify-around border-t border-white/5 pt-2 text-[10px] text-slate-400">
          <div className="text-center">
            <span className="block text-[9px] uppercase text-slate-500 font-bold">Q1</span>
            <span>{match.scores.home.quarter_1 ?? '-'}:{match.scores.away.quarter_1 ?? '-'}</span>
          </div>
          <div className="text-center">
            <span className="block text-[9px] uppercase text-slate-500 font-bold">Q2</span>
            <span>{match.scores.home.quarter_2 ?? '-'}:{match.scores.away.quarter_2 ?? '-'}</span>
          </div>
          <div className="text-center">
            <span className="block text-[9px] uppercase text-slate-500 font-bold">Q3</span>
            <span>{match.scores.home.quarter_3 ?? '-'}:{match.scores.away.quarter_3 ?? '-'}</span>
          </div>
          <div className="text-center">
            <span className="block text-[9px] uppercase text-slate-500 font-bold">Q4</span>
            <span>{match.scores.home.quarter_4 ?? '-'}:{match.scores.away.quarter_4 ?? '-'}</span>
          </div>
          {match.scores.home.over_time !== null && (
            <div className="text-center">
              <span className="block text-[9px] uppercase text-slate-500 font-bold">OT</span>
              <span>{match.scores.home.over_time}:{match.scores.away.over_time}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
