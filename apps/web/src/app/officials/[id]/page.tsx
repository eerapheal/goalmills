'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { FootballOfficial } from '@goalmills/types';
import { BackButton } from '../../../components/BackButton';

export default function OfficialDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const officialId = params.id;

    const [loading, setLoading] = useState(true);
    const [official, setOfficial] = useState<FootballOfficial | null>(null);

    useEffect(() => {
        const loadOfficial = async () => {
            try {
                const res = await advancedFootballApi.getOfficials();
                const officials = res.result;
                const index = Number(officialId) % officials.length;
                const found = isNaN(index) ? officials[0] : officials[index];
                setOfficial(found);
            } catch (error) {
                console.error('Error loading official:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOfficial();
    }, [officialId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!official) return null;

    return (
        <div className="min-h-screen bg-background pt-[90px] pb-20 p-4">
            <div className="max-w-3xl mx-auto glass-card rounded-2xl overflow-hidden animate-fade-in relative">
                <BackButton className="absolute top-4 left-4 z-20" />
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
                        <img src={official.image} alt={official.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-white mb-2">{official.name}</h1>
                        <p className="text-xl text-text-muted flex items-center justify-center md:justify-start gap-2">
                            <span>🚩</span> Referee • {official.country}
                        </p>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surfaceHighlight/30 p-6 rounded-xl text-center border border-white/5">
                        <span className="block text-4xl font-black text-white mb-2">{official.matches}</span>
                        <span className="text-sm text-text-muted uppercase tracking-wider font-bold">Matches Officiated</span>
                    </div>
                    <div className="bg-surfaceHighlight/30 p-6 rounded-xl text-center border border-white/5">
                        <span className="block text-4xl font-black text-yellow-400 mb-2">{official.yellowCards}</span>
                        <span className="text-sm text-text-muted uppercase tracking-wider font-bold">Yellow Cards</span>
                    </div>
                    <div className="bg-surfaceHighlight/30 p-6 rounded-xl text-center border border-white/5">
                        <span className="block text-4xl font-black text-accent-red mb-2">{official.redCards}</span>
                        <span className="text-sm text-text-muted uppercase tracking-wider font-bold">Red Cards</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
