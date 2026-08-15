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
import { TennisEvent, TennisStanding, TennisLeague } from '@goalmills/types';
import { tennisApi } from '../services/tennisApi';
import { TennisMatchCard } from '../components/TennisMatchCard';

type TennisTab = 'live' | 'upcoming' | 'results' | 'leagues' | 'standings';

export function TennisScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TennisTab>('live');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [liveMatches, setLiveMatches] = useState<TennisEvent[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<TennisEvent[]>([]);
  const [recentMatches, setRecentMatches] = useState<TennisEvent[]>([]);
  const [leagues, setLeagues] = useState<TennisLeague[]>([]);
  const [standings, setStandings] = useState<TennisStanding[]>([]);
  const [odds, setOdds] = useState<any>({});
  const [liveOdds, setLiveOdds] = useState<any>({});

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const [live, fixtures, results, leaguesData, standingsData, oddsData, liveOddsData] = await Promise.all([
        tennisApi.getLivescore({}),
        tennisApi.getFixtures({ from: tomorrow, to: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] }),
        tennisApi.getFixtures({ from: yesterday, to: yesterday }),
        tennisApi.getLeagues({}),
        tennisApi.getStandings({ league: 'ATP' }),
        tennisApi.getOdds({}),
        tennisApi.getLiveOdds({})
      ]);

      const allFixtures = fixtures.result || [];
      const upcoming = allFixtures.filter((m: TennisEvent) => {
          const status = (m.event_status || '').toUpperCase();
          const isFinished = status === 'FINISHED' || status === 'FT' || status === 'RET' || status === 'W/O';
          return m.event_live !== '1' && !isFinished;
      });

      const allResults = results.result || [];
      const finished = allResults.filter((m: TennisEvent) => {
          const status = (m.event_status || '').toUpperCase();
          return status === 'FINISHED' || status === 'FT' || status === 'RET' || status === 'W/O';
      });

      setLiveMatches(live.result || []);
      setUpcomingMatches(upcoming);
      setRecentMatches(finished);
      setLeagues(leaguesData.result || []);
      
      const rawStandings = standingsData.result || [];
      const uniqueStandings = rawStandings.reduce((acc: any[], curr: any) => {
          const isDuplicate = acc.some(item => 
              item.player_key === curr.player_key || 
              item.place === curr.place
          );
          if (!isDuplicate) {
              acc.push(curr);
          }
          return acc;
      }, []);
      setStandings(uniqueStandings);
      
      setOdds(oddsData.result || {});
      setLiveOdds(liveOddsData.result || {});
    } catch (error) {
      console.error('Error loading tennis data:', error);
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

  const tabs: { id: TennisTab; label: string; count?: number }[] = [
    { id: 'live', label: 'Live', count: liveMatches.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
    { id: 'results', label: 'Results', count: recentMatches.length },
    { id: 'leagues', label: 'Leagues' },
    { id: 'standings', label: 'Rankings' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Loading tennis data...</Text>
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
                  <TennisMatchCard
                    key={match.event_key}
                    match={match}
                    odds={liveOdds[String(match.event_key)]?.live_odds ?
                      // Transform array specific to match winner or just pass raw data and let component handle?
                      // The component expects structure matching mockOdds. live_odds is array.
                      // Let's adapt data or just pass simple structure.
                      // Mock data structure: { 'Match Winner': { 'Home': ..., 'Away': ... } }
                      // Live odds structure: live_odds array.
                      // Let's map live odds to component expected format for simplicity or update component.
                      // Updating component is harder now. Let's transform here.
                      {
                        'Match Winner': {
                          'Home': { 'Bet365': liveOdds[String(match.event_key)].live_odds.find((o: any) => o.type === 'Home' && o.odd_name === 'Match Winner')?.value },
                          'Away': { 'Bet365': liveOdds[String(match.event_key)].live_odds.find((o: any) => o.type === 'Away' && o.odd_name === 'Match Winner')?.value }
                        }
                      }
                      : undefined
                    }
                  />
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎾</Text>
                <Text style={styles.emptyText}>No live matches at the moment</Text>
                <Text style={styles.emptySubtext}>Check back later or view upcoming matches</Text>
              </View>
            )}
          </View>
        );

      case 'upcoming':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>📅 Upcoming Matches</Text>
            {upcomingMatches.length > 0 ? upcomingMatches.map((match) => (
              <TennisMatchCard key={match.event_key} match={match} odds={odds[String(match.event_key)]} />
            )) : (
              <Text style={styles.emptySubtext}>No upcoming matches found.</Text>
            )}
          </View>
        );

      case 'results':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>✅ Recent Results</Text>
            {recentMatches.length > 0 ? recentMatches.map((match) => (
              <TennisMatchCard key={match.event_key} match={match} />
            )) : (
              <Text style={styles.emptySubtext}>No recent results found.</Text>
            )}
          </View>
        );

      case 'leagues':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>🏆 Tournaments</Text>
            {leagues.map((league) => (
              <Pressable
                key={league.league_key}
                style={({ pressed }) => [styles.leagueCard, pressed && styles.pressedTab]}
                onPress={() => router.push(`/home/tennis/leagues/${league.league_key}`)}
              >
                <View style={styles.leagueInfo}>
                  <Text style={styles.leagueName}>{league.league_name}</Text>
                  <Text style={styles.leagueCountry}>{league.country_name}</Text>
                  {league.league_surface && (
                    <Text style={styles.leagueSurface}>{league.league_surface}</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        );

      case 'standings':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>🌍 ATP Rankings</Text>
            <View style={styles.standingsHeader}>
              <Text style={[styles.headerCell, { width: 40 }]}>#</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Player</Text>
              <Text style={[styles.headerCell, { width: 60, textAlign: 'right' }]}>Pts</Text>
            </View>
            {standings.map((player) => (
              <View key={player.player_key} style={styles.standingRow}>
                <Text style={[styles.cellText, { width: 40, fontWeight: 'bold' }]}>{player.place}.</Text>
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/home/tennis/players/${player.player_key}`)}
                >
                  <Text style={styles.cellText}>{player.player}</Text>
                  <Text style={styles.cellSubtext}>{player.country}</Text>
                </Pressable>
                <Text style={[styles.cellText, { width: 60, textAlign: 'right', color: COLORS.secondary }]}>{player.points}</Text>
              </View>
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
  leagueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  leagueCountry: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
  },
  leagueSurface: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  standingsHeader: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.sm,
  },
  headerCell: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  cellText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
  },
  cellSubtext: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xs,
  }
});
