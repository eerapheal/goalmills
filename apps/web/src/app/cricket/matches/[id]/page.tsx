'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketEvent, CricketScorecardPlayer } from '@goalmills/types';
import Image from 'next/image';

export default function CricketMatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [match, setMatch] = useState<CricketEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'scorecard'>('info');

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const matchId = String(params.id);
            try {
                // Create date range for the API call (30 days before and after today)
                const today = new Date();
                const fromDate = new Date(today);
                fromDate.setDate(today.getDate() - 30);
                const toDate = new Date(today);
                toDate.setDate(today.getDate() + 30);

                const response = await advancedCricketApi.getFixtures({
                    matchId: Number(matchId),
                    APIkey: 'mock',
                    from: fromDate.toISOString().split('T')[0], // yyyy-mm-dd format
                    to: toDate.toISOString().split('T')[0] // yyyy-mm-dd format
                });
                if (response.result && response.result.length > 0) {
                    setMatch(response.result[0]);
                }
            } catch (error) {
                console.error('Error loading match details:', error);
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

    if (!match) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl font-bold mb-4">Match Not Found</h2>
                <button onClick={() => router.back()} className="text-secondary hover:underline">Go Back</button>
            </div>
        );
    }

    const isLive = match.event_live === '1';
    const isUpcoming = match.event_status === 'Not Started';

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
                    <span className="text-sm font-bold text-text-muted uppercase tracking-wider">{match.league_name}</span>
                </div>

                {/* Score Header Card */}
                <div className="glass-card rounded-2xl p-6 mb-8 border border-white/5 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                    {isLive && (
                        <div className="absolute top-0 right-0 p-4">
                            <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                </span>
                                <span className="text-xs font-bold text-yellow-500 tracking-widest">LIVE</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1">
                            {match.event_home_team_logo ? (
                                <div className="relative w-20 h-20 bg-white/5 rounded-full p-2 mb-3">
                                    <Image src={match.event_home_team_logo} alt={match.event_home_team} width={80} height={80} className="object-contain w-full h-full" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-3xl font-bold text-blue-400">{match.event_home_team.charAt(0)}</span>
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-white text-center">{match.event_home_team}</h2>
                            {!isUpcoming && match.event_home_final_result && (
                                <p className="text-2xl font-extrabold text-white mt-1">{match.event_home_final_result}</p>
                            )}
                        </div>

                        {/* VS / Info */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-3xl font-black text-white/20">VS</div>
                            <div className="text-center mt-2">
                                <p className="text-xs font-bold text-secondary uppercase">{match.event_type}</p>
                                <p className="text-[10px] text-text-muted mt-1">{match.event_date_start}</p>
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1">
                            {match.event_away_team_logo ? (
                                <div className="relative w-20 h-20 bg-white/5 rounded-full p-2 mb-3">
                                    <Image src={match.event_away_team_logo} alt={match.event_away_team} width={80} height={80} className="object-contain w-full h-full" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-3xl font-bold text-blue-400">{match.event_away_team.charAt(0)}</span>
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-white text-center">{match.event_away_team}</h2>
                            {!isUpcoming && match.event_away_final_result && (
                                <p className="text-2xl font-extrabold text-white mt-1">{match.event_away_final_result}</p>
                            )}
                        </div>
                    </div>

                    {/* Status Text Footer */}
                    <div className="border-t border-white/5 pt-4 text-center">
                        <p className="text-secondary font-semibold uppercase text-sm tracking-wide">
                            {match.event_status_info || match.event_status}
                        </p>
                        <p className="text-text-muted text-xs mt-1">{match.event_stadium}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/10">
                    {['info', 'scorecard'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`
                                pb-3 font-bold text-sm uppercase tracking-wider relative
                                ${activeTab === tab ? 'text-secondary' : 'text-text-muted hover:text-white'}`}
                        >
                            {tab}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full" />}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'info' ? (
                    <div className="glass-card rounded-xl p-6 border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Match Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-text-muted text-xs uppercase mb-1">Date</p>
                                <p className="text-white font-medium">{match.event_date_start}</p>
                            </div>
                            <div>
                                <p className="text-text-muted text-xs uppercase mb-1">Time</p>
                                <p className="text-white font-medium">{match.event_time}</p>
                            </div>
                            <div>
                                <p className="text-text-muted text-xs uppercase mb-1">Venue</p>
                                <p className="text-white font-medium">{match.event_stadium}</p>
                            </div>
                            <div>
                                <p className="text-text-muted text-xs uppercase mb-1">Series</p>
                                <p className="text-white font-medium">{match.league_name}</p>
                            </div>
                            {match.event_toss && (
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-text-muted text-xs uppercase mb-1">Toss</p>
                                    <p className="text-white font-medium">{match.event_toss}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card rounded-xl p-6 border border-white/5">
                        {match.scorecard && Object.keys(match.scorecard).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(match.scorecard).map(([innings, players]) => (
                                    <div key={innings}>
                                        <h3 className="text-lg font-bold text-white mb-3">{innings}</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-text-muted border-b border-white/10">
                                                    <tr>
                                                        <th className="py-2 text-left w-1/3">Player</th>
                                                        <th className="py-2 text-right">R</th>
                                                        <th className="py-2 text-right">B</th>
                                                        <th className="py-2 text-right">4s</th>
                                                        <th className="py-2 text-right">6s</th>
                                                        <th className="py-2 text-right">SR</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-white">
                                                    {(players as CricketScorecardPlayer[]).map((player, i) => (
                                                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                                            <td className="py-2.5">
                                                                <div className="font-bold">{player.player}</div>
                                                                <div className="text-text-muted text-xs">{player.status}</div>
                                                            </td>
                                                            <td className="py-2.5 text-right font-bold">{player.R}</td>
                                                            <td className="py-2.5 text-right">{player.B}</td>
                                                            <td className="py-2.5 text-right">{player['4s']}</td>
                                                            <td className="py-2.5 text-right">{player['6s']}</td>
                                                            <td className="py-2.5 text-right">{player.SR}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-text-muted">Scorecard not available yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
