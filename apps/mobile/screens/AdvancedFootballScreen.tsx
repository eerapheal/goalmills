import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Image,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import {
    FootballEvent,
    FootballStanding,
    FootballTopscorer,
    FootballLeague,
    FootballTeam,
    BlogPost,
    FootballVideo,
} from '@goalmills/types';
import { advancedFootballApi } from '../services/advancedFootballApi';
// import { footballApi } from '../services/footballApi'; // Removed
import { FootballMatchCard } from '../components/FootballMatchCard';
import { NewsCard } from '../components/NewsCard';
import { FootballVideoCard } from '../components/FootballVideoCard';
import { VideoPlayerModal } from '../components/VideoPlayerModal';

type FootballTab = 'live' | 'upcoming' | 'results' | 'standings' | 'topscorers' | 'news' | 'videos';

export function AdvancedFootballScreen() {
    const router = useRouter();
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
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [videos, setVideos] = useState<FootballVideo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    // League rankings for sorting (Advanced) - Synced with Web App
    const leagueRankings: { [key: string]: number } = {
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
        '262': 55,  // Eredivisie (Netherlands)
        '322': 50,  // Liga Portugal
        '12': 45,   // FA Cup
        '141': 40,  // Championship (England)
        '10': 35,   // Copa America
        '343': 30,  // Brazilian Serie A
        '31': 25,   // MLS
    };

    const sortByRankAndDate = (a: FootballEvent, b: FootballEvent, ascending: boolean = true) => {
        const dateA = new Date(`${a.event_date} ${a.event_time || '00:00'}`).getTime();
        const dateB = new Date(`${b.event_date} ${b.event_time || '00:00'}`).getTime();

        // For RESULTS (ascending = false): Purely date based (Newest first)
        if (!ascending) {
            return dateB - dateA;
        }

        // For UPCOMING (ascending = true):
        // 1. Prioritize Today and Tomorrow matches (within 30 hours)
        const now = new Date().getTime();
        const diffA = dateA - now;
        const diffB = dateB - now;
        const isNearA = diffA > -7200000 && diffA < 108000000; // -2h to +30h
        const isNearB = diffB > -7200000 && diffB < 108000000;

        if (isNearA && !isNearB) return -1;
        if (!isNearA && isNearB) return 1;

        // 2. If both are near or both are far, use Rank logic
        const rankA = leagueRankings[a.league_key] || 0;
        const rankB = leagueRankings[b.league_key] || 0;

        if (rankB !== rankA) return rankB - rankA;

        // 3. Fallback to date
        return dateA - dateB;
    };

    const [matchFilterLeagueId, setMatchFilterLeagueId] = useState<number | null>(null);
    const [isRefreshingMatches, setIsRefreshingMatches] = useState(false);

    const loadData = async (filterLeagueId: number | null = null) => {
        try {
            if (!refreshing && !isRefreshingMatches) setLoading(true);
            const today = new Date();
            const future = new Date(today);
            future.setDate(future.getDate() + 14); // Extended to 14 days for more upcoming matches
            const past = new Date(today);
            past.setDate(past.getDate() - 14); // Extended to 14 days for more results

            // If league filtered, use much wider range to ensure we get data
            if (filterLeagueId) {
                past.setDate(past.getDate() - 60);
                future.setDate(future.getDate() + 60);
            }

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            console.log(`🔄 Mobile: Loading football data${filterLeagueId ? ` for League ${filterLeagueId}` : ''}...`);

            const [
                livescoreRes,
                fixturesRes,
                standingsRes,
                topscorersRes,
                leaguesRes,
                teamsRes,
                posts,
                videosRes,
            ] = await Promise.all([
                advancedFootballApi.getLivescore({
                    leagueId: filterLeagueId || undefined
                }).catch(() => ({ result: [] })),
                advancedFootballApi.getFixtures({
                    from: formatDate(past),
                    to: formatDate(future),
                    leagueId: filterLeagueId || undefined
                }).catch(() => ({ result: [] })),
                advancedFootballApi.getStandings(filterLeagueId || 152).catch(() => ({ result: { total: [] } })),
                advancedFootballApi.getTopscorers(filterLeagueId || 152).catch(() => ({ result: [] })),
                advancedFootballApi.getLeagues().catch(() => ({ result: [] })),
                advancedFootballApi.getTeams({ leagueId: filterLeagueId || 152 }).catch(() => ({ result: [] })),
                advancedFootballApi.getBlogPosts().catch(() => []),
                advancedFootballApi.getVideos().catch(() => ({ result: [] })),
            ]);

            setLiveEvents(livescoreRes.result || []);

            // Process Fixtures
            let fixtures = fixturesRes.result || [];

            // If not filtering by league, and global fixtures are few, fetch top leagues
            if (!filterLeagueId && fixtures.length < 20) {
                const topLeagues = [152, 302, 175, 207, 168, 3]; // EPL, La Liga, Bunesliga, Serie A, Ligue 1, UCL
                const topFixturesPromises = topLeagues.map(id =>
                    advancedFootballApi.getFixtures({
                        from: formatDate(past),
                        to: formatDate(future),
                        leagueId: id
                    }).catch(() => ({ result: [] }))
                );
                const responses = await Promise.all(topFixturesPromises);
                responses.forEach(res => {
                    if (res.result) fixtures = [...fixtures, ...res.result];
                });

                // Remove duplicates
                const matchMap = new Map();
                fixtures.forEach(f => matchMap.set(f.event_key, f));
                fixtures = Array.from(matchMap.values());
            }

            const now = new Date();
            const upcoming = fixtures.filter((e: FootballEvent) => {
                const status = e.event_status?.toLowerCase();
                const isFinished = status === 'finished' || e.event_status === 'FT' || e.event_status === 'AET' || e.event_status === 'AP';
                return !isFinished;
            });
            const finished = fixtures.filter((e: FootballEvent) => {
                const status = e.event_status?.toLowerCase();
                return status === 'finished' || e.event_status === 'FT' || e.event_status === 'AET' || e.event_status === 'AP';
            });

            upcoming.sort((a, b) => sortByRankAndDate(a, b, true));
            finished.sort((a, b) => sortByRankAndDate(a, b, false));

            setUpcomingEvents(upcoming);
            setFinishedEvents(finished);

            // Intelligent Team & Logo Merging
            const teamMap = new Map<string, FootballTeam>();
            if (teamsRes?.result) {
                teamsRes.result.forEach((t: FootballTeam) => teamMap.set(String(t.team_key), t));
            }

            // Extract logos from fixtures for missing teams
            fixtures.forEach((f: FootballEvent) => {
                const homeKey = String(f.home_team_key);
                const awayKey = String(f.away_team_key);

                if (!teamMap.has(homeKey)) {
                    teamMap.set(homeKey, { team_key: homeKey, team_name: f.event_home_team, team_logo: f.home_team_logo || undefined } as FootballTeam);
                } else if (!teamMap.get(homeKey)?.team_logo) {
                    const existing = teamMap.get(homeKey)!;
                    existing.team_logo = f.home_team_logo || undefined;
                }

                if (!teamMap.has(awayKey)) {
                    teamMap.set(awayKey, { team_key: awayKey, team_name: f.event_away_team, team_logo: f.away_team_logo || undefined } as FootballTeam);
                } else if (!teamMap.get(awayKey)?.team_logo) {
                    const existing = teamMap.get(awayKey)!;
                    existing.team_logo = f.away_team_logo || undefined;
                }
            });

            const finalTeams = Array.from(teamMap.values());
            setTeams(finalTeams);

            // Process Standings (Filtering for main stage)
            const rawStandings = standingsRes.result?.total || [];
            setStandings(rawStandings);

            // Process Top Scorers
            setTopscorers(topscorersRes.result || []);

            setLeagues(leaguesRes.result || []);
            setBlogPosts(posts || []);
            setVideos(videosRes.result || []);

            console.log('✅ Mobile football data loaded');
        } catch (error) {
            console.error('❌ Mobile Error loading football data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsRefreshingMatches(false);
        }
    };

    const handleLeagueFilter = async (leagueId: number | null) => {
        setMatchFilterLeagueId(leagueId);
        setIsRefreshingMatches(true);
        await loadData(leagueId);
    };

    const renderLeagueSelector = () => {
        const topLeagues = [
            { id: null, name: 'All', icon: '🏟️' },
            { id: 152, name: 'EPL', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
            { id: 302, name: 'La Liga', icon: '🇪🇸' },
            { id: 175, name: 'Bundesliga', icon: '🇩🇪' },
            { id: 207, name: 'Serie A', icon: '🇮🇹' },
            { id: 168, name: 'Ligue 1', icon: '🇫🇷' },
            { id: 3, name: 'UCL', icon: '⭐️' },
        ];

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.leagueSelector}
                contentContainerStyle={styles.leagueSelectorContent}
            >
                {topLeagues.map((league) => (
                    <Pressable
                        key={String(league.id)}
                        onPress={() => handleLeagueFilter(league.id)}
                        style={[
                            styles.leagueBtn,
                            matchFilterLeagueId === league.id && styles.activeLeagueBtn
                        ]}
                    >
                        <Text style={styles.leagueIcon}>{league.icon}</Text>
                        <Text style={[
                            styles.leagueBtnText,
                            matchFilterLeagueId === league.id && styles.activeLeagueBtnText
                        ]}>
                            {league.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        );
    };

    useEffect(() => {
        loadData();
    }, []);

    // 45s Auto-Refresh for Live Matches
    useEffect(() => {
        let interval: any;
        if (activeTab === 'live' && !loading) {
            console.log('⏱️ Mobile: Starting live score polling (45s)...');
            interval = setInterval(() => {
                loadData();
            }, 45000);
        }
        return () => {
            if (interval) {
                console.log('⏱️ Mobile: Stopping live score polling.');
                clearInterval(interval);
            }
        };
    }, [activeTab, loading]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData(matchFilterLeagueId);
    };

    const tabs: { id: FootballTab; label: string; count?: number }[] = [
        { id: 'live', label: 'Live', count: liveEvents.length },
        { id: 'upcoming', label: 'Upcoming', count: upcomingEvents.length },
        { id: 'results', label: 'Results', count: finishedEvents.length },
        { id: 'standings', label: 'Standings' },
        { id: 'topscorers', label: 'Top Scorers' },
        { id: 'news', label: 'News', count: blogPosts.length },
        { id: 'videos', label: 'Videos', count: videos.length },
    ];

    const renderStandingsTable = () => {
        const getTeamLogo = (teamKey: string) => {
            const team = teams.find(t => String(t.team_key) === String(teamKey));
            return team?.team_logo;
        };

        // Group Standings Logic
        const groupedStandings: { [key: string]: FootballStanding[] } = {};
        standings.forEach(s => {
            let groupName = s.stage_name || 'League Table';
            const specificGroup = (s as any).group || (s as any).league_group;
            const round = s.league_round;

            if (groupName === 'Group Stage' || groupName === 'League Table') {
                if (specificGroup) {
                    groupName = specificGroup;
                } else if (round && round.length < 20) {
                    groupName = round;
                }
            }
            groupName = groupName.trim();

            if (!groupedStandings[groupName]) {
                groupedStandings[groupName] = [];
            }
            groupedStandings[groupName].push(s);
        });

        const standingsData = Object.entries(groupedStandings).map(([name, teams]) => ({
            name,
            teams: teams.sort((a, b) => parseInt(a.standing_place) - parseInt(b.standing_place))
        }));
        standingsData.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        return (
            <View>
                {standingsData.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No standings available</Text>
                    </View>
                ) : (
                    standingsData.map((group, groupIndex) => (
                        <View key={`group-${groupIndex}`} style={styles.standingsTable}>
                            {standingsData.length > 1 && (
                                <Text style={[styles.sectionTitle, { fontSize: FONT_SIZES.md, marginBottom: SPACING.sm, marginTop: SPACING.md }]}>
                                    {group.name}
                                </Text>
                            )}
                            {/* Header */}
                            <View style={styles.standingsHeader}>
                                <Text style={[styles.standingsHeaderText, styles.posCol]}>#</Text>
                                <Text style={[styles.standingsHeaderText, styles.teamCol]}>Team</Text>
                                <Text style={[styles.standingsHeaderText, styles.statCol]}>P</Text>
                                <Text style={[styles.standingsHeaderText, styles.statCol]}>W</Text>
                                <Text style={[styles.standingsHeaderText, styles.statCol]}>D</Text>
                                <Text style={[styles.standingsHeaderText, styles.statCol]}>L</Text>
                                <Text style={[styles.standingsHeaderText, styles.statCol]}>GD</Text>
                                <Text style={[styles.standingsHeaderText, styles.ptsCol]}>Pts</Text>
                            </View>
                            {/* Rows */}
                            {group.teams.map((standing, index) => {
                                const teamLogo = getTeamLogo(standing.team_key);
                                return (
                                    <Pressable
                                        key={`${group.name}-${standing.team_key}-${index}`} // Safe Key
                                        style={[
                                            styles.standingsRow,
                                            index < 4 && styles.championsLeagueRow,
                                        ]}
                                        onPress={() => {
                                            if (standing.team_key) {
                                                router.push(`/home/football/teams/${standing.team_key}` as any);
                                            }
                                        }}
                                    >
                                        <Text style={[styles.standingsText, styles.posCol]}>{standing.standing_place}</Text>
                                        <View style={styles.teamColContainer}>
                                            {teamLogo && (
                                                <Image source={{ uri: teamLogo }} style={styles.standingsTeamLogo} />
                                            )}
                                            <Text style={[styles.standingsText, styles.teamColText]} numberOfLines={1}>
                                                {standing.standing_team}
                                            </Text>
                                        </View>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_P}</Text>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_W}</Text>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_D}</Text>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_L}</Text>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_GD}</Text>
                                        <Text style={[styles.standingsText, styles.ptsCol, styles.ptsValue]}>
                                            {standing.standing_PTS}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))
                )}
            </View>
        );
    };

    const renderTopscorers = () => {
        // ... existing implementation ...
        const getTeamLogo = (teamKey: string) => {
            const team = teams.find(t => t.team_key === teamKey);
            return team?.team_logo;
        };

        return (
            <View style={styles.topscorersContainer}>
                {topscorers.map((scorer, index) => {
                    const teamLogo = getTeamLogo(scorer.team_key);
                    return (
                        <Pressable
                            key={`scorer-${scorer.player_key}-${index}`}
                            style={styles.topscorerCard}
                            onPress={() => router.push(`/home/football/players/${scorer.player_key}` as any)}
                        >
                            <View style={styles.topscorerRank}>
                                <Text style={styles.topscorerRankText}>{scorer.player_place}</Text>
                            </View>
                            <View style={styles.topscorerInfo}>
                                <Text style={styles.topscorerName}>{scorer.player_name}</Text>
                                <View style={styles.topscorerTeamContainer}>
                                    {teamLogo && (
                                        <Image source={{ uri: teamLogo }} style={styles.topscorerTeamLogo} />
                                    )}
                                    <Text style={styles.topscorerTeam}>{scorer.team_name}</Text>
                                </View>
                            </View>
                            <View style={styles.topscorerStats}>
                                <View style={styles.topscorerStat}>
                                    <Text style={styles.topscorerStatValue}>⚽ {scorer.goals}</Text>
                                    <Text style={styles.topscorerStatLabel}>Goals</Text>
                                </View>
                                {scorer.assists && (
                                    <View style={styles.topscorerStat}>
                                        <Text style={styles.topscorerStatValue}>🎯 {scorer.assists}</Text>
                                        <Text style={styles.topscorerStatLabel}>Assists</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        );
    };


    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                    <Text style={styles.loadingText}>Loading football data...</Text>
                </View>
            );
        }

        switch (activeTab) {
            case 'live':
                return (
                    <View style={styles.content}>
                        <View style={styles.contentHeader}>
                            <Text style={styles.sectionTitle}>🔴 Live Matches</Text>
                            {renderLeagueSelector()}
                        </View>
                        {liveEvents.length > 0 ? (
                            <>
                                {liveEvents.map((event, index) => (
                                    <FootballMatchCard key={`live-${event.event_key || index}`} event={event} />
                                ))}
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>⚽</Text>
                                <Text style={styles.emptyText}>No live matches at the moment</Text>
                                <Text style={styles.emptySubtext}>Check back soon for live action!</Text>
                            </View>
                        )}
                    </View>
                );

            case 'upcoming':
                return (
                    <View style={styles.content}>
                        <View style={styles.contentHeader}>
                            <Text style={styles.sectionTitle}>📅 Upcoming Matches</Text>
                            {renderLeagueSelector()}
                        </View>
                        {isRefreshingMatches ? (
                            <ActivityIndicator color={COLORS.secondary} style={{ marginTop: 20 }} />
                        ) : (
                            upcomingEvents.map((event, index) => (
                                <FootballMatchCard key={`upcoming-${event.event_key || index}`} event={event} />
                            ))
                        )}
                        {upcomingEvents.length === 0 && !isRefreshingMatches && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>📅</Text>
                                <Text style={styles.emptyText}>No upcoming matches</Text>
                            </View>
                        )}
                    </View>
                );

            case 'results':
                return (
                    <View style={styles.content}>
                        <View style={styles.contentHeader}>
                            <Text style={styles.sectionTitle}>✅ Recent Results</Text>
                            {renderLeagueSelector()}
                        </View>
                        {isRefreshingMatches ? (
                            <ActivityIndicator color={COLORS.secondary} style={{ marginTop: 20 }} />
                        ) : (
                            finishedEvents.map((event, index) => (
                                <FootballMatchCard key={`finished-${event.event_key || index}`} event={event} />
                            ))
                        )}
                        {finishedEvents.length === 0 && !isRefreshingMatches && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🏁</Text>
                                <Text style={styles.emptyText}>No recent results</Text>
                            </View>
                        )}
                    </View>
                );

            case 'standings':
                // Filter and sort leagues by rank (Top 70)
                const standingsLeagues = [...leagues]
                    .sort((a, b) => {
                        const rankA = leagueRankings[a.league_key] || 0;
                        const rankB = leagueRankings[b.league_key] || 0;
                        if (rankB !== rankA) return rankB - rankA;
                        return a.league_name.localeCompare(b.league_name);
                    });

                const top70Leagues = standingsLeagues.slice(0, 70);

                return (
                    <View style={styles.content}>
                        <View style={styles.contentHeader}>
                            <Text style={styles.sectionTitle}>🏆 Standings</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.leagueSelector}
                                contentContainerStyle={styles.leagueSelectorContent}
                            >
                                {top70Leagues.map((league) => (
                                    <Pressable
                                        key={String(league.league_key)}
                                        onPress={() => handleLeagueFilter(Number(league.league_key))}
                                        style={[
                                            styles.leagueBtn,
                                            matchFilterLeagueId === Number(league.league_key) && styles.activeLeagueBtn
                                        ]}
                                    >
                                        <Text style={[
                                            styles.leagueBtnText,
                                            matchFilterLeagueId === Number(league.league_key) && styles.activeLeagueBtnText
                                        ]}>
                                            {league.league_name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                        {renderStandingsTable()}
                    </View>
                );

            case 'topscorers':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>⚽ Top Scorers</Text>
                        {renderTopscorers()}
                    </View>
                );

            case 'news':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>📰 Latest News</Text>
                        {blogPosts.map((post, index) => (
                            <NewsCard key={`news-${post._id || index}`} item={post} onPress={() => router.push(`/news/${post._id}`)} />
                        ))}
                    </View>
                );

            case 'videos':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>🎥 Video Highlights</Text>
                        {videos.filter((v) => v).map((video, index) => (
                            <FootballVideoCard
                                key={`video-${video.event_key || index}`}
                                video={video}
                                onPress={() => video.video_url && setSelectedVideo(video.video_url)}
                            />
                        ))}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View>
                {/* Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                    style={styles.tabsScrollView}
                >
                    {tabs.map((tab) => (
                        <Pressable
                            key={tab.id}
                            style={({ pressed }) => [
                                styles.tab,
                                activeTab === tab.id && styles.activeTab,
                                pressed && styles.pressedTab,
                            ]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                            {tab.count !== undefined && tab.count > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{tab.count}</Text>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Quick Links */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickLinksContainer}
                    style={styles.quickLinksScrollView}
                >
                    {[
                        { label: '🏆 Leagues', route: '/home/football/leagues' },
                        { label: '👕 Teams', route: '/home/football/teams' },
                        { label: '🏃 Players', route: '/home/football/players' },
                        { label: '👨‍💼 Coaches', route: '/home/football/coaches' },
                        { label: '👨‍⚖️ Officials', route: '/home/football/officials' },
                        { label: '🌍 Countries', route: '/home/football/countries' },
                    ].map((link) => (
                        <Pressable
                            key={link.label}
                            style={styles.quickLink}
                            onPress={() => router.push(link.route as any)}
                        >
                            <Text style={styles.quickLinkText}>{link.label}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.secondary}
                        colors={[COLORS.secondary]}
                    />
                }
            >
                {renderContent()}
            </ScrollView>

            <VideoPlayerModal
                visible={!!selectedVideo}
                videoUrl={selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    tabsScrollView: {
        flexGrow: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabsContainer: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: SPACING.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeTab: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.primary,
    },
    pressedTab: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    tabText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    activeTabText: {
        color: COLORS.background,
        fontWeight: '700',
    },
    badge: {
        marginLeft: SPACING.xs,
        backgroundColor: COLORS.danger,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    contentHeader: {
        marginBottom: SPACING.md,
    },
    leagueSelector: {
        marginTop: SPACING.sm,
        flexGrow: 0,
    },
    leagueSelectorContent: {
        paddingRight: SPACING.lg,
        gap: SPACING.sm,
    },
    leagueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    activeLeagueBtn: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.primary,
    },
    leagueIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    leagueBtnText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
    },
    activeLeagueBtnText: {
        color: COLORS.background,
    },
    content: {
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    loadingText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        marginTop: SPACING.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xxl,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    emptyText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    emptySubtext: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
    quickLinksScrollView: {
        flexGrow: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    quickLinksContainer: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    quickLink: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginRight: SPACING.xs,
    },
    quickLinkText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    standingsTable: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    standingsHeader: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.secondary,
    },
    standingsHeaderText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.secondary,
        textAlign: 'center',
    },
    standingsRow: {
        flexDirection: 'row',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    championsLeagueRow: {
        borderLeftColor: COLORS.primary,
    },
    europaLeagueRow: {
        borderLeftColor: COLORS.secondary,
    },
    standingsText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        textAlign: 'center',
    },
    posCol: {
        width: 30,
    },
    teamCol: {
        flex: 1,
        textAlign: 'left',
        paddingLeft: SPACING.sm,
    },
    teamColContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: SPACING.sm,
    },
    teamColText: {
        flex: 1,
        textAlign: 'left',
    },
    standingsTeamLogo: {
        width: 20,
        height: 20,
        marginRight: SPACING.xs,
    },
    statCol: {
        width: 30,
    },
    ptsCol: {
        width: 40,
    },
    ptsValue: {
        fontWeight: '700',
        color: COLORS.secondary,
    },
    topscorersContainer: {
        gap: SPACING.md,
    },
    topscorerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    topscorerRank: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    topscorerRankText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.background,
    },
    topscorerInfo: {
        flex: 1,
    },
    topscorerName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: 2,
    },
    topscorerTeamContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topscorerTeamLogo: {
        width: 16,
        height: 16,
        marginRight: SPACING.xs,
    },
    topscorerTeam: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
    topscorerStats: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    topscorerStat: {
        alignItems: 'center',
    },
    topscorerStatValue: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    topscorerStatLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
    },
});
