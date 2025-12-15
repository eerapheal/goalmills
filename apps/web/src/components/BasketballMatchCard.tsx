'use client';

import { BasketballEvent } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BasketballMatchCardProps {
    match: BasketballEvent;
    onPress?: () => void;
    odds?: any;
}

export function BasketballMatchCard({ match, onPress, odds }: BasketballMatchCardProps) {
    const router = useRouter();
    const isLive = match.event_live === '1';

    const handleCardClick = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/basketball/matches/${match.event_key}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`
                group glass-card rounded-lg p-3 mb-2 cursor-pointer relative overflow-hidden transition-all
                ${isLive ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/5 hover:bg-white/5'}
            `}
        >
            {isLive && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none" />
            )}

            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5 relative z-10">
                <div onClick={(e) => e.stopPropagation()}>
                    <Link href={`/basketball/leagues/${match.league_key}`} className="text-[10px] font-bold text-text-secondary uppercase tracking-wider hover:text-white transition-colors">
                        {match.league_name} {match.league_round && `• ${match.league_round}`}
                    </Link>
                </div>
                {isLive ? (
                    <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/20">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
                        </span>
                        <span className="text-[9px] font-bold text-yellow-500 tracking-widest">LIVE</span>
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{match.event_status}</span>
                )}
            </div>

            <div className="flex flex-col gap-3 relative z-10">
                {/* Home Team */}
                <div className="flex items-center justify-between">
                    <Link
                        href={`/basketball/teams/${match.home_team_key}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 group/team"
                    >
                        <div className="relative w-6 h-6 rounded-full bg-white/5 overflow-hidden">
                            <Image
                                src={match.event_home_team_logo || 'https://via.placeholder.com/40'}
                                alt={match.event_home_team}
                                width={24}
                                height={24}
                                className="object-cover"
                            />
                        </div>
                        <span className="text-sm font-bold text-text-primary group-hover/team:text-yellow-500 transition-colors">
                            {match.event_home_team}
                        </span>
                    </Link>
                    <span className="text-lg font-bold text-text-primary">
                        {match.event_final_result?.split(' - ')[0] || '-'}
                    </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between">
                    <Link
                        href={`/basketball/teams/${match.away_team_key}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 group/team"
                    >
                        <div className="relative w-6 h-6 rounded-full bg-white/5 overflow-hidden">
                            <Image
                                src={match.event_away_team_logo || 'https://via.placeholder.com/40'}
                                alt={match.event_away_team}
                                width={24}
                                height={24}
                                className="object-cover"
                            />
                        </div>
                        <span className="text-sm font-bold text-text-primary group-hover/team:text-yellow-500 transition-colors">
                            {match.event_away_team}
                        </span>
                    </Link>
                    <span className="text-lg font-bold text-text-primary">
                        {match.event_final_result?.split(' - ')[1] || '-'}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 text-center border-t border-white/5">
                {odds && odds['Home/Away'] && (
                    <div className="flex justify-center gap-4 mb-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded">
                            <span className="text-[10px] text-text-muted font-bold">1</span>
                            <span className="text-xs font-bold text-yellow-500">{odds['Home/Away']['Home']?.['Bet365'] || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded">
                            <span className="text-[10px] text-text-muted font-bold">2</span>
                            <span className="text-xs font-bold text-yellow-500">{odds['Home/Away']['Away']?.['Bet365'] || '-'}</span>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-text-muted">
                    <span>{match.country_name}</span>
                    <span>{match.event_time}</span>
                </div>
            </div>
        </div>
    );
}
