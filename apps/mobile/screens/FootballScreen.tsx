import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Fixture, Standing, BlogPost, VideoHighlight } from '@goalmills/types';
import { footballApi } from '../services/footballApi';
import { FixtureCard } from '../components/FixtureCard';
import { StandingsTable } from '../components/StandingsTable';
import { BlogCard } from '../components/BlogCard';
import { VideoCard } from '../components/VideoCard';

type FootballTab = 'live' | 'upcoming' | 'results' | 'standings' | 'news' | 'videos';

export function FootballScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<FootballTab>('live');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data states
    const [liveFixtures, setLiveFixtures] = useState<Fixture[]>([]);
    const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
    const [finishedFixtures, setFinishedFixtures] = useState<Fixture[]>([]);
    const [standings, setStandings] = useState<Standing[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [videos, setVideos] = useState<VideoHighlight[]>([]);

    const loadData = async () => {
        try {
            const [live, upcoming, finished, standingsData, posts, videoData] = await Promise.all([
                footballApi.getLiveFixtures(),
                footballApi.getUpcomingFixtures(15),
                footballApi.getFinishedFixtures(15),
                footballApi.getStandingsByLeague(39), // Premier League
                footballApi.getBlogPosts(),
                footballApi.getVideoHighlights(),
            ]);

            setLiveFixtures(live);
            setUpcomingFixtures(upcoming);
            setFinishedFixtures(finished);
            setStandings(standingsData);
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
        { id: 'live', label: 'Live', count: liveFixtures.length },
        { id: 'upcoming', label: 'Upcoming', count: upcomingFixtures.length },
        { id: 'results', label: 'Results', count: finishedFixtures.length },
        { id: 'standings', label: 'Standings' },
        { id: 'news', label: 'News', count: blogPosts.length },
        { id: 'videos', label: 'Videos', count: videos.length },
    ];

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
                        {liveFixtures.length > 0 ? (
                            <>
                                <Text style={styles.sectionTitle}>🔴 Live Matches</Text>
                                {liveFixtures.map((fixture) => (
                                    <FixtureCard key={fixture.fixture.id} fixture={fixture} />
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
                        {upcomingFixtures.map((fixture) => (
                            <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                        ))}
                    </View>
                );

            case 'results':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>✅ Recent Results</Text>
                        {finishedFixtures.map((fixture) => (
                            <FixtureCard key={fixture.fixture.id} fixture={fixture} />
                        ))}
                    </View>
                );

            case 'standings':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>🏆 Premier League Standings</Text>
                        <StandingsTable standings={standings} />
                    </View>
                );

            case 'news':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>📰 Latest News</Text>
                        {blogPosts.map((post) => (
                            <BlogCard key={post._id} post={post} />
                        ))}
                    </View>
                );

            case 'videos':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>🎥 Video Highlights</Text>
                        {videos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⚽ Football</Text>
                <Text style={styles.headerSubtitle}>Live scores, fixtures & news</Text>
            </View>

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
                        { label: '🏆 Leagues', route: '/leagues' },
                        { label: '👕 Teams', route: '/teams' },
                        { label: '🌍 Regions', route: '/regions' },
                        { label: '⚔️ Competitions', route: '/competitions' },
                        { label: '🏃 Players', route: '/players' },
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
    header: {
        padding: SPACING.lg,
        paddingTop: SPACING.xl,
        backgroundColor: 'rgba(0, 31, 63, 0.8)',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.secondary,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
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
});
