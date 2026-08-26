'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketLeague, CricketEvent } from '@goalmills/types';
import { CricketMatchCard } from '../../../../components/CricketMatchCard';
import Link from 'next/link';

type SeriesTab = 'matches' | 'table' | 'squads' | 'venues' | 'news' | 'stats';

export default function CricketSeriesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [series, setSeries] = useState<CricketLeague | null>(null);
    const [activeTab, setActiveTab] = useState<SeriesTab>('matches');
    const [matches, setMatches] = useState<CricketEvent[]>([]);
    const [standings, setStandings] = useState<any[]>([]);
    const [squads, setSquads] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [news, setNews] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!params.id) return;
            const seriesId = String(params.id);
            try {
                setLoading(true);
                // 1. Get Series Overview
                const leaguesRes = await advancedCricketApi.getLeagues();
                const foundSeries = leaguesRes.result?.find(s => String(s.league_key) === seriesId) || {
                    league_key: seriesId,
                    league_name: `Cricket Series #${seriesId}`,
                    country_name: 'International Tournament',
                    league_season: '2026',
                    league_year: '2026',
                };
                setSeries(foundSeries);

                // 2. Parallel fetch for all Series data
                const [matchesRes, standingsRes, squadsRes, venuesRes, newsRes, statsRes] = await Promise.all([
                    advancedCricketApi.getSeriesMatches(seriesId).catch(() => ({ result: [] })),
                    advancedCricketApi.getSeriesPointsTable(seriesId).catch(() => ({ result: [] })),
                    advancedCricketApi.getSeriesSquads(seriesId).catch(() => ({ result: [] })),
                    advancedCricketApi.getSeriesVenues(seriesId).catch(() => ({ result: [] })),
                    advancedCricketApi.getSeriesNews(seriesId).catch(() => ({ result: [] })),
                    advancedCricketApi.getSeriesStats(seriesId).catch(() => null),
                ]);

                setMatches(matchesRes?.result || []);
                setStandings(standingsRes?.result || []);
                setSquads(squadsRes?.result || (Array.isArray(squadsRes) ? squadsRes : []));
                setVenues(venuesRes?.result || (Array.isArray(venuesRes) ? venuesRes : []));
                setNews(newsRes?.result || newsRes?.storyList || []);
                if (statsRes?.result) setStats(statsRes.result);
            } catch (error) {
                console.error('Error loading series intelligence:', error);
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
                <p className="text-text-secondary font-black uppercase tracking-widest text-xs">Syncing Tournament Intelligence...</p>
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center text-white px-4 text-center">
                <div className="text-6xl mb-6">🔍</div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Series Not Located</h2>
                <p className="text-text-secondary mb-8 max-w-md">The requested series data could not be retrieved from the worldwide feed.</p>
                <button
                    onClick={() => router.push('/cricket')}
                    className="px-8 py-3 bg-secondary text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Back to Cricket Dashboard
                </button>
            </div>
        );
    }

    const tabs: { id: SeriesTab; label: string; icon: string }[] = [
        { id: 'matches', label: 'Matches', icon: '📅' },
        { id: 'table', label: 'Points Table', icon: '🏆' },
        { id: 'squads', label: 'Squads', icon: '👥' },
        { id: 'venues', label: 'Venues', icon: '📍' },
        { id: 'news', label: 'News', icon: '📰' },
        { id: 'stats', label: 'Stats', icon: '📊' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-24">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header Navigation */}
                <div className="flex items-center gap-6 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:border-secondary transition-all hover:scale-105 group shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Tournament Hub</span>
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mt-1">{series.league_name}</h1>
                    </div>
                </div>

                {/* Series Identity Banner */}
                <div className="glass-card rounded-3xl p-6 md:p-8 mb-8 border border-white/10 relative overflow-hidden bg-gradient-to-br from-white/[0.07] via-[#0a0e27] to-[#0d143d]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 shadow-lg p-3 flex items-center justify-center">
                            {series.league_logo ? (
                                <img src={series.league_logo} alt={series.league_name} className="object-contain w-full h-full" />
                            ) : (
                                <span className="text-3xl font-black text-secondary">{series.league_name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="inline-flex px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-wider mb-2 border border-secondary/20">
                                {series.country_name || 'International Events'}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2">{series.league_name}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-white/5 px-3 py-1 rounded-lg border border-white/10">{series.league_season || '2026'}</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-white/5 px-3 py-1 rounded-lg border border-white/10">{matches.length} Total Matches</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Pills Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-secondary text-white shadow-lg shadow-secondary/25 scale-[1.02]'
                                    : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white border border-white/5'
                                }
                            `}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab 1: Matches & Results */}
                {activeTab === 'matches' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Tournament Fixtures & Results</h3>
                            <span className="text-xs font-bold text-text-muted">{matches.length} Matches</span>
                        </div>
                        {matches.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {matches.map((m) => (
                                    <CricketMatchCard key={m.event_key} match={m} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No scheduled matches or past results documented for this tournament yet." />
                        )}
                    </div>
                )}

                {/* Tab 2: Standings / Points Table */}
                {activeTab === 'table' && (
                    <div className="space-y-6">
                        {standings.length > 0 ? (
                            <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
                                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Official Points Table</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-white/[0.02] text-text-muted text-[10px] uppercase font-black tracking-wider border-b border-white/5">
                                            <tr>
                                                <th className="py-3 px-4"># Team</th>
                                                <th className="py-3 px-3 text-center">P</th>
                                                <th className="py-3 px-3 text-center">W</th>
                                                <th className="py-3 px-3 text-center">L</th>
                                                <th className="py-3 px-3 text-center">NR</th>
                                                <th className="py-3 px-3 text-center">PTS</th>
                                                <th className="py-3 px-4 text-right">NRR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {standings.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 flex items-center gap-3">
                                                        <span className="font-bold text-text-muted text-[11px] w-4">{row.standing_place || idx + 1}</span>
                                                        {row.team_logo && (
                                                            <img src={row.team_logo} alt={row.team_name} className="w-6 h-6 object-contain rounded-md bg-white/5 p-0.5" />
                                                        )}
                                                        <Link href={`/cricket/teams/${row.team_key}`} className="font-black text-white hover:text-secondary uppercase">
                                                            {row.team_name}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-bold text-white">{row.standing_P}</td>
                                                    <td className="py-3 px-3 text-center font-bold text-emerald-400">{row.standing_W}</td>
                                                    <td className="py-3 px-3 text-center font-bold text-red-400">{row.standing_L}</td>
                                                    <td className="py-3 px-3 text-center font-bold text-text-muted">{row.standing_NR || '0'}</td>
                                                    <td className="py-3 px-3 text-center font-black text-amber-400 text-sm">{row.standing_PTS}</td>
                                                    <td className="py-3 px-4 text-right font-bold text-text-muted tabular-nums">{row.standing_NRR}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <EmptyState message="Points table standings are currently being compiled for this series." />
                        )}
                    </div>
                )}

                {/* Tab 3: Squads */}
                {activeTab === 'squads' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {squads.length > 0 ? (
                            squads.map((sq, idx) => (
                                <div key={idx} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-secondary/30 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {sq.squad_image ? (
                                            <img src={sq.squad_image} alt={sq.squad_name} className="w-10 h-10 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center font-black text-secondary">
                                                {sq.squad_name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-white text-sm uppercase">{sq.squad_name}</h4>
                                            <span className="text-[10px] text-text-muted font-semibold">{sq.squad_type || 'Official Squad'}</span>
                                        </div>
                                    </div>
                                    <span className="text-secondary font-black text-xs">→</span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full">
                                <EmptyState message="Squad rosters will be announced following team announcements." />
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 4: Venues */}
                {activeTab === 'venues' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {venues.length > 0 ? (
                            venues.map((v, idx) => (
                                <div key={idx} className="glass-card rounded-2xl p-5 border border-white/5 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                                        📍
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm uppercase">{v.ground}</h4>
                                        <p className="text-text-muted text-xs font-semibold">{v.city}{v.country ? `, ${v.country}` : ''}</p>
                                        {v.capacity && (
                                            <span className="inline-block mt-2 text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded">
                                                Capacity: {v.capacity}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full">
                                <EmptyState message="Stadium and venue details are pending schedule release." />
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 5: News */}
                {activeTab === 'news' && (
                    <div className="space-y-4">
                        {news.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {news.map((item, idx) => (
                                    <div key={idx} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-secondary/30 transition-all">
                                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-2">Tournament News</span>
                                        <h4 className="font-bold text-white text-sm mb-2">{item.headline || item.title || 'Cricket News Update'}</h4>
                                        <p className="text-text-muted text-xs line-clamp-2">{item.intro || item.description || ''}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No editorial reports posted for this series yet." />
                        )}
                    </div>
                )}

                {/* Tab 6: Stats */}
                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        {stats && stats.headers?.length ? (
                            <div className="glass-card rounded-2xl p-6 border border-white/5">
                                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">{stats.stat_type || 'Top Performers'}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-white/5 text-text-muted text-[10px] uppercase font-black border-b border-white/5">
                                            <tr>
                                                {stats.headers.map((h: string, idx: number) => (
                                                    <th key={idx} className="py-2.5 px-3">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {stats.values.map((row: any, rIdx: number) => (
                                                <tr key={rIdx} className="hover:bg-white/[0.02]">
                                                    {row.values?.map((val: string, cIdx: number) => (
                                                        <td key={cIdx} className="py-2.5 px-3 font-semibold text-white">{val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <EmptyState message="Series tournament statistics are compiled as matches conclude." />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center justify-center">
            <span className="text-3xl mb-3 opacity-40">🏏</span>
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider max-w-sm">{message}</p>
        </div>
    );
}
