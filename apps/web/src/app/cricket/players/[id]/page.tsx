'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cricketApi } from '../../../../services/cricketApi';
import { CricketPlayer } from '@goalmills/types';
import Image from 'next/image';

export default function CricketPlayerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [player, setPlayer] = useState<CricketPlayer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const playerId = Number(params.id);
            try {
                // Efficiently find player from mock data (same logic as mobile)
                const teamsRes = await cricketApi.getTeams();
                for (const team of teamsRes.teams) {
                    const playersRes = await cricketApi.getPlayersByTeamId({ teamId: team.id });
                    const found = playersRes.players.find(p => p.id === playerId);
                    if (found) {
                        setPlayer(found);
                        break;
                    }
                }
            } catch (error) {
                console.error('Error loading player details:', error);
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

    if (!player) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl font-bold mb-4">Player Not Found</h2>
                <button onClick={() => router.back()} className="text-secondary hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[90px] pb-10">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Player Profile</span>
                </div>

                {/* Profile Card */}
                <div className="glass-card rounded-2xl p-8 mb-6 border border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex flex-col items-center">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl mb-6">
                            {player.image ? (
                                <Image src={player.image} alt={player.name} width={160} height={160} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mb-2 text-center">{player.name}</h1>
                        <div className="inline-block bg-secondary/20 px-4 py-1.5 rounded-full border border-secondary/30">
                            <span className="text-secondary font-bold uppercase tracking-wider text-sm">{player.role}</span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-secondary rounded-full"></span>
                        Personal Info
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                            <span className="text-text-secondary font-medium">Batting Style</span>
                            <span className="text-white font-bold">{player.battingStyle}</span>
                        </div>
                        {player.bowlingStyle && (
                            <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                <span className="text-text-secondary font-medium">Bowling Style</span>
                                <span className="text-white font-bold">{player.bowlingStyle}</span>
                            </div>
                        )}
                        {/* Placeholder for Age/Country if we had it in mock data */}
                        <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                            <span className="text-text-secondary font-medium">Country</span>
                            <span className="text-white font-bold">Unknown (Mock)</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-white/5 mt-6">
                    <h2 className="text-xl font-bold text-white mb-4">Stats</h2>
                    <p className="text-text-muted italic text-center py-4">Detailed statistics coming soon...</p>
                </div>
            </div>
        </div>
    );
}
