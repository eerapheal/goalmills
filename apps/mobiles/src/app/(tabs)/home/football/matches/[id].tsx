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
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import {
  apiFootballService,
  ApiFootballFixtureItem,
  ApiFootballEvent,
  ApiFootballLineup,
  ApiFootballTeamStats,
  ApiFootballStandingItem,
} from '../../../../../services/apiFootball';

const { width } = Dimensions.get('window');

type DetailTab = 'overview' | 'events' | 'lineups' | 'stats' | 'standings';

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const matchId = Number(id);

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fixture, setFixture] = useState<ApiFootballFixtureItem | null>(null);
  const [events, setEvents] = useState<ApiFootballEvent[]>([]);
  const [lineups, setLineups] = useState<ApiFootballLineup[]>([]);
  const [stats, setStats] = useState<ApiFootballTeamStats[]>([]);
  const [standings, setStandings] = useState<ApiFootballStandingItem[]>([]);

  const loadMatchDetails = useCallback(async () => {
    if (!matchId || isNaN(matchId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [fix, evs, lns, st] = await Promise.allSettled([
        apiFootballService.getFixtureById(matchId),
        apiFootballService.getFixtureEvents({ fixture: matchId }),
        apiFootballService.getFixtureLineups({ fixture: matchId }),
        apiFootballService.getFixtureStatistics({ fixture: matchId }),
      ]);

      if (fix.status === 'fulfilled' && fix.value) {
        setFixture(fix.value);
        if (fix.value?.league?.id) {
          apiFootballService
            .getStandings({ league: fix.value.league.id, season: fix.value.league.season })
            .then((res) => setStandings(Array.isArray(res) ? res : []))
            .catch(() => {});
        }
      } else {
        setFixture(null);
      }

      if (evs.status === 'fulfilled') setEvents(Array.isArray(evs.value) ? evs.value : []);
      if (lns.status === 'fulfilled') setLineups(Array.isArray(lns.value) ? lns.value : []);
      if (st.status === 'fulfilled') setStats(Array.isArray(st.value) ? st.value : []);
    } catch (err) {
      console.warn('[MatchDetails] Error loading details:', err);
      setFixture(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadMatchDetails();
  }, [loadMatchDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMatchDetails();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading match center...</Text>
      </View>
    );
  }

  if (!fixture) {
    return (
      <View style={styles.container}>
        <View style={styles.navBar}>
          <Pressable style={styles.navBackBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
          </Pressable>
          <Text style={styles.navTitle}>Match Details</Text>
          <Pressable style={styles.navRefreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={20} color="#F8FAFC" />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="football-outline" size={48} color="#64748B" />
          <Text style={styles.emptyTitle}>Match Data Unavailable</Text>
          <Text style={styles.emptySubtitle}>
            Unable to load fixture details for #{id || 'unknown'}. Please check your connection or
            try again.
          </Text>
          <Pressable style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(
    fixture?.fixture?.status?.short || ''
  );

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <Pressable style={styles.navBackBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {fixture?.league?.name || 'Match Center'}
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
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* Score Banner */}
        <View style={styles.scoreBanner}>
          <View style={styles.leagueBannerInfo}>
            {fixture?.league?.logo && (
              <Image
                source={{ uri: fixture.league.logo }}
                style={styles.bannerLeagueLogo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.bannerLeagueText}>
              {fixture?.league?.name} • {fixture?.league?.round || 'Matchday'}
            </Text>
          </View>

          <View style={styles.bannerTeamsRow}>
            {/* Home Team */}
            <View style={styles.bannerTeam}>
              {fixture?.teams?.home?.logo ? (
                <Image
                  source={{ uri: fixture.teams.home.logo }}
                  style={styles.bannerTeamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.fallbackLogo}>
                  <Ionicons name="shield-outline" size={28} color="#94A3B8" />
                </View>
              )}
              <Text style={styles.bannerTeamName} numberOfLines={2}>
                {fixture?.teams?.home?.name || 'Home Team'}
              </Text>
            </View>

            {/* Score & Status */}
            <View style={styles.bannerScoreBox}>
              <View style={[styles.statusBadge, isLive && styles.liveStatusBadge]}>
                {isLive && <View style={styles.livePulse} />}
                <Text style={[styles.statusBadgeText, isLive && styles.liveStatusBadgeText]}>
                  {fixture?.fixture?.status?.short || 'VS'}
                </Text>
              </View>
              <Text style={styles.bannerScoreNumbers}>
                {fixture?.goals?.home !== null && fixture?.goals?.home !== undefined
                  ? fixture.goals.home
                  : '-'}{' '}
                :{' '}
                {fixture?.goals?.away !== null && fixture?.goals?.away !== undefined
                  ? fixture.goals.away
                  : '-'}
              </Text>
              {fixture?.fixture?.venue?.name && (
                <Text style={styles.bannerVenueText} numberOfLines={1}>
                  📍 {fixture.fixture.venue.name}
                </Text>
              )}
            </View>

            {/* Away Team */}
            <View style={styles.bannerTeam}>
              {fixture?.teams?.away?.logo ? (
                <Image
                  source={{ uri: fixture.teams.away.logo }}
                  style={styles.bannerTeamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.fallbackLogo}>
                  <Ionicons name="shield-outline" size={28} color="#94A3B8" />
                </View>
              )}
              <Text style={styles.bannerTeamName} numberOfLines={2}>
                {fixture?.teams?.away?.name || 'Away Team'}
              </Text>
            </View>
          </View>
        </View>

        {/* 5 Tabs Segment */}
        <View style={styles.tabSegments}>
          {(['overview', 'events', 'lineups', 'stats', 'standings'] as DetailTab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.segmentBtn, activeTab === tab && styles.activeSegmentBtn]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[styles.segmentBtnText, activeTab === tab && styles.activeSegmentBtnText]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Match Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>
                  {fixture?.fixture?.date ? new Date(fixture.fixture.date).toLocaleString() : 'TBD'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Referee</Text>
                <Text style={styles.infoValue}>{fixture?.fixture?.referee || 'Not Assigned'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Stadium</Text>
                <Text style={styles.infoValue}>
                  {fixture?.fixture?.venue?.name || 'Venue TBD'}
                  {fixture?.fixture?.venue?.city ? ` (${fixture.fixture.venue.city})` : ''}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Half-Time Result</Text>
                <Text style={styles.infoValue}>
                  {fixture?.score?.halftime?.home ?? '-'} - {fixture?.score?.halftime?.away ?? '-'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: Timeline / Events */}
        {activeTab === 'events' && (
          <View style={styles.tabSection}>
            {events.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No match events recorded yet.</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeaderTitle}>Key Events Timeline</Text>
                {events.map((ev, idx) => {
                  const isHome = ev?.team?.id === fixture?.teams?.home?.id;
                  const isGoal = ev?.type === 'Goal';
                  const isCard = ev?.type === 'Card';
                  const isYellow = isCard && String(ev?.detail || '').includes('Yellow');

                  return (
                    <View
                      key={idx}
                      style={[
                        styles.timelineRow,
                        isHome ? styles.timelineLeft : styles.timelineRight,
                      ]}
                    >
                      <View style={styles.eventMinuteBox}>
                        <Text style={styles.eventMinuteText}>{ev?.time?.elapsed || 0}'</Text>
                      </View>
                      <View style={styles.eventDetailsBox}>
                        <View style={styles.eventTypeRow}>
                          {isGoal && <Ionicons name="football" size={16} color="#10B981" />}
                          {isCard && (
                            <View
                              style={[
                                styles.cardIcon,
                                { backgroundColor: isYellow ? '#F59E0B' : '#EF4444' },
                              ]}
                            />
                          )}
                          {ev?.type === 'subst' && (
                            <Ionicons name="swap-horizontal" size={16} color="#3B82F6" />
                          )}
                          <Text style={styles.eventPlayerName}>{ev?.player?.name || 'Player'}</Text>
                        </View>
                        {ev?.assist?.name ? (
                          <Text style={styles.eventAssistText}>Assist: {ev.assist.name}</Text>
                        ) : null}
                        {ev?.detail ? (
                          <Text style={styles.eventDetailText}>{ev.detail}</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Tab 3: Lineups & 2D Tactical Pitch */}
        {activeTab === 'lineups' && (
          <View style={styles.tabSection}>
            {lineups.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Lineups are announced ~1 hour before kickoff.</Text>
              </View>
            ) : (
              <>
                {/* 2D Pitch Graphic */}
                <View style={styles.pitchContainer}>
                  <View style={styles.pitchCenterCircle} />
                  <View style={styles.pitchHalfLine} />

                  {/* Home Team Formations */}
                  <View style={styles.pitchTeamHalf}>
                    <Text style={styles.pitchFormationHeader}>
                      {lineups[0]?.team?.name || 'Home'} ({lineups[0]?.formation || '4-3-3'})
                    </Text>
                    <View style={styles.pitchGrid}>
                      {(lineups[0]?.startXI || []).slice(0, 11).map((p: any, idx: number) => (
                        <View key={idx} style={styles.pitchPlayerNode}>
                          <View style={[styles.pitchJersey, { backgroundColor: '#3B82F6' }]}>
                            <Text style={styles.pitchJerseyNum}>
                              {p?.player?.number ?? idx + 1}
                            </Text>
                          </View>
                          <Text style={styles.pitchPlayerName} numberOfLines={1}>
                            {(p?.player?.name || 'Player').split(' ').pop()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Away Team Formations */}
                  {lineups[1] && (
                    <View style={styles.pitchTeamHalf}>
                      <Text style={styles.pitchFormationHeader}>
                        {lineups[1]?.team?.name || 'Away'} ({lineups[1]?.formation || '4-3-3'})
                      </Text>
                      <View style={styles.pitchGrid}>
                        {(lineups[1]?.startXI || []).slice(0, 11).map((p: any, idx: number) => (
                          <View key={idx} style={styles.pitchPlayerNode}>
                            <View style={[styles.pitchJersey, { backgroundColor: '#EF4444' }]}>
                              <Text style={styles.pitchJerseyNum}>
                                {p?.player?.number ?? idx + 1}
                              </Text>
                            </View>
                            <Text style={styles.pitchPlayerName} numberOfLines={1}>
                              {(p?.player?.name || 'Player').split(' ').pop()}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* Substitutes Bench */}
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>Substitutes</Text>
                  <View style={styles.benchRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.benchTeamHeader}>{lineups[0]?.team?.name || 'Home'}</Text>
                      {(lineups[0]?.substitutes || []).map((s: any, idx: number) => (
                        <Text key={idx} style={styles.benchPlayerText}>
                          {s?.player?.number ?? '-'}. {s?.player?.name || 'Player'} (
                          {s?.player?.pos || 'SUB'})
                        </Text>
                      ))}
                    </View>
                    {lineups[1] && (
                      <View style={{ flex: 1 }}>
                        <Text style={styles.benchTeamHeader}>
                          {lineups[1]?.team?.name || 'Away'}
                        </Text>
                        {(lineups[1]?.substitutes || []).map((s: any, idx: number) => (
                          <Text key={idx} style={styles.benchPlayerText}>
                            {s?.player?.number ?? '-'}. {s?.player?.name || 'Player'} (
                            {s?.player?.pos || 'SUB'})
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Tab 4: Live Statistics (Comparison Bars) */}
        {activeTab === 'stats' && (
          <View style={styles.tabSection}>
            {stats.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Match statistics available during and after the game.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeaderTitle}>Team Statistics</Text>
                {(stats[0]?.statistics || []).map((st: any, idx: number) => {
                  const awayStat = (stats[1]?.statistics || []).find(
                    (s: any) => s?.type === st?.type
                  );
                  const homeVal = String(st?.value ?? 0).replace('%', '');
                  const awayVal = String(awayStat?.value ?? 0).replace('%', '');
                  const numHome = Number(homeVal) || 1;
                  const numAway = Number(awayVal) || 1;
                  const total = numHome + numAway || 2;
                  const homePercent = (numHome / total) * 100;

                  return (
                    <View key={idx} style={styles.statComparisonRow}>
                      <View style={styles.statLabelsRow}>
                        <Text style={styles.statValHome}>{st?.value ?? '0'}</Text>
                        <Text style={styles.statTypeName}>{st?.type || 'Stat'}</Text>
                        <Text style={styles.statValAway}>{awayStat?.value ?? '0'}</Text>
                      </View>
                      <View style={styles.dualBarContainer}>
                        <View style={[styles.homeProgressBar, { width: `${homePercent}%` }]} />
                        <View
                          style={[styles.awayProgressBar, { width: `${100 - homePercent}%` }]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Tab 5: Standings Table */}
        {activeTab === 'standings' && (
          <View style={styles.tabSection}>
            {standings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Standings table not available for this league.</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeaderTitle}>
                  {fixture?.league?.name || 'League'} Standings
                </Text>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { width: 28 }]}>#</Text>
                  <Text style={[styles.tableColHeader, { flex: 1 }]}>Team</Text>
                  <Text style={[styles.tableColHeader, { width: 30, textAlign: 'center' }]}>P</Text>
                  <Text style={[styles.tableColHeader, { width: 30, textAlign: 'center' }]}>
                    GD
                  </Text>
                  <Text style={[styles.tableColHeader, { width: 36, textAlign: 'right' }]}>
                    PTS
                  </Text>
                </View>
                {standings.map((row) => {
                  const isCurrent =
                    row?.team?.id === fixture?.teams?.home?.id ||
                    row?.team?.id === fixture?.teams?.away?.id;
                  return (
                    <View
                      key={row?.rank || Math.random()}
                      style={[styles.tableRow, isCurrent && styles.tableRowHighlight]}
                    >
                      <Text style={[styles.tableRank, isCurrent && styles.textHighlight]}>
                        {row?.rank ?? '-'}
                      </Text>
                      {row?.team?.logo ? (
                        <Image
                          source={{ uri: row.team.logo }}
                          style={styles.tableTeamLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={{ width: 16, height: 16, marginRight: 6 }} />
                      )}
                      <Text
                        style={[styles.tableTeamName, isCurrent && styles.textHighlight]}
                        numberOfLines={1}
                      >
                        {row?.team?.name || 'Team'}
                      </Text>
                      <Text style={styles.tableStat}>{row?.all?.played ?? '-'}</Text>
                      <Text style={styles.tableStat}>{row?.goalsDiff ?? '-'}</Text>
                      <Text style={[styles.tablePts, isCurrent && styles.textHighlight]}>
                        {row?.points ?? '-'}
                      </Text>
                    </View>
                  );
                })}
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
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  bannerScoreBox: {
    minWidth: 100,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 6,
    gap: 4,
  },
  liveStatusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  liveStatusBadgeText: {
    color: '#10B981',
  },
  bannerScoreNumbers: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
  },
  bannerVenueText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  tabSegments: {
    flexDirection: 'row',
    backgroundColor: '#141C2B',
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeSegmentBtn: {
    backgroundColor: '#1E293B',
  },
  segmentBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeSegmentBtnText: {
    color: '#10B981',
    fontWeight: '700',
  },
  tabSection: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.md,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  emptyCard: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
  timelineRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
  },
  timelineLeft: {},
  timelineRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  eventMinuteBox: {
    width: 38,
    alignItems: 'center',
  },
  eventMinuteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  eventDetailsBox: {
    flex: 1,
    marginLeft: 8,
  },
  eventTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardIcon: {
    width: 10,
    height: 14,
    borderRadius: 2,
  },
  eventPlayerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  eventAssistText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  eventDetailText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  pitchContainer: {
    backgroundColor: '#0F281E',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: '#10B981',
    padding: 12,
    marginBottom: SPACING.md,
    position: 'relative',
    minHeight: 280,
    justifyContent: 'space-between',
  },
  pitchHalfLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pitchCenterCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pitchTeamHalf: {
    paddingVertical: 6,
  },
  pitchFormationHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 6,
  },
  pitchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  pitchPlayerNode: {
    alignItems: 'center',
    width: (width - 80) / 5,
  },
  pitchJersey: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  pitchJerseyNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pitchPlayerName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
    textAlign: 'center',
  },
  benchRow: {
    flexDirection: 'row',
  },
  benchTeamHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  benchPlayerText: {
    fontSize: 11,
    color: '#64748B',
    paddingVertical: 2,
  },
  statComparisonRow: {
    marginBottom: SPACING.md,
  },
  statLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statValHome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
    width: 40,
  },
  statTypeName: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  statValAway: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    width: 40,
    textAlign: 'right',
  },
  dualBarContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  homeProgressBar: {
    backgroundColor: '#3B82F6',
    height: '100%',
  },
  awayProgressBar: {
    backgroundColor: '#EF4444',
    height: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tableColHeader: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tableRowHighlight: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 4,
  },
  tableRank: {
    width: 28,
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tableTeamLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  tableTeamName: {
    flex: 1,
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  tableStat: {
    width: 30,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  tablePts: {
    width: 36,
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'right',
  },
  textHighlight: {
    color: '#10B981',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
