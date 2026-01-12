'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import {
    CricketEvent,
    CricketScorecardPlayer,
    CricketComment,
    CricketWicket,
    CricketExtra,
    CricketMatchOdds,
    CricketH2HResponse
} from '@goalmills/types';
import Image from 'next/image';

type TabType = 'info' | 'scorecard' | 'commentary' | 'lineups' | 'wickets' | 'h2h' | 'odds';

export default function CricketMatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [match, setMatch] = useState<CricketEvent | null>(null);
    const [h2h, setH2h] = useState<CricketH2HResponse['result'] | null>(null);
    const [odds, setOdds] = useState<CricketMatchOdds | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('info');

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const matchId = String(params.id);
            try {
                // Fetch match details via Fixtures endpoint
                const todayRes = await advancedCricketApi.getFixtures({
                    matchId: Number(matchId),
                    from: advancedCricketApi.getFormattedDate(-30),
                    to: advancedCricketApi.getFormattedDate(30)
                });

                const foundMatch = todayRes.result && todayRes.result.length > 0 ? todayRes.result[0] : null;
                setMatch(foundMatch);

                if (foundMatch) {
                    // Parallel fetch for H2H and Odds to build professional depth
                    const [h2hRes, oddsRes] = await Promise.all([
                        advancedCricketApi.getH2H({
                            firstTeamId: Number(foundMatch.home_team_key),
                            secondTeamId: Number(foundMatch.away_team_key)
                        }),
                        advancedCricketApi.getOdds({
                            matchId: Number(matchId)
                        })
                    ]);

                    setH2h(h2hRes.result);
                    if (oddsRes.result && oddsRes.result[matchId]) {
                        setOdds(oddsRes.result[matchId]);
                    }
                }
            } catch (error) {
                console.error('Error loading match intelligence:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-text-secondary font-black uppercase tracking-widest text-xs">Synchronizing Live Feed...</p>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center text-white text-center px-4">
                <div className="text-6xl mb-6">🏜️</div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Event Not Located</h2>
                <p className="text-text-secondary mb-8 max-w-md">The requested match intel is unavailable. It may have concluded or been removed from the live roster.</p>
                <button onClick={() => router.back()} className="px-8 py-3 bg-secondary text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">
                    Return to Central
                </button>
            </div>
        );
    }

    const isLive = match.event_live === '1';
    const isUpcoming = match.event_status === 'Not Started';

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-24">
            <div className="max-w-6xl mx-auto px-4">
                {/* Unified Match Header */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-12 mb-10 border-2 border-white/5 bg-gradient-to-br from-white/10 via-[#0a0e27] to-[#0d143d] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067')] bg-cover bg-center opacity-[0.07] mix-blend-overlay group-hover:scale-105 transition-transform duration-[15s] pointer-events-none"></div>

                    {/* Top Action Row */}
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <button onClick={() => router.back()} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group/btn">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/btn:bg-secondary group-hover/btn:border-secondary transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                        </button>

                        <div className="text-right">
                            <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] border border-blue-500/20">
                                {match.event_type} • {match.league_season}
                            </span>
                        </div>
                    </div>

                    {/* Main Scoreboard Area */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative z-10 py-4">
                        {/* Home Team */}
                        <div className="flex flex-col items-center group/team">
                            <div className="relative w-28 h-28 bg-white/5 rounded-[2rem] p-5 mb-6 border border-white/10 shadow-2xl group-hover/team:scale-110 group-hover/team:rotate-3 transition-all duration-500">
                                {match.event_home_team_logo ? (
                                    <Image src={match.event_home_team_logo} alt={match.event_home_team} width={112} height={112} className="object-contain w-full h-full" />
                                ) : (
                                    <span className="text-5xl font-black text-blue-400 flex items-center justify-center h-full">{match.event_home_team.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-white text-center uppercase tracking-tighter mb-4">{match.event_home_team}</h2>
                            {!isUpcoming && (
                                <div className="text-center">
                                    <p className="text-4xl md:text-6xl font-black text-white tabular-nums tracking-tighter">{match.event_home_final_result || '0'}</p>
                                    {match.event_home_rr && <p className="text-[10px] font-black text-text-muted mt-2 tracking-widest uppercase">RR: {match.event_home_rr}</p>}
                                </div>
                            )}
                        </div>

                        {/* Match Status Center */}
                        <div className="flex flex-col items-center justify-center">
                            {isLive ? (
                                <div className="flex flex-col items-center mb-6">
                                    <div className="bg-amber-500/20 px-6 py-2 rounded-full border border-amber-500/40 backdrop-blur-xl animate-pulse flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                                        <span className="text-xs font-black text-amber-500 tracking-[0.3em]">LIVE</span>
                                    </div>
                                    <div className="mt-4 flex flex-col items-center gap-2">
                                        <span className="px-3 py-1 bg-secondary text-white text-[9px] font-black uppercase rounded shadow-lg animate-bounce">Playing</span>
                                        {match.event_status_info?.toLowerCase().includes('innings break') && (
                                            <span className="px-3 py-1 bg-white/10 text-secondary text-[9px] font-black uppercase rounded border border-secondary/30">HT (Innings Break)</span>
                                        )}
                                    </div>
                                    <p className="text-6xl font-black text-white/5 italic mt-4 uppercase">VS</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 mb-8">
                                    <p className="text-7xl font-black text-white/5 italic uppercase leading-none">VS</p>
                                    {match.event_status === 'Finished' && (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase rounded border border-blue-500/20">FT</span>
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded border border-emerald-500/20">Completed</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="text-center">
                                <p className="text-sm font-black text-white tracking-widest uppercase">{match.event_time}</p>
                                <p className="text-[10px] font-bold text-text-muted mt-2 tracking-widest uppercase">{match.event_date_start}</p>
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center group/team">
                            <div className="relative w-28 h-28 bg-white/5 rounded-[2rem] p-5 mb-6 border border-white/10 shadow-2xl group-hover/team:scale-110 group-hover/team:rotate-[-3deg] transition-all duration-500">
                                {match.event_away_team_logo ? (
                                    <Image src={match.event_away_team_logo} alt={match.event_away_team} width={112} height={112} className="object-contain w-full h-full" />
                                ) : (
                                    <span className="text-5xl font-black text-blue-400 flex items-center justify-center h-full">{match.event_away_team.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-white text-center uppercase tracking-tighter mb-4">{match.event_away_team}</h2>
                            {!isUpcoming && (
                                <div className="text-center">
                                    <p className="text-4xl md:text-6xl font-black text-white tabular-nums tracking-tighter">{match.event_away_final_result || '0'}</p>
                                    {match.event_away_rr && <p className="text-[10px] font-black text-text-muted mt-2 tracking-widest uppercase">RR: {match.event_away_rr}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Footer Info */}
                    <div className="mt-12 pt-10 border-t border-white/5 text-center relative z-10">
                        <p className={`text-lg font-black uppercase tracking-tight ${isLive ? 'text-amber-500' : 'text-blue-400'}`}>
                            {match.event_status_info || match.event_status}
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-4 text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
                            <span>🏟️ {match.event_stadium || 'Global Stadium'}</span>
                            <span className="w-1.5 h-1.5 bg-white/10 rounded-full"></span>
                            <span>🏆 {match.league_name}</span>
                        </div>
                    </div>
                </div>

                {/* Professional Data Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-white/5 rounded-2xl p-2 border border-white/5">
                    {[
                        { id: 'info', label: 'Match Info', icon: '📝' },
                        { id: 'scorecard', label: 'Scorecard', icon: '📊' },
                        { id: 'commentary', label: 'Commentary', icon: '🎙️' },
                        { id: 'lineups', label: 'Lineups', icon: '👥' },
                        { id: 'wickets', label: 'Wickets', icon: '☝️' },
                        { id: 'h2h', label: 'Head to Head', icon: '⚔️' },
                        { id: 'odds', label: 'Betting Odds', icon: '📈' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`
                                flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-secondary text-white shadow-xl scale-[1.02]' : 'text-text-muted hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <span className="text-xs">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Render Dynamic Content Based on Tab */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 min-h-[400px]">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Toss Result', value: match.event_toss || 'Information Pending', span: 3 },
                                { label: 'Format & Type', value: match.event_type || 'TBC' },
                                { label: 'Match Status', value: match.event_status },
                                { label: 'League Round', value: match.league_round || 'Group Stage' },
                                { label: 'Man of the Match', value: match.event_man_of_match || 'Not Awarded' },
                                { label: 'Service Home', value: match.event_service_home || 'N/A' },
                                { label: 'Service Away', value: match.event_service_away || 'N/A' }
                            ].map((item, idx) => (
                                <div key={idx} className={`glass-card rounded-2xl p-6 border border-white/5 hover:border-secondary/20 transition-all ${item.span ? 'md:col-span-3' : ''}`}>
                                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">{item.label}</p>
                                    <p className="text-white font-black uppercase text-sm tracking-tight">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'scorecard' && (
                        <div className="space-y-12">
                            {match.scorecard && Object.keys(match.scorecard).length > 0 ? (
                                Object.entries(match.scorecard).map(([innings, players]) => {
                                    const batsmen = players.filter(p => p.type === 'Batsman');
                                    const bowlers = players.filter(p => p.type === 'Bowler');
                                    const extras = match.extra?.[innings];

                                    return (
                                        <div key={innings} className="glass-card rounded-3xl overflow-hidden border border-white/5">
                                            <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-6 w-1 bg-secondary rounded-full"></div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{innings}</h3>
                                                </div>
                                                {extras && (
                                                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">
                                                        Total: {extras.total} • Extras: {extras.text}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Batsmen Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left min-w-[600px]">
                                                    <thead className="text-text-muted uppercase tracking-widest bg-white/2">
                                                        <tr>
                                                            <th className="py-4 px-8 text-left">Batsman</th>
                                                            <th className="py-4 px-4 text-center">R</th>
                                                            <th className="py-4 px-4 text-center">B</th>
                                                            <th className="py-4 px-4 text-center">4s</th>
                                                            <th className="py-4 px-4 text-center">6s</th>
                                                            <th className="py-4 px-8 text-right">S/R</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-white">
                                                        {batsmen.map((player, i) => (
                                                            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                                <td className="py-5 px-8">
                                                                    <div className="font-black text-sm uppercase tracking-tight">{player.player}</div>
                                                                    <div className="text-text-muted text-[10px] mt-1 font-bold italic">{player.status}</div>
                                                                </td>
                                                                <td className="py-5 px-4 text-center font-black text-sm tabular-nums">{player.R}</td>
                                                                <td className="py-5 px-4 text-center font-bold text-text-secondary tabular-nums">{player.B}</td>
                                                                <td className="py-5 px-4 text-center font-bold text-text-secondary tabular-nums">{player['4s']}</td>
                                                                <td className="py-5 px-4 text-center font-bold text-text-secondary tabular-nums">{player['6s']}</td>
                                                                <td className="py-5 px-8 text-right font-black text-secondary tabular-nums">{player.SR}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Bowlers Table */}
                                            {bowlers.length > 0 && (
                                                <div className="overflow-x-auto mt-6">
                                                    <table className="w-full text-xs text-left min-w-[600px] border-t border-white/5">
                                                        <thead className="text-text-muted uppercase tracking-widest bg-white/2">
                                                            <tr>
                                                                <th className="py-4 px-8 text-left">Bowler</th>
                                                                <th className="py-4 px-4 text-center">O</th>
                                                                <th className="py-4 px-4 text-center">M</th>
                                                                <th className="py-4 px-4 text-center">R</th>
                                                                <th className="py-4 px-4 text-center">W</th>
                                                                <th className="py-4 px-8 text-right">E/R</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-white">
                                                            {bowlers.map((player, i) => (
                                                                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                                    <td className="py-5 px-8 font-black text-sm uppercase tracking-tight">{player.player}</td>
                                                                    <td className="py-5 px-4 text-center font-black text-sm tabular-nums">{player.O}</td>
                                                                    <td className="py-5 px-4 text-center font-bold text-text-secondary tabular-nums">{player.M || '0'}</td>
                                                                    <td className="py-5 px-4 text-center font-bold text-text-secondary tabular-nums">{player.R}</td>
                                                                    <td className="py-5 px-4 text-center font-black text-amber-500 tabular-nums">{player.W}</td>
                                                                    <td className="py-5 px-8 text-right font-black text-secondary tabular-nums">{player.ER}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState message="Full statistical analysis pending match progression." />
                            )}
                        </div>
                    )}

                    {activeTab === 'commentary' && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {match.comments && Object.keys(match.comments).length > 0 ? (
                                Object.entries(match.comments).map(([innings, comments]) => (
                                    <div key={innings} className="space-y-4">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-1 flex-1 bg-white/5 rounded-full"></div>
                                            <h3 className="text-xs font-black text-secondary uppercase tracking-[0.3em]">{innings} Commentary</h3>
                                            <div className="h-1 flex-1 bg-white/5 rounded-full"></div>
                                        </div>
                                        {comments.map((comment, i) => (
                                            <div key={i} className="glass-card rounded-2xl p-6 border border-white/5 flex gap-6 hover:border-white/10 transition-all">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="text-sm font-black text-white tabular-nums">{comment.overs}</div>
                                                    <div className="px-2 py-0.5 rounded bg-secondary/10 text-[9px] font-black text-secondary">V. {comment.balls}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-sm font-medium leading-relaxed tracking-tight">{comment.post}</p>
                                                    {comment.runs !== '0' && (
                                                        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${parseInt(comment.runs) >= 4 ? 'bg-amber-500 text-black' : 'bg-blue-500/10 text-blue-400'}`}>
                                                            {comment.runs} Runs Scored
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <EmptyState message="Live commentary feed will initiate at first delivery." />
                            )}
                        </div>
                    )}

                    {activeTab === 'lineups' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {match.lineups ? (
                                <>
                                    <div className="glass-card rounded-3xl p-8 border border-white/5">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-6 w-1 bg-blue-400 rounded-full"></div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{match.event_home_team} XI</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {match.lineups.home_team.starting_lineups.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                                    <span className="text-sm font-black text-white uppercase tracking-tight">{p.player}</span>
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{p.player_country || 'National Player'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="glass-card rounded-3xl p-8 border border-white/5">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{match.event_away_team} XI</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {match.lineups.away_team.starting_lineups.map((p, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                                    <span className="text-sm font-black text-white uppercase tracking-tight">{p.player}</span>
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{p.player_country || 'National Player'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="md:col-span-2">
                                    <EmptyState message="Official squad lineups are pending announcement." />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'wickets' && (
                        <div className="max-w-4xl mx-auto space-y-12">
                            {match.wickets && Object.keys(match.wickets).length > 0 ? (
                                Object.entries(match.wickets).map(([innings, wickets]) => (
                                    <div key={innings} className="glass-card rounded-3xl overflow-hidden border border-white/5">
                                        <div className="bg-white/5 p-6 border-b border-white/5 flex items-center gap-4">
                                            <div className="h-6 w-1 bg-secondary rounded-full"></div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Fall of Wickets - {innings}</h3>
                                        </div>
                                        <div className="p-2">
                                            {wickets.map((wicket, i) => (
                                                <div key={i} className="flex items-center gap-6 p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                                                    <div className="flex flex-col items-center justify-center min-w-[80px]">
                                                        <span className="text-xl font-black text-white">{i + 1}</span>
                                                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Wicket</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{wicket.batsman}</h4>
                                                            <span className="text-xs font-black text-amber-500 tabular-nums">{wicket.score}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                                            <span>Bowled by: {wicket.balwer}</span>
                                                            <span>Fall at: {wicket.fall}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState message="No wicket events have been documented for this event yet." />
                            )}
                        </div>
                    )}

                    {activeTab === 'h2h' && (
                        <div className="space-y-12">
                            {h2h ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="glass-card rounded-3xl p-8 border border-white/5">
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                {match.event_home_team} Performance
                                            </h3>
                                            <div className="space-y-4">
                                                {h2h.firstTeamResults.slice(0, 5).map((res, i) => (
                                                    <CompactResult key={i} res={res} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="glass-card rounded-3xl p-8 border border-white/5">
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                                {match.event_away_team} Performance
                                            </h3>
                                            <div className="space-y-4">
                                                {h2h.secondTeamResults.slice(0, 5).map((res, i) => (
                                                    <CompactResult key={i} res={res} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="glass-card rounded-3xl p-8 border border-white/5">
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-10 text-center">Historical Face-Offs</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {h2h.H2H.slice(0, 4).map((res, i) => (
                                                <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-[10px] font-bold text-text-muted">{res.league_name}</span>
                                                        <span className="text-[10px] font-black text-secondary tracking-widest uppercase">{res.event_status}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-black text-white uppercase">{res.event_home_team}</span>
                                                            <span className="text-xs font-black text-white uppercase">{res.event_away_team}</span>
                                                        </div>
                                                        <div className="flex flex-col text-right gap-1">
                                                            <span className="text-xs font-black text-white tabular-nums">{res.event_home_final_result}</span>
                                                            <span className="text-xs font-black text-white tabular-nums">{res.event_away_final_result}</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-4 pt-3 border-t border-white/5 text-[9px] font-bold text-blue-400 uppercase text-center">{res.event_status_info}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <EmptyState message="Comparative historical data is being processed for these squads." />
                            )}
                        </div>
                    )}

                    {activeTab === 'odds' && (
                        <div className="max-w-4xl mx-auto">
                            {odds ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.entries(odds).map(([market, outcomes]) => (
                                        <div key={market} className="glass-card rounded-3xl p-8 border border-white/5">
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">{market}</h3>
                                            <div className="space-y-6">
                                                {Object.entries(outcomes).map(([outcome, bookmakers]) => (
                                                    <div key={outcome} className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{outcome}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {Object.entries(bookmakers).slice(0, 4).map(([bookie, value]) => (
                                                                <div key={bookie} className="bg-white/5 rounded-lg p-3 flex justify-between items-center border border-white/5 hover:border-secondary/30 transition-all">
                                                                    <span className="text-[9px] font-bold text-text-muted uppercase">{bookie}</span>
                                                                    <span className="text-xs font-black text-white tabular-nums">{value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                                    <div className="text-5xl mb-6 grayscale opacity-30">📉</div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Markets Closed</h3>
                                    <p className="text-text-muted text-sm max-w-xs mx-auto font-medium">Betting markets are currently unavailable or have concluded for this event.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
            <div className="text-5xl mb-6 grayscale opacity-20">📊</div>
            <p className="text-text-muted font-black uppercase tracking-widest text-xs max-w-xs leading-relaxed">{message}</p>
        </div>
    );
}

function CompactResult({ res }: { res: CricketEvent }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{res.event_away_team === 'England' ? res.event_home_team : res.event_away_team}</span>
                <span className="text-[8px] font-bold text-text-muted">{res.event_date_start}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-black text-white tabular-nums">{res.event_home_final_result}</span>
                <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${res.event_status === 'Finished' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/10 text-white/40'}`}>
                    {res.event_home_final_result > res.event_away_final_result ? 'W' : 'L'}
                </div>
            </div>
        </div>
    );
}
