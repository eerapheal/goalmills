import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { COMPETITIONS_REGISTRY } from '../../../utils/entityRegistry';
import { FootballStanding, FootballTopscorer, FootballProbability, FootballOdds } from '@goalmills/types';
import { LiveNewsFlashTicker } from '../../../components/LiveNewsFlashTicker';
import { MatchOddsModal } from '../../../components/MatchOddsModal';

type StatsTab = 'standings' | 'topscorers' | 'predictions' | 'odds';

export default function StatsScreen() {
  const router = useRouter();
  const [selectedCompSlug, setSelectedCompSlug] = useState('premier-league');
  const [activeTab, setActiveTab] = useState<StatsTab>('standings');
  const [standingView, setStandingView] = useState<'total' | 'home' | 'away'>('total');

  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
  const [probabilities, setProbabilities] = useState<FootballProbability[]>([]);
  const [oddsList, setOddsList] = useState<{ matchId: string; homeTeam: string; awayTeam: string; date: string; time: string; odds: FootballOdds[] }[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [oddsModal, setOddsModal] = useState<{ visible: boolean; matchId: string; home: string; away: string }>({
    visible: false,
    matchId: '',
    home: '',
    away: '',
  });

  const selectedComp =
    COMPETITIONS_REGISTRY[selectedCompSlug] || COMPETITIONS_REGISTRY['premier-league'];

  const loadData = async (compMeta = selectedComp) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const compId = compMeta.id;

    try {
      const [standingsRes, scorersRes, probRes, fixRes] = await Promise.allSettled([
        advancedFootballApi.getStandings(compId),
        advancedFootballApi.getTopscorers(compId),
        advancedFootballApi.getProbabilities({ leagueId: compId, from: today, to: today }),
        advancedFootballApi.getFixtures({ leagueId: compId, from: today, to: today }),
      ]);

      if (standingsRes.status === 'fulfilled' && standingsRes.value?.result) {
        const res = standingsRes.value.result as any;
        const table = res?.[standingView] || res?.total || (Array.isArray(res) ? res : []);
        setStandings(table);
      } else {
        setStandings([]);
      }

      if (scorersRes.status === 'fulfilled' && scorersRes.value?.result) {
        setTopscorers(Array.isArray(scorersRes.value.result) ? scorersRes.value.result.slice(0, 15) : []);
      } else {
        setTopscorers([]);
      }

      if (probRes.status === 'fulfilled' && probRes.value?.result) {
        setProbabilities(Array.isArray(probRes.value.result) ? probRes.value.result : []);
      } else {
        setProbabilities([]);
      }

      // Fetch odds for today's fixtures
      if (fixRes.status === 'fulfilled' && Array.isArray(fixRes.value?.result)) {
        const matches = fixRes.value.result.slice(0, 8);
        const oddsPromises = matches.map(async (m) => {
          try {
            const oRes = await advancedFootballApi.getOdds({ matchId: Number(m.event_key) });
            const matchOdds = oRes?.result?.[String(m.event_key)] || [];
            return {
              matchId: String(m.event_key),
              homeTeam: m.event_home_team,
              awayTeam: m.event_away_team,
              date: m.event_date,
              time: m.event_time,
              odds: Array.isArray(matchOdds) ? matchOdds : [],
            };
          } catch {
            return null;
          }
        });
        const resolvedOdds = await Promise.all(oddsPromises);
        setOddsList(resolvedOdds.filter((x): x is NonNullable<typeof x> => Boolean(x && x.odds.length > 0)));
      } else {
        setOddsList([]);
      }
    } catch (err) {
      console.error('Error loading stats on mobile:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCompSlug, standingView]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const tabs: { id: StatsTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'standings', label: 'Standings', icon: 'trophy-outline' },
    { id: 'topscorers', label: 'Top Scorers', icon: 'football-outline' },
    { id: 'predictions', label: 'AI Odds', icon: 'analytics-outline' },
    { id: 'odds', label: 'Bookmakers', icon: 'trending-up-outline' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Live Flash Ticker ── */}
      <LiveNewsFlashTicker badgeText="TABLES WIRE" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="bar-chart" size={14} color="#f59e0b" />
          <Text style={styles.badgeText}>STATISTICS & TELEMETRY</Text>
        </View>
        <Text style={styles.title}>GoalMills Stats Center</Text>
        <Text style={styles.subtitle}>
          Live league tables, golden boot race, bookmaker odds & AI win matrices
        </Text>
      </View>

      {/* Competition Selector Ribbon */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.compScroll}>
        {Object.values(COMPETITIONS_REGISTRY).map((comp) => {
          const isSelected = selectedCompSlug === comp.slug;
          return (
            <TouchableOpacity
              key={comp.slug}
              onPress={() => setSelectedCompSlug(comp.slug)}
              style={[styles.compButton, isSelected && styles.compButtonActive]}
            >
              {comp.logo ? <Image source={{ uri: comp.logo }} style={styles.compLogo} /> : null}
              <Text style={[styles.compText, isSelected && styles.compTextActive]}>
                {comp.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={13} color={active ? '#0F172A' : '#64748B'} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Standings View Filter (Total / Home / Away) */}
      {activeTab === 'standings' && (
        <View style={styles.standingToggleRow}>
          {(['total', 'home', 'away'] as const).map((v) => (
            <Pressable
              key={v}
              style={[styles.standingToggleBtn, standingView === v && styles.standingToggleBtnActive]}
              onPress={() => setStandingView(v)}
            >
              <Text style={[styles.standingToggleLabel, standingView === v && { color: '#F8FAFC' }]}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loaderText}>Syncing competition analytics...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* ── 1. STANDINGS TABLE ── */}
          {activeTab === 'standings' && (
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: 30 }]}>#</Text>
                <Text style={[styles.th, { flex: 1 }]}>Club</Text>
                <Text style={[styles.th, { width: 32, textAlign: 'center' }]}>P</Text>
                <Text style={[styles.th, { width: 32, textAlign: 'center', color: '#34D399' }]}>W</Text>
                <Text style={[styles.th, { width: 32, textAlign: 'center', color: '#94A3B8' }]}>D</Text>
                <Text style={[styles.th, { width: 32, textAlign: 'center', color: '#F87171' }]}>L</Text>
                <Text style={[styles.th, { width: 32, textAlign: 'center' }]}>GD</Text>
                <Text style={[styles.th, { width: 38, textAlign: 'right', color: '#FBBF24' }]}>Pts</Text>
              </View>

              {standings.length === 0 ? (
                <Text style={styles.emptyText}>No standings data available for this competition.</Text>
              ) : (
                standings.map((item, idx) => {
                  const rank = Number(item.standing_place || idx + 1);
                  const isUCL = rank <= 4;
                  const isUEL = rank === 5 || rank === 6;
                  const isRel = rank >= 18;

                  return (
                    <Pressable
                      key={item.standing_place || idx}
                      style={styles.tableRow}
                      onPress={() => item.team_key && router.push(`/(tabs)/home/football/teams/${item.team_key}` as any)}
                    >
                      <View style={[styles.rankBadge, isUCL && styles.rankUCL, isUEL && styles.rankUEL, isRel && styles.rankRel]}>
                        <Text style={styles.tdRank}>{item.standing_place || idx + 1}</Text>
                      </View>
                      <Text style={[styles.tdClub, { flex: 1 }]} numberOfLines={1}>
                        {item.standing_team}
                      </Text>
                      <Text style={[styles.td, { width: 32, textAlign: 'center' }]}>{item.standing_P || 0}</Text>
                      <Text style={[styles.td, { width: 32, textAlign: 'center', color: '#34D399' }]}>{item.standing_W || 0}</Text>
                      <Text style={[styles.td, { width: 32, textAlign: 'center', color: '#94A3B8' }]}>{item.standing_D || 0}</Text>
                      <Text style={[styles.td, { width: 32, textAlign: 'center', color: '#F87171' }]}>{item.standing_L || 0}</Text>
                      <Text style={[styles.td, { width: 32, textAlign: 'center' }]}>{item.standing_GD || 0}</Text>
                      <Text style={[styles.tdPts, { width: 38, textAlign: 'right' }]}>{item.standing_PTS || 0}</Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}

          {/* ── 2. TOP SCORERS ── */}
          {activeTab === 'topscorers' && (
            <View style={{ gap: 8 }}>
              {topscorers.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 36 }}>👟</Text>
                  <Text style={styles.emptyTitle}>No Top Scorers</Text>
                  <Text style={styles.emptyText}>Top scorer records pending for this season.</Text>
                </View>
              ) : (
                topscorers.map((scorer, idx) => (
                  <Pressable
                    key={scorer.player_key || idx}
                    style={styles.scorerCard}
                    onPress={() => scorer.player_key && router.push(`/(tabs)/home/football/players/${scorer.player_key}` as any)}
                  >
                    <Text style={styles.scorerRank}>#{scorer.player_place || idx + 1}</Text>
                    {scorer.player_image ? (
                      <Image source={{ uri: scorer.player_image }} style={styles.scorerPhoto} />
                    ) : (
                      <View style={[styles.scorerPhoto, styles.scorerPhotoPlaceholder]}>
                        <Text style={{ fontSize: 20 }}>👤</Text>
                      </View>
                    )}
                    <View style={styles.scorerInfo}>
                      <Text style={styles.scorerName}>{scorer.player_name}</Text>
                      <Text style={styles.scorerTeam}>{scorer.team_name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.goalsText}>{scorer.goals} ⚽</Text>
                      {scorer.penalty_goals && scorer.penalty_goals !== '0' && (
                        <Text style={styles.pensText}>({scorer.penalty_goals} pens)</Text>
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          )}

          {/* ── 3. AI PREDICTIONS ── */}
          {activeTab === 'predictions' && (
            <View style={{ gap: 10 }}>
              {probabilities.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 36 }}>🤖</Text>
                  <Text style={styles.emptyTitle}>No AI Predictions</Text>
                  <Text style={styles.emptyText}>No matches scheduled today in this competition with win probability models.</Text>
                </View>
              ) : (
                probabilities.map((item, idx) => {
                  const hw = Number(item.event_HW) || 0;
                  const d = Number(item.event_D) || 0;
                  const aw = Number(item.event_AW) || 0;

                  return (
                    <Pressable
                      key={idx}
                      style={styles.predCard}
                      onPress={() => item.event_key && router.push(`/(tabs)/home/football/matches/${item.event_key}` as any)}
                    >
                      <View style={styles.predHeader}>
                        <Text style={styles.predLeague} numberOfLines={1}>{item.league_name}</Text>
                        <Text style={styles.predTime}>{item.event_time}</Text>
                      </View>
                      <View style={styles.predTeams}>
                        <Text style={styles.predTeamHome} numberOfLines={1}>{item.event_home_team}</Text>
                        <Text style={styles.predVS}>VS</Text>
                        <Text style={styles.predTeamAway} numberOfLines={1}>{item.event_away_team}</Text>
                      </View>
                      <View style={styles.predBarLabels}>
                        <Text style={[styles.predBarLabel, { color: '#60A5FA' }]}>{hw}%</Text>
                        <Text style={[styles.predBarLabel, { color: '#94A3B8' }]}>Draw {d}%</Text>
                        <Text style={[styles.predBarLabel, { color: '#FBBF24' }]}>{aw}%</Text>
                      </View>
                      <View style={styles.predBar}>
                        <View style={{ flex: hw || 1, backgroundColor: '#2563EB', height: '100%' }} />
                        <View style={{ flex: d || 1, backgroundColor: '#475569', height: '100%' }} />
                        <View style={{ flex: aw || 1, backgroundColor: '#D97706', height: '100%' }} />
                      </View>
                      <View style={styles.predMetrics}>
                        <Text style={styles.predMetric}>Over 2.5: <Text style={{ color: '#34D399' }}>{item.event_O}%</Text></Text>
                        <Text style={styles.predMetric}>BTS: <Text style={{ color: '#FBBF24' }}>{item.event_bts}%</Text></Text>
                        <Text style={styles.predMetric}>Clean Sheet: <Text style={{ color: '#67E8F9' }}>{item.event_ots}%</Text></Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}

          {/* ── 4. BOOKMAKER ODDS ── */}
          {activeTab === 'odds' && (
            <View style={{ gap: 10 }}>
              {oddsList.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 36 }}>📊</Text>
                  <Text style={styles.emptyTitle}>No Live Odds</Text>
                  <Text style={styles.emptyText}>Bookmaker odds will open closer to kickoff for today&apos;s fixtures.</Text>
                </View>
              ) : (
                oddsList.map((item, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.oddsCard}
                    onPress={() =>
                      setOddsModal({
                        visible: true,
                        matchId: item.matchId,
                        home: item.homeTeam,
                        away: item.awayTeam,
                      })
                    }
                  >
                    <View style={styles.oddsCardHeader}>
                      <Text style={styles.oddsCardTeams} numberOfLines={1}>
                        {item.homeTeam} vs {item.awayTeam}
                      </Text>
                      <Text style={styles.oddsCardTime}>{item.time || item.date}</Text>
                    </View>
                    <View style={styles.oddsSummaryRow}>
                      {item.odds.slice(0, 3).map((o, oIdx) => (
                        <View key={oIdx} style={styles.oddsPill}>
                          <Text style={styles.oddsBookieName} numberOfLines={1}>{o.odd_bookmakers}</Text>
                          <Text style={styles.oddsPillVal}>
                            1: <Text style={{ color: '#60A5FA' }}>{o.odd_1 || '-'}</Text> · X:{' '}
                            <Text style={{ color: '#94A3B8' }}>{o.odd_x || '-'}</Text> · 2:{' '}
                            <Text style={{ color: '#FBBF24' }}>{o.odd_2 || '-'}</Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.oddsCTA}>Tap for full bookmaker markets →</Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      )}

      <View style={{ height: 60 }} />

      {/* Quick Odds Modal */}
      <MatchOddsModal
        visible={oddsModal.visible}
        matchId={oddsModal.matchId}
        homeTeam={oddsModal.home}
        awayTeam={oddsModal.away}
        onClose={() => setOddsModal((prev) => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080E18',
  },
  header: {
    padding: 16,
    paddingTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  compScroll: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  compButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  compButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#3B82F6',
  },
  compLogo: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 6,
  },
  compText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  compTextActive: {
    color: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: '#0F172A',
  },
  standingToggleRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  standingToggleBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  standingToggleBtnActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#3B82F6',
  },
  standingToggleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  loaderContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
  },
  tableCard: {
    backgroundColor: '#0B1526',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  th: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  rankUCL: { backgroundColor: 'rgba(59,130,246,0.25)' },
  rankUEL: { backgroundColor: 'rgba(245,158,11,0.25)' },
  rankRel: { backgroundColor: 'rgba(239,68,68,0.25)' },
  tdRank: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
  },
  tdClub: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
    paddingRight: 4,
  },
  td: {
    color: '#cbd5e1',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  tdPts: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  scorerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1526',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scorerRank: {
    width: 26,
    fontSize: 12,
    fontWeight: '900',
    color: '#FBBF24',
    fontFamily: 'monospace',
  },
  scorerPhoto: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
  },
  scorerPhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scorerInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  scorerName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  scorerTeam: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  goalsText: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '900',
  },
  pensText: {
    color: '#64748B',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  predCard: {
    backgroundColor: '#0B1526',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  predHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  predLeague: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    flex: 1,
  },
  predTime: {
    fontSize: 10,
    color: '#FBBF24',
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  predTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  predTeamHome: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#60A5FA',
  },
  predVS: {
    fontSize: 10,
    color: '#475569',
    marginHorizontal: 8,
  },
  predTeamAway: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
    textAlign: 'right',
  },
  predBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  predBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  predBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 8,
  },
  predMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  predMetric: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  oddsCard: {
    backgroundColor: '#0B1526',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  oddsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  oddsCardTeams: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  oddsCardTime: {
    fontSize: 10,
    color: '#FBBF24',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  oddsSummaryRow: {
    gap: 4,
    marginBottom: 8,
  },
  oddsPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  oddsBookieName: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  oddsPillVal: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  oddsCTA: {
    fontSize: 10,
    color: '#FBBF24',
    fontWeight: '800',
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
