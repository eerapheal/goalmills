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
                console.log('🔄 Loading country data for ID:', id);

                // Fetch both countries and leagues in parallel
                const [countriesRes, leaguesRes] = await Promise.all([
                    advancedFootballApi.getCountries().catch(() => ({ result: [] })),
                    advancedFootballApi.getLeagues(Number(id)).catch(() => ({ result: [] }))
                ]);

                const foundLeagues = leaguesRes.result || [];
                setLeagues(foundLeagues);

                const foundCountry = countriesRes.result?.find(c => String(c.country_key) === String(id));

                if (foundCountry) {
                    setCountry(foundCountry);
                    console.log('✅ Found country in global list:', foundCountry.country_name);
                } else if (foundLeagues.length > 0) {
                    // Fallback: extract country info from the first league
                    const firstLeague = foundLeagues[0];
                    setCountry({
                        country_key: String(id),
                        country_name: firstLeague.country_name,
                        country_logo: firstLeague.country_logo,
                        country_iso2: null
                    } as FootballCountry);
                    console.log('⚠️ Country info extracted from league data:', firstLeague.country_name);
                } else {
                    console.error('❌ Country not found with ID:', id);
                    setCountry(null);
                }

                console.log(`📊 Loaded ${foundLeagues.length} leagues for country ID ${id}`);

            } catch (error) {
                console.error('❌ Error loading country data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-[90px] p-4">
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-surfaceHighlight/50 rounded-full" />
                        <div className="space-y-4">
                            <div className="h-6 w-48 bg-surfaceHighlight/50 rounded-lg" />
                            <div className="h-4 w-24 bg-surfaceHighlight/30 rounded-lg" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-20 bg-surfaceHighlight/30 rounded-xl" />
                        ))}
                    </div>
                </div>
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
