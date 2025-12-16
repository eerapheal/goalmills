'use client';

import { useState, useEffect } from 'react';
import { CricketEvent, CricketLeague, CricketTeam } from '@goalmills/types';
import { advancedCricketApi } from '../services/advancedCricketApi';
import { CricketMatchCard } from './CricketMatchCard';
import Image from 'next/image';
import Link from 'next/link';

type CricketTab = 'live' | 'upcoming' | 'results' | 'series' | 'teams' | 'rankings';

export function CricketScreen() {
    const [activeTab, setActiveTab] = useState<CricketTab>('live');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data states
    const [liveMatches, setLiveMatches] = useState<CricketEvent[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<CricketEvent[]>([]);
    const [recentMatches, setRecentMatches] = useState<CricketEvent[]>([]);
    const [seriesList, setSeriesList] = useState<CricketLeague[]>([]);
    const [teamsList, setTeamsList] = useState<CricketTeam[]>([]);

    const getDateString = (daysOffset: number = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    };

    const loadData = async () => {
        try {
            const today = getDateString();
            const futureDate = getDateString(7);
            const pastDate = getDateString(-7);

            const [live, upcoming, recent, series, teams] = await Promise.all([
                advancedCricketApi.getLivescore({ APIkey: 'mock' }),
                advancedCricketApi.getFixtures({ from: today, to: futureDate, APIkey: 'mock' }),
                advancedCricketApi.getFixtures({ from: pastDate, to: today, APIkey: 'mock' }),
                advancedCricketApi.getLeagues({ APIkey: 'mock' }),
                advancedCricketApi.getTeams({ APIkey: 'mock' }),
            ]);

            setLiveMatches(live.result || []);
            setUpcomingMatches(upcoming.result || []);
            setRecentMatches(recent.result || []);
            setSeriesList(series.result || []);
            setTeamsList(teams.result || []);
        } catch (error) {
            console.error('Error loading cricket data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const tabs: { id: CricketTab; label: string; count?: number }[] = [
        { id: 'live', label: 'Live', count: liveMatches.length },
        { id: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
        { id: 'results', label: 'Results', count: recentMatches.length },
        { id: 'series', label: 'Series', count: seriesList.length },
        { id: 'teams', label: 'Teams', count: teamsList.length },
        { id: 'rankings', label: 'Rankings' },
    ];

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-12 animate-pulse">
                    <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-text-secondary font-medium tracking-wide">Loading cricket data...</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'live':
                return (
                    <div className="p-4 space-y-2 animate-fade-in">
                        {liveMatches.length > 0 ? (
                            <>
                                <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                    Live Matches
                                </h2>
                                {liveMatches.map((match) => (
                                    <CricketMatchCard key={match.event_key} match={match} />
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 glass-card rounded-2xl mx-auto max-w-lg mt-8 text-center">
                                <span className="text-6xl mb-6 opacity-80">🏏</span>
                                <p className="text-xl font-bold text-text-primary mb-2">No live matches right now</p>
                                <p className="text-text-muted">Check out Upcoming or Results to stay updated!</p>
                            </div>
                        )}
                    </div>
                );

            case 'upcoming':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">📅 Upcoming Matches</h2>
                        {upcomingMatches.map((match) => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))}
                    </div>
                );

            case 'results':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">✅ Recent Results</h2>
                        {recentMatches.map((match) => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))}
                    </div>
                );

            case 'series':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">🏆 Tournaments & Series</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {seriesList.map((series) => (
                                <Link
                                    href={`/cricket/series/${series.league_key}`}
                                    key={series.league_key}
                                    className="glass-card rounded-xl p-4 hover:border-white/20 transition-all flex items-center gap-4 cursor-pointer"
                                >
                                    {series.league_logo ? (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image src={series.league_logo} alt={series.league_name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl font-bold text-blue-400">{series.league_name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white mb-1 leading-tight">{series.league_name}</h3>
                                        <p className="text-xs text-text-secondary">{series.league_season} • {series.country_name}</p>
                                        <p className="text-xs text-text-muted mt-1">{series.league_year}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                );

            case 'teams':
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">Teams</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {teamsList.map((team) => (
                                <Link
                                    href={`/cricket/teams/${team.team_key}`}
                                    key={team.team_key}
                                    className="glass-card rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/5 transition-all"
                                >
                                    {team.team_logo ? (
                                        <div className="relative w-16 h-16 mb-3 bg-white/5 rounded-full p-2">
                                            <Image src={team.team_logo} alt={team.team_name} width={64} height={64} className="object-contain w-full h-full" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 mb-3 bg-blue-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-blue-400">{team.team_name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <h3 className="font-bold text-white text-sm">{team.team_name}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                );

            case 'rankings':
                return (
                    <div className="p-4 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-text-primary">ICC Rankings</h2>
                            <Link href="/cricket/rankings" className="text-sm text-secondary hover:text-white transition-colors">
                                View Full Rankings →
                            </Link>
                        </div>

                        <div className="glass-card rounded-xl overflow-hidden p-6 text-center">
                            <p className="text-text-secondary">Full rankings table implementation coming soon.</p>
                            <Link
                                href="/cricket/rankings"
                                className="inline-block mt-4 bg-secondary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-80 transition-all"
                            >
                                Go to Rankings Page
                            </Link>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex-1">
            {/* Tabs (Inside Content Area for now, or could be lifted) */}
            <div className="sticky top-[86px] z-30 bg-[#0a0e27]/95 backdrop-blur-sm border-b border-white/5 pb-2 pt-2 px-4 shadow-lg">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full border 
                                transition-all duration-300 whitespace-nowrap text-sm font-bold
                                ${activeTab === tab.id
                                    ? 'bg-secondary text-white border-secondary shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                    : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`
                                    text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                                    ${activeTab === tab.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-black/20 text-text-secondary'}`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto pb-20 mt-4">
                {refreshing && (
                    <div className="flex justify-center py-6 animate-fade-in">
                        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {renderContent()}
            </div>

            {/* Floating Action Button for Refresh */}
            <button
                onClick={onRefresh}
                disabled={refreshing}
                className="fixed bottom-8 right-8 bg-secondary text-white p-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]
                         hover:bg-amber-600 hover:scale-110 active:scale-90 transition-all duration-300 
                         disabled:opacity-50 disabled:scale-100 z-50 group"
                aria-label="Refresh Data"
            >
                <svg className={`w-6 h-6 group-hover:rotate-180 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>
    );
}
