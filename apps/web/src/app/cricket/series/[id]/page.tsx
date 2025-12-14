'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cricketApi } from '../../../../services/cricketApi';
import { CricketSeries } from '@goalmills/types';
import Image from 'next/image';

export default function CricketSeriesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [series, setSeries] = useState<CricketSeries | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const seriesId = Number(params.id);
            try {
                const response = await cricketApi.getSeries();
                const found = response.series.find(s => s.id === seriesId);
                setSeries(found || null);
            } catch (error) {
                console.error('Error loading series:', error);
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
            <div className="max-w-5xl mx-auto px-4">
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

                {/* Hero Banner */}
                <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] to-transparent z-10" />
                    {series.image && <Image src={series.image} alt={series.name} fill className="object-cover" />}

                    <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                        <div className="inline-block bg-secondary px-3 py-1 rounded text-xs font-bold text-white uppercase tracking-wider mb-3">
                            {series.seriesType}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{series.name}</h1>
                        <div className="flex items-center gap-4 text-gray-300 font-medium">
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                {new Date(series.startDate).toLocaleDateString()} - {new Date(series.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {series.country || series.tournament}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Tabs (Simplified) */}
                <div className="glass-card rounded-xl p-6 border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-4">Matches</h2>
                    <p className="text-text-muted text-center py-8">Match schedule for this series will appear here.</p>
                </div>
            </div>
        </div>
    );
}
