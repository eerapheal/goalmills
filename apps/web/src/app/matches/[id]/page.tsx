'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FootballEvent, FootballLineups, FootballStatistic } from '@goalmills/types';
import { advancedFootballApi } from '../../../services/advancedFootballApi';

type MatchTab = 'summary' | 'lineups' | 'stats' | 'info';

export default function MatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const fixtureId = Number(params.id);

    const [activeTab, setActiveTab] = useState<MatchTab>('summary');
    const [loading, setLoading] = useState(true);
    const [fixture, setFixture] = useState<FootballEvent | null>(null);
    const [events, setEvents] = useState<any[]>([]); // Using any for goalscorers/cards mixed array if needed or map property
    const [lineups, setLineups] = useState<FootballLineups | null>(null);

    useEffect(() => {
        const loadMatchData = async () => {
            if (!fixtureId) return;

            try {
                // Since advancedFootballApi.getFixtures returns array, we filter by ID (Assuming API supports it or we fetch list and find)
                // The mock getFixtures supports matchId
                const [matchRes] = await Promise.all([
                    advancedFootballApi.getFixtures({ matchId: fixtureId }),
                ]);

                if (matchRes.result && matchRes.result.length > 0) {
                    const match = matchRes.result[0];
                    setFixture(match);
                    // Adapt flat structure to components state if needed
                    // advancedFootballApi returns detailed object including goalscorers, cards, lineups, etc in the even object itself?
                    // Let's check the FootballEvent type structure from Step 24.
                    // It has goalscorers, cards, lineups, statistics directly on FootballEvent.
                    // So we just set fixture.
                    if (match.lineups) setLineups(match.lineups);
                }
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

    const isLive = fixture.event_status === 'Live' || !isNaN(Number(fixture.event_status));

    // Consolidate events (goals + cards) for timeline
    const timelineEvents = [
        ...(fixture.goalscorers || []).map(g => ({ type: 'Goal', time: g.time, player: g.home_scorer || g.away_scorer, team: g.home_scorer ? 'home' : 'away', detail: g.score })),
        ...(fixture.cards || []).map(c => ({ type: 'Card', time: c.time, player: c.home_fault || c.away_fault, team: c.home_fault ? 'home' : 'away', detail: c.card }))
    ].sort((a, b) => parseInt(a.time) - parseInt(b.time));

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Scoreboard */}
            <div className="bg-gradient-to-b from-surface to-background border-b border-white/5 pt-8 pb-4 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* League Info */}
                    <Link href={`/leagues/${fixture.league_key}`} className="flex items-center justify-center gap-2 mb-6 text-text-muted text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
                        <img src={fixture.league_logo} alt={fixture.league_name} className="w-5 h-5 object-contain" />
                        <span>{fixture.league_name}</span>
                        {fixture.league_round && <span className="text-text-secondary">• {fixture.league_round}</span>}
                    </Link>

                    {/* Scoreboard */}
                    <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <Link href={`/teams/${fixture.home_team_key}`} className="flex-1 flex flex-col items-center gap-4 group hover:opacity-80 transition-opacity">
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 group-hover:scale-105 transition-transform duration-300">
                                <Image src={fixture.home_team_logo || ''} alt={fixture.event_home_team || ''} fill className="object-contain drop-shadow-xl" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white text-center group-hover:text-accent-green transition-colors">{fixture.event_home_team}</h2>
                        </Link>

                        {/* Score */}
                        <div className="flex flex-col items-center px-4 sm:px-12">
                            <div className="flex items-center gap-4 text-4xl sm:text-6xl font-black text-white mb-2 tracking-tighter">
                                <span>{fixture.event_final_result ? fixture.event_final_result.split(' - ')[0] : '-'}</span>
                                <span className="opacity-50 text-3xl sm:text-4xl">:</span>
                                <span>{fixture.event_final_result ? fixture.event_final_result.split(' - ')[1] : '-'}</span>
                            </div>
                            <div className={`px-3 py-1 rounded text-sm font-bold tracking-wider uppercase
                                ${isLive ? 'bg-accent-red text-white animate-pulse' : 'bg-white/10 text-text-muted'}
                            `}>
                                {fixture.event_status}
                            </div>
                        </div>

                        {/* Away Team */}
                        <Link href={`/teams/${fixture.away_team_key}`} className="flex-1 flex flex-col items-center gap-4 group hover:opacity-80 transition-opacity">
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 group-hover:scale-105 transition-transform duration-300">
                                <Image src={fixture.away_team_logo || ''} alt={fixture.event_away_team || ''} fill className="object-contain drop-shadow-xl" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white text-center group-hover:text-accent-green transition-colors">{fixture.event_away_team}</h2>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-center gap-8">
                        {(['summary', 'lineups', 'stats', 'info'] as const).map((tab) => (
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

                            {timelineEvents.map((event, index) => {
                                const isHome = event.team === 'home';
                                return (
                                    <div key={index} className={`flex items-center ${isHome ? 'flex-row' : 'flex-row-reverse'} md:justify-center relative`}>
                                        <div className={`flex-1 flex ${isHome ? 'justify-end md:pr-12' : 'justify-start md:pl-12'}`}>
                                            <div className="bg-surface border border-white/5 p-3 rounded-xl shadow-lg min-w-[140px]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold ${event.type === 'Goal' ? 'text-accent-green' : 'text-secondary'}`}>
                                                        {event.type}
                                                    </span>
                                                    <span className="text-xs text-text-muted">{event.detail}</span>
                                                </div>
                                                <div className="font-bold text-white text-sm">
                                                    {event.player}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time Badge */}
                                        <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs font-bold text-white z-10">
                                            {event.time}
                                        </div>

                                        <div className="flex-1 hidden md:block" />
                                    </div>
                                );
                            })}

                            {timelineEvents.length === 0 && (
                                <p className="text-center text-text-muted italic">No major events recorded yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'lineups' && (
                    <div className="animate-fade-in">
                        {lineups ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[lineups.home_team, lineups.away_team].map((teamLineup, idx) => (
                                    <div key={idx} className="bg-surface/30 rounded-xl p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                                            <h3 className="font-bold text-white">{idx === 0 ? fixture.event_home_team : fixture.event_away_team}</h3>
                                            <span className="text-xs font-mono text-secondary bg-surface px-2 py-1 rounded">{idx === 0 ? fixture.event_home_formation : fixture.event_away_formation}</span>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-text-muted uppercase mb-3">Starting XI</h4>
                                                <ul className="space-y-2">
                                                    {teamLineup.starting_lineups.map((player) => (
                                                        <li key={player.player_key} className="flex items-center gap-3 text-sm">
                                                            <span className="w-6 text-center text-text-secondary font-mono text-xs">{player.player_number}</span>
                                                            <Link href={`/players/${player.player_key}`} className="text-white font-medium hover:text-secondary hover:underline transition-colors">
                                                                {player.player}
                                                            </Link>
                                                            <span className="text-[10px] text-text-muted bg-white/5 px-1.5 rounded">{player.player_position}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-text-muted uppercase mb-3">Substitutes</h4>
                                                <ul className="space-y-2">
                                                    {teamLineup.substitutes.map((player) => (
                                                        <li key={player.player_key} className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity">
                                                            <span className="w-6 text-center text-text-secondary font-mono text-xs">{player.player_number}</span>
                                                            <Link href={`/players/${player.player_key}`} className="text-text-primary hover:text-secondary hover:underline transition-colors">
                                                                {player.player}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-2 border-t border-white/5 text-sm">
                                                <span className="text-text-muted">Coach: </span>
                                                <Link href={`/coaches/${idx}`} className="text-white font-semibold hover:underline">
                                                    {teamLineup.coaches && teamLineup.coaches[0]?.coache ? teamLineup.coaches[0].coache : 'Unknown'}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
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

                {activeTab === 'info' && (
                    <div className="animate-fade-in bg-surface/30 rounded-xl p-6 border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-6">Match Info</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-text-muted">Venue</span>
                                <span className="text-white font-medium text-right">{fixture.event_stadium}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-text-muted">Referee</span>
                                <Link href="/officials/1" className="text-white font-medium text-right hover:underline hover:text-secondary">{fixture.event_referee || 'N/A'}</Link>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-text-muted">Date</span>
                                <span className="text-white font-medium text-right">{new Date(fixture.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-text-muted">Kickoff</span>
                                <span className="text-white font-medium text-right">{fixture.event_time}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-text-muted">League</span>
                                <span className="text-white font-medium text-right">{fixture.league_name} - {fixture.league_round}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
