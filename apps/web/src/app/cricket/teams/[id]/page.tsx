'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketTeam, CricketEvent } from '@goalmills/types';
import { CricketMatchCard } from '../../../../components/CricketMatchCard';
import Image from 'next/image';

type TabType = 'schedule' | 'results';

export default function CricketTeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [team, setTeam] = useState<CricketTeam | null>(null);
    const [matches, setMatches] = useState<CricketEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('schedule');

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const teamId = String(params.id);
            try {
                // Fetch team metadata
                const teamsRes = await advancedCricketApi.getTeams({ teamId: parseInt(teamId) });
                const foundTeam = teamsRes.result && teamsRes.result.length > 0 ? teamsRes.result[0] : null;
                setTeam(foundTeam);

                if (foundTeam) {
                    // Fetch full fixture window for the squad
                    const matchesRes = await advancedCricketApi.getFixtures({
                        from: advancedCricketApi.getFormattedDate(-60),
                        to: advancedCricketApi.getFormattedDate(60),
                    });

                    // Filter for matches involving this squad ID
                    const teamMatches = (matchesRes.result || []).filter(
                        m => String(m.home_team_key) === teamId || String(m.away_team_key) === teamId
                    );
                    setMatches(teamMatches);
                }
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
        return m.event_status !== 'Not Started';
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
            <div className="max-w-5xl mx-auto px-4">
                {/* Header Navigation */}
                <div className="flex items-center gap-6 mb-12">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:border-secondary transition-all hover:scale-110 group shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Squad Analytics</span>
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mt-1">SQUAD Overview</h1>
                    </div>
                </div>

                {/* Team Identity Card */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-12 mb-12 border-2 border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none group-hover:bg-secondary/10 transition-colors" />

                    <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                        <div className="relative w-48 h-48 bg-white/5 rounded-full p-6 border border-white/10 flex shrink-0 items-center justify-center shadow-2xl group-hover:scale-105 transition-transform overflow-hidden">
                            {team.team_logo ? (
                                <Image src={team.team_logo} alt={tName} width={192} height={192} className="object-contain w-full h-full" />
                            ) : (
                                <span className="text-8xl font-black text-blue-400">{tName.charAt(0)}</span>
                            )}
                        </div>
                        <div className="text-center md:text-left relative z-10">
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-secondary/20">
                                Professional Cricket Entry
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                                {tName}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 px-6 py-2.5 rounded-xl border border-white/10 shadow-lg">Network Key: {team.team_key}</p>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 px-6 py-2.5 rounded-xl border border-white/10 shadow-lg">Status: Verified Member</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Tabs */}
                <div className="flex gap-4 mb-10 bg-white/5 p-2 rounded-2xl border border-white/5">
                    {[
                        { id: 'schedule', label: 'Upcoming Schedule', icon: '📅' },
                        { id: 'results', label: 'Recent Results', icon: '✅' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                                ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-xs">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Categorized Matches */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="mb-8 flex items-center justify-between px-2">
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-secondary rounded-full"></span>
                            Verified Fixtures Archive
                        </h2>
                        <span className="text-[10px] font-bold text-text-muted italic">{displayMatches.length} squad matches tracked</span>
                    </div>

                    {displayMatches.length > 0 ? (
                        <div className="space-y-4">
                            {displayMatches.map(match => (
                                <CricketMatchCard key={match.event_key} match={match} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card rounded-[2.5rem] p-24 text-center border-2 border-dashed border-white/5 bg-transparent">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <span className="text-4xl opacity-40 grayscale">{activeTab === 'schedule' ? '🏟️' : '📋'}</span>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                                {activeTab === 'schedule' ? 'No Upcoming Games' : 'No Recent Data'}
                            </h3>
                            <p className="text-text-muted text-sm max-w-sm mx-auto font-medium leading-relaxed">
                                Our live feed currently has no {activeTab === 'schedule' ? 'scheduled' : 'recorded'} records for this squad within the active coverage window.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
