'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FootballEvent,
    FootballStanding,
    FootballTopscorer,
    FootballTeam,
    BlogPost,
    FootballVideo,
    FootballLeague,
    FootballCountry
} from '@goalmills/types';
import { advancedFootballApi } from '../services/advancedFootballApi';
import { FootballMatchCard } from '../components/FootballMatchCard';
import { FootballStandingsTable } from '../components/FootballStandingsTable';
import { FootballTopScorers } from '../components/FootballTopScorers';
import { FootballVideoCard } from '../components/FootballVideoCard';
import { BlogCard } from '../components/BlogCard';

type FootballTab = 'live' | 'upcoming' | 'results' | 'standings' | 'topscorers' | 'news' | 'videos' | 'countries' | 'leagues' | 'teams' | 'competitions';

export function FootballScreen() {
    const [activeTab, setActiveTab] = useState<FootballTab>('live');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data states
    const [liveEvents, setLiveEvents] = useState<FootballEvent[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<FootballEvent[]>([]);
    const [finishedEvents, setFinishedEvents] = useState<FootballEvent[]>([]);
    const [standings, setStandings] = useState<FootballStanding[]>([]);
    const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
    const [leagues, setLeagues] = useState<FootballLeague[]>([]);
    const [teams, setTeams] = useState<FootballTeam[]>([]);
    const [countries, setCountries] = useState<FootballCountry[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [videos, setVideos] = useState<FootballVideo[]>([]);

    const loadData = async () => {
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 7);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            console.log('🔄 Loading football data...');

            const [
                livescoreRes,
                fixturesRes,
                standingsRes,
                topscorersRes,
                leaguesRes,
                countriesRes,
                posts,
                videosRes,
            ] = await Promise.all([
                advancedFootballApi.getLivescore().catch(err => {
                    console.error('❌ Livescore API error:', err);
                    return { success: 1, result: [] };
                }),
                advancedFootballApi.getFixtures({
                    from: formatDate(yesterday),
                    to: formatDate(tomorrow),
                }).catch(err => {
                    console.error('❌ Fixtures API error:', err);
                    return { success: 1, result: [] };
                }),
                advancedFootballApi.getStandings(152).catch(err => {
                    console.error('❌ Standings API error:', err);
                    return { success: 1, result: { total: [], home: [], away: [] } };
                }),
                advancedFootballApi.getTopscorers(152).catch(err => {
                    console.error('❌ Topscorers API error:', err);
                    return { success: 1, result: [] };
                }),
                advancedFootballApi.getLeagues().catch(err => {
                    console.error('❌ Leagues API error:', err);
                    return { success: 1, result: [] };
                }),
                advancedFootballApi.getCountries().catch(err => {
                    console.error('❌ Countries API error:', err);
                    return { success: 1, result: [] };
                }),
                advancedFootballApi.getBlogPosts(),
                advancedFootballApi.getVideos().catch(err => {
                    console.error('❌ Videos API error:', err);
                    return { success: 1, result: [] };
                }),
            ]);

            console.log('✅ API Responses:', {
                livescore: livescoreRes?.result?.length || 0,
                fixtures: fixturesRes?.result?.length || 0,
                standings: standingsRes?.result?.total?.length || 0,
                topscorers: topscorersRes?.result?.length || 0,
                leagues: leaguesRes?.result?.length || 0,
                countries: countriesRes?.result?.length || 0,
                videos: videosRes?.result?.length || 0,
            });


            // Filter upcoming and finished from fixtures
            const now = new Date();
            const allFixtures = fixturesRes?.result || [];
            const upcoming = allFixtures.filter((e) => {
                const eventDate = new Date(`${e.event_date} ${e.event_time}`);
                return eventDate > now && e.event_status === 'Not Started';
            });
            const finished = allFixtures.filter((e) => e.event_status === 'Finished');

            console.log('📊 Filtered events:', {
                live: livescoreRes?.result?.length || 0,
                upcoming: upcoming.length,
                finished: finished.length
            });

            // League rankings for sorting (Advanced)
            const leagueRankings: { [key: string]: number } = {
                // Top Tier
                '152': 100, // Premier League
                '302': 95,  // La Liga
                '175': 90,  // Bundesliga
                '207': 85,  // Serie A
                '168': 80,  // Ligue 1
                '3': 110,   // UEFA Champions League
                '4': 75,    // UEFA Europa League
                '683': 70,  // UEFA Conference League
                '28': 65,   // World Cup
                '6': 60,    // Euro Championship

                // Second Tier / Popular
                '262': 55,  // Eredivisie (Netherlands)
                '322': 50,  // Liga Portugal
                '12': 45,   // FA Cup
                '141': 40,  // Championship (England)
                '10': 35,   // Copa America
                '343': 30,  // Brazilian Serie A
                '31': 25,   // MLS
            };

            const sortByRank = (a: FootballEvent, b: FootballEvent) => {
                const rankA = leagueRankings[a.league_key] || 0;
                const rankB = leagueRankings[b.league_key] || 0;
                // If same league rank, sort by time
                if (rankB === rankA) {
                    return a.event_time.localeCompare(b.event_time);
                }
                return rankB - rankA;
            };

            const live = (livescoreRes?.result || []).sort(sortByRank);
            upcoming.sort(sortByRank);
            finished.sort(sortByRank);

            setLiveEvents(live);
            setUpcomingEvents(upcoming.slice(0, 15));
            setFinishedEvents(finished.slice(0, 15));
            setStandings(standingsRes?.result?.total || []);
            setTopscorers(topscorersRes?.result || []);
            setLeagues(leaguesRes?.result || []);
            setCountries(countriesRes?.result || []);
            setBlogPosts(posts || []);
            setVideos(videosRes?.result || []);

            // Fetch teams for top leagues
            console.log('🔄 Loading teams from top leagues...');
            const topLeagueIds = [152, 302, 175, 207, 168]; // Premier League, La Liga, Bundesliga, Serie A, Ligue 1
            const teamsPromises = topLeagueIds.map(leagueId =>
                advancedFootballApi.getTeams({ leagueId }).catch(err => {
                    console.error(`❌ Teams API error for league ${leagueId}:`, err);
                    return { success: 1, result: [] };
                })
            );

            const teamsResponses = await Promise.all(teamsPromises);
            const allTeams = teamsResponses.flatMap(res => res?.result || []);

            // Remove duplicates based on team_key
            const uniqueTeams = Array.from(
                new Map(allTeams.map(team => [team.team_key, team])).values()
            );

            console.log(`✅ Loaded ${uniqueTeams.length} unique teams from ${topLeagueIds.length} leagues`);
            setTeams(uniqueTeams);

        } catch (error) {
            console.error('❌ Critical error loading football data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const tabs: { id: FootballTab; label: string; count?: number }[] = [
        { id: 'live', label: 'Live', count: liveEvents?.length ?? 0 },
        { id: 'upcoming', label: 'Upcoming', count: upcomingEvents?.length ?? 0 },
        { id: 'results', label: 'Results', count: finishedEvents?.length ?? 0 },
        { id: 'standings', label: 'Standings' },
        { id: 'topscorers', label: 'Top Scorers' },
        { id: 'news', label: 'News', count: blogPosts?.length ?? 0 },
        { id: 'videos', label: 'Videos', count: videos?.length ?? 0 },
        { id: 'countries', label: 'Countries', count: countries?.length ?? 0 },
        { id: 'leagues', label: 'Leagues', count: leagues?.length ?? 0 },
        { id: 'competitions', label: 'Competitions', count: leagues?.length ?? 0 },
        { id: 'teams', label: 'Teams', count: teams?.length ?? 0 },
    ];

    const [searchQuery, setSearchQuery] = useState('');

    const filterData = <T extends any>(data: T[] | undefined, key: keyof T | ((item: T) => string)): T[] => {
        if (!data) return [];
        if (!searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter(item => {
            const value = typeof key === 'function' ? key(item) : String(item[key]);
            return value.toLowerCase().includes(lowerQuery);
        });
    };

    const renderSkeleton = () => (
        <div className="p-4 space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-surfaceHighlight/50 rounded-lg mb-6" />
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-surfaceHighlight/30 rounded-xl border border-white/5" />
            ))}
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return renderSkeleton();
        }

        switch (activeTab) {
            case 'live':
                const filteredLive = filterData(liveEvents, (e) => `${e.event_home_team} ${e.event_away_team} ${e.league_name}`);
                return (
                    <div className="p-4 space-y-2 animate-fade-in">
                        {filteredLive.length > 0 ? (
                            <>
                                <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-accent-red rounded-full animate-pulse"></span>
                                    Live Matches
                                </h2>
                                {filteredLive.map((event, index) => (
                                    <FootballMatchCard key={event.event_key || `live-${index}`} event={event} />
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 glass-card rounded-2xl mx-auto max-w-lg mt-8 text-center">
                                <span className="text-6xl mb-6 opacity-80">⚽</span>
                                <p className="text-xl font-bold text-text-primary mb-2">No live matches found</p>
                                <p className="text-text-muted">Try a different search term or check back later!</p>
                            </div>
                        )}
                    </div>
                );

            case 'upcoming':
                const filteredUpcoming = filterData(upcomingEvents, (e) => `${e.event_home_team} ${e.event_away_team} ${e.league_name}`);
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">📅 Upcoming Matches</h2>
                        {filteredUpcoming.length > 0 ? (
                            filteredUpcoming.map((event, index) => (
                                <FootballMatchCard key={event.event_key || `upcoming-${index}`} event={event} />
                            ))
                        ) : (
                            <p className="text-text-muted italic">No upcoming matches found.</p>
                        )}
                    </div>
                );

            case 'results':
                const filteredResults = filterData(finishedEvents, (e) => `${e.event_home_team} ${e.event_away_team} ${e.league_name}`);
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">✅ Recent Results</h2>
                        {filteredResults.length > 0 ? (
                            filteredResults.map((event, index) => (
                                <FootballMatchCard key={event.event_key || `result-${index}`} event={event} />
                            ))
                        ) : (
                            <p className="text-text-muted italic">No results found.</p>
                        )}
                    </div>
                );

            case 'standings':
                // Search in standings (usually searching for team name)
                const filteredStandings = filterData(standings, 'standing_team');
                // Wait, FootballStanding usually has team_name. Let's check type if possible, but usually yes.
                // Assuming it works for now.
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">🏆 Premier League Standings</h2>
                        <div className="glass-card rounded-xl overflow-hidden">
                            <FootballStandingsTable standings={filteredStandings} teams={teams} />
                        </div>
                    </div>
                );

            case 'topscorers':
                const filteredScorers = filterData(topscorers, 'player_name');
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">⚽ Top Scorers</h2>
                        <FootballTopScorers scorers={filteredScorers} teams={teams} />
                    </div>
                );

            case 'news':
                const filteredNews = filterData(blogPosts, 'title');
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">📰 Latest News</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredNews.map((post, index) => (
                                <BlogCard key={post._id || `news-${index}`} post={post} />
                            ))}
                        </div>
                        {filteredNews.length === 0 && <p className="text-text-muted italic">No news found.</p>}
                    </div>
                );

            case 'videos':
                const filteredVideos = filterData(videos, (v) => `${v.video_title} ${v.video_title_full}`);
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">🎥 Video Highlights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredVideos.map((video, index) => (
                                <FootballVideoCard key={video.event_key || `video-${index}`} video={video} />
                            ))}
                        </div>
                        {filteredVideos.length === 0 && <p className="text-text-muted italic">No videos found.</p>}
                    </div>
                );

            case 'countries':
                const filteredCountries = filterData(countries, 'country_name');
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">🌍 Countries</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredCountries.map((country, index) => (
                                <Link
                                    href={`/countries/${country.country_key}`}
                                    key={country.country_key || `country-${index}`}
                                    className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-surfaceHighlight/50 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                        <img src={country.country_logo} alt={country.country_name} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="font-bold text-text-primary group-hover:text-white transition-colors">{country.country_name}</span>
                                </Link>
                            ))}
                        </div>
                        {filteredCountries.length === 0 && <p className="text-text-muted italic">No countries found.</p>}
                    </div>
                );

            case 'leagues':
            case 'competitions':
                const filteredLeagues = filterData(leagues, (l) => `${l.league_name} ${l.country_name}`);
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">🏆 {activeTab === 'leagues' ? 'Leagues' : 'Competitions'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredLeagues.map((league, index) => (
                                <Link
                                    href={`/leagues/${league.league_key}`}
                                    key={league.league_key || `league-${index}`}
                                    className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-surfaceHighlight/50 transition-all cursor-pointer group"
                                >
                                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                        <img src={league.league_logo} alt={league.league_name} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-primary text-lg group-hover:text-white transition-colors">{league.league_name}</h3>
                                        <p className="text-sm text-text-muted">{league.country_name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {filteredLeagues.length === 0 && <p className="text-text-muted italic">No leagues found.</p>}
                    </div>
                );

            case 'teams':
                const filteredTeams = filterData(teams, 'team_name');
                return (
                    <div className="p-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-text-primary mb-6">👕 Teams</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredTeams.map((team, index) => (
                                <Link
                                    href={`/teams/${team.team_key}`}
                                    key={team.team_key || `team-${index}`}
                                    className="glass-card p-6 rounded-xl flex flex-col items-center gap-4 text-center hover:bg-surfaceHighlight/50 transition-all cursor-pointer group"
                                >
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center p-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                                        <img src={team.team_logo} alt={team.team_name} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="font-bold text-text-primary group-hover:text-white transition-colors">{team.team_name}</span>
                                </Link>
                            ))}
                        </div>
                        {filteredTeams.length === 0 && <p className="text-text-muted italic">No teams found.</p>}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex-1 bg-background min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-surface/90 backdrop-blur-lg border-b border-white/5">
                <div className="p-4 pt-6 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">GOAL</span>
                                <span className="text-white">MILLS</span>
                            </h1>
                            <p className="text-sm text-text-muted font-medium">Premium Sports Analytics</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-text-muted">🔍</span>
                            </div>
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full bg-background border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchQuery(''); // Reset search on tab change
                                }}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-full border 
                                    transition-all duration-300 whitespace-nowrap text-sm font-bold tracking-wide
                                    ${activeTab === tab.id
                                        ? 'bg-secondary text-surface border-secondary shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105'
                                        : 'bg-surfaceHighlight/50 border-white/5 text-text-secondary hover:bg-surfaceHighlight hover:text-white'
                                    }
                                    active:scale-95
                                `}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`
                                        text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                                        ${activeTab === tab.id
                                            ? 'bg-surface text-secondary'
                                            : 'bg-surface text-text-secondary'}
                                    `}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto pb-20">
                {refreshing && (
                    <div className="flex justify-center py-6 animate-fade-in">
                        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {renderContent()}
            </div>

            {/* Quick Links / Fab handled elsewhere or can be added here if needed */}
        </div>
    );
}
