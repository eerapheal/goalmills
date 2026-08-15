'use client';

import { FootballEvent } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface FootballMatchCardProps {
    event: FootballEvent;
    onPress?: () => void;
    hideLeague?: boolean;
}

export function FootballMatchCard({ event, onPress, hideLeague = false }: FootballMatchCardProps) {
    const router = useRouter();

    const isLive = event.event_live === '1';
    const isFinished = event.event_status?.toLowerCase() === 'finished' ||
        event.event_status === 'FT' ||
        event.event_status === 'AET' ||
        event.event_status === 'AP';
    const isUpcoming = !isLive && !isFinished;

    // Mock odds for live and upcoming matches
    const mockOdds = useMemo(() => ({
        home: (1.5 + Math.random() * 2).toFixed(2),
        draw: (2.8 + Math.random() * 1.5).toFixed(2),
        away: (1.8 + Math.random() * 2.5).toFixed(2),
    }), [event.event_key]);

    const handleCardClick = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/matches/${event.event_key}`);
        }
    };

    // Helper to get local time from UTC
    const getLocalTime = (date: string, time: string) => {
        if (!date || !time) return time;
        try {
            const utcDate = new Date(`${date}T${time}Z`);
            if (isNaN(utcDate.getTime())) return time;
            return utcDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch (e) {
            return time;
        }
    };

    const getStatusDisplay = () => {
        if (isLive) {
            if (!isNaN(Number(event.event_status))) {
                return `${event.event_status}'`;
            }
            return 'LIVE';
        }
        if (isFinished) {
            return event.event_status === 'Finished' ? 'FT' : event.event_status;
        }
        return getLocalTime(event.event_date, event.event_time) || event.event_status;
    };

    const getScoreDisplay = () => {
        if (isFinished) {
            return event.event_final_result || event.event_ft_result;
        }
        if (isLive) {
            return event.event_final_result || '0 - 0';
        }
        return 'vs';
    };

    const statusBgColor = isLive
        ? 'bg-red-500'
        : isFinished
            ? 'bg-slate-500'
            : 'bg-blue-500';

    return (
        <div
            onClick={handleCardClick}
            className={`
                group relative overflow-hidden rounded-lg p-3 mb-2 cursor-pointer
                transition-all duration-200 w-full lg:max-w-lg lg:mx-auto
                ${isLive
                    ? 'bg-red-500/[0.08] border border-amber-500/60 hover:bg-red-500/[0.12]'
                    : 'bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08]'
                }
            `}
            style={{ backdropFilter: 'blur(4px)' }}
        >
            {/* League Info Header */}
            {!hideLeague && (
                <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-white/[0.05]">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 flex-1 min-w-0"
                    >
                        <Link
                            href={`/leagues/${event.league_key}`}
                            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity min-w-0"
                        >
                            {event.league_logo && (
                                <Image
                                    src={event.league_logo}
                                    alt={event.league_name || 'League'}
                                    width={16}
                                    height={16}
                                    className="object-contain rounded-sm flex-shrink-0"
                                />
                            )}
                            <span className="text-[11px] font-semibold text-blue-400 truncate">
                                {event.league_name}
                            </span>
                        </Link>
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1 bg-red-500 px-2 py-0.5 rounded-full flex-shrink-0">
                            <span className="relative flex h-1 w-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1 w-1 bg-white"></span>
                            </span>
                            <span className="text-[9px] font-bold text-white tracking-wider">LIVE</span>
                        </div>
                    )}
                </div>
            )}

            {/* Match Info Row */}
            <div className="flex items-center justify-between mb-1.5">
                {/* Home Team */}
                <Link
                    href={`/teams/${event.home_team_key}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                >
                    {event.home_team_logo && (
                        <div className="w-7 h-7 flex-shrink-0">
                            <Image
                                src={event.home_team_logo}
                                alt={event.event_home_team || 'Home'}
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                        </div>
                    )}
                    <span className="text-sm font-semibold text-white truncate">
                        {event.event_home_team}
                    </span>
                </Link>

                {/* Score / Status Center */}
                <div className="flex flex-col items-center justify-center px-2 min-w-[60px]">
                    <div className={`${statusBgColor} px-2 py-0.5 rounded-full min-w-[40px] text-center`}>
                        <span className="text-[9px] font-bold text-white tracking-wide">
                            {getStatusDisplay()}
                        </span>
                    </div>
                    <span className={`text-lg font-extrabold mt-0.5 ${isLive ? 'text-red-400' : 'text-white'}`}>
                        {isLive ? (event.event_final_result || getScoreDisplay()) : getScoreDisplay()}
                    </span>
                    {!isLive && event.event_date && (
                        <span className="text-[8px] text-slate-400 font-medium">
                            {event.event_date}
                        </span>
                    )}
                </div>

                {/* Away Team */}
                <Link
                    href={`/teams/${event.away_team_key}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center gap-2 justify-end min-w-0 hover:opacity-80 transition-opacity"
                >
                    <span className="text-sm font-semibold text-white truncate text-right">
                        {event.event_away_team}
                    </span>
                    {event.away_team_logo && (
                        <div className="w-7 h-7 flex-shrink-0">
                            <Image
                                src={event.away_team_logo}
                                alt={event.event_away_team || 'Away'}
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                        </div>
                    )}
                </Link>
            </div>

            {/* Odds Row - Only for Live and Upcoming */}
            {(isLive || isUpcoming) && (
                <div className="flex gap-1.5 pt-1.5 border-t border-white/[0.05]">
                    <div className="flex-1 flex flex-col items-center bg-white/[0.05] border border-white/[0.1] rounded py-1">
                        <span className="text-[10px] font-semibold text-slate-400 mb-0.5">1</span>
                        <span className="text-xs font-bold text-blue-400">{mockOdds.home}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center bg-white/[0.05] border border-white/[0.1] rounded py-1">
                        <span className="text-[10px] font-semibold text-slate-400 mb-0.5">X</span>
                        <span className="text-xs font-bold text-blue-400">{mockOdds.draw}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center bg-white/[0.05] border border-white/[0.1] rounded py-1">
                        <span className="text-[10px] font-semibold text-slate-400 mb-0.5">2</span>
                        <span className="text-xs font-bold text-blue-400">{mockOdds.away}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
