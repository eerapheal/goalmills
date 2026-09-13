'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CricketEvent } from '@goalmills/types';
import { cricketRoutes, buildMatchSlug } from '@/lib/slugUtils';

interface CricketMatchCardProps {
  match: CricketEvent;
  onPress?: () => void;
  hideLeague?: boolean;
}

export function CricketMatchCard({
  match,
  onPress,
  hideLeague = false,
}: CricketMatchCardProps) {
  const router = useRouter();
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);

  const isLive =
    match?.event_live === '1' ||
    match?.event_live === (1 as any) ||
    match?.event_status?.toLowerCase().includes('live') ||
    match?.event_status?.toLowerCase().includes('innings') ||
    match?.event_status?.toLowerCase().includes('break');

  const isFinished =
    match?.event_status?.toLowerCase() === 'finished' ||
    match?.event_status === 'FT' ||
    match?.event_status?.toLowerCase().includes('won') ||
    match?.event_status?.toLowerCase().includes('complete') ||
    match?.event_status?.toLowerCase().includes('draw') ||
    match?.event_status?.toLowerCase().includes('abandoned');

  const isUpcoming = !isLive && !isFinished;

  const homeName = match?.event_home_team || 'Home Team';
  const awayName = match?.event_away_team || 'Away Team';

  const formattedTime = useMemo(() => {
    if (match?.event_time) return match.event_time.slice(0, 5);
    return match?.event_date_start || match?.event_date_stop || (match as any)?.event_date || 'TBD';
  }, [match?.event_time, match?.event_date_start, match?.event_date_stop, (match as any)?.event_date]);

  const statusDisplay = useMemo(() => {
    if (isLive) return 'LIVE';
    if (isFinished) return 'FT';
    return formattedTime;
  }, [isLive, isFinished, formattedTime]);

  const matchSlug = useMemo(() => {
    return buildMatchSlug({
      event_home_team: match?.event_home_team,
      event_away_team: match?.event_away_team,
      event_date: match?.event_date_start || match?.event_date_stop || (match as any)?.event_date || undefined,
      event_key: match?.event_key,
    });
  }, [match]);

  const handleClick = () => {
    if (onPress) {
      onPress();
    } else if (match?.event_key) {
      router.push(cricketRoutes.match(matchSlug));
    }
  };

  const leagueHref = useMemo(() => {
    if (match?.league_name) {
      return cricketRoutes.leagueFromName(match.league_name, match.league_key);
    }
    return match?.league_key ? `/cricket/leagues/${match.league_key}` : '/cricket';
  }, [match?.league_name, match?.league_key]);

  const homeHref = useMemo(() => {
    if (match?.event_home_team) {
      return cricketRoutes.teamFromName(match.event_home_team, match.home_team_key);
    }
    return match?.home_team_key ? `/cricket/teams/${match.home_team_key}` : '#';
  }, [match?.event_home_team, match?.home_team_key]);

  const awayHref = useMemo(() => {
    if (match?.event_away_team) {
      return cricketRoutes.teamFromName(match.event_away_team, match.away_team_key);
    }
    return match?.away_team_key ? `/cricket/teams/${match.away_team_key}` : '#';
  }, [match?.event_away_team, match?.away_team_key]);

  return (
    <div
      onClick={handleClick}
      className={`group relative cursor-pointer rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isLive
          ? 'border-red-500/50 bg-gradient-to-br from-[#22060b] via-[#1a080d] to-[#120509] shadow-[0_0_20px_rgba(239,68,68,0.22)] hover:border-red-400'
          : 'border-red-500/20 bg-[#140a10]/90 hover:border-red-400/40 hover:bg-[#1c0e16]'
      }`}
    >
      {/* Ambient subtle glow for live matches */}
      {isLive && (
        <div className="absolute top-0 right-0 w-32 h-16 bg-red-500/10 blur-2xl pointer-events-none -z-0" />
      )}

      {/* League Header */}
      {!hideLeague && (
        <div className="mb-2.5 flex items-center justify-between border-b border-white/5 pb-2 text-xs">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="text-red-400 text-xs">🏏</span>
            <Link
              href={leagueHref}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-[11px] text-slate-300 group-hover:text-white truncate transition-colors hover:text-red-300"
            >
              {match?.league_name || 'Cricket Series'}
            </Link>
            {match?.event_type && (
              <span className="text-[10px] text-slate-500 hidden sm:inline truncate">
                • {match.event_type}
              </span>
            )}
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="flex items-center space-x-1 rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-300 shadow-sm animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span>LIVE</span>
            </span>
          ) : (
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                isFinished
                  ? 'bg-red-950/40 text-red-300 border border-red-500/30'
                  : 'bg-white/5 text-slate-300 border border-white/10'
              }`}
            >
              {statusDisplay}
            </span>
          )}
        </div>
      )}

      {/* Teams and Scores Grid */}
      <div className="space-y-2 relative z-10">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <Link
            href={homeHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-2.5 truncate hover:text-red-300 transition-colors"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden group-hover:border-red-400/40 transition-colors">
              {match?.event_home_team_logo && !homeImgError ? (
                <img
                  src={match.event_home_team_logo}
                  alt={homeName}
                  className="h-full w-full object-contain p-0.5"
                  onError={() => setHomeImgError(true)}
                />
              ) : (
                <span className="text-xs font-bold text-slate-400">{homeName.charAt(0)}</span>
              )}
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white truncate transition-colors">
              {homeName}
            </span>
          </Link>

          <div className="flex items-baseline space-x-1.5 pl-2">
            <span
              className={`font-mono font-black text-xs sm:text-sm tabular-nums ${
                isLive
                  ? 'text-red-400'
                  : isFinished
                    ? 'text-white'
                    : 'text-slate-500'
              }`}
            >
              {match?.event_home_final_result || (isUpcoming ? '-' : '0')}
            </span>
            {match?.event_home_rr && (
              <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">
                ({match.event_home_rr})
              </span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <Link
            href={awayHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-2.5 truncate hover:text-red-300 transition-colors"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden group-hover:border-red-400/40 transition-colors">
              {match?.event_away_team_logo && !awayImgError ? (
                <img
                  src={match.event_away_team_logo}
                  alt={awayName}
                  className="h-full w-full object-contain p-0.5"
                  onError={() => setAwayImgError(true)}
                />
              ) : (
                <span className="text-xs font-bold text-slate-400">{awayName.charAt(0)}</span>
              )}
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white truncate transition-colors">
              {awayName}
            </span>
          </Link>

          <div className="flex items-baseline space-x-1.5 pl-2">
            <span
              className={`font-mono font-black text-xs sm:text-sm tabular-nums ${
                isLive
                  ? 'text-red-400'
                  : isFinished
                    ? 'text-white'
                    : 'text-slate-500'
              }`}
            >
              {match?.event_away_final_result || (isUpcoming ? '-' : '0')}
            </span>
            {match?.event_away_rr && (
              <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">
                ({match.event_away_rr})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Match Result / Status Note */}
      {(match?.event_status_info || match?.event_toss) && (
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-medium text-slate-300 truncate max-w-[240px]">
            {match?.event_status_info || match?.event_status}
          </span>
          {match?.event_toss && (
            <span className="text-slate-500 hidden sm:inline truncate max-w-[160px]">
              🪙 {match.event_toss}
            </span>
          )}
        </div>
      )}

      {/* Footer Info / SEO Link */}
      <div className="mt-2 flex items-center justify-end text-[10px] text-slate-500 group-hover:text-red-400 transition-colors">
        <span className="flex items-center gap-1 font-semibold">
          Match Center →
        </span>
      </div>
    </div>
  );
}

export default CricketMatchCard;
