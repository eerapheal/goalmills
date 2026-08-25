'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketLeague, CricketEvent, CricketStanding } from '@goalmills/types';
import { CricketMatchCard } from '../../../../components/CricketMatchCard';
import Image from 'next/image';
import Link from 'next/link';

type TabType = 'fixtures' | 'standings';

export default function CricketSeriesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [series, setSeries] = useState<CricketLeague | null>(null);
    const [fixtures, setFixtures] = useState<CricketEvent[]>([]);
    const [standings, setStandings] = useState<CricketStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('fixtures');

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const seriesId = String(params.id);
            try {
                // Get all leagues to find this specific one
                const seriesRes = await advancedCricketApi.getLeagues();
                const foundSeries = seriesRes.result.find(s => String(s.league_key) === seriesId) || {
                    league_key: seriesId,
                    league_name: `Cricket Series #${seriesId}`,
                    country_name: 'International Events',
                    league_season: '2026',
                    league_year: '2026 Edition',
                };
                setSeries(foundSeries);

                // Parallel fetch for fixtures and standings
                const [fixturesRes, standingsRes] = await Promise.all([
                    advancedCricketApi.getFixtures({
                        leagueId: Number(seriesId),
                        from: advancedCricketApi.getFormattedDate(-30),
                        to: advancedCricketApi.getFormattedDate(60),
                    }),
                    advancedCricketApi.getStandings({
                        leagueId: Number(seriesId)
                    }).catch(() => ({ success: 1, result: { total: [] } }))
                ]);

                setFixtures(fixturesRes.result || []);
                setStandings(standingsRes.result?.total || []);
            } catch (error) {
                console.error('Error loading series intelligence:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-text-secondary font-black uppercase tracking-widest text-xs">Accessing Series Archive...</p>
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center text-white px-4 text-center">
                <div className="text-6xl mb-6">🔍</div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Intel Not Found</h2>
                <p className="text-text-secondary mb-8 max-w-md">The requested series data is currently restricted or deprecated from the live feed.</p>
                <button
                    onClick={() => router.push('/cricket')}
                    className="px-8 py-3 bg-secondary text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Back to Cricket Central
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-24">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header Navigation */}
                <div className="flex items-center gap-6 mb-12">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:border-secondary transition-all hover:scale-110 group shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Series Intelligence</span>
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mt-1">Tournament Overview</h1>
                    </div>
                </div>

                {/* Unified Series Identity Card */}
                <div className="glass-card rounded-3xl p-6 md:p-8 mb-8 border border-white/10 relative overflow-hidden group bg-gradient-to-br from-white/[0.07] via-[#0a0e27] to-[#0d143d]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 shadow-lg p-4 flex items-center justify-center">
                            {series.league_logo ? (
                                <Image src={series.league_logo} alt={series.league_name} width={112} height={112} className="object-contain w-full h-full" />
                            ) : (
                                <span className="text-4xl font-bold text-blue-400">{series.league_name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="inline-flex px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-wider mb-2 border border-secondary/20">
                                {series.country_name || 'International Events'}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 uppercase tracking-tight leading-tight">{series.league_name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{series.league_season || '2026 Edition'}</span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{series.league_year || 'Official Tournament'}</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Sub-Navigation Tabs */}
                <div className="flex gap-4 mb-10 bg-white/5 p-2 rounded-2xl border border-white/5">
                    {[
                        { id: 'fixtures', label: 'Match Schedule', icon: '📅' },
                        { id: 'standings', label: 'League Standings', icon: '📈' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                                ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-xs">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Dynamic Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {activeTab === 'fixtures' ? (
                        <div className="space-y-4">
                            {fixtures.length > 0 ? (
                                fixtures.map(match => (
                                    <CricketMatchCard key={match.event_key} match={match} />
                                ))
                            ) : (
                                <EmptyPlaceholder icon="🏏" title="No Active Fixtures" message="There are currently no scheduled matches or recent results available for this series in the live roster." />
                            )}
                        </div>
                    ) : (
                        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                            {standings.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="text-text-muted uppercase tracking-[0.2em] bg-white/5">
                                            <tr>
                                                <th className="py-6 px-8">#</th>
                                                <th className="py-6 px-4">Squad Name</th>
                                                <th className="py-6 px-4 text-center">P</th>
                                                <th className="py-6 px-4 text-center">W</th>
                                                <th className="py-6 px-4 text-center">L</th>
                                                <th className="py-6 px-4 text-center">Pts</th>
                                                <th className="py-6 px-8 text-right">NRR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-white">
                                            {standings.map((rank, i) => (
                                                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                                    <td className="py-5 px-8 font-black text-text-muted/50 tabular-nums">{(i + 1).toString().padStart(2, '0')}</td>
                                                    <td className="py-5 px-4">
                                                        <Link href={`/cricket/teams/${rank.team_key}`} className="font-black text-sm uppercase tracking-tight group-hover:text-secondary transition-colors">
                                                            {rank.standing_team}
                                                        </Link>
                                                    </td>
                                                    <td className="py-5 px-4 text-center font-black tabular-nums">{rank.standing_MP}</td>
                                                    <td className="py-5 px-4 text-center font-bold text-emerald-500 tabular-nums">{rank.standing_W}</td>
                                                    <td className="py-5 px-4 text-center font-bold text-rose-500 tabular-nums">{rank.standing_L}</td>
                                                    <td className="py-5 px-4 text-center font-black text-secondary tabular-nums">{rank.standing_Pts}</td>
                                                    <td className={`py-5 px-8 text-right font-black tabular-nums ${parseFloat(rank.standing_NRR) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {rank.standing_NRR}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyPlaceholder icon="📈" title="Standings Evaluated" message="League table data is either not applicable for this series format or is currently being calculated." />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyPlaceholder({ icon, title, message }: { icon: string, title: string, message: string }) {
    return (
        <div className="glass-card rounded-[2.5rem] p-20 text-center border-2 border-dashed border-white/5 bg-transparent">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <span className="text-4xl opacity-40 grayscale">{icon}</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{title}</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto font-medium leading-relaxed">{message}</p>
        </div>
    );
}
