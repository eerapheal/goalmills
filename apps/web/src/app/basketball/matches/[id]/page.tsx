'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BasketballEvent } from '@goalmills/types';
import { basketballApi } from '../../../../services/basketballApi';
import Image from 'next/image';
import Link from 'next/link';

export default function BasketballMatchPage() {
    const params = useParams();
    const router = useRouter();
    const [match, setMatch] = useState<BasketballEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'lineups'>('overview');
    const [odds, setOdds] = useState<any>(null);
    const [statistics, setStatistics] = useState<any>(null);
    const [lineups, setLineups] = useState<any>(null);

    useEffect(() => {
        const loadMatchData = async () => {
            try {
                const matchId = parseInt(params.id as string);
                const [matchData, oddsData, statsData, lineupsData] = await Promise.all([
                    basketballApi.getFixtures({ matchId }),
                    basketballApi.getOdds({ matchId }),
                    basketballApi.getStatistics({ matchId }),
                    basketballApi.getLineups({ matchId })
                ]);

                if (matchData.result && matchData.result.length > 0) {
                    setMatch(matchData.result[0]);
                    setOdds(oddsData.result[matchId]);
                    setStatistics(statsData.result);
                    setLineups(lineupsData.result);
                }
            } catch (error) {
                console.error('Error loading match data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMatchData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex items-center justify-center">
                <p className="text-white">Match not found</p>
            </div>
        );
    }

    const isLive = match.event_live === '1';

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[90px]">
            <div className="max-w-4xl mx-auto p-4">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-4 flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Match Header */}
                <div className="glass-card rounded-2xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Link href={`/basketball/leagues/${match.league_key}`} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">
                                {match.league_name} • {match.league_round}
                            </Link>
                            <p className="text-xs text-text-muted mt-1">{match.event_date} • {match.event_time}</p>
                        </div>
                        {isLive && (
                            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                </span>
                                <span className="text-sm font-bold text-yellow-500">LIVE</span>
                            </div>
                        )}
                    </div>

                    {/* Teams and Score */}
                    <div className="space-y-6">
                        {/* Home Team */}
                        <div className="flex items-center justify-between">
                            <Link href={`/basketball/teams/${match.home_team_key}`} className="flex items-center gap-4 group">
                                <div className="relative w-16 h-16 rounded-full bg-white/5 overflow-hidden">
                                    <Image
                                        src={match.event_home_team_logo || 'https://via.placeholder.com/64'}
                                        alt={match.event_home_team}
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-2xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                                    {match.event_home_team}
                                </span>
                            </Link>
                            <span className="text-4xl font-bold text-white">
                                {match.event_final_result?.split(' - ')[0] || '-'}
                            </span>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-between">
                            <Link href={`/basketball/teams/${match.away_team_key}`} className="flex items-center gap-4 group">
                                <div className="relative w-16 h-16 rounded-full bg-white/5 overflow-hidden">
                                    <Image
                                        src={match.event_away_team_logo || 'https://via.placeholder.com/64'}
                                        alt={match.event_away_team}
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-2xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                                    {match.event_away_team}
                                </span>
                            </Link>
                            <span className="text-4xl font-bold text-white">
                                {match.event_final_result?.split(' - ')[1] || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Quarter Scores */}
                    {match.scores && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="grid grid-cols-5 gap-2 text-center">
                                <div className="text-xs text-text-muted font-bold">Team</div>
                                {Object.keys(match.scores).map((quarter, i) => (
                                    <div key={i} className="text-xs text-text-muted font-bold">{quarter.replace('Quarter', 'Q')}</div>
                                ))}

                                <div className="text-sm font-bold text-white">{match.event_home_team.substring(0, 3).toUpperCase()}</div>
                                {Object.values(match.scores).map((score: any, i) => (
                                    <div key={i} className="text-sm font-bold text-white">{score[0]?.score_home || '-'}</div>
                                ))}

                                <div className="text-sm font-bold text-white">{match.event_away_team.substring(0, 3).toUpperCase()}</div>
                                {Object.values(match.scores).map((score: any, i) => (
                                    <div key={i} className="text-sm font-bold text-white">{score[0]?.score_away || '-'}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {(['overview', 'stats', 'lineups'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                px-4 py-2 rounded-full border transition-all capitalize
                                ${activeTab === tab
                                    ? 'bg-yellow-500 text-white border-yellow-500'
                                    : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && odds && (
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Betting Odds</h3>
                        <div className="space-y-4">
                            {odds['Home/Away'] && (
                                <div>
                                    <p className="text-sm text-text-muted mb-2">Match Winner</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-xs text-text-muted mb-2">Home Win</p>
                                            <p className="text-2xl font-bold text-yellow-500">{odds['Home/Away']['Home']?.['Bet365'] || '-'}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-xs text-text-muted mb-2">Away Win</p>
                                            <p className="text-2xl font-bold text-yellow-500">{odds['Home/Away']['Away']?.['Bet365'] || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {odds['Total'] && (
                                <div>
                                    <p className="text-sm text-text-muted mb-2">Total Points</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(odds['Total']).map(([key, value]: [string, any]) => (
                                            <div key={key} className="bg-white/5 rounded-lg p-4">
                                                <p className="text-xs text-text-muted mb-2">{key}</p>
                                                <p className="text-xl font-bold text-yellow-500">{value?.['Bet365'] || '-'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {odds['Handicap'] && (
                                <div>
                                    <p className="text-sm text-text-muted mb-2">Handicap</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(odds['Handicap']).map(([key, value]: [string, any]) => (
                                            <div key={key} className="bg-white/5 rounded-lg p-4">
                                                <p className="text-xs text-text-muted mb-2">{key}</p>
                                                <p className="text-xl font-bold text-yellow-500">{value?.['Bet365'] || '-'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && statistics && (
                    <div className="space-y-4">
                        {/* Team Statistics */}
                        {statistics.statistics && statistics.statistics.length > 0 && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Team Statistics</h3>
                                <div className="space-y-3">
                                    {statistics.statistics.map((stat: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                            <div className="flex-1 text-center">
                                                <p className="text-lg font-bold text-white">{stat.home}</p>
                                            </div>
                                            <div className="flex-1 text-center">
                                                <p className="text-xs text-text-muted font-bold uppercase">{stat.type}</p>
                                            </div>
                                            <div className="flex-1 text-center">
                                                <p className="text-lg font-bold text-white">{stat.away}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Player Statistics */}
                        {statistics.player_statistics && (
                            <div className="space-y-4">
                                {/* Home Team Players */}
                                {statistics.player_statistics.home_team && statistics.player_statistics.home_team.length > 0 && (
                                    <div className="glass-card rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4">{match?.event_home_team} - Player Stats</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-xs text-text-muted uppercase">
                                                        <th className="p-2">Player</th>
                                                        <th className="p-2 text-center">MIN</th>
                                                        <th className="p-2 text-center">PTS</th>
                                                        <th className="p-2 text-center">REB</th>
                                                        <th className="p-2 text-center">AST</th>
                                                        <th className="p-2 text-center">FG</th>
                                                        <th className="p-2 text-center">3P</th>
                                                        <th className="p-2 text-center">FT</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {statistics.player_statistics.home_team.map((player: any, index: number) => (
                                                        <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                                            <td className="p-2">
                                                                <Link href={`/basketball/players/${player.player_id}`} className="font-bold text-white hover:text-yellow-500">
                                                                    {player.player}
                                                                </Link>
                                                            </td>
                                                            <td className="p-2 text-center text-text-secondary">{player.player_minutes}</td>
                                                            <td className="p-2 text-center font-bold text-yellow-500">{player.player_points}</td>
                                                            <td className="p-2 text-center text-white">{player.player_total_rebounds}</td>
                                                            <td className="p-2 text-center text-white">{player.player_assists}</td>
                                                            <td className="p-2 text-center text-text-secondary">{player.player_field_goals_made}/{player.player_field_goals_attempts}</td>
                                                            <td className="p-2 text-center text-text-secondary">{player.player_threepoint_goals_made}/{player.player_threepoint_goals_attempts}</td>
                                                            <td className="p-2 text-center text-text-secondary">{player.player_freethrows_goals_made}/{player.player_freethrows_goals_attempts}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Away Team Players */}
                                {statistics.player_statistics.away_team && statistics.player_statistics.away_team.length > 0 && (
                                    <div className="glass-card rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4">{match?.event_away_team} - Player Stats</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-xs text-text-muted uppercase">
                                                        <th className="p-2">Player</th>
                                                        <th className="p-2 text-center">MIN</th>
                                                        <th className="p-2 text-center">PTS</th>
                                                        <th className="p-2 text-center">REB</th>
                                                        <th className="p-2 text-center">AST</th>
                                                        <th className="p-2 text-center">FG</th>
                                                        <th className="p-2 text-center">3P</th>
                                                        <th className="p-2 text-center">FT</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {statistics.player_statistics.away_team.map((player: any, index: number) => (
                                                        <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                                            <td className="p-2">
                                                                <Link href={`/basketball/players/${player.player_id}`} className="font-bold text-white hover:text-yellow-500">
                                                                    {player.player}
                                                                </Link>
                                                            </td>
                                                            <td className="p-2 text-center text-text-secondary">{player.player_minutes}</td>
                                                            <td className="p-2 text-center font-bold text-yellow-500">{player.player_points}</td>
                                                            <td className="p-2 text-center text-white">{player.player_total_rebounds}</td>
                                                            <td className="p-2 text-center text-white">{player.player_assists}</td>
                                                            <td className="p-2 text-center text-text-secondary">{player.player_field_goals_made}/{player.player_field_goals_attempts}</td>
                                                            <td className="p-2 text-center text-text-secondary">{player.player_threepoint_goals_made}/{player.player_threepoint_goals_attempts}</td>
                                                            <td className="p-2 text-center text-text-secondary">{player.player_freethrows_goals_made}/{player.player_freethrows_goals_attempts}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(!statistics || (!statistics.statistics?.length && !statistics.player_statistics?.home_team?.length)) && (
                            <div className="glass-card rounded-2xl p-6">
                                <p className="text-text-muted text-center">Statistics will be available during and after the match.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'lineups' && lineups && (
                    <div className="space-y-4">
                        {/* Home Team Lineup */}
                        {lineups.home_team && lineups.home_team.starting_lineups && lineups.home_team.starting_lineups.length > 0 && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">{match?.event_home_team} - Starting Lineup</h3>
                                <div className="space-y-3">
                                    {lineups.home_team.starting_lineups.map((player: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={`/basketball/players/${player.player_id}`}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-text-muted w-8">#{player.player_number}</span>
                                                <span className="font-bold text-white group-hover:text-yellow-500">{player.player}</span>
                                            </div>
                                            <span className="text-sm text-text-secondary">{player.player_position}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Away Team Lineup */}
                        {lineups.away_team && lineups.away_team.starting_lineups && lineups.away_team.starting_lineups.length > 0 && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">{match?.event_away_team} - Starting Lineup</h3>
                                <div className="space-y-3">
                                    {lineups.away_team.starting_lineups.map((player: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={`/basketball/players/${player.player_id}`}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-text-muted w-8">#{player.player_number}</span>
                                                <span className="font-bold text-white group-hover:text-yellow-500">{player.player}</span>
                                            </div>
                                            <span className="text-sm text-text-secondary">{player.player_position}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(!lineups || (!lineups.home_team?.starting_lineups?.length && !lineups.away_team?.starting_lineups?.length)) && (
                            <div className="glass-card rounded-2xl p-6">
                                <p className="text-text-muted text-center">Lineups will be available closer to match time.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
