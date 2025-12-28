'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { FootballLeague, FootballEvent, FootballStanding, FootballTopscorer } from '@goalmills/types';
import { FootballMatchCard } from '../../../components/FootballMatchCard';
import { FootballStandingsTable } from '../../../components/FootballStandingsTable';
import { FootballTopScorers } from '../../../components/FootballTopScorers';
import { BackButton } from '../../../components/BackButton';

type Tab = 'fixtures' | 'results' | 'standings' | 'topscorers';

export default function LeagueDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const leagueId = Number(params.id);

    const [activeTab, setActiveTab] = useState<Tab>('fixtures');
    const [loading, setLoading] = useState(true);
    const [league, setLeague] = useState<FootballLeague | null>(null);
    const [events, setEvents] = useState<FootballEvent[]>([]);
    const [standings, setStandings] = useState<FootballStanding[]>([]);
    const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!leagueId) return;

            try {
                console.log('🔄 Loading league data for ID:', leagueId);

                const today = new Date();
                const past = new Date(today);
                past.setDate(past.getDate() - 30);
                const future = new Date(today);
                future.setDate(future.getDate() + 30);

                const formatDate = (date: Date) => date.toISOString().split('T')[0];

                const [leaguesRes, fixturesRes, standingsRes, topscorersRes] = await Promise.all([
                    advancedFootballApi.getLeagues().catch(err => {
                        console.error('❌ Leagues API error:', err);
                        return { success: 1, result: [] };
                    }),
                    advancedFootballApi.getFixtures({
                        from: formatDate(past),
                        to: formatDate(future),
                        leagueId: leagueId
                    }).catch(err => {
                        console.error('❌ Fixtures API error:', err);
                        return { success: 1, result: [] };
                    }),
                    advancedFootballApi.getStandings(leagueId).catch(err => {
                        console.error('❌ Standings API error:', err);
                        return { success: 1, result: { total: [], home: [], away: [] } };
                    }),
                    advancedFootballApi.getTopscorers(leagueId).catch(err => {
                        console.error('❌ Topscorers API error:', err);
                        return { success: 1, result: [] };
                    })
                ]);

                const foundLeague = leaguesRes.result.find(l => l.league_key === String(leagueId));

                // If league not found in leagues list, try to get it from fixtures
                if (!foundLeague && fixturesRes.result.length > 0) {
                    const firstFixture = fixturesRes.result[0];
                    setLeague({
                        league_key: String(leagueId),
                        league_name: firstFixture.league_name,
                        league_logo: firstFixture.league_logo || '',
                        country_key: firstFixture.event_country_key || '',
                        country_name: firstFixture.country_name,
                        country_logo: firstFixture.country_logo || '',
                    } as FootballLeague);
                    console.log('✅ League info extracted from fixtures:', firstFixture.league_name);
                } else {
                    setLeague(foundLeague || null);
                    if (foundLeague) {
                        console.log('✅ Found league:', foundLeague.league_name);
                    } else {
                        console.error('❌ League not found with ID:', leagueId);
                    }
                }

                setEvents(fixturesRes.result || []);
                setStandings(standingsRes.result?.total || []);
                setTopscorers(topscorersRes.result || []);

                console.log('✅ League data loaded:', {
                    fixtures: fixturesRes.result?.length || 0,
                    standings: standingsRes.result?.total?.length || 0,
                    topscorers: topscorersRes.result?.length || 0
                });

            } catch (error) {
                console.error('❌ Error loading league data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [leagueId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-[90px] p-4">
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-surfaceHighlight/50 rounded-full" />
                        <div className="space-y-4">
                            <div className="h-8 w-64 bg-surfaceHighlight/50 rounded-lg" />
                            <div className="h-4 w-32 bg-surfaceHighlight/30 rounded-lg" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-surfaceHighlight/30 rounded-xl" />
                            ))}
                        </div>
                        <div className="space-y-4">
                            <div className="h-96 bg-surfaceHighlight/30 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!league) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold text-white mb-4">League Not Found</h1>
                <BackButton className="mt-4" />
            </div>
        );
    }

    const upcomingEvents = events.filter(e => e.event_status === 'Not Started').sort((a, b) => new Date(`${a.event_date} ${a.event_time}`).getTime() - new Date(`${b.event_date} ${b.event_time}`).getTime());
    const finishedEvents = events.filter(e => e.event_status === 'Finished').sort((a, b) => new Date(`${b.event_date} ${b.event_time}`).getTime() - new Date(`${a.event_date} ${a.event_time}`).getTime());

    return (
        <div className="min-h-screen bg-background pt-[90px] pb-20">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 pt-8 pb-6 px-4 relative">
                <BackButton className="absolute top-4 left-4 z-20" />
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <img src={league.league_logo} alt={league.league_name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-white mb-2">{league.league_name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-3 text-text-muted font-medium">
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-sm">
                                <img src={league.country_logo} alt={league.country_name} className="w-4 h-3 object-cover rounded-sm" />
                                {league.country_name}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-[90px] z-30 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                        {(['fixtures', 'results', 'standings', 'topscorers'] as const).map((tab) => (
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

            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'fixtures' && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4">Upcoming Matches</h3>
                        {upcomingEvents.map((event, index) => (
                            <FootballMatchCard key={`fixture-${event.event_key}-${index}`} event={event} />
                        ))}
                        {upcomingEvents.length === 0 && <p className="text-text-muted text-center py-8">No upcoming matches.</p>}
                    </div>
                )}
                {activeTab === 'results' && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4">Recent Results</h3>
                        {finishedEvents.map((event, index) => (
                            <FootballMatchCard key={`result-${event.event_key}-${index}`} event={event} />
                        ))}
                        {finishedEvents.length === 0 && <p className="text-text-muted text-center py-8">No recent results.</p>}
                    </div>
                )}
                {activeTab === 'standings' && (
                    <div className="animate-fade-in">
                        <div className="glass-card rounded-xl overflow-hidden">
                            <FootballStandingsTable standings={standings} teams={[]} />
                        </div>
                    </div>
                )}

                {activeTab === 'topscorers' && (
                    <div className="animate-fade-in">
                        <FootballTopScorers scorers={topscorers} teams={[]} />
                    </div>
                )}
            </div>

        </div>
    );
}
