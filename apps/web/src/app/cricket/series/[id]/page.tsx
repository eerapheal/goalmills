'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketLeague, CricketEvent } from '@goalmills/types';
import { CricketMatchCard } from '../../../../components/CricketMatchCard';
import Image from 'next/image';

export default function CricketSeriesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [series, setSeries] = useState<CricketLeague | null>(null);
    const [fixtures, setFixtures] = useState<CricketEvent[]>([]);
    const [loading, setLoading] = useState(true);

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

                // Fetch fixtures for this series
                const fixturesRes = await advancedCricketApi.getFixtures({
                    leagueId: Number(seriesId),
                    from: advancedCricketApi.getFormattedDate(-30),
                    to: advancedCricketApi.getFormattedDate(60),
                });

                setFixtures(fixturesRes.result || []);
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

                {/* Section Title */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <span>📅</span> Match Schedule & Results
                    </h2>
                    <span className="text-xs text-text-muted font-bold">{fixtures.length} Matches</span>
                </div>

                {/* Match Fixtures List */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-4">
                    {fixtures.length > 0 ? (
                        fixtures.map(match => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))
                    ) : (
                        <EmptyPlaceholder icon="🏏" title="No Active Fixtures" message="There are currently no scheduled matches or recent results available for this series in the live roster." />
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
