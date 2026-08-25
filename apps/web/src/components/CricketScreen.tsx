'use client';

import { useState, useEffect, useMemo } from 'react';
import { advancedCricketApi } from '../services/advancedCricketApi';
import { CricketEvent, CricketLeague, CricketTeam, CricketStanding, CricketNewsItem } from '@goalmills/types';
import { CricketMatchCard } from './CricketMatchCard';
import Image from 'next/image';
import Link from 'next/link';

type TabType = 'live' | 'upcoming' | 'recent' | 'series' | 'teams' | 'rankings' | 'news';
type FormatFilter = 'all' | 'international' | 'franchise' | 'domestic' | 'women';

export function CricketScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('live');
    const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
    const [liveMatches, setLiveMatches] = useState<CricketEvent[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<CricketEvent[]>([]);
    const [recentMatches, setRecentMatches] = useState<CricketEvent[]>([]);
    const [seriesList, setSeriesList] = useState<CricketLeague[]>([]);
    const [teamsList, setTeamsList] = useState<CricketTeam[]>([]);
    const [rankings, setRankings] = useState<Record<string, CricketStanding[]>>({});
    const [newsList, setNewsList] = useState<CricketNewsItem[]>([]);
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
        'Women': 8,
        'International': 10
    };

    const getLeagueRank = (name: string = '') => {
        for (const [key, rank] of Object.entries(LEAGUE_PRIORITY)) {
            if (name.toLowerCase().includes(key.toLowerCase())) return rank;
        }
        return 100;
    };

    const sortMatches = (matches: CricketEvent[]) => {
        return [...matches].sort((a, b) => {
            const rankA = getLeagueRank(a.league_name);
            const rankB = getLeagueRank(b.league_name);
            if (rankA !== rankB) return rankA - rankB;
            return new Date(a.event_date_start + ' ' + (a.event_time || '00:00')).getTime() -
                new Date(b.event_date_start + ' ' + (b.event_time || '00:00')).getTime();
        });
    };

    useEffect(() => {
        loadData();
    }, [timezone]);

    const loadData = async () => {
        try {
            setLoading(true);
            const today = advancedCricketApi.getFormattedDate();
            const futureDate = advancedCricketApi.getFormattedDate(14);
            const pastDate = advancedCricketApi.getFormattedDate(-14);

            const [live, upcoming, recent, series, teams, iplRank, t20WorldCupRank, bblRank, news] = await Promise.all([
                advancedCricketApi.getLivescore({ timezone }),
                advancedCricketApi.getFixtures({ from: today, to: futureDate, timezone }),
                advancedCricketApi.getFixtures({ from: pastDate, to: today, timezone }),
                advancedCricketApi.getLeagues(),
                advancedCricketApi.getTeams(),
                advancedCricketApi.getStandings({ leagueId: 9785 }),
                advancedCricketApi.getStandings({ leagueId: 9843 }),
                advancedCricketApi.getStandings({ leagueId: 9779 }),
                advancedCricketApi.getNews(),
            ]);

            setLiveMatches(sortMatches(live.result || []));
            setUpcomingMatches(sortMatches(upcoming.result || []));
            setRecentMatches(sortMatches(recent.result || []).reverse());
            setSeriesList(series.result || []);
            setTeamsList(teams.result || []);
            setNewsList(news || []);

            setRankings({
                'IPL': iplRank.result?.total || (Array.isArray(iplRank.result) ? iplRank.result : []),
                'T20 WC': t20WorldCupRank.result?.total || (Array.isArray(t20WorldCupRank.result) ? t20WorldCupRank.result : []),
                'BBL': bblRank.result?.total || (Array.isArray(bblRank.result) ? bblRank.result : []),
            });
        } catch (error) {
            console.error('Error loading cricket intelligence:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterMatchesByFormat = (matches: CricketEvent[]) => {
        return matches.filter(m => {
            const league = (m.league_name || '').toLowerCase();
            const type = (m.event_type || '').toLowerCase();
            const query = searchQuery.toLowerCase();

            const matchesSearch = !query ||
                (m.event_home_team && m.event_home_team.toLowerCase().includes(query)) ||
                (m.event_away_team && m.event_away_team.toLowerCase().includes(query)) ||
                league.includes(query);

            if (!matchesSearch) return false;

            if (formatFilter === 'all') return true;
            if (formatFilter === 'international') {
                return league.includes('icc') || league.includes('international') || type.includes('t20i') || type.includes('odi') || type.includes('test');
            }
            if (formatFilter === 'franchise') {
                return league.includes('ipl') || league.includes('bbl') || league.includes('psl') || league.includes('sa20') || league.includes('hundred') || league.includes('cpl');
            }
            if (formatFilter === 'women') {
                return league.includes('women') || league.includes('wpl') || league.includes('wbbl');
            }
            if (formatFilter === 'domestic') {
                return !league.includes('icc') && !league.includes('ipl') && !league.includes('bbl');
            }
            return true;
        });
    };

    const filteredSeries = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return seriesList
            .filter(s => {
                const name = s.league_name?.toLowerCase() || '';
                const search = searchQuery.toLowerCase();
                const matchesSearch = name.includes(search) || s.country_name?.toLowerCase().includes(search);

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

    const filteredLive = filterMatchesByFormat(liveMatches);
    const filteredUpcoming = filterMatchesByFormat(upcomingMatches);
    const filteredRecent = filterMatchesByFormat(recentMatches);

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Worldwide Cricket Feed...</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'live':
                return (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                                Live Wicket Action ({filteredLive.length})
                            </h2>
                        </div>
                        {filteredLive.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredLive.map((match, idx) => (
                                    <CricketMatchCard key={match.event_key || `live-${idx}`} match={match} />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card rounded-3xl p-16 text-center border border-white/5">
                                <div className="text-4xl mb-4">🏏</div>
                                <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">No Live Matches In Session</h3>
                                <p className="text-text-muted font-bold text-xs max-w-md mx-auto">
                                    Check upcoming fixtures or explore recent tournament results and global standings below.
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'upcoming':
                return (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span>🗓️</span> Upcoming Match Schedule ({filteredUpcoming.length})
                            </h2>
                        </div>
                        {filteredUpcoming.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredUpcoming.map((match, idx) => (
                                    <CricketMatchCard key={match.event_key || `up-${idx}`} match={match} />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card rounded-3xl p-16 text-center border border-white/5">
                                <p className="text-text-muted font-bold uppercase tracking-widest text-xs">No upcoming fixtures matching current filter.</p>
                            </div>
                        )}
                    </div>
                );

            case 'recent':
                return (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span>✅</span> Recent Match Results ({filteredRecent.length})
                            </h2>
                        </div>
                        {filteredRecent.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredRecent.map((match, idx) => (
                                    <CricketMatchCard key={match.event_key || `result-${idx}`} match={match} />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card rounded-3xl p-16 text-center border border-white/5">
                                <p className="text-text-muted font-bold uppercase tracking-widest text-xs">No recent fixtures found.</p>
                            </div>
                        )}
                    </div>
                );

            case 'series':
                return (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span>🏆</span> Global Tournaments & Series ({filteredSeries.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSeries.map((series, idx) => {
                                const leagueName = series.league_name || 'Tournament';
                                return (
                                    <Link
                                        href={`/cricket/series/${series.league_key}`}
                                        key={series.league_key || `series-${idx}`}
                                        className="group glass-card rounded-3xl p-6 border border-white/5 hover:border-secondary/40 transition-all hover:bg-secondary/5 relative overflow-hidden"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-secondary flex-shrink-0 group-hover:scale-110 transition-transform">
                                                {leagueName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-white text-sm uppercase tracking-tight truncate group-hover:text-secondary transition-colors">
                                                    {leagueName}
                                                </h3>
                                                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-wider">
                                                    {series.league_season || '2026'} • {series.country_name || 'International'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-secondary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                        Explore Series <span>→</span>
                                                    </span>
                                                </div>
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
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span>🛡️</span> International & Franchise Squads ({filteredTeams.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredTeams.map((team, idx) => (
                                <Link
                                    href={`/cricket/teams/${team.team_key}`}
                                    key={team.team_key || `team-${idx}`}
                                    className="group glass-card rounded-3xl p-6 border border-white/5 hover:border-secondary/40 transition-all hover:scale-[1.03] flex flex-col items-center text-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition-colors">
                                        {team.team_logo ? (
                                            <Image src={team.team_logo} alt={team.team_name} width={40} height={40} className="object-contain" />
                                        ) : (
                                            <span className="text-2xl font-black text-secondary">{team.team_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-white text-xs uppercase tracking-tight group-hover:text-secondary transition-colors line-clamp-2">
                                        {team.team_name}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                );

            case 'rankings':
                return (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <span>📈</span> League Tables & ICC Standings
                                </h2>
                            </div>
                            <Link
                                href="/cricket/rankings"
                                className="px-5 py-2 rounded-xl bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                                Full ICC Rankings →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {['IPL', 'T20 WC', 'BBL'].map((format) => {
                                const list = Array.isArray(rankings[format]) ? rankings[format] : [];
                                return (
                                    <div key={format} className="glass-card rounded-[2.5rem] p-6 md:p-8 border border-white/5 relative overflow-hidden">
                                        <h4 className="text-secondary font-black uppercase tracking-[0.3em] text-xs mb-6 border-b border-white/5 pb-4">
                                            {format} Points Table
                                        </h4>

                                        {list.length > 0 ? (
                                            <div className="space-y-3">
                                                {list.slice(0, 8).map((rank, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-5 text-[10px] font-black text-text-muted tabular-nums">{idx + 1}</span>
                                                            <Link
                                                                href={`/cricket/teams/${rank.team_key}`}
                                                                className="text-xs font-black text-white uppercase tracking-tight hover:text-secondary transition-colors"
                                                            >
                                                                {rank.standing_team}
                                                            </Link>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-black text-white tabular-nums">{rank.standing_Pts} pts</span>
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${parseFloat(rank.standing_NRR) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                                {rank.standing_NRR}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center text-text-muted text-xs font-bold uppercase tracking-widest">
                                                Tournament Table Initializing
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'news':
                return (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span>📰</span> Cricket Pulse & Editorial Reports
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {newsList.map((item) => (
                                <div key={item.id} className="glass-card rounded-[2rem] overflow-hidden border border-white/5 flex flex-col group hover:border-secondary/40 transition-all">
                                    <div className="relative h-48 w-full overflow-hidden bg-white/5">
                                        <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-secondary/80 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-white">
                                            {item.category}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-2">
                                                {item.author} • {item.read_time}
                                            </p>
                                            <h3 className="font-black text-white text-base leading-snug uppercase tracking-tight mb-3 group-hover:text-secondary transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mb-4">
                                                {item.summary}
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-secondary uppercase tracking-widest">
                                            <span>Read Analysis</span>
                                            <span>→</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-24">
            <div className="max-w-7xl mx-auto px-4">
                {/* Hero Banner */}
                <div className="relative glass-card rounded-3xl p-6 md:p-8 mb-8 border border-white/10 bg-gradient-to-br from-white/[0.07] to-[#0a0e27] overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067')] bg-cover bg-center opacity-[0.10] mix-blend-overlay group-hover:scale-105 transition-transform duration-[15s]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="inline-flex px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-wider mb-3 border border-secondary/30">
                                Live Cricket Central
                            </span>
                            <h1 className="text-2xl md:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight mb-2">
                                Cricket Pulse & Intelligence
                            </h1>
                            <p className="text-text-secondary text-xs md:text-sm font-medium max-w-xl leading-relaxed">
                                Real-time ball-by-ball scorecards, tournament standings, franchise leagues, player analytics, and ICC leaderboards.
                            </p>
                        </div>


                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                                    Timezone Sync
                                </p>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="bg-[#0a0e27] text-white text-[10px] font-black border border-white/10 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:border-secondary cursor-pointer uppercase tracking-widest"
                                >
                                    {['GMT', 'UTC', 'Africa/Lagos', 'Europe/London', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney', 'America/New_York'].map(tz => (
                                        <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl flex flex-col justify-center">
                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-white font-black uppercase text-xs">Live Matrix Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Tabs Navigation */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/5 sticky top-[100px] z-[40]">
                    {[
                        { id: 'live', label: 'Live Action', icon: '⚡' },
                        { id: 'upcoming', label: 'Schedule', icon: '🗓️' },
                        { id: 'recent', label: 'Results', icon: '📊' },
                        { id: 'series', label: 'Series', icon: '🏆' },
                        { id: 'teams', label: 'Squads', icon: '🛡️' },
                        { id: 'rankings', label: 'Standings', icon: '📈' },
                        { id: 'news', label: 'News & Pulse', icon: '📰' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg scale-[1.02]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Format Filter Pills & Search Bar */}
                <div className="glass-card rounded-2xl p-4 mb-8 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Format Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'all', label: 'All Formats' },
                            { id: 'international', label: 'International (ICC)' },
                            { id: 'franchise', label: 'IPL & T20 Leagues' },
                            { id: 'domestic', label: 'Domestic' },
                            { id: 'women', label: 'Women’s' },
                        ].map((fmt) => (
                            <button
                                key={fmt.id}
                                onClick={() => setFormatFilter(fmt.id as FormatFilter)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                    formatFilter === fmt.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {fmt.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SEARCH TEAMS, MATCHES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black tracking-widest text-white focus:outline-none focus:border-secondary w-full md:w-[260px] transition-all"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                </div>

                {/* Main Content Area */}
                {renderTabContent()}
            </div>
        </div>
    );
}
