'use client';

import { useState } from 'react';
import { CricketEvent } from '@goalmills/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CricketMatchCardProps {
  match: CricketEvent;
  onPress?: () => void;
}

export function CricketMatchCard({ match, onPress }: CricketMatchCardProps) {
  const router = useRouter();
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);
  const isLive = match.event_live === '1';
  const isUpcoming = match.event_status === 'Not Started';

  const handleCardClick = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/cricket/matches/${match.event_key}`);
    }
  };

  const homeName = match.event_home_team || 'TBC';
  const awayName = match.event_away_team || 'TBC';

  return (
    <div
      onClick={handleCardClick}
      className={`
                group
                glass-card rounded-lg p-2 mb-2 cursor-pointer relative overflow-hidden
                border-2 transition-all duration-300 hover:scale-[1.01]
                ${isLive ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'}
            `}
    >
      {/* Live Indicator Background Effect */}
      {isLive && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none animate-pulse" />
      )}

      {/* Series Header */}
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/5 relative z-10">
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[10px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20 whitespace-nowrap">
            {match.event_type || 'MATCH'}
          </span>
          <Link
            href={`/cricket/series/${match.league_key}`}
            className="text-[11px] font-bold text-text-secondary uppercase tracking-tight hover:text-secondary transition-colors whitespace-nowrap"
          >
            {match.league_name || 'Tournament'}
          </Link>
        </div>
        {isLive ? (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">
                Live
              </span>
            </div>
          </div>
        ) : match.event_status === 'Finished' ? (
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20">
              FT
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              Done
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {match.event_status}
          </span>
        )}
      </div>

      {/* Match Info Grid */}
      <div className="grid grid-cols-[1.2fr_auto_1.2fr] items-center gap-3 relative z-10">
        {/* Home Team */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-md bg-white/5 p-1 border border-white/10 flex shrink-0 items-center justify-center overflow-hidden">
              {match.event_home_team_logo && !homeImgError ? (
                <img
                  src={match.event_home_team_logo}
                  alt={homeName}
                  className="w-full h-full object-contain"
                  onError={() => setHomeImgError(true)}
                />
              ) : (
                <span className="text-xs font-black text-blue-400">{homeName.charAt(0)}</span>
              )}
            </div>
            <Link
              href={`/cricket/teams/${match.home_team_key}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-black text-white leading-tight uppercase tracking-tight hover:text-secondary transition-colors"
            >
              {homeName}
            </Link>
          </div>
          {!isUpcoming && match.event_home_final_result && (
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-lg font-black text-white tabular-nums">
                {match.event_home_final_result}
              </span>
              {match.event_home_rr && (
                <span className="text-[9px] text-text-muted font-bold">
                  RR: {match.event_home_rr}
                </span>
              )}
            </div>
          )}
        </div>

        {/* VS / Status Area */}
        <div className="flex flex-col items-center justify-center min-w-[80px] border-x border-white/5 px-2">
          <div className="flex flex-col items-center mb-1">
            <span className="text-[11px] font-black text-white tabular-nums leading-none mb-0.5">
              {match.event_time}
            </span>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">
              {match.event_date_start}
            </span>
          </div>

          {isLive ? (
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full border border-amber-500/20 flex items-center justify-center bg-amber-500/5 animate-pulse">
                <span className="text-[8px] font-black text-amber-500 uppercase">Live</span>
              </div>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                VS
              </span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col gap-1.5 items-end text-right">
          <div className="flex flex-row-reverse items-center gap-2">
            <div className="relative w-8 h-8 rounded-md bg-white/5 p-1 border border-white/10 flex shrink-0 items-center justify-center overflow-hidden">
              {match.event_away_team_logo && !awayImgError ? (
                <img
                  src={match.event_away_team_logo}
                  alt={awayName}
                  className="w-full h-full object-contain"
                  onError={() => setAwayImgError(true)}
                />
              ) : (
                <span className="text-xs font-black text-blue-400">{awayName.charAt(0)}</span>
              )}
            </div>
            <Link
              href={`/cricket/teams/${match.away_team_key}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-black text-white leading-tight uppercase tracking-tight hover:text-secondary transition-colors"
            >
              {awayName}
            </Link>
          </div>
          {!isUpcoming && match.event_away_final_result && (
            <div className="flex flex-row-reverse flex-wrap items-baseline gap-1.5">
              <span className="text-lg font-black text-white tabular-nums">
                {match.event_away_final_result}
              </span>
              {match.event_away_rr && (
                <span className="text-[9px] text-text-muted font-bold">
                  RR: {match.event_away_rr}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Result Info / Toss Info */}
      {match.event_status_info && (
        <div className="mt-2 pt-1.5 border-t border-white/5 relative z-10">
          <p
            className={`text-[10px] font-black text-center tracking-tight uppercase ${isLive ? 'text-amber-500 animate-pulse' : 'text-blue-400/80'}`}
          >
            {match.event_status_info}
          </p>
        </div>
      )}
    </div>
  );
}
