'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cricketApi } from '../../../../services/cricketApi';
import { CricketTeam, CricketPlayer } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';

export default function CricketTeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [team, setTeam] = useState<CricketTeam | null>(null);
    const [players, setPlayers] = useState<CricketPlayer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const teamId = Number(params.id);
            try {
                const teamsRes = await cricketApi.getTeams();
                const foundTeam = teamsRes.teams.find(t => t.id === teamId);
                setTeam(foundTeam || null);

                if (foundTeam) {
                    const playersRes = await cricketApi.getPlayersByTeamId({ teamId });
                    setPlayers(playersRes.players);
                }
            } catch (error) {
                console.error('Error loading team details:', error);
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

    if (!team) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl font-bold mb-4">Team Not Found</h2>
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
                    <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Team Details</span>
                </div>

                {/* Team Header Card */}
                <div className="glass-card rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 border border-white/5">
                    <div className="relative w-32 h-32 bg-white/5 rounded-full p-4 shadow-xl flex items-center justify-center overflow-hidden">
                        {team.logo ? (
                            <Image src={team.logo} alt={team.name} width={128} height={128} className="object-contain w-full h-full" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-white mb-2">{team.name}</h1>
                        <p className="text-xl text-text-secondary">{team.country}</p>
                    </div>
                </div>

                {/* Squad Section */}
                <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-secondary">Squad</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {players.map(player => (
                        <Link
                            href={`/cricket/players/${player.id}`}
                            key={player.id}
                            className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all group"
                        >
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 shrink-0 border border-white/10 group-hover:border-white/30 transition-colors">
                                {player.image ? (
                                    <Image src={player.image} alt={player.name} width={64} height={64} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-white group-hover:text-secondary transition-colors">{player.name}</h3>
                                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">{player.role}</p>
                                <p className="text-[10px] text-text-muted">{player.battingStyle}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
