import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { basketballApiService, ApiBasketballGameItem } from '../../../../../services/basketballApi';

type BasketballDetailTab = 'overview' | 'quarters' | 'stats' | 'h2h' | 'standings';

export default function BasketballMatchDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const gameId = Number(id);

  const [activeTab, setActiveTab] = useState<BasketballDetailTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [game, setGame] = useState<ApiBasketballGameItem | null>(null);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [h2h, setH2H] = useState<ApiBasketballGameItem[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  const loadDetails = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    try {
      const [g, st] = await Promise.allSettled([
        basketballApiService.getGameById(gameId),
        basketballApiService.getGameTeamStatistics({ id: gameId }),
      ]);

      if (g.status === 'fulfilled' && g.value) {
        setGame(g.value);

        // Fetch H2H and Standings in parallel
        if (g.value.teams?.home?.id && g.value.teams?.away?.id) {
          basketballApiService
            .getHeadToHead({
              h2h: `${g.value.teams.home.id}-${g.value.teams.away.id}`,
            })
            .then((res) => setH2H(res || []))
            .catch(() => {});
        }

        if (g.value.league?.id && g.value.league?.season) {
          basketballApiService
            .getStandings({
              league: g.value.league.id,
              season: g.value.league.season,
            })
            .then((res) => setStandings(res || []))
            .catch(() => {});
        }
      }

      if (st.status === 'fulfilled') {
        setTeamStats(st.value || []);
      }
    } catch (err) {
      console.error('[Basketball MatchDetails] Error loading details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [gameId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDetails();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading game center...</Text>
      </View>
    );
  }

  const isLive = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE'].includes(
    game?.status.short || ''
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <Pressable style={styles.navBackBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {game?.league.name || 'Basketball Game Center'}
        </Text>
        <Pressable style={styles.navRefreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={20} color="#F8FAFC" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
            colors={['#F97316']}
          />
        }
      >
        {/* Score Banner */}
        <View style={styles.scoreBanner}>
          <Pressable
            style={styles.leagueBannerInfo}
            onPress={() => {
              if (game?.league?.id) {
                router.push(`/home/basketball/leagues/${String(game.league.id)}` as any);
              }
            }}
          >
            {game?.league?.logo && (
              <Image
                source={{ uri: game.league.logo }}
                style={styles.bannerLeagueLogo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.bannerLeagueText}>
              {game?.league?.name} • {game?.country?.name}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#64748B" style={{ marginLeft: 4 }} />
          </Pressable>

          <View style={styles.bannerTeamsRow}>
            {/* Home Team */}
            <Pressable
              style={styles.bannerTeam}
              onPress={() => {
                if (game?.teams?.home?.id) {
                  router.push(`/home/basketball/teams/${String(game.teams.home.id)}` as any);
                }
              }}
            >
              {game?.teams?.home?.logo ? (
                <Image
                  source={{ uri: game.teams.home.logo }}
                  style={styles.bannerTeamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.fallbackLogo}>
                  <Ionicons name="basketball-outline" size={28} color="#3B82F6" />
                </View>
              )}
              <Text style={styles.bannerTeamName} numberOfLines={2}>
                {game?.teams?.home?.name || 'Home'}
              </Text>
            </Pressable>

            {/* Score & Status */}
            <View style={styles.bannerScoreBox}>
              <View style={[styles.statusBadge, isLive && styles.liveStatusBadge]}>
                {isLive && <View style={styles.livePulse} />}
                <Text style={[styles.statusBadgeText, isLive && styles.liveStatusBadgeText]}>
                  {game?.status?.short || 'VS'}
                </Text>
              </View>
              <Text style={styles.bannerScoreNumbers}>
                {game?.scores?.home?.total ?? '-'}:{game?.scores?.away?.total ?? '-'}
              </Text>
              {game?.time && (
                <Text style={styles.bannerTimeText}>
                  {game.date} • {game.time}
                </Text>
              )}
            </View>

            {/* Away Team */}
            <Pressable
              style={styles.bannerTeam}
              onPress={() => {
                if (game?.teams?.away?.id) {
                  router.push(`/home/basketball/teams/${String(game.teams.away.id)}` as any);
                }
              }}
            >
              {game?.teams?.away?.logo ? (
                <Image
                  source={{ uri: game.teams.away.logo }}
                  style={styles.bannerTeamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.fallbackLogo}>
                  <Ionicons name="basketball-outline" size={28} color="#3B82F6" />
                </View>
              )}
              <Text style={styles.bannerTeamName} numberOfLines={2}>
                {game?.teams?.away?.name || 'Away'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 5 Tabs Segment */}
        <View style={styles.tabSegments}>
          {(['overview', 'quarters', 'stats', 'h2h', 'standings'] as BasketballDetailTab[]).map(
            (tab) => (
              <Pressable
                key={tab}
                style={[styles.segmentBtn, activeTab === tab && styles.activeSegmentBtn]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[styles.segmentBtnText, activeTab === tab && styles.activeSegmentBtnText]}
                >
                  {tab.toUpperCase()}
                </Text>
              </Pressable>
            )
          )}
        </View>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Game Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>League</Text>
                <Text style={styles.infoValue}>{game?.league.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Season</Text>
                <Text style={styles.infoValue}>{game?.league.season}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>
                  {game?.date} {game?.time}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{game?.status.long || game?.status.short}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: Quarters Breakdown */}
        {activeTab === 'quarters' && (
          <View style={styles.tabSection}>
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Quarter-by-Quarter Scores</Text>
              <View style={styles.quartersTable}>
                {/* Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { flex: 1 }]}>Team</Text>
                  <Text style={styles.tableColStatHeader}>Q1</Text>
                  <Text style={styles.tableColStatHeader}>Q2</Text>
                  <Text style={styles.tableColStatHeader}>Q3</Text>
                  <Text style={styles.tableColStatHeader}>Q4</Text>
                  {game?.scores.home.over_time !== null && (
                    <Text style={styles.tableColStatHeader}>OT</Text>
                  )}
                  <Text
                    style={[styles.tableColStatHeader, { color: '#F97316', fontWeight: '900' }]}
                  >
                    TOT
                  </Text>
                </View>

                {/* Home Team Row */}
                <View style={styles.tableScoreRow}>
                  <Text style={styles.tableRowTeamName} numberOfLines={1}>
                    {game?.teams.home.name}
                  </Text>
                  <Text style={styles.tableScoreVal}>{game?.scores.home.quarter_1 ?? '-'}</Text>
                  <Text style={styles.tableScoreVal}>{game?.scores.home.quarter_2 ?? '-'}</Text>
                  <Text style={styles.tableScoreVal}>{game?.scores.home.quarter_3 ?? '-'}</Text>
                  <Text style={styles.tableScoreVal}>{game?.scores.home.quarter_4 ?? '-'}</Text>
                  {game?.scores.home.over_time !== null && (
                    <Text style={styles.tableScoreVal}>{game?.scores.home.over_time ?? '-'}</Text>
                  )}
                  <Text style={[styles.tableScoreVal, styles.tableScoreTotal]}>
                    {game?.scores.home.total ?? '-'}
                  </Text>
                </View>

                {/* Away Team Row */}
                <View style={styles.tableScoreRow}>
                  <Text style={styles.tableRowTeamName} numberOfLines={1}>
                    {game?.teams.away.name}
                  </Text>
                  <Text style={styles.tableScoreVal}>{game?.scores.away.quarter_1 ?? '-'}</Text>
                  <Text style={styles.tableScoreVal}>{game?.scores.away.quarter_2 ?? '-'}</Text>
                  <Text style={styles.tableScoreVal}>{game?.scores.away.quarter_3 ?? '-'}</Text>
                  <Text style={styles.tableScoreVal}>{game?.scores.away.quarter_4 ?? '-'}</Text>
                  {game?.scores.away.over_time !== null && (
                    <Text style={styles.tableScoreVal}>{game?.scores.away.over_time ?? '-'}</Text>
                  )}
                  <Text style={[styles.tableScoreVal, styles.tableScoreTotal]}>
                    {game?.scores.away.total ?? '-'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: Team Statistics */}
        {activeTab === 'stats' && (
          <View style={styles.tabSection}>
            {teamStats.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Team statistics available for live and completed games.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeaderTitle}>Team Statistics</Text>
                {teamStats.map((st, idx) => (
                  <View key={idx} style={styles.statComparisonRow}>
                    <Text style={styles.statTypeName}>{st.type || `Stat #${idx + 1}`}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tab 4: Head-to-Head */}
        {activeTab === 'h2h' && (
          <View style={styles.tabSection}>
            {h2h.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No head-to-head match history found.</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeaderTitle}>Past Head-to-Head Clashes</Text>
                {h2h.slice(0, 5).map((h) => (
                  <View key={h.id} style={styles.h2hRow}>
                    <Text style={styles.h2hDate}>{h.date}</Text>
                    <View style={styles.h2hMatch}>
                      <Text style={styles.h2hTeam} numberOfLines={1}>
                        {h.teams.home.name}
                      </Text>
                      <Text style={styles.h2hScore}>
                        {h.scores.home.total ?? '-'}:{h.scores.away.total ?? '-'}
                      </Text>
                      <Text style={styles.h2hTeam} numberOfLines={1}>
                        {h.teams.away.name}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tab 5: Standings */}
        {activeTab === 'standings' && (
          <View style={styles.tabSection}>
            {standings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Standings not available for this league.</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeaderTitle}>{game?.league.name} Standings</Text>
                {standings.map((stRow, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableRank}>{stRow.position || idx + 1}</Text>
                    <Text style={styles.tableName} numberOfLines={1}>
                      {stRow.team?.name || 'Team'}
                    </Text>
                    <Text style={styles.tableStat}>{stRow.games?.win?.total ?? 0}W</Text>
                    <Text style={styles.tableStat}>{stRow.games?.lose?.total ?? 0}L</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0B0F17',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 14,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  navBackBtn: {
    padding: 6,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  navRefreshBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scoreBanner: {
    backgroundColor: '#141C2B',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  leagueBannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  bannerLeagueLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  bannerLeagueText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bannerTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTeam: {
    flex: 1,
    alignItems: 'center',
  },
  bannerTeamLogo: {
    width: 52,
    height: 52,
    marginBottom: 8,
  },
  fallbackLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bannerTeamName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  bannerScoreBox: {
    minWidth: 80,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
    gap: 4,
  },
  liveStatusBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  livePulse: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3B82F6',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  liveStatusBadgeText: {
    color: '#60A5FA',
  },
  bannerScoreNumbers: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.5,
  },
  bannerTimeText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  tabSegments: {
    flexDirection: 'row',
    backgroundColor: '#141C2B',
    marginHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    padding: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeSegmentBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  segmentBtnText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeSegmentBtnText: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  tabSection: {
    paddingHorizontal: SPACING.sm,
  },
  card: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.sm,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  emptyCard: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 11,
  },
  quartersTable: {
    marginTop: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tableColHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  tableColStatHeader: {
    width: 28,
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  tableScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tableRowTeamName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  tableScoreVal: {
    width: 28,
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  tableScoreTotal: {
    color: '#60A5FA',
    fontWeight: '900',
  },
  statComparisonRow: {
    marginBottom: SPACING.sm,
  },
  statTypeName: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
  h2hRow: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  h2hDate: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 2,
  },
  h2hMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h2hTeam: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  h2hScore: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tableRank: {
    width: 20,
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tableName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  tableStat: {
    width: 32,
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'right',
  },
});
