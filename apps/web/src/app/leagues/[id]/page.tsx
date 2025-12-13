'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { League, Fixture, Standing } from '@goalmills/types';
import { footballApi } from '../../../services/footballApi';
import { FixtureCard } from '../../../components/FixtureCard';
import { StandingsTable } from '../../../components/StandingsTable';

type Tab = 'fixtures' | 'results' | 'standings';

export default function LeagueDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const leagueId = Number(params.id);

    const [activeTab, setActiveTab] = useState<Tab>('fixtures');
    const [loading, setLoading] = useState(true);
    const [league, setLeague] = useState<League | null>(null);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [standings, setStandings] = useState<Standing[]>([]);

    useEffect(() => {
        const loadLeagueData = async () => {
            if (!leagueId) return;

            try {
                const [leagueData, fixturesData, standingsData] = await Promise.all([
                    footballApi.getLeagueById(leagueId),
                    footballApi.getFixturesByLeague(leagueId),
                    footballApi.getStandingsByLeague(leagueId),
                ]);

                setLeague(leagueData);
                setFixtures(fixturesData); // This contains all fixtures (past, future)
                setStandings(standingsData);
            } catch (error) {
                console.error('Error loading league data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLeagueData();
    }, [leagueId]);

    const upcomingFixtures = fixtures.filter(f => f.fixture.status.short === 'NS' || f.fixture.status.short === 'TBD');
    const pastFixtures = fixtures.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)).reverse();
    const liveFixtures = fixtures.filter(f => ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short));

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!league) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold text-white mb-4">League Not Found</h1>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-primary rounded-lg text-white font-bold hover:bg-primary-dark transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 pt-8 pb-6 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <Image src={league.logo} alt={league.name} fill className="object-contain p-2" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-white mb-2">{league.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-3 text-text-muted font-medium">
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-sm">
                                <Image src={league.flag} alt={league.country} width={16} height={12} className="object-cover rounded-sm" />
                                {league.country}
                            </span>
                            <span className="bg-white/5 px-3 py-1 rounded-full text-sm">{league.season} Season</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8 overflow-x-auto">
                        {(['fixtures', 'results', 'standings'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    py-4 px-2 border-b-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap
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
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'fixtures' && (
                    <div className="animate-fade-in space-y-4">
                        {liveFixtures.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
                                    Live Matches
                                </h3>
                                {liveFixtures.map(fixture => (
                                    <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                                ))}
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-white mb-4">Upcoming Matches</h3>
                        {upcomingFixtures.length > 0 ? (
                            upcomingFixtures.map(fixture => (
                                <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                            ))
                        ) : (
                            <p className="text-text-muted text-center py-8">No upcoming matches scheduled.</p>
                        )}
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4">Recent Results</h3>
                        {pastFixtures.length > 0 ? (
                            pastFixtures.map(fixture => (
                                <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                            ))
                        ) : (
                            <p className="text-text-muted text-center py-8">No results found.</p>
                        )}
                    </div>
                )}

                {activeTab === 'standings' && (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4">League Table</h3>
                        <div className="glass-card rounded-xl overflow-hidden">
                            <StandingsTable standings={standings} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
