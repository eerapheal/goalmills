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
import Link from 'next/link';

type TabType = 'scorecard' | 'commentary' | 'lineups' | 'wickets' | 'h2h' | 'odds' | 'info';

export default function CricketMatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [match, setMatch] = useState<CricketEvent | null>(null);
    const [h2h, setH2h] = useState<CricketH2HResponse['result'] | null>(null);
    const [odds, setOdds] = useState<CricketMatchOdds | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('scorecard');

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

                let foundMatch = todayRes.result && todayRes.result.length > 0 ? todayRes.result[0] : null;

                if (!foundMatch) {
                    const liveRes = await advancedCricketApi.getLivescore({ matchId: Number(matchId) });
                    if (liveRes.result && liveRes.result.length > 0) {
                        foundMatch = liveRes.result[0];
                    }
                }

                setMatch(foundMatch);

                if (foundMatch) {
                    const [h2hRes, oddsRes] = await Promise.all([
                        advancedCricketApi.getH2H({
                            firstTeamId: Number(foundMatch.home_team_key),
                            secondTeamId: Number(foundMatch.away_team_key)
                        }).catch(() => null),
                        advancedCricketApi.getOdds({
                            matchId: Number(matchId)
                        }).catch(() => null)
                    ]);

                    if (h2hRes?.result) setH2h(h2hRes.result);
                    if (oddsRes?.result?.[matchId]) {
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
                <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 border-3 border-secondary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-text-secondary font-bold uppercase tracking-widest text-[11px]">Loading Match Details...</p>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center text-white text-center px-4">
                <div className="text-4xl mb-4">🏏</div>
                <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Match Not Located</h2>
                <p className="text-text-secondary text-xs mb-6 max-w-sm">The requested match data could not be found in the current feed.</p>
                <button
                    onClick={() => router.push('/cricket')}
                    className="px-6 py-2.5 bg-secondary text-white rounded-full font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                    Back to Cricket Central
                </button>
            </div>
        );
    }

    const isLive = match.event_live === '1' || match.event_status === 'In Progress' || match.event_status === 'Live';
    const isUpcoming = match.event_status === 'Not Started';

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[100px] pb-20">
            <div className="max-w-5xl mx-auto px-4">
                {/* Unified Sleek Match Header */}
                <div className="glass-card rounded-3xl p-6 md:p-8 mb-6 border border-white/10 bg-gradient-to-br from-white/[0.07] via-[#0a0e27] to-[#0d143d] relative overflow-hidden">
                    {/* Top Action Row */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-wider border border-blue-500/20">
                                {match.event_type || 'Cricket'} • {match.league_season || '2026'}
                            </span>
                            <Link
                                href={`/cricket/series/${match.league_key}`}
                                className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-text-muted hover:text-secondary uppercase tracking-wider border border-white/10 transition-colors"
                            >
                                🏆 {match.league_name}
                            </Link>
                        </div>
                    </div>

                    {/* Main Scoreboard Area */}
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-2">
                        {/* Home Team */}
                        <div className="flex flex-col items-center md:items-end text-center md:text-right">
                            <div className="flex items-center gap-4 md:flex-row-reverse">
                                <Link
                                    href={`/cricket/teams/${match.home_team_key}`}
                                    className="relative w-16 h-16 rounded-2xl bg-white/5 p-3 border border-white/10 flex items-center justify-center flex-shrink-0 hover:border-secondary hover:scale-105 transition-all"
                                >
                                    {match.event_home_team_logo ? (
                                        <Image src={match.event_home_team_logo} alt={match.event_home_team} width={48} height={48} className="object-contain" />
                                    ) : (
                                        <span className="text-xl font-bold text-blue-400">{match.event_home_team.charAt(0)}</span>
                                    )}
                                </Link>
                                <div>
                                    <Link
                                        href={`/cricket/teams/${match.home_team_key}`}
                                        className="text-base md:text-lg font-bold text-white hover:text-secondary uppercase tracking-tight transition-colors block"
                                    >
                                        {match.event_home_team}
                                    </Link>
                                    {!isUpcoming && (
                                        <div className="mt-1">
                                            <span className="text-xl md:text-2xl font-black text-amber-400 tabular-nums">
                                                {match.event_home_final_result || '0'}
                                            </span>
                                            {match.event_home_rr && (
                                                <span className="text-[10px] font-bold text-text-muted ml-2 uppercase">
                                                    RR: {match.event_home_rr}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Match Status Center */}
                        <div className="flex flex-col items-center justify-center py-2">
                            {isLive ? (
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-500/40 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black text-amber-400 tracking-widest">LIVE</span>
                                    </div>
                                    <span className="text-xs font-semibold text-text-muted">{match.event_time}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">VS</span>
                                    <span className="text-xs font-bold text-white tracking-wider">{match.event_time}</span>
                                    <span className="text-[10px] font-medium text-text-muted">{match.event_date_start}</span>
                                </div>
                            )}

                            {match.event_status === 'Finished' && (
                                <span className="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/20">
                                    Completed
                                </span>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/cricket/teams/${match.away_team_key}`}
                                    className="relative w-16 h-16 rounded-2xl bg-white/5 p-3 border border-white/10 flex items-center justify-center flex-shrink-0 hover:border-secondary hover:scale-105 transition-all"
                                >
                                    {match.event_away_team_logo ? (
                                        <Image src={match.event_away_team_logo} alt={match.event_away_team} width={48} height={48} className="object-contain" />
                                    ) : (
                                        <span className="text-xl font-bold text-amber-400">{match.event_away_team.charAt(0)}</span>
                                    )}
                                </Link>
                                <div>
                                    <Link
                                        href={`/cricket/teams/${match.away_team_key}`}
                                        className="text-base md:text-lg font-bold text-white hover:text-secondary uppercase tracking-tight transition-colors block"
                                    >
                                        {match.event_away_team}
                                    </Link>
                                    {!isUpcoming && (
                                        <div className="mt-1">
                                            <span className="text-xl md:text-2xl font-black text-white tabular-nums">
                                                {match.event_away_final_result || '0'}
                                            </span>
                                            {match.event_away_rr && (
                                                <span className="text-[10px] font-bold text-text-muted ml-2 uppercase">
                                                    RR: {match.event_away_rr}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Status / Equation Banner */}
                    {match.event_status_info && (
                        <div className="mt-6 pt-4 border-t border-white/5 text-center">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 uppercase tracking-wide">
                                {match.event_status_info}
                            </span>
                        </div>
                    )}
                </div>

                {/* Refined Data Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 mb-6 bg-white/[0.03] rounded-2xl p-1.5 border border-white/5">
                    {[
                        { id: 'scorecard', label: 'Scorecard', icon: '📊' },
                        { id: 'commentary', label: 'Commentary', icon: '🎙️' },
                        { id: 'lineups', label: 'Lineups', icon: '👥' },
                        { id: 'wickets', label: 'Fall of Wickets', icon: '☝️' },
                        { id: 'h2h', label: 'Head to Head', icon: '⚔️' },
                        { id: 'odds', label: 'Odds', icon: '📈' },
                        { id: 'info', label: 'Match Info', icon: '📝' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`
                                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-secondary text-white shadow-md' : 'text-text-muted hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <span className="text-xs">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Views */}
                <div>
                    {activeTab === 'scorecard' && (
                        <div className="space-y-6">
                            {match.scorecard && Object.keys(match.scorecard).length > 0 ? (
                                Object.entries(match.scorecard).map(([innings, players]) => {
                                    const batsmen = players.filter(p => p.type === 'Batsman' || (p.R !== undefined && p.O === null));
                                    const bowlers = players.filter(p => p.type === 'Bowler' || p.O !== null);
                                    const extras = match.extra?.[innings];

                                    return (
                                        <div key={innings} className="glass-card rounded-2xl overflow-hidden border border-white/5">
                                            <div className="bg-white/[0.04] p-4 border-b border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-4 w-1 bg-secondary rounded-full"></div>
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                                                        {innings.replace('_', ' ')}
                                                    </h3>
                                                </div>
                                                {extras && (
                                                    <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                                                        Total: {extras.total} • Extras: {extras.text}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Batsmen Table */}
                                            {batsmen.length > 0 && (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs text-left min-w-[500px]">
                                                        <thead className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-white/[0.02]">
                                                            <tr>
                                                                <th className="py-2.5 px-4 text-left">Batter</th>
                                                                <th className="py-2.5 px-3 text-center">R</th>
                                                                <th className="py-2.5 px-3 text-center">B</th>
                                                                <th className="py-2.5 px-3 text-center">4s</th>
                                                                <th className="py-2.5 px-3 text-center">6s</th>
                                                                <th className="py-2.5 px-4 text-right">SR</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-white divide-y divide-white/5">
                                                            {batsmen.map((player, i) => (
                                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                                    <td className="py-3 px-4">
                                                                        <Link
                                                                            href={`/cricket/players/${(player as any).player_id || (player as any).player_key || encodeURIComponent(player.player)}`}
                                                                            className="font-bold text-xs uppercase text-white hover:text-secondary transition-colors block"
                                                                        >
                                                                            {player.player}
                                                                        </Link>
                                                                        {player.status && (
                                                                            <span className="text-[10px] text-text-muted italic block">
                                                                                {player.status}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 px-3 text-center font-bold text-xs text-amber-400 tabular-nums">
                                                                        {player.R}
                                                                    </td>
                                                                    <td className="py-3 px-3 text-center text-xs text-text-muted tabular-nums">
                                                                        {player.B}
                                                                    </td>
                                                                    <td className="py-3 px-3 text-center text-xs text-text-muted tabular-nums">
                                                                        {player['4s']}
                                                                    </td>
                                                                    <td className="py-3 px-3 text-center text-xs text-text-muted tabular-nums">
                                                                        {player['6s']}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-right font-semibold text-xs text-secondary tabular-nums">
                                                                        {player.SR}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Bowlers Table */}
                                            {bowlers.length > 0 && (
                                                <div className="overflow-x-auto border-t border-white/5">
                                                    <table className="w-full text-xs text-left min-w-[500px]">
                                                        <thead className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-white/[0.02]">
                                                            <tr>
                                                                <th className="py-2.5 px-4 text-left">Bowler</th>
                                                                <th className="py-2.5 px-3 text-center">O</th>
                                                                <th className="py-2.5 px-3 text-center">M</th>
                                                                <th className="py-2.5 px-3 text-center">R</th>
                                                                <th className="py-2.5 px-3 text-center">W</th>
                                                                <th className="py-2.5 px-4 text-right">ECON</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-white divide-y divide-white/5">
                                                            {bowlers.map((player, i) => (
                                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                                    <td className="py-3 px-4">
                                                                        <Link
                                                                            href={`/cricket/players/${(player as any).player_id || (player as any).player_key || encodeURIComponent(player.player)}`}
                                                                            className="font-bold text-xs uppercase text-white hover:text-secondary transition-colors"
                                                                        >
                                                                            {player.player}
                                                                        </Link>
                                                                    </td>

                                                                    <td className="py-3 px-3 text-center text-xs text-text-muted tabular-nums">
                                                                        {player.O}
                                                                    </td>
                                                                    <td className="py-3 px-3 text-center text-xs text-text-muted tabular-nums">
                                                                        {player.M || '0'}
                                                                    </td>
                                                                    <td className="py-3 px-3 text-center text-xs text-text-muted tabular-nums">
                                                                        {player.R}
                                                                    </td>
                                                                    <td className="py-3 px-3 text-center font-bold text-xs text-emerald-400 tabular-nums">
                                                                        {player.W}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-right font-semibold text-xs text-secondary tabular-nums">
                                                                        {player.ER}
                                                                    </td>
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
                                <EmptyState message="Scorecard will be generated as deliveries unfold." />
                            )}
                        </div>
                    )}

                    {activeTab === 'commentary' && (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {match.comments && Object.keys(match.comments).length > 0 ? (
                                Object.entries(match.comments).map(([innings, comments]) => (
                                    <div key={innings} className="space-y-3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-px flex-1 bg-white/10"></div>
                                            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">
                                                {innings.replace('_', ' ')} Commentary
                                            </h4>
                                            <div className="h-px flex-1 bg-white/10"></div>
                                        </div>

                                        {comments.map((comment, i) => (
                                            <div key={i} className="glass-card rounded-2xl p-4 border border-white/5 flex gap-4 hover:border-white/10 transition-all">
                                                <div className="flex flex-col items-center">
                                                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-black text-amber-400 tabular-nums">
                                                        {comment.overs || comment.balls}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-slate-200 text-xs md:text-sm font-normal leading-relaxed">
                                                        {comment.post}
                                                    </p>
                                                    {comment.runs !== '0' && (
                                                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            parseInt(comment.runs) >= 4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        }`}>
                                                            {comment.runs} Runs Scored
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <EmptyState message="Live commentary feed will initiate with the first ball." />
                            )}
                        </div>
                    )}

                    {activeTab === 'lineups' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {match.lineups ? (
                                <>
                                    <div className="glass-card rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                                            <div className="h-4 w-1 bg-blue-400 rounded-full"></div>
                                            <Link
                                                href={`/cricket/teams/${match.home_team_key}`}
                                                className="text-sm font-bold text-white hover:text-secondary uppercase tracking-tight transition-colors"
                                            >
                                                {match.event_home_team} Playing XI
                                            </Link>
                                        </div>
                                        <div className="space-y-2">
                                            {match.lineups.home_team.starting_lineups.map((p, i) => (
                                                <Link
                                                    key={i}
                                                    href={`/cricket/players/${(p as any).player_id || (p as any).player_key || encodeURIComponent(p.player)}`}
                                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-secondary/30 hover:bg-white/5 transition-all text-xs block"
                                                >
                                                    <span className="font-bold text-white hover:text-secondary uppercase transition-colors">{p.player}</span>
                                                    <span className="text-[10px] font-medium text-text-muted">{p.player_country || 'Squad'}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                                            <div className="h-4 w-1 bg-amber-400 rounded-full"></div>
                                            <Link
                                                href={`/cricket/teams/${match.away_team_key}`}
                                                className="text-sm font-bold text-white hover:text-secondary uppercase tracking-tight transition-colors"
                                            >
                                                {match.event_away_team} Playing XI
                                            </Link>
                                        </div>
                                        <div className="space-y-2">
                                            {match.lineups.away_team.starting_lineups.map((p, i) => (
                                                <Link
                                                    key={i}
                                                    href={`/cricket/players/${(p as any).player_id || (p as any).player_key || encodeURIComponent(p.player)}`}
                                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-secondary/30 hover:bg-white/5 transition-all text-xs block"
                                                >
                                                    <span className="font-bold text-white hover:text-secondary uppercase transition-colors">{p.player}</span>
                                                    <span className="text-[10px] font-medium text-text-muted">{p.player_country || 'Squad'}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="md:col-span-2">
                                    <EmptyState message="Squad playing XIs will be announced after the toss." />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'wickets' && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {match.wickets && Object.keys(match.wickets).length > 0 ? (
                                Object.entries(match.wickets).map(([innings, wickets]) => (
                                    <div key={innings} className="glass-card rounded-2xl overflow-hidden border border-white/5">
                                        <div className="bg-white/[0.04] p-4 border-b border-white/5 flex items-center gap-3">
                                            <div className="h-4 w-1 bg-secondary rounded-full"></div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                                                Fall of Wickets - {innings.replace('_', ' ')}
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {wickets.map((wicket, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-xs">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px] text-secondary">
                                                            {i + 1}
                                                        </span>
                                                        <div>
                                                            <Link
                                                                href={`/cricket/players/${(wicket as any).batsman_id || encodeURIComponent(wicket.batsman)}`}
                                                                className="font-bold text-white hover:text-secondary uppercase block transition-colors"
                                                            >
                                                                {wicket.batsman}
                                                            </Link>
                                                            <span className="text-[10px] text-text-muted block">Bowled by {wicket.balwer}</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="font-bold text-amber-400 block tabular-nums">{wicket.score}</span>
                                                        <span className="text-[10px] text-text-muted block">Over {wicket.fall}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState message="No wicket events documented for this match yet." />
                            )}
                        </div>
                    )}


                    {activeTab === 'h2h' && (
                        <div className="space-y-6">
                            {(() => {
                                const h2hList = Array.isArray(h2h)
                                    ? h2h
                                    : Array.isArray(h2h?.H2H)
                                        ? h2h.H2H
                                        : [];
                                return h2hList.length > 0 ? (
                                    <div className="glass-card rounded-2xl p-6 border border-white/5">
                                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 text-center">
                                            Head-to-Head Encounters
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {h2hList.slice(0, 6).map((res, i) => (
                                                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                                                    <div className="flex justify-between items-center mb-2 text-[10px] text-text-muted">
                                                        <span>{res.league_name}</span>
                                                        <span className="font-bold text-secondary uppercase">{res.event_status}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-1">
                                                        <span className="font-bold text-white uppercase">{res.event_home_team}</span>
                                                        <span className="font-bold text-amber-400 tabular-nums">{res.event_home_final_result}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-1">
                                                        <span className="font-bold text-white uppercase">{res.event_away_team}</span>
                                                        <span className="font-bold text-amber-400 tabular-nums">{res.event_away_final_result}</span>
                                                    </div>
                                                    {res.event_status_info && (
                                                        <p className="mt-2 pt-2 border-t border-white/5 text-[10px] text-emerald-400">
                                                            {res.event_status_info}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyState message="Historical head-to-head records processing." />
                                );
                            })()}
                        </div>
                    )}

                    {activeTab === 'odds' && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            {odds ? (
                                <div className="glass-card rounded-2xl p-6 border border-white/5">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                                        Match Odds & Projections
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(odds).map(([market, outcomes]) => (
                                            <div key={market} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                <h4 className="text-xs font-bold text-amber-400 uppercase mb-3">{market}</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {Object.entries(outcomes).map(([outcome, bookmakers]) => (
                                                        <div key={outcome} className="p-3 rounded-lg bg-white/5">
                                                            <span className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                                                                {outcome}
                                                            </span>
                                                            <div className="space-y-1">
                                                                {Object.entries(bookmakers).slice(0, 2).map(([bookie, val]) => (
                                                                    <div key={bookie} className="flex justify-between text-xs font-semibold">
                                                                        <span className="text-text-muted">{bookie}</span>
                                                                        <span className="text-white tabular-nums">{val}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState message="Betting markets are currently closed for this event." />
                            )}
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                            {[
                                { label: 'Toss Result', value: match.event_toss || 'Pending announcement' },
                                { label: 'Format & Type', value: match.event_type || 'TBC' },
                                { label: 'Match Status', value: match.event_status },
                                { label: 'League Round', value: match.league_round || 'Group Stage' },
                                { label: 'Venue', value: match.event_stadium || 'Global Stadium' },
                                { label: 'Man of the Match', value: match.event_man_of_match || 'Not Awarded' }
                            ].map((item, idx) => (
                                <div key={idx} className="glass-card rounded-2xl p-4 border border-white/5">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">
                                        {item.label}
                                    </span>
                                    <span className="text-xs font-bold text-white uppercase block">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-2xl border border-white/5 p-6">
            <div className="text-3xl mb-3 opacity-40">📊</div>
            <p className="text-text-muted font-bold text-xs uppercase tracking-wider max-w-xs">{message}</p>
        </div>
    );
}
