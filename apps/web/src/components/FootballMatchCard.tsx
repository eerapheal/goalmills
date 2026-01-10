'use client';

import { FootballEvent } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FootballMatchCardProps {
    event: FootballEvent;
    onPress?: () => void;
    hideLeague?: boolean;
}

export function FootballMatchCard({ event, onPress, hideLeague = false }: FootballMatchCardProps) {
    const router = useRouter();

    // Parse status and time
    const isFinished = event.event_status === 'Finished';
    const isLive = event.event_live === '1';
    const isScheduled = event.event_status === 'Not Started';

    const handleCardClick = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/matches/${event.event_key}`);
        }
    };

    const getScore = () => {
        if (isScheduled) return null;
        if (event.event_final_result && event.event_final_result !== '-') {
            const [home, away] = event.event_final_result.split(' - ');
            return { home, away };
        }
        return { home: '0', away: '0' }; // Default if parsing fails or empty
    };

    const scores = getScore();

    return (
        <div
            onClick={handleCardClick}
            className={`
                group
                glass-card rounded-lg p-3 mb-2 cursor-pointer relative overflow-hidden
                ${isLive ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/5'}
            `}
        >
            {/* Live Indicator Background Effect */}
            {isLive && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none" />
            )}

            {/* League Header */}
            {!hideLeague && (
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5 relative z-10">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2"
                    >
                        <Link href={`/leagues/${event.league_key}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            {event.league_logo && (
                                <img
                                    src={event.league_logo}
                                    alt={event.league_name}
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                />
                            )}
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{event.league_name} - {event.league_round}</span>
                        </Link>
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
                            </span>
                            <span className="text-[9px] font-bold text-yellow-500 tracking-widest">LIVE</span>
                        </div>
                    )}
                </div>
            )}

            {/* Match Info */}
            <div className={`flex items-center justify-between relative z-10 ${hideLeague ? 'pt-1' : ''}`}>
                {/* Home Team */}
                <Link
                    href={`/teams/${event.home_team_key}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex flex-row items-center justify-start gap-2 group-hover:opacity-80 transition-opacity"
                >
                    <div className="relative w-7 h-7 flex items-center justify-center bg-gray-700/50 rounded-full overflow-hidden">
                        {event.home_team_logo ? (
                            <img
                                src={event.home_team_logo}
                                alt={event.event_home_team}
                                className="object-contain drop-shadow-lg w-full h-full"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-700 rounded-full" />
                        )}
                    </div>
                    <p className="text-sm font-bold truncate leading-tight text-text-primary">
                        {event.event_home_team}
                    </p>
                </Link>

                {/* Score/Time Center */}
                <Link
                    href={`/matches/${event.event_key}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center justify-center min-w-[70px] px-1"
                >
                    {isScheduled ? (
                        <div className="flex flex-col items-center">
                            <span className="text-base font-bold text-text-primary tracking-tight">{event.event_time}</span>
                            <span className="text-[9px] font-medium text-text-muted">{event.event_date}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xl font-bold tracking-tight text-text-primary">
                                    {scores?.home || 0}
                                </span>
                                <span className="text-sm font-light text-text-muted/50">-</span>
                                <span className="text-xl font-bold tracking-tight text-text-primary">
                                    {scores?.away || 0}
                                </span>
                            </div>

                            <div className={`text-[9px] font-bold tracking-wider uppercase
                                ${isLive ? 'text-accent-red' : 'text-accent-green'}
                            `}>
                                {isLive ? `${event.event_status}'` : event.event_status}
                            </div>
                        </div>
                    )}
                </Link>

                {/* Away Team */}
                <Link
                    href={`/teams/${event.away_team_key}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex flex-row items-center justify-end gap-2 group-hover:opacity-80 transition-opacity"
                >
                    <p className="text-sm font-bold text-right truncate leading-tight text-text-primary">
                        {event.event_away_team}
                    </p>
                    <div className="relative w-7 h-7 flex items-center justify-center bg-gray-700/50 rounded-full overflow-hidden">
                        {event.away_team_logo ? (
                            <img
                                src={event.away_team_logo}
                                alt={event.event_away_team}
                                className="object-contain drop-shadow-lg w-full h-full"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-700 rounded-full" />
                        )}
                    </div>
                </Link>
            </div>
        </div>
    );
}
