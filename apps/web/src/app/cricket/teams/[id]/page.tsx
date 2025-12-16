'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketTeam, CricketEvent } from '@goalmills/types';
import { CricketMatchCard } from '../../../../components/CricketMatchCard';
import Image from 'next/image';

export default function CricketTeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [team, setTeam] = useState<CricketTeam | null>(null);
    const [matches, setMatches] = useState<CricketEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const teamId = String(params.id);
            try {
                const teamsRes = await advancedCricketApi.getTeams({ teamId, APIkey: 'mock' });
                const foundTeam = teamsRes.result[0];
                setTeam(foundTeam || null);

                if (foundTeam) {
                    // Get team matches
                    const today = new Date().toISOString().split('T')[0];
                    const futureDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
                    const matchesRes = await advancedCricketApi.getFixtures({
                        from: today,
                        to: futureDate,
                        APIkey: 'mock'
                    });
                    // Filter matches where this team is playing
                    const teamMatches = matchesRes.result.filter(
                        m => m.home_team_key === teamId || m.away_team_key === teamId
                    );
                    setMatches(teamMatches);
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
                    {team.team_logo ? (
                        <div className="relative w-32 h-32 bg-white/5 rounded-full p-4 shadow-xl flex items-center justify-center overflow-hidden">
                            <Image src={team.team_logo} alt={team.team_name} width={128} height={128} className="object-contain w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center shadow-xl">
                            <span className="text-5xl font-bold text-blue-400">{team.team_name.charAt(0)}</span>
                        </div>
                    )}
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-white mb-2">{team.team_name}</h1>
                        <p className="text-xl text-text-secondary">International Cricket Team</p>
                    </div>
                </div>

                {/* Matches Section */}
                <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-secondary">Upcoming Matches</h2>
                {matches.length > 0 ? (
                    <div className="space-y-2">
                        {matches.map(match => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-xl p-8 text-center">
                        <p className="text-text-secondary">No upcoming matches scheduled for this team.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
