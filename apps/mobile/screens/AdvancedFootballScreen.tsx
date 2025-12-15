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
    VideoHighlight,
} from '@goalmills/types';
import { advancedFootballApi } from '../services/advancedFootballApi';
import { footballApi } from '../services/footballApi';
import { FootballMatchCard } from '../components/FootballMatchCard';
import { NewsCard } from '../components/NewsCard';
import { VideoCard } from '../components/VideoCard';

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
    const [videos, setVideos] = useState<VideoHighlight[]>([]);

    const loadData = async () => {
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 7);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            const [
                livescoreRes,
                fixturesRes,
                standingsRes,
                topscorersRes,
                leaguesRes,
                teamsRes,
                posts,
                videoData,
            ] = await Promise.all([
                advancedFootballApi.getLivescore(),
                advancedFootballApi.getFixtures({
                    from: formatDate(yesterday),
                    to: formatDate(tomorrow),
                }),
                advancedFootballApi.getStandings(152), // Premier League
                advancedFootballApi.getTopscorers(152),
                advancedFootballApi.getLeagues(),
                advancedFootballApi.getTeams(),
                footballApi.getBlogPosts(),
                footballApi.getVideoHighlights(),
            ]);

            setLiveEvents(livescoreRes.result);

            // Filter upcoming and finished from fixtures
            const now = new Date();
            const upcoming = fixturesRes.result.filter((e) => {
                const eventDate = new Date(`${e.event_date} ${e.event_time}`);
                return eventDate > now && e.event_status === 'Not Started';
            });
            const finished = fixturesRes.result.filter((e) => e.event_status === 'Finished');

            // League rankings for sorting
            const leagueRankings: { [key: string]: number } = {
                '152': 100, // Premier League
                '302': 95,  // La Liga
                '175': 90,  // Bundesliga
                '207': 85,  // Serie A
                '3': 80,    // UEFA Champions League
                '168': 75,  // Ligue 1
            };

            // Sort upcoming by league ranking
            upcoming.sort((a, b) => {
                const rankA = leagueRankings[a.league_key] || 0;
                const rankB = leagueRankings[b.league_key] || 0;
                return rankB - rankA;
            });

            // Sort finished matches by league ranking
            finished.sort((a, b) => {
                const rankA = leagueRankings[a.league_key] || 0;
                const rankB = leagueRankings[b.league_key] || 0;
                return rankB - rankA;
            });

            setUpcomingEvents(upcoming.slice(0, 15));
            setFinishedEvents(finished.slice(0, 15));
            setStandings(standingsRes.result.total);
            setTopscorers(topscorersRes.result);
            setLeagues(leaguesRes.result);
            setTeams(teamsRes.result);
            setBlogPosts(posts);
            setVideos(videoData);
        } catch (error) {
            console.error('Error loading football data:', error);
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
            const team = teams.find(t => t.team_key === teamKey);
            return team?.team_logo;
        };

        return (
            <View style={styles.standingsTable}>
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
                {standings.map((standing, index) => {
                    const teamLogo = getTeamLogo(standing.team_key);
                    return (
                        <Pressable
                            key={standing.team_key}
                            style={[
                                styles.standingsRow,
                                index < 4 && styles.championsLeagueRow,
                                index === 4 && styles.europaLeagueRow,
                            ]}
                            onPress={() => router.push(`/home/football/teams/${standing.team_key}` as any)}
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
        );
    };

    const renderTopscorers = () => {
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
                            key={scorer.player_key}
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
                        {liveEvents.length > 0 ? (
                            <>
                                <Text style={styles.sectionTitle}>🔴 Live Matches</Text>
                                {liveEvents.map((event) => (
                                    <FootballMatchCard key={event.event_key} event={event} />
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
                        <Text style={styles.sectionTitle}>📅 Upcoming Matches</Text>
                        {upcomingEvents.map((event) => (
                            <FootballMatchCard key={event.event_key} event={event} />
                        ))}
                    </View>
                );

            case 'results':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>✅ Recent Results</Text>
                        {finishedEvents.map((event) => (
                            <FootballMatchCard key={event.event_key} event={event} />
                        ))}
                    </View>
                );

            case 'standings':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>🏆 Premier League Standings</Text>
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
                        {blogPosts.map((post) => (
                            <NewsCard key={post._id} item={post} onPress={() => router.push(`/news/${post._id}`)} />
                        ))}
                    </View>
                );

            case 'videos':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>🎥 Video Highlights</Text>
                        {videos.filter((v) => v).map((video) => (
                            <VideoCard
                                key={video.id}
                                item={video}
                                onPress={() => router.push(`/highlight/${video.id}`)}
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
