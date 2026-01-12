'use client';

import { useState, useEffect, useMemo } from 'react';
import { advancedCricketApi } from '../services/advancedCricketApi';
import { CricketEvent, CricketLeague, CricketTeam, CricketStanding } from '@goalmills/types';
import { CricketMatchCard } from './CricketMatchCard';
import Image from 'next/image';
import Link from 'next/link';

type TabType = 'live' | 'upcoming' | 'recent' | 'series' | 'teams' | 'rankings';

export function CricketScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('live');
    const [liveMatches, setLiveMatches] = useState<CricketEvent[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<CricketEvent[]>([]);
    const [recentMatches, setRecentMatches] = useState<CricketEvent[]>([]);
    const [seriesList, setSeriesList] = useState<CricketLeague[]>([]);
    const [teamsList, setTeamsList] = useState<CricketTeam[]>([]);
    const [rankings, setRankings] = useState<Record<string, CricketStanding[]>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [timezone, setTimezone] = useState('GMT');

    // Priority ranking for major cricket competitions
    const LEAGUE_PRIORITY: Record<string, number> = {
        'ICC World Cup': 1,
        'ICC T20 World Cup': 1,
        'Indian Premier League': 2,
        'IPL': 2,
        'Big Bash League': 3,
        'BBL': 3,
        'Pakistan Super League': 4,
        'PSL': 4,
        'SA20': 5,
        'The Hundred': 6,
        'Caribbean Premier League': 7,
        'CPL': 7,
        'Vitality Blast': 8,
        'Bangladesh Premier League': 9,
        'BPL': 9,
        'International': 10
    };

    const getLeagueRank = (name: string = '') => {
        for (const [key, rank] of Object.entries(LEAGUE_PRIORITY)) {
            if (name.toLowerCase().includes(key.toLowerCase())) return rank;
        }
        return 100; // Unranked/Minor leagues
    };

    const sortMatches = (matches: CricketEvent[]) => {
        return [...matches].sort((a, b) => {
            const rankA = getLeagueRank(a.league_name);
            const rankB = getLeagueRank(b.league_name);
            if (rankA !== rankB) return rankA - rankB;
            // Secondary sort by date/time
            return new Date(a.event_date_start + ' ' + (a.event_time || '00:00')).getTime() -
                new Date(b.event_date_start + ' ' + (b.event_time || '00:00')).getTime();
        });
    };

    useEffect(() => {
        loadData();
    }, [timezone]); // Reload data when timezone changes

    const loadData = async () => {
        try {
            setLoading(true);
            const today = advancedCricketApi.getFormattedDate();
            const futureDate = advancedCricketApi.getFormattedDate(14);
            const pastDate = advancedCricketApi.getFormattedDate(-14);

            const [live, upcoming, recent, series, teams, iplRank, t20WorldCupRank, bblRank] = await Promise.all([
                advancedCricketApi.getLivescore({ timezone }),
                advancedCricketApi.getFixtures({ from: today, to: futureDate, timezone }),
                advancedCricketApi.getFixtures({ from: pastDate, to: today, timezone }),
                advancedCricketApi.getLeagues(),
                advancedCricketApi.getTeams(),
                advancedCricketApi.getStandings({ leagueId: 9785 }), // IPL
                advancedCricketApi.getStandings({ leagueId: 9843 }), // ICC T20 World Cup
                advancedCricketApi.getStandings({ leagueId: 9779 }), // BBL
            ]);

            setLiveMatches(sortMatches(live.result || []));
            setUpcomingMatches(sortMatches(upcoming.result || []));
            setRecentMatches(sortMatches(recent.result || []).reverse()); // Show most recent first
            setSeriesList(series.result || []);
            setTeamsList(teams.result || []);

            setRankings({
                'IPL': iplRank.result?.total || [],
                'T20 WC': t20WorldCupRank.result?.total || [],
                'BBL': bblRank.result?.total || [],
            });
        } catch (error) {
            console.error('Error loading cricket intelligence:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSeries = useMemo(() => {
        const currentYear = new Date().getFullYear(); // 2026
        return seriesList
            .filter(s => {
                const name = s.league_name?.toLowerCase() || '';
                const search = searchQuery.toLowerCase();
                const matchesSearch = name.includes(search) ||
                    s.country_name?.toLowerCase().includes(search);

                // Temporal filter: Only show 2025, 2026, or future seasons
                // This eliminates the "IPL 2024" noise when in 2026
                const seasonStr = s.league_season || name;
                const years = seasonStr.match(/\d{4}/g) || [];
                const isModern = years.length === 0 || years.some(y => parseInt(y) >= currentYear - 1);

                return matchesSearch && isModern;
            })
            .sort((a, b) => {
                const rankA = getLeagueRank(a.league_name);
                const rankB = getLeagueRank(b.league_name);
                if (rankA !== rankB) return rankA - rankB;
                return (a.league_name || '').localeCompare(b.league_name || '');
            });
    }, [seriesList, searchQuery]);

    const filteredTeams = useMemo(() => {
        return teamsList.filter(t =>
            t.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [teamsList, searchQuery]);

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Worldwide Coverage...</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'live':
                return (
                    <div className="p-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                                Playing Now
                            </h2>
                        </div>
                        {liveMatches.length > 0 ? (
                            liveMatches.map((match, idx) => (
                                <CricketMatchCard key={match.event_key || `live-${idx}`} match={match} />
                            ))
                        ) : (
                            <div className="glass-card rounded-3xl p-16 text-center border-white/5">
                                <p className="text-text-muted font-black uppercase tracking-widest text-xs">No active professional matches at this hour.</p>
                            </div>
                        )}
                    </div>
                );

            case 'upcoming':
                return (
                    <div className="p-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">🗓️ Future Fixtures</h2>
                        </div>
                        {upcomingMatches.map((match, idx) => (
                            <CricketMatchCard key={match.event_key || `up-${idx}`} match={match} />
                        ))}
                    </div>
                );

            case 'recent':
                return (
                    <div className="p-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">✅ Recent Results</h2>
                        </div>
                        {recentMatches.map((match, idx) => (
                            <CricketMatchCard key={match.event_key || `result-${idx}`} match={match} />
                        ))}
                    </div>
                );

            case 'series':
                return (
                    <div className="p-4 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">🏆 Global Series & Cups</h2>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="SEARCH SERIES..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-full px-6 py-2.5 text-[10px] font-black tracking-widest text-white focus:outline-none focus:border-secondary w-full md:w-[250px] transition-all"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-secondary"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSeries.map((series, idx) => {
                                const leagueName = series.league_name || (series as any).name || 'Tournament';
                                const detectedLogos = teamsList
                                    .filter(t => {
                                        const tName = t.team_name || (t as any).name;
                                        return tName && leagueName.toLowerCase().includes(tName.toLowerCase());
                                    })
                                    .map(t => t.team_logo)
                                    .filter(Boolean) as string[];

                                return (
                                    <Link
                                        href={`/cricket/series/${series.league_key}`}
                                        key={series.league_key || `series-${idx}`}
                                        className="group glass-card rounded-2xl p-5 border border-white/5 hover:border-secondary/30 transition-all hover:bg-secondary/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-secondary/10 transition-colors" />
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg flex items-center justify-center">
                                                {series.league_logo ? (
                                                    <Image src={series.league_logo} alt={leagueName} fill className="object-contain p-1" />
                                                ) : detectedLogos.length > 0 ? (
                                                    <div className="flex -space-x-4">
                                                        {detectedLogos.slice(0, 2).map((logo, idx) => (
                                                            <div key={idx} className="relative w-9 h-9 rounded-full border-2 border-[#0a0e27] overflow-hidden bg-white/10 shadow-xl">
                                                                <Image src={logo} alt="Team" fill className="object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-xl text-blue-400">
                                                        {leagueName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-white text-sm uppercase tracking-tight truncate group-hover:text-secondary transition-colors">
                                                    {leagueName}
                                                </h3>
                                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-wider">
                                                    {series.league_season || '2024'} • {series.country_name || 'International'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'teams':
                return (
                    <div className="p-4 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">🛡️ Registered Clubs & Nations</h2>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="SEARCH SQUADS..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-full px-6 py-2.5 text-[10px] font-black tracking-widest text-white focus:outline-none focus:border-secondary w-full md:w-[250px] transition-all"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-secondary"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-8">
                            {filteredTeams.map((team, idx) => (
                                <Link
                                    href={`/cricket/teams/${team.team_key}`}
                                    key={team.team_key || `team-${idx}`}
                                    className="group flex flex-col items-center"
                                >
                                    {(() => {
                                        const tName = team.team_name || (team as any).name || 'Unknown Team';
                                        return (
                                            <>
                                                <div className="relative w-20 h-20 mb-3 bg-white/5 rounded-full p-3 border border-white/5 group-hover:border-secondary/50 group-hover:bg-secondary/10 transition-all group-hover:scale-110 shadow-xl overflow-hidden flex items-center justify-center">
                                                    {team.team_logo ? (
                                                        <Image src={team.team_logo} alt={tName} width={64} height={64} className="object-contain w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="text-2xl font-black text-blue-400">{tName.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="font-black text-white text-[10px] uppercase tracking-widest text-center group-hover:text-secondary truncate w-full px-2">
                                                    {tName}
                                                </h3>
                                            </>
                                        );
                                    })()}
                                </Link>
                            ))}
                        </div>
                    </div>
                );

            case 'rankings':
                return (
                    <div className="p-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Global Standings Matrix</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {['IPL', 'T20 WC', 'BBL'].map((format) => (
                                <div key={format} className="glass-card rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute -right-6 -bottom-6 text-[8rem] opacity-[0.03] group-hover:rotate-12 transition-all font-black pointer-events-none select-none">#{format}</div>
                                    <h4 className="text-secondary font-black uppercase tracking-[0.3em] text-xs mb-10 border-b border-white/5 pb-4">{format} Leaderboard</h4>

                                    <div className="space-y-4">
                                        {(rankings[format] || []).slice(0, 10).map((rank, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between group/row hover:translate-x-1 transition-transform cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="w-6 text-[10px] font-black text-text-muted/50 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                                                    <Link
                                                        href={`/cricket/teams/${rank.team_key}`}
                                                        className="text-xs font-black text-white uppercase tracking-tight group-hover/row:text-secondary transition-colors"
                                                    >
                                                        {rank.standing_team}
                                                    </Link>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-white tabular-nums">{rank.standing_Pts}</span>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${parseFloat(rank.standing_NRR) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {rank.standing_NRR}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Hero Section */}
                <div className="relative glass-card rounded-[2.5rem] p-12 mb-12 border-2 border-white/5 bg-gradient-to-br from-white/5 to-[#0a0e27] overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067')] bg-cover bg-center opacity-[0.15] mix-blend-overlay group-hover:scale-105 transition-transform duration-[15s]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div>
                            <span className="inline-flex px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-secondary/30">Worldwide Coverage</span>
                            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">Cricket Intelligence</h1>
                            <p className="text-text-secondary text-base font-medium max-w-xl leading-relaxed">Access real-time analytics, live scorecards, and historical performance metrics from every professional wicket on the planet.</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                                    Timezone Sync
                                </p>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="bg-[#0a0e27] text-white text-[10px] font-black border border-white/10 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-secondary cursor-pointer hover:bg-white/5 transition-colors uppercase tracking-widest"
                                >
                                    {['GMT', 'UTC', 'Africa/Lagos', 'Europe/London', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney', 'America/New_York'].map(tz => (
                                        <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Network Status</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-white font-black uppercase text-sm">Live Feed Optimized</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Intelligent Navigation */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-10 bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/5 sticky top-[100px] z-[40]">
                    {[
                        { id: 'live', label: 'Live Action', icon: '⚡' },
                        { id: 'upcoming', label: 'Match Schedule', icon: '🗓️' },
                        { id: 'recent', label: 'Recent Intel', icon: '📊' },
                        { id: 'series', label: 'Series Intel', icon: '🏆' },
                        { id: 'teams', label: 'Squad Matrix', icon: '🛡️' },
                        { id: 'rankings', label: 'Standings Matrix', icon: '📈' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); }}
                            className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-secondary text-white shadow-[0_10px_30px_rgba(245,158,11,0.3)] scale-[1.02]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-xs">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Matrix */}
                {renderTabContent()}
            </div>
        </div>
    );
}
