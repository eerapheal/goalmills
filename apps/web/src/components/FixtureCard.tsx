'use client';

import { Fixture } from '@goalmills/types';
import Image from 'next/image';

interface FixtureCardProps {
    fixture: Fixture;
    onPress?: () => void;
}

export function FixtureCard({ fixture, onPress }: FixtureCardProps) {
    const { fixture: fixtureData, league, teams, goals, score } = fixture;
    const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixtureData.status.short);
    const isFinished = fixtureData.status.short === 'FT';
    const isUpcoming = fixtureData.status.short === 'NS';

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            onClick={onPress}
            className={`
                group
                glass-card rounded-xl p-5 mb-4 cursor-pointer relative overflow-hidden
                ${isLive ? 'border-accent-red/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5'}
            `}
        >
            {/* Live Indicator Background Effect */}
            {isLive && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red/10 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />
            )}

            {/* League Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/5 rounded-lg">
                        <Image src={league.logo} alt={league.name} width={20} height={20} className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{league.name}</span>
                        {league.round && <span className="text-[10px] text-text-muted">{league.round}</span>}
                    </div>
                </div>
                {isLive && (
                    <div className="flex items-center gap-2 bg-accent-red/20 px-2.5 py-1 rounded-full border border-accent-red/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red"></span>
                        </span>
                        <span className="text-[10px] font-bold text-accent-red tracking-widest">LIVE</span>
                    </div>
                )}
            </div>

            {/* Match Info */}
            <div className="flex items-center justify-between relative z-10">
                {/* Home Team */}
                <div className="flex-1 flex flex-col items-center gap-3 group-hover:transform group-hover:scale-105 transition-transform duration-300">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                        <Image src={teams.home.logo} alt={teams.home.name} width={64} height={64} className="object-contain drop-shadow-lg w-full h-full" />
                    </div>
                    <p className={`text-sm sm:text-base font-bold text-center leading-tight ${teams.home.winner ? 'text-accent-green' : 'text-text-primary'}`}>
                        {teams.home.name}
                    </p>
                </div>

                {/* Score/Time Center */}
                <div className="flex flex-col items-center justify-center min-w-[100px] px-2">
                    {isUpcoming ? (
                        <div className="flex flex-col items-center">
                            <div className="bg-surfaceHighlight/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5 mb-1">
                                <span className="text-xl font-bold text-text-primary tracking-tight">{formatTime(fixtureData.date)}</span>
                            </div>
                            <span className="text-xs font-medium text-text-muted">{formatDate(fixtureData.date)}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in">
                            <div className="flex items-center gap-4 mb-1">
                                <span className={`text-3xl sm:text-4xl font-extrabold tracking-tighter ${teams.home.winner ? 'text-text-primary' : 'text-text-secondary/80'}`}>
                                    {goals.home ?? 0}
                                </span>
                                <span className="text-xl font-light text-text-muted/50">:</span>
                                <span className={`text-3xl sm:text-4xl font-extrabold tracking-tighter ${teams.away.winner ? 'text-text-primary' : 'text-text-secondary/80'}`}>
                                    {goals.away ?? 0}
                                </span>
                            </div>

                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase
                                ${isLive ? 'text-accent-red' : 'text-accent-green'}
                            `}>
                                {isLive ? `${fixtureData.status.elapsed}'` : fixtureData.status.short}
                            </div>
                        </div>
                    )}
                </div>

                {/* Away Team */}
                <div className="flex-1 flex flex-col items-center gap-3 group-hover:transform group-hover:scale-105 transition-transform duration-300">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                        <Image src={teams.away.logo} alt={teams.away.name} width={64} height={64} className="object-contain drop-shadow-lg w-full h-full" />
                    </div>
                    <p className={`text-sm sm:text-base font-bold text-center leading-tight ${teams.away.winner ? 'text-accent-green' : 'text-text-primary'}`}>
                        {teams.away.name}
                    </p>
                </div>
            </div>

            {/* Footer / Venue */}
            {fixtureData.venue.name && (
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-center text-text-muted gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs">
                        {fixtureData.venue.name}
                        {fixtureData.venue.city && <span> • {fixtureData.venue.city}</span>}
                    </span>
                </div>
            )}
        </div>
    );
}
