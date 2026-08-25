'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketTeam, CricketEvent, CricketPlayer } from '@goalmills/types';
import { CricketMatchCard } from '../../../../components/CricketMatchCard';
import Image from 'next/image';
import Link from 'next/link';

type TabType = 'squad' | 'schedule' | 'results';

export default function CricketTeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [team, setTeam] = useState<CricketTeam | null>(null);
    const [matches, setMatches] = useState<CricketEvent[]>([]);
    const [players, setPlayers] = useState<CricketPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('squad');

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const teamId = String(params.id);
            try {
                setLoading(true);
                // Fetch team metadata, fixtures, and squad players
                const [teamsRes, matchesRes, playersRes] = await Promise.all([
                    advancedCricketApi.getTeams({ teamId: parseInt(teamId) }),
                    advancedCricketApi.getFixtures({
                        from: advancedCricketApi.getFormattedDate(-60),
                        to: advancedCricketApi.getFormattedDate(60),
                    }),
                    advancedCricketApi.getPlayers({ teamId }),
                ]);

                const foundTeam = teamsRes.result && teamsRes.result.length > 0
                    ? (teamsRes.result.find(t => String(t.team_key) === teamId) || teamsRes.result[0])
                    : null;
                setTeam(foundTeam);

                // Filter for matches involving this squad ID
                const teamMatches = (matchesRes.result || []).filter(
                    m => String(m.home_team_key) === teamId || String(m.away_team_key) === teamId
                );
                setMatches(teamMatches);
                setPlayers(playersRes.result || []);
            } catch (error) {
                console.error('Error loading squad intelligence:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [params.id]);

    const displayMatches = matches.filter(m => {
        if (activeTab === 'schedule') return m.event_status === 'Not Started';
        if (activeTab === 'results') return m.event_status !== 'Not Started';
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-text-secondary font-black uppercase tracking-widest text-xs">Deploying Team Profile...</p>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center text-white text-center px-4">
                <div className="text-6xl mb-6">🛡️</div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Squad Archive Error</h2>
                <p className="text-text-secondary mb-8 max-w-md">The requested squad metadata is currently unavailable in the live feed records.</p>
                <button
                    onClick={() => router.push('/cricket')}
                    className="px-8 py-3 bg-secondary text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Back to Cricket Central
                </button>
            </div>
        );
    }

    const tName = team.team_name || (team as any).name || 'International Squad';

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-24">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header Navigation */}
                <div className="flex items-center gap-6 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:border-secondary transition-all hover:scale-110 group shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Squad Analytics</span>
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mt-1">Squad Profile & Roster</h1>
                    </div>
                </div>

                {/* Team Hero Card */}
                <div className="glass-card rounded-3xl p-6 md:p-8 mb-8 border border-white/10 bg-gradient-to-br from-white/[0.07] via-[#0a0e27] to-[#0d143d] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/5 p-4 border border-white/10 shadow-lg flex items-center justify-center">
                            {team.team_logo ? (
                                <Image src={team.team_logo} alt={tName} width={72} height={72} className="object-contain" />
                            ) : (
                                <span className="text-3xl font-bold text-secondary">{tName.charAt(0)}</span>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-bold uppercase tracking-wider inline-block mb-2">
                                Registered Cricket Franchise / Nation
                            </span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight mb-1">
                                {tName}
                            </h2>
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
                                {players.length} Active Squad Members • Official Roster
                            </p>


                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">Matches Played</span>
                                    <span className="text-sm font-black text-white">{matches.length} Total</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">Team ID</span>
                                    <span className="text-sm font-black text-secondary">#{team.team_key}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub Navigation */}
                <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-8 w-fit">
                    {[
                        { id: 'squad', label: `Squad Roster (${players.length})`, icon: '👥' },
                        { id: 'schedule', label: 'Upcoming Schedule', icon: '🗓️' },
                        { id: 'results', label: 'Recent Results', icon: '📊' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                activeTab === tab.id
                                    ? 'bg-secondary text-white shadow-lg'
                                    : 'text-text-muted hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'squad' && (
                    <div className="glass-card rounded-[2.5rem] p-6 md:p-10 border border-white/5">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <span>🏏</span> Official Squad Players
                            </h3>
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                Click Player For Full Career Matrix
                            </span>
                        </div>

                        {players.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {players.map((player) => (
                                    <Link
                                        key={player.player_key}
                                        href={`/cricket/players/${player.player_key}`}
                                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/40 hover:bg-secondary/5 transition-all"
                                    >
                                        <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-secondary overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                            {player.player_image ? (
                                                <Image src={player.player_image} alt={player.player_name} fill className="object-cover" />
                                            ) : (
                                                player.player_name.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-white text-sm uppercase tracking-tight truncate group-hover:text-secondary transition-colors">
                                                {player.player_name}
                                            </h4>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                                                {player.player_type || player.player_role || 'Athlete'}
                                            </p>
                                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest mt-1 block">
                                                View Analytics →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center text-text-muted font-bold text-xs uppercase tracking-widest">
                                Squad roster announcement pending for this team.
                            </div>
                        )}
                    </div>
                )}

                {(activeTab === 'schedule' || activeTab === 'results') && (
                    <div className="space-y-4">
                        {displayMatches.length > 0 ? (
                            displayMatches.map((match) => (
                                <CricketMatchCard key={match.event_key} match={match} />
                            ))
                        ) : (
                            <div className="glass-card rounded-[2.5rem] p-16 text-center border border-white/5">
                                <p className="text-text-muted font-bold uppercase tracking-widest text-xs">
                                    No {activeTab} recorded for this squad.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
