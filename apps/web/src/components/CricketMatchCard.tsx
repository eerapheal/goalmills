'use client';

import { CricketEvent } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CricketMatchCardProps {
    match: CricketEvent;
    onPress?: () => void;
}

export function CricketMatchCard({ match, onPress }: CricketMatchCardProps) {
    const router = useRouter();
    const isLive = match.event_live === '1';
    const isUpcoming = match.event_status === 'Not Started';

    const handleCardClick = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/cricket/matches/${match.event_key}`);
        }
    };

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

            {/* Series Header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5 relative z-10">
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2"
                >
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        {match.league_name} • {match.event_type}
                    </span>
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

            {/* Match Info */}
            <div className="flex items-center justify-between relative z-10 gap-4">
                {/* Home Team */}
                <Link
                    href={`/cricket/teams/${match.home_team_key}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex flex-row items-center justify-start gap-3 group-hover:opacity-80 transition-opacity"
                >
                    {match.event_home_team_logo ? (
                        <div className="relative w-8 h-8 rounded-full bg-white/5 p-1">
                            <Image
                                src={match.event_home_team_logo}
                                alt={match.event_home_team}
                                width={32}
                                height={32}
                                className="object-contain w-full h-full"
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-400">
                                {match.event_home_team.charAt(0)}
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col">
                        <p className="text-sm font-bold text-text-primary leading-tight">
                            {match.event_home_team}
                        </p>
                        {!isUpcoming && match.event_home_final_result && (
                            <p className="text-xs font-bold text-text-primary mt-0.5 whitespace-nowrap">
                                {match.event_home_final_result}
                            </p>
                        )}
                    </div>
                </Link>

                {/* Status/Time Center */}
                <Link
                    href={`/cricket/matches/${match.event_key}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center justify-center min-w-[80px]"
                >
                    {isUpcoming ? (
                        <div className="flex flex-col items-center">
                            <span className="text-base font-bold text-text-primary tracking-tight">{match.event_time}</span>
                            <span className="text-[10px] font-medium text-text-muted">{match.event_date_start}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className={`text-[10px] font-bold tracking-wider uppercase ${isLive ? 'text-yellow-500' : 'text-blue-400'}`}>
                                {match.event_status}
                            </span>
                            <p className="text-[10px] text-text-muted mt-1 truncate max-w-[100px] text-center">
                                {match.event_stadium}
                            </p>
                        </div>
                    )}
                </Link>

                {/* Away Team */}
                <Link
                    href={`/cricket/teams/${match.away_team_key}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex flex-row-reverse items-center justify-start gap-3 group-hover:opacity-80 transition-opacity text-right"
                >
                    {match.event_away_team_logo ? (
                        <div className="relative w-8 h-8 rounded-full bg-white/5 p-1">
                            <Image
                                src={match.event_away_team_logo}
                                alt={match.event_away_team}
                                width={32}
                                height={32}
                                className="object-contain w-full h-full"
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-400">
                                {match.event_away_team.charAt(0)}
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col items-end">
                        <p className="text-sm font-bold text-text-primary leading-tight">
                            {match.event_away_team}
                        </p>
                        {!isUpcoming && match.event_away_final_result && (
                            <p className="text-xs font-bold text-text-primary mt-0.5 whitespace-nowrap">
                                {match.event_away_final_result}
                            </p>
                        )}
                    </div>
                </Link>
            </div>
        </div>
    );
}
