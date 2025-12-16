'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { FootballTeam, FootballLeague, FootballPlayer } from '@goalmills/types';

export default function TeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<FootballTeam | null>(null);
    const [players, setPlayers] = useState<FootballPlayer[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!teamId) return;

            try {
                // In a real app, we might get specific team details and players here
                // For mock, we reuse getTeams and getPlayers
                const [teamsRes, playersRes] = await Promise.all([
                    advancedFootballApi.getTeams({ teamId }),
                    advancedFootballApi.getPlayers({ teamId }),
                ]);

                if (teamsRes.result && teamsRes.result.length > 0) {
                    setTeam(teamsRes.result[0]);
                }
                setPlayers(playersRes.result);

            } catch (error) {
                console.error('Error loading team data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [teamId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold text-white mb-4">Team Not Found</h1>
                <button onClick={() => router.back()} className="text-secondary hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-[90px] pb-20">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 pt-12 pb-8 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <img src={team.team_logo} alt="" className="object-cover blur-3xl scale-150 w-full h-full" />
                </div>

                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10">
                    <div className="w-32 h-32 relative mb-6 drop-shadow-2xl bg-white/10 rounded-full p-4">
                        <img src={team.team_logo} alt={team.team_name} className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 text-center">{team.team_name}</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Squad</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player) => (
                        <Link
                            href={`/players/${player.player_key}`}
                            key={player.player_key}
                            className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-surfaceHighlight/50 transition-all cursor-pointer group"
                        >
                            <div className="w-16 h-16 bg-white/5 rounded-full overflow-hidden shrink-0">
                                <img src={player.player_image} alt={player.player_name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white group-hover:text-secondary transition-colors">{player.player_name}</h3>
                                <p className="text-sm text-text-muted">{player.player_type} • #{player.player_number}</p>
                            </div>
                        </Link>
                    ))}
                    {players.length === 0 && (
                        <p className="text-text-muted col-span-full text-center py-8">No players found for this team.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
