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
import { advancedFootballApi } from '../services/advancedFootballApi';
import { goalmillsApi } from '../services/goalmillsApi';
import {
  mapEventToFixture,
  mapStandingToStanding,
  mapVideoToHighlight,
} from '../utils/footballAdapters';
import { FixtureCard } from '../components/FixtureCard';
import { StandingsTable } from '../components/StandingsTable';
import { NewsCard } from '../components/NewsCard';
import { VideoCard } from '../components/VideoCard';
import { PulseNewsTicker } from '../components/PulseNewsTicker';
import { GoalmillsLoader } from '../components/GoalmillsLoader';
import { RecommendedFeed } from '../components/RecommendedFeed';
import { HeadToHeadView } from '../components/HeadToHeadView';
import { mobileAnalytics } from '../utils/analytics';

type FootballTab = 'live' | 'upcoming' | 'results' | 'h2h' | 'standings' | 'news' | 'videos';

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
      // Calculate Dates for upcoming/finished
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const prevWeek = new Date(today);
      prevWeek.setDate(today.getDate() - 7);

      const [liveRes, upcomingRes, finishedRes, standingsRes, videoRes, newsRes, dynamicVideos] =
        await Promise.all([
          advancedFootballApi.getLivescore(),
          advancedFootballApi.getFixtures({
            from: today.toISOString().split('T')[0],
            to: nextWeek.toISOString().split('T')[0],
          }),
          advancedFootballApi.getFixtures({
            from: prevWeek.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0],
          }),
          advancedFootballApi.getStandings(152),
          advancedFootballApi.getVideos(),
          goalmillsApi.getNews({ sport: 'football', limit: 15 }).catch(() => []),
          goalmillsApi.getVideos().catch(() => []),
        ]);

      // Process Live
      if (liveRes.success) {
        setLiveFixtures(liveRes.result.map(mapEventToFixture));
      }

      // Process Upcoming
      if (upcomingRes.success) {
        const upcoming = upcomingRes.result
          .filter((e) => e.event_status === 'Not Started' || e.event_status === 'NS')
          .slice(0, 15)
          .map(mapEventToFixture);
        setUpcomingFixtures(upcoming);
      }

      // Process Finished
      if (finishedRes.success) {
        const finished = finishedRes.result
          .filter(
            (e) =>
              e.event_status === 'Finished' ||
              e.event_status === 'FT' ||
              e.event_status === 'AET' ||
              e.event_status === 'AP'
          )
          .slice(0, 15)
          .map(mapEventToFixture);
        setFinishedFixtures(finished);
      }

      // Process Standings
      if (standingsRes.success) {
        setStandings(standingsRes.result.total.map(mapStandingToStanding));
      }

      // Process Videos (Dynamic API with videoRes fallback)
      if (Array.isArray(dynamicVideos) && dynamicVideos.length > 0) {
        setVideos(dynamicVideos);
      } else if (videoRes.success) {
        setVideos(videoRes.result.map(mapVideoToHighlight));
      }

      // Dynamic News from API
      if (Array.isArray(newsRes) && newsRes.length > 0) {
        setBlogPosts(newsRes);
      } else {
        setBlogPosts([]);
      }
    } catch (error) {
      console.error('Error loading football data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    mobileAnalytics.trackScreenView('football_hub', { sportSlug: 'football' });
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
    { id: 'h2h', label: 'H2H Intelligence' },
    { id: 'standings', label: 'Standings' },
    { id: 'news', label: 'News', count: blogPosts.length },
    { id: 'videos', label: 'Videos', count: videos.length },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <GoalmillsLoader
            size="md"
            label="Football Live"
            sublabel="Syncing match fixtures & league tables..."
          />
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
                {liveFixtures.map((fixture, index) => (
                  <FixtureCard key={`live-${fixture.fixture.id}-${index}`} fixture={fixture} />
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
            {upcomingFixtures.map((fixture, index) => (
              <FixtureCard key={`upcoming-${fixture.fixture.id}-${index}`} fixture={fixture} />
            ))}
          </View>
        );

      case 'results':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>✅ Recent Results</Text>
            <HeadToHeadView sport="football" teamA="arsenal" teamB="chelsea" />
            {finishedFixtures.map((fixture, index) => (
              <FixtureCard key={`result-${fixture.fixture.id}-${index}`} fixture={fixture} />
            ))}
          </View>
        );

      case 'h2h':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>⚔️ Head-to-Head Derby Records</Text>
            <HeadToHeadView sport="football" teamA="arsenal" teamB="chelsea" />
            <HeadToHeadView sport="football" teamA="manchester-united" teamB="liverpool" />
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
            {blogPosts.map((post, index) => (
              <NewsCard
                key={`post-${post._id}-${index}`}
                item={post}
                onPress={() => router.push(`/news/${post._id}`)}
              />
            ))}
          </View>
        );

      case 'videos':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>🎥 Video Highlights</Text>
            {videos
              .filter((v) => v)
              .map((video, index) => (
                <VideoCard
                  key={`vid-${video.id}-${index}`}
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
      {/* Top Football Pulse Wire Ticker */}
      <PulseNewsTicker
        sport="football"
        pulseLabel="FOOTBALL PULSE"
        actionLabel={activeTab === 'live' ? '📅 Upcoming' : '⚡ Live'}
        onActionPress={() => setActiveTab(activeTab === 'live' ? 'upcoming' : 'live')}
      />

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
            { label: '🏆 Leagues', route: '/home/leagues' },
            { label: '👕 Teams', route: '/home/teams' },
            { label: '🌍 Regions', route: '/home/regions' },
            { label: '⚔️ Competitions', route: '/home/competitions' },
            { label: '🏃 Players', route: '/home/players' },
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
        <RecommendedFeed sportSlug="football" title="Recommended Football Intel" />
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
    backgroundColor: '#070D18',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  tabsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    gap: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  pressedTab: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  badge: {
    marginLeft: 5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: SPACING.md,
    letterSpacing: 0.2,
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
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginTop: 8,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: '#64748B',
    textAlign: 'center',
  },
  quickLinksScrollView: {
    flexGrow: 0,
    backgroundColor: '#070D18',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickLinksContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    gap: 6,
  },
  quickLink: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
