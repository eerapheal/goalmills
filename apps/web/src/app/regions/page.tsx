'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { footballApi } from '../../services/footballApi';
import { League } from '@goalmills/types';
import { getLeagueRank } from '../../lib/utils';

export default function RegionsPage() {
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<League[]>([]);

    useEffect(() => {
        const loadLeagues = async () => {
            const data = await footballApi.getLeagues();
            // Sort by ranking
            const sorted = data.sort((a, b) => getLeagueRank(a.id) - getLeagueRank(b.id));
            setLeagues(sorted);
            setLoading(false);
        };
        loadLeagues();
    }, []);

    // Group by Country/Region
    const regions = Array.from(new Set(leagues.map(l => l.country))).sort();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-black text-white mb-8">Competitions</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {leagues.map((league) => (
                        <Link
                            href={`/leagues/${league.id}`}
                            key={league.id}
                            className="glass-card p-4 rounded-xl flex items-center gap-4 hover:scale-105 transition-transform duration-300 group"
                        >
                            <div className="relative w-12 h-12 bg-white/5 rounded-lg p-2">
                                <Image src={league.logo} alt={league.name} fill className="object-contain p-1" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white group-hover:text-secondary transition-colors line-clamp-1">{league.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="relative w-4 h-3 overflow-hidden rounded-[2px] opacity-70">
                                        <Image src={league.flag} alt={league.country} fill className="object-cover" />
                                    </div>
                                    <span className="text-xs text-text-muted">{league.country}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
