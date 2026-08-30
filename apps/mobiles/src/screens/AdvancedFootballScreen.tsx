import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballMatchCard, UnifiedMatchEvent } from '../components/FootballMatchCard';
import { apiFootballService, ApiFootballFixtureItem } from '../services/apiFootball';
import { advancedFootballApi } from '../services/advancedFootballApi';

type FootballTab = 'live' | 'upcoming' | 'results' | 'standings';

export function AdvancedFootballScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FootballTab>('live');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fixtures, setFixtures] = useState<UnifiedMatchEvent[]>([]);

  // Generate 7-day date slider (3 days before, today, 3 days after)
  const dateStrip = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName =
        i === 0
          ? 'Today'
          : i === -1
            ? 'Yest'
            : i === 1
              ? 'Tmrw'
              : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      dates.push({ iso, dayName, dayNumber });
    }
    return dates;
  }, []);

  // Adapt API-Football Fixture to UnifiedMatchEvent
  const adaptFixture = (item: ApiFootballFixtureItem): UnifiedMatchEvent => {
    if (!item) return {} as UnifiedMatchEvent;

    const isLiveShort = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(
      item?.fixture?.status?.short || ''
    );
    const scoreStr =
      item?.goals?.home !== null &&
      item?.goals?.home !== undefined &&
      item?.goals?.away !== null &&
      item?.goals?.away !== undefined
        ? `${item.goals.home} - ${item.goals.away}`
        : undefined;

    const fixtureDate = item?.fixture?.date ? String(item.fixture.date).split('T') : ['', ''];

    return {
      event_key: item?.fixture?.id || Math.floor(Math.random() * 1000000),
      event_date: fixtureDate[0] || '',
      event_time: fixtureDate[1]?.slice(0, 5) || '',
      event_status: item?.fixture?.status?.short || '',
      event_live: isLiveShort ? '1' : '0',
      event_home_team: item?.teams?.home?.name || 'Home Team',
      home_team_key: item?.teams?.home?.id || 0,
      home_team_logo: item?.teams?.home?.logo || '',
      event_away_team: item?.teams?.away?.name || 'Away Team',
      away_team_key: item?.teams?.away?.id || 0,
      away_team_logo: item?.teams?.away?.logo || '',
      event_final_result: scoreStr,
      event_ft_result: scoreStr,
      league_name: item?.league?.name || 'General League',
      league_key: item?.league?.id || 0,
      league_logo: item?.league?.logo || '',
      country_name: item?.league?.country || '',
      country_logo: item?.league?.flag || undefined,
    };
  };

  // Load data on demand (NO auto-refresh intervals)
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      let raw: ApiFootballFixtureItem[] = [];
      try {
        if (activeTab === 'live') {
          raw = await apiFootballService.getLiveFixtures();
        } else {
          raw = await apiFootballService.getFixturesByDate(selectedDate);
        }
      } catch {
        raw = [];
      }

      if (Array.isArray(raw) && raw.length > 0) {
        setFixtures(raw.map(adaptFixture));
      } else {
        // Fallback to advancedFootballApi (AllSportsAPI / GoalMills backend)
        try {
          if (activeTab === 'live') {
            const fallback = await advancedFootballApi.getLivescore();
            if (
              fallback &&
              fallback.success &&
              Array.isArray(fallback.result) &&
              fallback.result.length > 0
            ) {
              setFixtures(fallback.result as any);
              return;
            }
          } else {
            const fallback = await advancedFootballApi.getFixtures({
              from: selectedDate,
              to: selectedDate,
            });
            if (
              fallback &&
              fallback.success &&
              Array.isArray(fallback.result) &&
              fallback.result.length > 0
            ) {
              setFixtures(fallback.result as any);
              return;
            }
          }
        } catch {
          // Fallback handled safely
        }
        setFixtures([]);
      }
    } catch {
      setFixtures([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  // Filter and group matches by league
  const filteredFixtures = useMemo(() => {
    if (!Array.isArray(fixtures)) return [];
    let list = fixtures;

    if (activeTab === 'live') {
      list = list.filter((f) => f && f.event_live === '1');
    } else if (activeTab === 'upcoming') {
      list = list.filter(
        (f) =>
          f &&
          f.event_live !== '1' &&
          f.event_status !== 'FT' &&
          f.event_status !== 'Finished'
      );
    } else if (activeTab === 'results') {
      list = list.filter(
        (f) => f && (f.event_status === 'FT' || f.event_status === 'Finished')
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          (f?.event_home_team && f.event_home_team.toLowerCase().includes(q)) ||
          (f?.event_away_team && f.event_away_team.toLowerCase().includes(q)) ||
          (f?.league_name && f.league_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [fixtures, activeTab, searchQuery]);

  // Group by league for SectionList
  const sections = useMemo(() => {
    const groups: { [key: string]: { title: string; logo?: string; data: UnifiedMatchEvent[] } } =
      {};

    filteredFixtures.forEach((item) => {
      const leagueTitle = item.league_name || 'Other Matches';
      if (!groups[leagueTitle]) {
        groups[leagueTitle] = {
          title: leagueTitle,
          logo: item.league_logo,
          data: [],
        };
      }
      groups[leagueTitle].data.push(item);
    });

    return Object.values(groups);
  }, [filteredFixtures]);

  const tabs: { id: FootballTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'live', label: 'Live', icon: 'radio' },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
    { id: 'results', label: 'Results', icon: 'checkmark-circle-outline' },
    { id: 'standings', label: 'Standings', icon: 'trophy-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header Search & Refresh */}
      <View style={styles.headerBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams or leagues..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>

        <Pressable style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#F8FAFC" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabItem, isActive && styles.activeTabItem]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? '#10B981' : '#94A3B8'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Date Strip (for upcoming/results) */}
      {activeTab !== 'live' && activeTab !== 'standings' && (
        <View style={styles.dateStripContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dateStrip}
            keyExtractor={(item) => item.iso}
            contentContainerStyle={styles.dateStripContent}
            renderItem={({ item }) => {
              const isSelected = selectedDate === item.iso;
              return (
                <Pressable
                  style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                  onPress={() => setSelectedDate(item.iso)}
                >
                  <Text style={[styles.dateDayName, isSelected && styles.selectedDateText]}>
                    {item.dayName}
                  </Text>
                  <Text style={[styles.dateDayNumber, isSelected && styles.selectedDateNumber]}>
                    {item.dayNumber}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Content List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Fetching match data...</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="football-outline" size={48} color="#334155" />
          <Text style={styles.emptyTitle}>
            {activeTab === 'live' ? 'No Live Matches Right Now' : 'No Matches Found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'live'
              ? 'Check upcoming games or select another date.'
              : 'Try searching for a different team or check back later.'}
          </Text>
          <Pressable style={styles.emptyButton} onPress={onRefresh}>
            <Text style={styles.emptyButtonText}>Refresh Scores</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.event_key)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
              colors={['#10B981']}
            />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              {section.logo ? (
                <Image
                  source={{ uri: section.logo }}
                  style={styles.sectionLogo}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name="trophy-outline"
                  size={14}
                  color="#3B82F6"
                  style={{ marginRight: 6 }}
                />
              )}
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>({section.data.length})</Text>
            </View>
          )}
          renderItem={({ item }) => <FootballMatchCard event={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: FONT_SIZES.sm,
    marginLeft: 6,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeTabItem: {
    backgroundColor: '#162234',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  dateStripContainer: {
    paddingVertical: SPACING.xs,
  },
  dateStripContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  dateCard: {
    width: 60,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#141C2B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  selectedDateCard: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  dateDayName: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedDateText: {
    color: '#0B0F17',
    fontWeight: '700',
  },
  dateDayNumber: {
    fontSize: 16,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  selectedDateNumber: {
    color: '#0B0F17',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  sectionLogo: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#F8FAFC',
    fontWeight: '700',
    marginRight: 6,
  },
  sectionCount: {
    fontSize: 12,
    color: '#64748B',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: 40,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  emptyButton: {
    marginTop: SPACING.md,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyButtonText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: FONT_SIZES.xs,
  },
});
