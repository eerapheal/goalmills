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
                // Get series details
                const seriesRes = await advancedCricketApi.getLeagues({ APIkey: 'mock' });
                const foundSeries = seriesRes.result.find(s => s.league_key === seriesId);
                setSeries(foundSeries || null);

                if (foundSeries) {
                    // Get fixtures for this series
                    const today = new Date().toISOString().split('T')[0];
                    const futureDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
                    const fixturesRes = await advancedCricketApi.getFixtures({
                        leagueId: Number(seriesId),
                        from: today,
                        to: futureDate,
                        APIkey: 'mock'
                    });
                    setFixtures(fixturesRes.result || []);
                }
            } catch (error) {
                console.error('Error loading series details:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl font-bold mb-4">Series Not Found</h2>
                <button onClick={() => router.back()} className="text-secondary hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[90px] pb-10">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Series Details</span>
                </div>

                {/* Series Header Card */}
                <div className="glass-card rounded-2xl p-8 mb-8 border border-white/5">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {series.league_logo ? (
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-xl flex-shrink-0">
                                <Image src={series.league_logo} alt={series.league_name} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-32 h-32 bg-blue-500/20 rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
                                <span className="text-5xl font-bold text-blue-400">{series.league_name.charAt(0)}</span>
                            </div>
                        )}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl font-extrabold text-white mb-2">{series.league_name}</h1>
                            <p className="text-xl text-text-secondary mb-2">{series.league_season} • {series.country_name}</p>
                            <p className="text-lg text-text-muted">{series.league_year}</p>
                        </div>
                    </div>
                </div>

                {/* Fixtures Section */}
                <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-secondary">Fixtures</h2>
                {fixtures.length > 0 ? (
                    <div className="space-y-2">
                        {fixtures.map(match => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-xl p-8 text-center">
                        <p className="text-text-secondary">No fixtures available for this series.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
