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
import { CricketMatchInfo, CricketSeries, BlogPost, VideoHighlight } from '@goalmills/types';
import { cricketApi } from '../services/cricketApi';
import { CricketMatchCard } from '../components/CricketMatchCard';
import { NewsCard } from '../components/NewsCard';
import { VideoCard } from '../components/VideoCard';

type CricketTab = 'live' | 'upcoming' | 'results' | 'series' | 'news' | 'videos';

export function CricketScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<CricketTab>('live');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data states
    const [liveMatches, setLiveMatches] = useState<CricketMatchInfo[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<CricketMatchInfo[]>([]);
    const [recentMatches, setRecentMatches] = useState<CricketMatchInfo[]>([]);
    const [seriesList, setSeriesList] = useState<CricketSeries[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [videos, setVideos] = useState<VideoHighlight[]>([]);

    const loadData = async () => {
        try {
            const [live, upcoming, recent, seriesData, posts, videoData] = await Promise.all([
                cricketApi.getLiveMatches(),
                cricketApi.getUpcomingMatches(),
                cricketApi.getRecentMatches(),
                cricketApi.getSeries(),
                cricketApi.getBlogPosts(),
                cricketApi.getVideoHighlights(),
            ]);

            setLiveMatches(live.matches);
            setUpcomingMatches(upcoming.matches);
            setRecentMatches(recent.matches);
            setSeriesList(seriesData.series);
            setBlogPosts(posts);
            setVideos(videoData);
        } catch (error) {
            console.error('Error loading cricket data:', error);
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

    const tabs: { id: CricketTab; label: string; count?: number }[] = [
        { id: 'live', label: 'Live', count: liveMatches.length },
        { id: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
        { id: 'results', label: 'Results', count: recentMatches.length },
        { id: 'series', label: 'Series' },
        { id: 'news', label: 'News', count: blogPosts.length },
        { id: 'videos', label: 'Videos', count: videos.length },
    ];

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                    <Text style={styles.loadingText}>Loading cricket data...</Text>
                </View>
            );
        }

        switch (activeTab) {
            case 'live':
                return (
                    <View style={styles.content}>
                        {liveMatches.length > 0 ? (
                            <>
                                <Text style={styles.sectionTitle}>🔴 Live Matches</Text>
                                {liveMatches.map((match) => (
                                    <CricketMatchCard key={match.id} match={match} />
                                ))}
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🏏</Text>
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
                        {upcomingMatches.map((match) => (
                            <CricketMatchCard key={match.id} match={match} />
                        ))}
                    </View>
                );

            case 'results':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>✅ Recent Results</Text>
                        {recentMatches.map((match) => (
                            <CricketMatchCard key={match.id} match={match} />
                        ))}
                    </View>
                );

            case 'series':
                return (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>🏆 Cricket Series</Text>
                        {seriesList.map((series) => (
                            <Pressable
                                key={series.id}
                                style={({ pressed }) => [styles.seriesCard, pressed && styles.pressedTab]}
                                onPress={() => router.push(`/home/cricket/series/${series.id}`)}
                            >
                                {series.image && <Image source={{ uri: series.image }} style={styles.seriesImage} />}
                                <View style={styles.seriesInfo}>
                                    <Text style={styles.seriesName}>{series.name}</Text>
                                    <Text style={styles.seriesDetails}>
                                        {new Date(series.startDate).toLocaleDateString()} - {new Date(series.endDate).toLocaleDateString()}
                                    </Text>
                                    <Text style={styles.seriesType}>{series.seriesType} • {series.country || series.tournament}</Text>
                                </View>
                            </Pressable>
                        ))}
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
                        {videos.map((video) => (
                            <VideoCard key={video.id} item={video} onPress={() => router.push(`/highlight/${video.id}`)} />
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
                        { label: '🏆 Series', route: '/home/cricket/series' },
                        { label: '👕 Teams', route: '/home/cricket/teams' },
                        { label: '🌍 ICC Rankings', route: '/home/cricket/rankings' },
                        { label: '🏃 Players', route: '/home/cricket/players' },
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
    seriesCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    seriesImage: {
        width: '100%',
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    seriesInfo: {
        padding: SPACING.md,
    },
    seriesName: {
        color: COLORS.background,
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        marginBottom: 4,
    },
    seriesDetails: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
        marginBottom: 4,
    },
    seriesType: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
