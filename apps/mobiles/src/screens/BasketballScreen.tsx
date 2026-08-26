import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import {
  basketballApiService,
  ApiBasketballGameItem,
} from '../services/basketballApi';
import { BasketballMatchCard } from '../components/BasketballMatchCard';
import { GoalmillsLoader } from '../components/GoalmillsLoader';

type BasketballTab = 'live' | 'upcoming' | 'results' | 'standings';

export default function BasketballScreen() {
  const [activeTab, setActiveTab] = useState<BasketballTab>('live');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [games, setGames] = useState<ApiBasketballGameItem[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  // 7-day date slider
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

  const loadBasketballData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'standings') {
        // NBA (League ID: 12) default standings
        const res = await basketballApiService.getStandings({
          league: 12,
          season: '2023-2024',
        });
        setStandings(res || []);
      } else {
        let raw: ApiBasketballGameItem[] = [];
        if (activeTab === 'live') {
          raw = await basketballApiService.getLiveGames();
        } else {
          raw = await basketballApiService.getGamesByDate(selectedDate);
        }
        setGames(raw || []);
      }
    } catch (err) {
      console.error('[BasketballScreen] Error loading games:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    loadBasketballData();
  }, [loadBasketballData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBasketballData();
  };

  const filteredGames = useMemo(() => {
    let list = Array.isArray(games) ? games : [];

    if (activeTab === 'live') {
      list = list.filter(g => {
        const short = g?.status?.short || '';
        return ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE'].includes(short);
      });
    } else if (activeTab === 'upcoming') {
      list = list.filter(g => {
        const short = g?.status?.short || '';
        return !['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE', 'FT', 'AOT'].includes(short);
      });
    } else if (activeTab === 'results') {
      list = list.filter(g => {
        const short = g?.status?.short || '';
        return ['FT', 'AOT'].includes(short);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        g =>
          (g?.teams?.home?.name || '').toLowerCase().includes(q) ||
          (g?.teams?.away?.name || '').toLowerCase().includes(q) ||
          (g?.league?.name || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [games, activeTab, searchQuery]);

  // Group by league for SectionList
  const sections = useMemo(() => {
    const map = new Map<string, { league: any; data: ApiBasketballGameItem[] }>();

    filteredGames.forEach(game => {
      if (!game) return;
      const key = `${game?.league?.id || 'other'}_${game?.league?.name || 'Other'}`;
      if (!map.has(key)) {
        map.set(key, {
          league: game?.league || { name: 'Other Competitions' },
          data: [],
        });
      }
      map.get(key)!.data.push(game);
    });

    return Array.from(map.values()).map(entry => ({
      title: entry?.league?.name || 'Competition',
      logo: entry?.league?.logo,
      data: entry?.data || [],
    }));
  }, [filteredGames]);

  const tabs: { id: BasketballTab; label: string; icon: any }[] = [
    { id: 'live', label: 'Live', icon: 'radio-outline' },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
    { id: 'results', label: 'Results', icon: 'checkmark-circle-outline' },
    { id: 'standings', label: 'Standings', icon: 'trophy-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search teams or leagues..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </Pressable>
          )}
        </View>

        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={20} color="#F8FAFC" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <Pressable
              key={t.id}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => setActiveTab(t.id)}
            >
              <Ionicons
                name={t.icon}
                size={14}
                color={isActive ? '#F97316' : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Date Slider (for upcoming & results) */}
      {activeTab !== 'live' && activeTab !== 'standings' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateSlider}
        >
          {dateStrip.map(item => {
            const isSelected = selectedDate === item.iso;
            return (
              <Pressable
                key={item.iso}
                style={[styles.dateCard, isSelected && styles.activeDateCard]}
                onPress={() => setSelectedDate(item.iso)}
              >
                <Text style={[styles.dateDayText, isSelected && styles.activeDateText]}>
                  {item.dayName}
                </Text>
                <Text style={[styles.dateNumberText, isSelected && styles.activeDateText]}>
                  {item.dayNumber}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <GoalmillsLoader size="md" label="Basketball Live" sublabel="Syncing NBA court action & standings..." />
        </View>
      ) : activeTab === 'standings' ? (
        <ScrollView
          contentContainerStyle={styles.standingsContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F97316"
              colors={['#F97316']}
            />
          }
        >
          <View style={styles.standingsCard}>
            <Text style={styles.standingsHeaderTitle}>NBA Standings</Text>
            {standings.length === 0 ? (
              <Text style={styles.emptyText}>No standings data currently available.</Text>
            ) : (
              standings.map((stRow, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableRank}>{stRow.position || idx + 1}</Text>
                  {stRow.team?.logo && (
                    <Image
                      source={{ uri: stRow.team.logo }}
                      style={styles.tableLogo}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.tableName} numberOfLines={1}>
                    {stRow.team?.name || 'Team'}
                  </Text>
                  <Text style={styles.tableStat}>{stRow.games?.win?.total ?? 0}W</Text>
                  <Text style={styles.tableStat}>{stRow.games?.lose?.total ?? 0}L</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      ) : sections.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="basketball-outline" size={48} color="#64748B" />
          <Text style={styles.emptyTitle}>
            {activeTab === 'live' ? 'No Live Games Right Now' : 'No Games Found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'live'
              ? 'Check upcoming games or select another date from the calendar.'
              : 'Try selecting a different date or clearing your search.'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F97316"
              colors={['#F97316']}
            />
          }
          renderSectionHeader={({ section: { title, logo } }) => (
            <View style={styles.sectionHeader}>
              {logo ? (
                <Image source={{ uri: logo }} style={styles.sectionLogo} resizeMode="contain" />
              ) : (
                <Ionicons name="basketball-outline" size={16} color="#F97316" />
              )}
              <Text style={styles.sectionTitle} numberOfLines={1}>
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => <BasketballMatchCard match={item} hideLeague />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeTabButton: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(249, 115, 22, 0.4)',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  activeTabButtonText: {
    color: '#F97316',
  },
  dateSlider: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: 8,
  },
  dateCard: {
    width: 58,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#141C2B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeDateCard: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  dateDayText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  dateNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  activeDateText: {
    color: '#0B0F17',
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
    gap: 6,
  },
  sectionLogo: {
    width: 18,
    height: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 13,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
  },
  standingsContainer: {
    padding: SPACING.md,
  },
  standingsCard: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  standingsHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tableRank: {
    width: 24,
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tableLogo: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  tableName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  tableStat: {
    width: 38,
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'right',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
