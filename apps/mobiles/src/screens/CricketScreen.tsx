import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import {
  CricketEvent,
  CricketLeague,
  CricketTeam,
  CricketStanding,
  CricketPlayer,
} from '@goalmills/types';
import { advancedCricketApi } from '../services/advancedCricketApi';
import { CricketMatchCard } from '../components/CricketMatchCard';
import { GoalmillsLoader } from '../components/GoalmillsLoader';

type CricketTab = 'live' | 'upcoming' | 'results' | 'standings' | 'series' | 'teams';
type FormatFilter = 'all' | 'international' | 'franchise' | 'domestic' | 'women';

const ICC_RANKINGS_DATA = {
  ICC_TEST: [
    { rank: 1, country: 'Australia', points: 3714, rating: '124' },
    { rank: 2, country: 'India', points: 3498, rating: '120' },
    { rank: 3, country: 'England', points: 4321, rating: '108' },
    { rank: 4, country: 'South Africa', points: 2604, rating: '104' },
    { rank: 5, country: 'New Zealand', points: 2712, rating: '97' },
    { rank: 6, country: 'Pakistan', points: 2315, rating: '89' },
  ],
  ICC_ODI: [
    { rank: 1, country: 'India', points: 4890, rating: '118' },
    { rank: 2, country: 'Australia', points: 4120, rating: '113' },
    { rank: 3, country: 'South Africa', points: 3105, rating: '106' },
    { rank: 4, country: 'Pakistan', points: 3200, rating: '104' },
    { rank: 5, country: 'New Zealand', points: 3300, rating: '101' },
    { rank: 6, country: 'England', points: 2900, rating: '95' },
  ],
  ICC_T20: [
    { rank: 1, country: 'India', points: 15420, rating: '268' },
    { rank: 2, country: 'Australia', points: 9812, rating: '256' },
    { rank: 3, country: 'England', points: 9540, rating: '252' },
    { rank: 4, country: 'West Indies', points: 8900, rating: '248' },
    { rank: 5, country: 'South Africa', points: 8100, rating: '244' },
    { rank: 6, country: 'New Zealand', points: 7900, rating: '240' },
  ],
};

export function CricketScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CricketTab>('live');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [liveMatches, setLiveMatches] = useState<CricketEvent[]>([]);
  const [fixtures, setFixtures] = useState<CricketEvent[]>([]);
  const [seriesList, setSeriesList] = useState<CricketLeague[]>([]);
  const [teamsList, setTeamsList] = useState<CricketTeam[]>([]);
  const [playersList, setPlayersList] = useState<CricketPlayer[]>([]);
  const [standingsTab, setStandingsTab] = useState<
    'IPL' | 'T20_WC' | 'BBL' | 'ICC_TEST' | 'ICC_ODI' | 'ICC_T20'
  >('IPL');
  const [standings, setStandings] = useState<Record<string, CricketStanding[]>>({});

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

  const loadCricketData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'live') {
        const res = await advancedCricketApi.getLivescore().catch(() => ({ result: [] }));
        setLiveMatches(res.result || []);
      } else if (activeTab === 'upcoming' || activeTab === 'results') {
        const res = await advancedCricketApi
          .getFixtures({ from: selectedDate, to: selectedDate })
          .catch(() => ({ result: [] }));
        setFixtures(res.result || []);
      } else if (activeTab === 'standings') {
        const [iplRank, t20WcRank, bblRank] = await Promise.all([
          advancedCricketApi
            .getStandings({ leagueId: 9785 })
            .catch(() => ({ result: { total: [] } })),
          advancedCricketApi
            .getStandings({ leagueId: 9843 })
            .catch(() => ({ result: { total: [] } })),
          advancedCricketApi
            .getStandings({ leagueId: 9779 })
            .catch(() => ({ result: { total: [] } })),
        ]);

        setStandings({
          IPL:
            (iplRank as any)?.result?.total ||
            (Array.isArray(iplRank?.result) ? iplRank.result : []),
          T20_WC:
            (t20WcRank as any)?.result?.total ||
            (Array.isArray(t20WcRank?.result) ? t20WcRank.result : []),
          BBL:
            (bblRank as any)?.result?.total ||
            (Array.isArray(bblRank?.result) ? bblRank.result : []),
        });
      } else if (activeTab === 'series') {
        const res = await advancedCricketApi.getLeagues().catch(() => ({ result: [] }));
        setSeriesList(res.result || []);
      } else if (activeTab === 'teams') {
        const [teamsRes, playersRes] = await Promise.all([
          advancedCricketApi.getTeams().catch(() => ({ result: [] })),
          advancedCricketApi.getPlayers().catch(() => ({ result: [] })),
        ]);
        setTeamsList(teamsRes.result || []);
        setPlayersList(playersRes.result || []);
      }
    } catch (err) {
      console.error('[Mobile CricketScreen] Error loading cricket data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    loadCricketData();
  }, [loadCricketData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCricketData();
  };

  // Filtered match list
  const currentMatchesList = useMemo(() => {
    let list: CricketEvent[] = [];
    if (activeTab === 'live') {
      list = liveMatches;
    } else if (activeTab === 'upcoming') {
      list = fixtures.filter(
        (m) => m.event_live !== '1' && m.event_status !== 'Finished' && m.event_status !== 'FT'
      );
    } else if (activeTab === 'results') {
      list = fixtures.filter((m) => m.event_status === 'Finished' || m.event_status === 'FT');
    }

    if (formatFilter !== 'all') {
      list = list.filter((m) => {
        const league = (m.league_name || '').toLowerCase();
        const type = (m.event_type || '').toLowerCase();
        if (formatFilter === 'international') {
          return (
            league.includes('icc') ||
            league.includes('international') ||
            type.includes('t20i') ||
            type.includes('odi') ||
            type.includes('test')
          );
        }
        if (formatFilter === 'franchise') {
          return (
            league.includes('ipl') ||
            league.includes('bbl') ||
            league.includes('psl') ||
            league.includes('hundred') ||
            league.includes('cpl') ||
            league.includes('sa20') ||
            league.includes('premier league')
          );
        }
        if (formatFilter === 'domestic') {
          return (
            league.includes('trophy') ||
            league.includes('shield') ||
            league.includes('cup') ||
            league.includes('championship')
          );
        }
        if (formatFilter === 'women') {
          return (
            league.includes('women') ||
            type.includes('women') ||
            (m.event_home_team || '').toLowerCase().includes('women')
          );
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          (m.event_home_team && m.event_home_team.toLowerCase().includes(q)) ||
          (m.event_away_team && m.event_away_team.toLowerCase().includes(q)) ||
          (m.league_name && m.league_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, liveMatches, fixtures, formatFilter, searchQuery]);

  // Group by league for SectionList
  const sections = useMemo(() => {
    const map = new Map<string, { title: string; data: CricketEvent[] }>();

    currentMatchesList.forEach((match) => {
      const key = match.league_name || 'Cricket Fixtures';
      if (!map.has(key)) {
        map.set(key, {
          title: key,
          data: [],
        });
      }
      map.get(key)!.data.push(match);
    });

    return Array.from(map.values());
  }, [currentMatchesList]);

  const tabs: { id: CricketTab; label: string; icon: any; count?: number }[] = [
    { id: 'live', label: 'Live', icon: 'radio-outline', count: liveMatches.length },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
    { id: 'results', label: 'Results', icon: 'checkmark-circle-outline' },
    { id: 'standings', label: 'Standings', icon: 'trophy-outline' },
    { id: 'series', label: 'Series', icon: 'ribbon-outline' },
    { id: 'teams', label: 'Teams', icon: 'people-outline' },
  ];

  const formatFilters: { id: FormatFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'international', label: 'ICC / Int' },
    { id: 'franchise', label: 'T20 Franchise' },
    { id: 'domestic', label: 'Domestic' },
    { id: 'women', label: 'Women' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <GoalmillsLoader
            size="md"
            label="Cricket Live"
            sublabel="Fetching real-time overs & match leaderboards..."
          />
        </View>
      );
    }

    if (activeTab === 'standings') {
      return (
        <ScrollView style={styles.contentScrollView}>
          {/* Sub-Tabs for Standings */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.subTabsContainer}
          >
            {[
              { id: 'IPL', label: 'IPL Table' },
              { id: 'T20_WC', label: 'T20 World Cup' },
              { id: 'BBL', label: 'Big Bash' },
              { id: 'ICC_TEST', label: 'ICC Tests' },
              { id: 'ICC_ODI', label: 'ICC ODIs' },
              { id: 'ICC_T20', label: 'ICC T20Is' },
            ].map((sub) => {
              const isSubActive = standingsTab === sub.id;
              return (
                <Pressable
                  key={sub.id}
                  style={[styles.subTabPill, isSubActive && styles.subTabPillActive]}
                  onPress={() => setStandingsTab(sub.id as any)}
                >
                  <Text style={[styles.subTabText, isSubActive && styles.subTabTextActive]}>
                    {sub.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Standings Table View */}
          {standingsTab === 'IPL' || standingsTab === 'T20_WC' || standingsTab === 'BBL' ? (
            <View style={styles.standingsCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thText, { width: 28 }]}>#</Text>
                <Text style={[styles.thText, { flex: 1 }]}>Team</Text>
                <Text style={[styles.thText, styles.thCenter, { width: 28 }]}>P</Text>
                <Text style={[styles.thText, styles.thCenter, { width: 28 }]}>W</Text>
                <Text style={[styles.thText, styles.thCenter, { width: 28 }]}>L</Text>
                <Text style={[styles.thText, styles.thCenter, { width: 44 }]}>NRR</Text>
                <Text style={[styles.thText, styles.thRight, { width: 36 }]}>PTS</Text>
              </View>

              {!standings[standingsTab] || standings[standingsTab].length === 0 ? (
                <Text style={styles.emptyTableText}>Standings updating shortly...</Text>
              ) : (
                standings[standingsTab].map((row, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.tdRank, { width: 28 }]}>
                      {row.standing_place || idx + 1}
                    </Text>
                    <Text style={[styles.tdTeam, { flex: 1 }]} numberOfLines={1}>
                      {row.standing_team}
                    </Text>
                    <Text style={[styles.tdText, styles.thCenter, { width: 28 }]}>
                      {row.standing_MP || '0'}
                    </Text>
                    <Text style={[styles.tdWin, styles.thCenter, { width: 28 }]}>
                      {row.standing_W || '0'}
                    </Text>
                    <Text style={[styles.tdLose, styles.thCenter, { width: 28 }]}>
                      {row.standing_L || '0'}
                    </Text>
                    <Text style={[styles.tdNrr, styles.thCenter, { width: 44 }]}>
                      {row.standing_NRR || '0.00'}
                    </Text>
                    <Text style={[styles.tdPts, styles.thRight, { width: 36 }]}>
                      {row.standing_Pts || '0'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ) : (
            <View style={styles.standingsCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thText, { width: 36 }]}>Rank</Text>
                <Text style={[styles.thText, { flex: 1 }]}>Nation / Team</Text>
                <Text style={[styles.thText, styles.thRight, { width: 60 }]}>Rating</Text>
              </View>

              {(() => {
                const data = (ICC_RANKINGS_DATA as any)[standingsTab] || [];
                if (data.length === 0) {
                  return <Text style={styles.emptyTableText}>ICC rankings updating...</Text>;
                }
                return data.map((item: any, idx: number) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.tdRank, { width: 36 }]}>{item.rank || idx + 1}</Text>
                    <Text style={[styles.tdTeam, { flex: 1 }]} numberOfLines={1}>
                      {item.country || item.team_name}
                    </Text>
                    <Text style={[styles.tdPts, styles.thRight, { width: 60 }]}>
                      {item.rating || '-'}
                    </Text>
                  </View>
                ));
              })()}
            </View>
          )}
        </ScrollView>
      );
    }

    if (activeTab === 'series') {
      return (
        <ScrollView style={styles.contentScrollView}>
          <Text style={styles.sectionHeaderTitle}>Cricket Series & Tournaments</Text>
          {seriesList.length === 0 ? (
            <Text style={styles.emptyTableText}>No series currently listed.</Text>
          ) : (
            seriesList
              .filter(
                (s) =>
                  !searchQuery ||
                  (s.league_name && s.league_name.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((series) => (
                <Pressable
                  key={series.league_key}
                  style={styles.seriesCard}
                  onPress={() => router.push(`/home/cricket/series/${series.league_key}`)}
                >
                  <View style={styles.seriesCardLeft}>
                    <Text style={styles.seriesEmoji}>🏏</Text>
                    <View style={styles.seriesInfo}>
                      <Text style={styles.seriesTitle} numberOfLines={1}>
                        {series.league_name}
                      </Text>
                      <Text style={styles.seriesCountry}>
                        {series.country_name || 'International'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
                </Pressable>
              ))
          )}
        </ScrollView>
      );
    }

    if (activeTab === 'teams') {
      return (
        <ScrollView style={styles.contentScrollView}>
          <Text style={styles.sectionHeaderTitle}>Trending Cricketers</Text>
          <View style={styles.directoryGrid}>
            {playersList
              .filter(
                (p) =>
                  !searchQuery ||
                  (p.player_name && p.player_name.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((player) => (
                <Pressable
                  key={player.player_key}
                  style={styles.playerCard}
                  onPress={() => router.push(`/home/cricket/players/${player.player_key}`)}
                >
                  <View style={styles.playerAvatar}>
                    {player.player_image ? (
                      <Image source={{ uri: player.player_image }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarInitial}>{player.player_name.charAt(0)}</Text>
                    )}
                  </View>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.player_name}
                  </Text>
                  <Text style={styles.playerRole} numberOfLines={1}>
                    {player.player_role || player.player_type || 'Cricket Star'}
                  </Text>
                </Pressable>
              ))}
          </View>

          <Text style={[styles.sectionHeaderTitle, { marginTop: SPACING.md }]}>Cricket Teams</Text>
          {teamsList
            .filter(
              (t) =>
                !searchQuery ||
                (t.team_name && t.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((team) => (
              <Pressable
                key={team.team_key}
                style={styles.seriesCard}
                onPress={() => router.push(`/home/cricket/teams/${team.team_key}`)}
              >
                <View style={styles.seriesCardLeft}>
                  {team.team_logo ? (
                    <Image
                      source={{ uri: team.team_logo }}
                      style={styles.teamListLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.teamFallbackLogo}>
                      <Text style={styles.teamFallbackText}>{team.team_name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.seriesInfo}>
                    <Text style={styles.seriesTitle} numberOfLines={1}>
                      {team.team_name}
                    </Text>
                    <Text style={styles.seriesCountry}>Squad & Matches</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </Pressable>
            ))}
        </ScrollView>
      );
    }

    if (sections.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏏</Text>
          <Text style={styles.emptyTitle}>
            {activeTab === 'live' ? 'No Live Matches Ongoing' : 'No Matches Found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'live'
              ? 'Check upcoming fixtures or select another date.'
              : 'Try selecting a different date or format filter.'}
          </Text>
          <Pressable style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh Matches</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.event_key)}
        renderItem={({ item }) => <CricketMatchCard match={item} hideLeague />}
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionEmoji}>🏏</Text>
              <Text style={styles.sectionTitle} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <Text style={styles.sectionCount}>({data.length})</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams, series or venues..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </Pressable>
          )}
        </View>
        <Pressable style={styles.reloadBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color="#F59E0B" />
        </Pressable>
      </View>

      {/* Main Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isActive ? '#F59E0B' : '#94A3B8'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {tab.count !== undefined && tab.count > 0 && (
                  <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                    <Text style={[styles.countText, isActive && styles.countTextActive]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Format Filter Chips */}
      {(activeTab === 'live' || activeTab === 'upcoming' || activeTab === 'results') && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formatScroll}>
          <View style={styles.formatContainer}>
            {formatFilters.map((fmt) => {
              const isFmtActive = formatFilter === fmt.id;
              return (
                <Pressable
                  key={fmt.id}
                  style={[styles.formatChip, isFmtActive && styles.formatChipActive]}
                  onPress={() => setFormatFilter(fmt.id)}
                >
                  <Text style={[styles.formatChipText, isFmtActive && styles.formatChipTextActive]}>
                    {fmt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Date Strip for upcoming & results */}
      {activeTab !== 'live' &&
        activeTab !== 'standings' &&
        activeTab !== 'series' &&
        activeTab !== 'teams' && (
          <View style={styles.dateStripContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateStrip}>
                {dateStrip.map((item) => {
                  const isSelected = selectedDate === item.iso;
                  return (
                    <Pressable
                      key={item.iso}
                      style={[styles.dateButton, isSelected && styles.dateButtonActive]}
                      onPress={() => setSelectedDate(item.iso)}
                    >
                      <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
                        {item.dayName}
                      </Text>
                      <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                        {item.dayNumber}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

      {/* Dynamic Screen Content */}
      <View style={styles.body}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
  },
  reloadBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsScroll: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: 8,
    alignItems: 'center',
    height: 44,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  countBadge: {
    marginLeft: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countBadgeActive: {
    backgroundColor: '#F59E0B',
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  countTextActive: {
    color: '#0A0E27',
  },
  formatScroll: {
    maxHeight: 38,
    marginTop: 6,
  },
  formatContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  formatChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  formatChipActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  formatChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  formatChipTextActive: {
    color: '#0A0E27',
    fontWeight: '900',
  },
  dateStripContainer: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateStrip: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  dateButton: {
    width: 58,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  dateButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  dayNameActive: {
    color: '#0A0E27',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 1,
  },
  dayNumberActive: {
    color: '#0A0E27',
  },
  body: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 24,
    paddingTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 6,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  sectionEmoji: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    flex: 1,
  },
  sectionCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: 16,
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  refreshButtonText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  contentScrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  subTabsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  subTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#141C2B',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  subTabPillActive: {
    backgroundColor: '#F59E0B',
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  subTabTextActive: {
    color: '#0A0E27',
    fontWeight: '900',
  },
  standingsCard: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 8,
    marginBottom: 6,
  },
  thText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  thCenter: {
    textAlign: 'center',
  },
  thRight: {
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tdRank: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  tdTeam: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    paddingRight: 6,
  },
  tdText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tdWin: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  tdLose: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  tdNrr: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tdPts: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F59E0B',
  },
  emptyTableText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  seriesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
  },
  seriesCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  seriesEmoji: {
    fontSize: 16,
  },
  seriesInfo: {
    flex: 1,
  },
  seriesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  seriesCountry: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  directoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  playerCard: {
    width: '48%',
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  avatarImg: {
    width: 44,
    height: 44,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F59E0B',
  },
  playerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  playerRole: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  teamListLogo: {
    width: 28,
    height: 28,
  },
  teamFallbackLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamFallbackText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
});
