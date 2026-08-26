'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketPlayer } from '@goalmills/types';
import Image from 'next/image';

type FormatTab = 'test' | 'odi' | 't20i' | 'ipl';

export default function CricketPlayerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [player, setPlayer] = useState<CricketPlayer | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeFormat, setActiveFormat] = useState<FormatTab>('odi');

    useEffect(() => {
        const loadPlayerData = async () => {
            if (!params.id) return;
            try {
                setLoading(true);
                const data = await advancedCricketApi.getPlayerById(String(params.id));
                setPlayer(data);
            } catch (error) {
                console.error('Error fetching player intelligence:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPlayerData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-text-secondary font-black uppercase tracking-widest text-xs">Synchronizing Player Profile...</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center text-white text-center px-4">
                <div className="text-6xl mb-6">🏏</div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Player Intel Unavailable</h2>
                <p className="text-text-secondary mb-8 max-w-md">Could not locate roster profile for the requested athlete identifier.</p>
                <button onClick={() => router.back()} className="px-8 py-3 bg-secondary text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">
                    Return to Cricket Hub
                </button>
            </div>
        );
    }

    const currentStats = player.career_stats?.[activeFormat] || player.career_stats?.odi || player.career_stats?.test;

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-24">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header Back Action */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group/btn"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/btn:bg-secondary group-hover/btn:border-secondary transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Central</span>
                    </button>
                    <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-black uppercase tracking-widest">
                        Official Athlete Intel
                    </span>
                </div>

                {/* Hero Player Card */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-12 mb-10 border-2 border-white/5 bg-gradient-to-br from-white/10 via-[#0a0e27] to-[#0d143d] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative z-10">
                        {/* Avatar */}
                        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden bg-white/5 border-2 border-white/10 shadow-2xl flex-shrink-0">
                            {player.player_image ? (
                                <Image
                                    src={player.player_image}
                                    alt={player.player_name}
                                    fill
                                    sizes="(max-width: 768px) 144px, 176px"
                                    priority
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-secondary">
                                    {player.player_name.charAt(0)}
                                </div>
                            )}
                            {player.jersey_number && (
                                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white">
                                    #{player.jersey_number}
                                </div>
                            )}
                        </div>

                        {/* Player Basic Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                                    {player.player_country || 'International'}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                                    {player.player_type || player.player_role || 'Athlete'}
                                </span>
                                {player.is_captain && (
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                                        Team Captain
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight mb-2">
                                {player.player_name}
                            </h1>


                            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">
                                {player.team_name || player.player_country}
                            </p>

                            {/* Bio */}
                            {player.bio && (
                                <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-2xl">
                                    {player.bio}
                                </p>
                            )}

                            {/* Quick Specs Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Batting Style</span>
                                    <span className="text-xs font-bold text-white uppercase">{player.batting_style || 'Right-hand bat'}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Bowling Style</span>
                                    <span className="text-xs font-bold text-white uppercase">{player.bowling_style || 'Right-arm medium'}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Age</span>
                                    <span className="text-xs font-bold text-white uppercase">{player.player_age ? `${player.player_age} yrs` : 'N/A'}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Birthplace</span>
                                    <span className="text-xs font-bold text-white uppercase">{player.player_born || player.player_country || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Career Statistics Section */}
                <div className="glass-card rounded-[2.5rem] p-6 md:p-10 mb-10 border border-white/5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <span>📊</span> Career Record Matrix
                            </h2>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Multi-format statistical performance</p>
                        </div>

                        {/* Format Tabs */}
                        <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
                            {(['test', 'odi', 't20i', 'ipl'] as FormatTab[]).map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => setActiveFormat(fmt)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeFormat === fmt
                                            ? 'bg-secondary text-white shadow-lg'
                                            : 'text-text-muted hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {currentStats ? (
                        <div className="space-y-8">
                            {/* Batting Matrix */}
                            <div>
                                <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span>🏏</span> Batting & Fielding Statistics ({activeFormat.toUpperCase()})
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Matches</span>
                                        <span className="text-xl font-black text-white tabular-nums">{currentStats.matches}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Innings</span>
                                        <span className="text-xl font-black text-white tabular-nums">{currentStats.innings}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center">
                                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest block mb-1">Runs</span>
                                        <span className="text-xl font-black text-white tabular-nums">{currentStats.runs}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Highest Score</span>
                                        <span className="text-xl font-black text-white tabular-nums">{currentStats.highestScore}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Average</span>
                                        <span className="text-xl font-black text-emerald-400 tabular-nums">{currentStats.average}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Strike Rate</span>
                                        <span className="text-xl font-black text-amber-400 tabular-nums">{currentStats.strikeRate}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">100s / Centuries</span>
                                        <span className="text-lg font-black text-purple-400 tabular-nums">{currentStats.centuries}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">50s / Half-Centuries</span>
                                        <span className="text-lg font-black text-blue-400 tabular-nums">{currentStats.fifties}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">4s (Fours)</span>
                                        <span className="text-lg font-black text-white tabular-nums">{currentStats.fours}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">6s (Sixes)</span>
                                        <span className="text-lg font-black text-white tabular-nums">{currentStats.sixes}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bowling Matrix (if applicable) */}
                            {currentStats.wickets !== undefined && currentStats.wickets > 0 && (
                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span>🎯</span> Bowling Statistics ({activeFormat.toUpperCase()})
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mb-1">Wickets</span>
                                            <span className="text-xl font-black text-white tabular-nums">{currentStats.wickets}</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Economy</span>
                                            <span className="text-xl font-black text-emerald-400 tabular-nums">{currentStats.economy || 'N/A'}</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Bowling Avg</span>
                                            <span className="text-xl font-black text-white tabular-nums">{currentStats.bowlingAverage || 'N/A'}</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Best Innings</span>
                                            <span className="text-xl font-black text-white tabular-nums">{currentStats.bestBowlingInnings || 'N/A'}</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">5 Wickets</span>
                                            <span className="text-xl font-black text-amber-400 tabular-nums">{currentStats.fiveWickets || 0}</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Overs Bowled</span>
                                            <span className="text-xl font-black text-white tabular-nums">{currentStats.overs || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-text-muted text-xs uppercase font-bold tracking-widest">
                            No recorded statistics available for this format.
                        </div>
                    )}
                </div>

                {/* Recent Form / Match Log */}
                {player.recent_matches && player.recent_matches.length > 0 && (
                    <div className="glass-card rounded-[2.5rem] p-6 md:p-10 border border-white/5">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                            <span>🔥</span> Recent Outings & Match Performance
                        </h2>

                        <div className="space-y-3">
                            {player.recent_matches.map((m, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-black text-white uppercase">{m.match_name}</span>
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">{m.result || 'Finished'}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">vs {m.opponent} • {m.date}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">Score</span>
                                            <span className="text-base font-black text-amber-400 tabular-nums">{m.runs} runs ({m.balls}b)</span>
                                        </div>
                                        {m.wickets !== '0' && (
                                            <div className="text-right">
                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">Bowling</span>
                                                <span className="text-base font-black text-cyan-400 tabular-nums">{m.wickets}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
