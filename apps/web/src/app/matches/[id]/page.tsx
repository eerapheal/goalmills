'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Fixture, MatchEvent, Lineup } from '@goalmills/types';
import { footballApi } from '../../../services/footballApi';

type MatchTab = 'summary' | 'lineups' | 'stats';

export default function MatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const fixtureId = Number(params.id);

    const [activeTab, setActiveTab] = useState<MatchTab>('summary');
    const [loading, setLoading] = useState(true);
    const [fixture, setFixture] = useState<Fixture | null>(null);
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [lineups, setLineups] = useState<Lineup[]>([]);

    useEffect(() => {
        const loadMatchData = async () => {
            if (!fixtureId) return;

            try {
                const [fixtureData, eventsData, lineupsData] = await Promise.all([
                    footballApi.getFixtureById(fixtureId),
                    footballApi.getEventsByFixtureId(fixtureId),
                    footballApi.getLineupsByFixtureId(fixtureId),
                ]);

                setFixture(fixtureData);
                setEvents(eventsData);
                setLineups(lineupsData);
            } catch (error) {
                console.error('Error loading match data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMatchData();
    }, [fixtureId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!fixture) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold text-white mb-4">Match Not Found</h1>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-primary rounded-lg text-white font-bold hover:bg-primary-dark transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const { league, teams, goals, fixture: fixtureInfo } = fixture;
    const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixtureInfo.status.short);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Scoreboard */}
            <div className="bg-gradient-to-b from-surface to-background border-b border-white/5 pt-8 pb-4 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* League Info */}
                    <div className="flex items-center justify-center gap-2 mb-6 text-text-muted text-sm font-bold uppercase tracking-wider">
                        <Image src={league.logo} alt={league.name} width={20} height={20} className="w-5 h-5 object-contain" />
                        <span>{league.name}</span>
                        {league.round && <span className="text-text-secondary">• {league.round}</span>}
                    </div>

                    {/* Scoreboard */}
                    <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex-1 flex flex-col items-center gap-4">
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                                <Image src={teams.home.logo} alt={teams.home.name} fill className="object-contain drop-shadow-xl" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">{teams.home.name}</h2>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center px-4 sm:px-12">
                            <div className="flex items-center gap-4 text-4xl sm:text-6xl font-black text-white mb-2 tracking-tighter">
                                <span>{goals.home ?? 0}</span>
                                <span className="opacity-50 text-3xl sm:text-4xl">:</span>
                                <span>{goals.away ?? 0}</span>
                            </div>
                            <div className={`px-3 py-1 rounded text-sm font-bold tracking-wider uppercase
                                ${isLive ? 'bg-accent-red text-white animate-pulse' : 'bg-white/10 text-text-muted'}
                            `}>
                                {isLive ? `${fixtureInfo.status.elapsed}'` : fixtureInfo.status.long}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex flex-col items-center gap-4">
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                                <Image src={teams.away.logo} alt={teams.away.name} fill className="object-contain drop-shadow-xl" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">{teams.away.name}</h2>
                        </div>
                    </div>

                    {/* Venue & Referee */}
                    <div className="mt-8 pt-4 border-t border-white/5 flex flex-wrap justify-center gap-6 text-xs text-text-muted uppercase tracking-wider font-medium">
                        {fixtureInfo.venue.name && (
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>{fixtureInfo.venue.name}, {fixtureInfo.venue.city}</span>
                            </div>
                        )}
                        {fixtureInfo.referee && (
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span>Ref: {fixtureInfo.referee}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-center gap-8">
                        {(['summary', 'lineups', 'stats'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    py-4 px-4 border-b-2 text-sm font-bold uppercase tracking-wider transition-colors
                                    ${activeTab === tab
                                        ? 'border-secondary text-secondary'
                                        : 'border-transparent text-text-muted hover:text-white'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                {activeTab === 'summary' && (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-center text-lg font-bold text-white mb-6">Match Events</h3>
                        <div className="relative border-l-2 border-white/10 ml-1/2 md:ml-0 md:border-none space-y-8">
                            {/* Timeline Line for Desktop */}
                            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

                            {events.map((event, index) => {
                                const isHome = event.team.id === teams.home.id;
                                return (
                                    <div key={index} className={`flex items-center ${isHome ? 'flex-row' : 'flex-row-reverse'} md:justify-center relative`}>
                                        <div className={`flex-1 flex ${isHome ? 'justify-end md:pr-12' : 'justify-start md:pl-12'}`}>
                                            <div className="bg-surface border border-white/5 p-3 rounded-xl shadow-lg min-w-[140px]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold ${event.type === 'Goal' ? 'text-accent-green' : event.type === 'Card' ? 'text-secondary' : 'text-primary'}`}>
                                                        {event.type}
                                                    </span>
                                                    <span className="text-xs text-text-muted">{event.detail}</span>
                                                </div>
                                                <div className="font-bold text-white text-sm">{event.player.name}</div>
                                                {event.assist.name && <div className="text-xs text-text-secondary">Ast: {event.assist.name}</div>}
                                            </div>
                                        </div>

                                        {/* Time Badge */}
                                        <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs font-bold text-white z-10">
                                            {event.time.elapsed}'
                                        </div>

                                        <div className="flex-1 hidden md:block" />
                                    </div>
                                );
                            })}

                            {events.length === 0 && (
                                <p className="text-center text-text-muted italic">No major events recorded yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'lineups' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {lineups.map((lineup, idx) => (
                                <div key={idx} className="bg-surface/30 rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                                        <h3 className="font-bold text-white">{lineup.team.name}</h3>
                                        <span className="text-xs font-mono text-secondary bg-surface px-2 py-1 rounded">{lineup.formation}</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-text-muted uppercase mb-3">Starting XI</h4>
                                            <ul className="space-y-2">
                                                {lineup.startXI.map((player) => (
                                                    <li key={player.player.id} className="flex items-center gap-3 text-sm">
                                                        <span className="w-6 text-center text-text-secondary font-mono text-xs">{player.player.number}</span>
                                                        <span className="text-white font-medium">{player.player.name}</span>
                                                        <span className="text-[10px] text-text-muted bg-white/5 px-1.5 rounded">{player.player.pos}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-text-muted uppercase mb-3">Substitutes</h4>
                                            <ul className="space-y-2">
                                                {lineup.substitutes.map((player) => (
                                                    <li key={player.player.id} className="flex items-center gap-3 text-sm opacity-70">
                                                        <span className="w-6 text-center text-text-secondary font-mono text-xs">{player.player.number}</span>
                                                        <span className="text-text-primary">{player.player.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="pt-2 border-t border-white/5 text-sm">
                                            <span className="text-text-muted">Coach: </span>
                                            <span className="text-white font-semibold">{lineup.coach.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {lineups.length === 0 && (
                            <p className="text-center text-text-muted italic py-12">Lineups not available yet.</p>
                        )}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="animate-fade-in flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-4xl mb-4">📊</span>
                        <h3 className="text-xl font-bold text-white mb-2">Detailed Statistics</h3>
                        <p className="text-text-muted max-w-sm">Detailed match statistics like possession, shots, and passes are coming soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
