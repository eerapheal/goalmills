'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { FootballLeague, FootballCountry } from '@goalmills/types';
import { BackButton } from '../../../components/BackButton';

export default function CountryPage() {
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<FootballLeague[]>([]);
    const [country, setCountry] = useState<FootballCountry | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const [leaguesRes, countriesRes] = await Promise.all([
                    advancedFootballApi.getLeagues(Number(id)),
                    advancedFootballApi.getCountries()
                ]);

                setLeagues(leaguesRes.result);
                const foundCountry = countriesRes.result.find(c => c.country_key === id);
                setCountry(foundCountry || null);
            } catch (error) {
                console.error('Error loading country data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!country && !loading) {
        return (
            <div className="min-h-screen bg-background pt-[90px] p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl text-white font-bold mb-2">Country Not Found</h1>
                    <BackButton className="mt-4" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pt-[90px] pb-20 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <BackButton />
                </div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-surface rounded-full p-4 flex items-center justify-center shadow-lg">
                        <img
                            src={country?.country_logo}
                            alt={country?.country_name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">{country?.country_name}</h1>
                        <p className="text-text-muted">Competitions</p>
                    </div>
                </div>

                {leagues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leagues.map((league) => (
                            <Link
                                href={`/leagues/${league.league_key}`}
                                key={league.league_key}
                                className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-surfaceHighlight/50 transition-all cursor-pointer group"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                    <img src={league.league_logo} alt={league.league_name} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-lg group-hover:text-white transition-colors">{league.league_name}</h3>
                                    <p className="text-sm text-text-muted">{league.country_name}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 rounded-xl text-center">
                        <p className="text-xl text-text-muted">No competitions found for this country.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
