'use client';

import { CricketMatchInfo } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CricketMatchCardProps {
    match: CricketMatchInfo;
    onPress?: () => void;
}

export function CricketMatchCard({ match, onPress }: CricketMatchCardProps) {
    const router = useRouter();
    const { status, teamInfo, score, date, matchType, series } = match;
    const isLive = status === 'Live';
    const isUpcoming = status === 'Upcoming';

    // Get scores for home and away teams
    const homeScore = score?.find(s => s.teamId === teamInfo[0].id);
    const awayScore = score?.find(s => s.teamId === teamInfo[1].id);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleCardClick = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/cricket/matches/${match.id}`);
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
                        {series} • {matchType}
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
                    href={`/cricket/teams/${teamInfo[0].id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex flex-row items-center justify-start gap-3 group-hover:opacity-80 transition-opacity"
                >
                    <div className="relative w-8 h-8 rounded-full bg-white/5 p-1">
                        <Image src={teamInfo[0].logo} alt={teamInfo[0].name} width={32} height={32} className="object-contain w-full h-full" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-bold text-text-primary leading-tight">
                            {teamInfo[0].shortName || teamInfo[0].name}
                        </p>
                        {!isUpcoming && homeScore && (
                            <p className="text-xs font-bold text-text-primary mt-0.5 whitespace-nowrap">
                                {homeScore.runs}/{homeScore.wickets} <span className="text-text-muted font-normal">({homeScore.overs})</span>
                            </p>
                        )}
                    </div>
                </Link>

                {/* Status/Time Center */}
                <Link
                    href={`/cricket/matches/${match.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center justify-center min-w-[80px]"
                >
                    {isUpcoming ? (
                        <div className="flex flex-col items-center">
                            <span className="text-base font-bold text-text-primary tracking-tight">{formatTime(date)}</span>
                            <span className="text-[10px] font-medium text-text-muted">{formatDate(date)}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className={`text-[10px] font-bold tracking-wider uppercase ${isLive ? 'text-yellow-500' : 'text-blue-400'}`}>
                                {status}
                            </span>
                            <p className="text-[10px] text-text-muted mt-1 truncate max-w-[100px] text-center">
                                {match.venue.city}
                            </p>
                        </div>
                    )}
                </Link>

                {/* Away Team */}
                <Link
                    href={`/cricket/teams/${teamInfo[1].id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex flex-row-reverse items-center justify-start gap-3 group-hover:opacity-80 transition-opacity text-right"
                >
                    <div className="relative w-8 h-8 rounded-full bg-white/5 p-1">
                        <Image src={teamInfo[1].logo} alt={teamInfo[1].name} width={32} height={32} className="object-contain w-full h-full" />
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-sm font-bold text-text-primary leading-tight">
                            {teamInfo[1].shortName || teamInfo[1].name}
                        </p>
                        {!isUpcoming && awayScore && (
                            <p className="text-xs font-bold text-text-primary mt-0.5 whitespace-nowrap">
                                {awayScore.runs}/{awayScore.wickets} <span className="text-text-muted font-normal">({awayScore.overs})</span>
                            </p>
                        )}
                    </div>
                </Link>
            </div>
        </div>
    );
}
