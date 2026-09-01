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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballMatchCard, UnifiedMatchEvent } from '../components/FootballMatchCard';
import { PulseNewsTicker } from '../components/PulseNewsTicker';
import { advancedFootballApi } from '../services/advancedFootballApi';
import {
  FootballStanding,
  FootballTopscorer,
  FootballProbability,
  FootballEvent,
} from '@goalmills/types';

type FootballTab = 'live' | 'upcoming' | 'results' | 'standings' | 'topscorers' | 'predictions';

const MAJOR_LEAGUES = [
  { id: '152', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: '3', name: 'Champions League', flag: '🇪🇺' },
  { id: '302', name: 'La Liga', flag: '🇪🇸' },
  { id: '207', name: 'Serie A', flag: '🇮🇹' },
  { id: '175', name: 'Bundesliga', flag: '🇩🇪' },
  { id: '168', name: 'Ligue 1', flag: '🇫🇷' },
  { id: '4', name: 'Europa League', flag: '🇪🇺' },
  { id: '6', name: 'AFCON', flag: '🌍' },
  { id: '28', name: 'World Cup', flag: '🌐' },
  { id: '1', name: 'EURO', flag: '🇪🇺' },
  { id: '17', name: 'Copa América', flag: '🌎' },
  { id: '5', name: 'Nations League', flag: '🇪🇺' },
  { id: '146', name: 'FA Cup', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: '19', name: 'CAF CL', flag: '🌍' },
  { id: '13', name: 'Libertadores', flag: '🌎' },
  { id: '278', name: 'Saudi Pro', flag: '🇸🇦' },
  { id: '244', name: 'Eredivisie', flag: '🇳🇱' },
  { id: '266', name: 'Liga Portugal', flag: '🇵🇹' },
  { id: '322', name: 'Süper Lig', flag: '🇹🇷' },
  { id: '99', name: 'Brasileirão', flag: '🇧🇷' },
];

const adaptMatch = (f: FootballEvent): UnifiedMatchEvent => {
  const isLive =
    f.event_live === '1' ||
    (f.event_live as any) === 1 ||
    ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(f.event_status || '') ||
    !isNaN(Number(f.event_status));

  return {
    event_key: f.event_key,
    event_date: f.event_date,
    event_time: f.event_time,
    event_status: f.event_status,
    event_live: isLive ? '1' : '0',
    event_home_team: f.event_home_team,
    home_team_key: f.home_team_key,
    home_team_logo: f.home_team_logo,
    event_away_team: f.event_away_team,
    away_team_key: f.away_team_key,
    away_team_logo: f.away_team_logo,
    event_final_result: f.event_final_result,
    event_ft_result: f.event_ft_result,
    league_name: f.league_name,
    league_key: f.league_key,
    league_logo: f.league_logo,
    country_name: f.country_name,
    goalscorers: f.goalscorers,
  };
};

export function AdvancedFootballScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FootballTab>('live');
  const [selectedLeague, setSelectedLeague] = useState('152');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [standingView, setStandingView] = useState<'total' | 'home' | 'away'>('total');

  const [fixtures, setFixtures] = useState<UnifiedMatchEvent[]>([]);
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
  const [probabilities, setProbabilities] = useState<FootballProbability[]>([]);

  const dateStrip = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName =
        i === 0 ? 'Today' : i === -1 ? 'Yest' : i === 1 ? 'Tmrw' :
          d.toLocaleDateString('en-US', { weekday: 'short' });
      dates.push({ iso, dayName, dayNumber: d.getDate() });
    }
    return dates;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const numLeague = Number(selectedLeague);
    try {
      if (activeTab === 'standings') {
        const res = await advancedFootballApi.getStandings(numLeague);
        const resObj = res?.result as any;
        const table = resObj?.[standingView] || resObj?.total || (Array.isArray(resObj) ? resObj : []);
        setStandings(table);
      } else if (activeTab === 'topscorers') {
        const res = await advancedFootballApi.getTopscorers(numLeague);
        setTopscorers(res?.result || []);
      } else if (activeTab === 'predictions') {
        const res = await advancedFootballApi.getProbabilities({
          from: selectedDate,
          to: selectedDate,
          leagueId: numLeague,
        });
        setProbabilities(res?.result || []);
      } else if (activeTab === 'live') {
        const res = await advancedFootballApi.getLivescore();
        const raw = (res?.result as FootballEvent[]) || [];
        setFixtures(raw.map(adaptMatch));
      } else {
        const res = await advancedFootballApi.getFixtures({
          from: selectedDate,
          to: selectedDate,
          leagueId: numLeague,
        });
        const raw = (res?.result as FootballEvent[]) || [];
        setFixtures(raw.map(adaptMatch));
      }
    } catch (err) {
      console.error('[AdvancedFootballScreen] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedLeague, selectedDate, standingView]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const filteredFixtures = useMemo(() => {
    if (!Array.isArray(fixtures)) return [];
    let list = fixtures;

    if (activeTab === 'live') {
      list = list.filter(f =>
        f.event_live === '1' || f.event_live === 1 ||
        (Boolean(f.event_status) && !['Finished', 'FT', 'Cancelled', 'Postponed', 'Not Started', 'NS'].includes(f.event_status as string))
      );
    } else if (activeTab === 'upcoming') {
      list = list.filter(f =>
        f.event_status === 'Not Started' || f.event_status === 'NS' || f.event_status === 'TBA' ||
        (f.event_live !== '1' && f.event_live !== 1 && f.event_status !== 'FT' && f.event_status !== 'Finished' && !f.event_final_result)
      );
    } else if (activeTab === 'results') {
      list = list.filter(f =>
        f.event_status === 'FT' || f.event_status === 'Finished' ||
        f.event_status === 'AET' || f.event_status === 'AP' ||
        Boolean(f.event_final_result && f.event_final_result !== '-')
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f =>
        f.event_home_team?.toLowerCase().includes(q) ||
        f.event_away_team?.toLowerCase().includes(q) ||
        (f.league_name && f.league_name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [fixtures, activeTab, searchQuery]);

  const sections = useMemo(() => {
    const groups: { [k: string]: { title: string; logo?: string; league_key?: string | number; data: UnifiedMatchEvent[] } } = {};
    filteredFixtures.forEach(item => {
      const key = item.league_name || 'Other';
      if (!groups[key]) groups[key] = { title: key, logo: item.league_logo, league_key: item.league_key, data: [] };
      groups[key].data.push(item);
    });
    return Object.values(groups);
  }, [filteredFixtures]);

  const tabs: { id: FootballTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'live', label: 'Live', icon: 'radio' },
    { id: 'upcoming', label: 'Fixtures', icon: 'calendar-outline' },
    { id: 'results', label: 'Results', icon: 'checkmark-circle-outline' },
    { id: 'standings', label: 'Table', icon: 'trophy-outline' },
    { id: 'topscorers', label: 'Scorers', icon: 'football-outline' },
    { id: 'predictions', label: 'AI Odds', icon: 'analytics-outline' },
  ];

  const showDatePicker = activeTab === 'upcoming' || activeTab === 'results' || activeTab === 'predictions';
  const showLeaguePicker = activeTab !== 'live';

  return (
    <View style={styles.container}>
      {/* News Ticker */}
      <PulseNewsTicker
        sport="football"
        pulseLabel="FOOTBALL PULSE"
        actionLabel={activeTab === 'live' ? '📅 Fixtures' : '⚡ Live'}
        onActionPress={() => setActiveTab(activeTab === 'live' ? 'upcoming' : 'live')}
      />

      {/* Competition Switcher */}
      {showLeaguePicker && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.leagueBar}
          contentContainerStyle={styles.leagueBarContent}
        >
          {MAJOR_LEAGUES.map(lg => {
            const selected = selectedLeague === lg.id;
            return (
              <Pressable
                key={lg.id}
                style={[styles.leagueChip, selected && styles.leagueChipActive]}
                onPress={() => setSelectedLeague(lg.id)}
              >
                <Text style={styles.leagueChipFlag}>{lg.flag}</Text>
                <Text style={[styles.leagueChipLabel, selected && styles.leagueChipLabelActive]}>
                  {lg.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Search + Refresh */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={14} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search team or competition..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.refreshBtn} onPress={() => { setRefreshing(true); fetchData(); }}>
          <Ionicons name="refresh-outline" size={16} color="#F8FAFC" />
        </Pressable>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={14} color={active ? '#0F172A' : '#64748B'} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              {tab.id === 'live' && (
                <View style={styles.liveDot} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Date Strip */}
      {showDatePicker && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateBar} contentContainerStyle={styles.dateBarContent}>
          {dateStrip.map(item => {
            const sel = selectedDate === item.iso;
            return (
              <Pressable key={item.iso} style={[styles.datePill, sel && styles.datePillActive]} onPress={() => setSelectedDate(item.iso)}>
                <Text style={[styles.datePillDay, sel && { color: '#93C5FD' }]}>{item.dayName}</Text>
                <Text style={[styles.datePillNum, sel && { color: '#F8FAFC' }]}>{item.dayNumber}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Standings Total/Home/Away Toggle */}
      {activeTab === 'standings' && (
        <View style={styles.standingToggleRow}>
          {(['total', 'home', 'away'] as const).map(v => (
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

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loaderText}>Syncing football telemetry...</Text>
        </View>
      ) : (
        <>
          {/* Fixtures / Live / Results */}
          {(activeTab === 'live' || activeTab === 'upcoming' || activeTab === 'results') && (
            <SectionList
              sections={sections}
              keyExtractor={(item, index) => `${item.event_key}-${index}`}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  {section.logo ? (
                    <Image source={{ uri: section.logo }} style={styles.sectionLogo} />
                  ) : (
                    <Text style={{ fontSize: 14 }}>🏆</Text>
                  )}
                  <Text style={styles.sectionTitle} numberOfLines={1}>{section.title}</Text>
                  {section.league_key && (
                    <Pressable
                      onPress={() => router.push(`/(tabs)/home/football/leagues/${section.league_key}` as any)}
                      style={styles.sectionLink}
                    >
                      <Text style={styles.sectionLinkText}>Table</Text>
                      <Ionicons name="chevron-forward" size={12} color="#3B82F6" />
                    </Pressable>
                  )}
                </View>
              )}
              renderItem={({ item }) => <FootballMatchCard event={item} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 40 }}>⚽</Text>
                  <Text style={styles.emptyTitle}>No Fixtures Found</Text>
                  <Text style={styles.emptyText}>
                    {activeTab === 'live'
                      ? 'No live matches in progress. Check Upcoming tab.'
                      : 'No matches scheduled for this date and competition.'}
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 100 }}
              stickySectionHeadersEnabled={false}
            />
          )}

          {/* Standings Table */}
          {activeTab === 'standings' && (
            <ScrollView
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <View style={styles.tableCard}>
                {/* Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableCell, styles.rankCol]}>#</Text>
                  <Text style={[styles.tableCell, styles.teamCol]}>Club</Text>
                  <Text style={[styles.tableCell, styles.numCol]}>P</Text>
                  <Text style={[styles.tableCell, styles.numCol, { color: '#34D399' }]}>W</Text>
                  <Text style={[styles.tableCell, styles.numCol, { color: '#94A3B8' }]}>D</Text>
                  <Text style={[styles.tableCell, styles.numCol, { color: '#F87171' }]}>L</Text>
                  <Text style={[styles.tableCell, styles.numCol]}>GD</Text>
                  <Text style={[styles.tableCell, styles.numCol, { color: '#FBBF24' }]}>PTS</Text>
                </View>
                {standings.length === 0 ? (
                  <Text style={styles.emptyText}>No standings data for this competition.</Text>
                ) : (
                  standings.map((row, i) => {
                    const rank = Number(row.standing_place);
                    const isUCL = rank <= 4;
                    const isUEL = rank === 5 || rank === 6;
                    const isRel = rank >= 18;
                    return (
                      <Pressable
                        key={i}
                        style={styles.tableRow}
                        onPress={() => row.team_key && router.push(`/(tabs)/home/football/teams/${row.team_key}` as any)}
                      >
                        <View style={[styles.rankCell, isUCL && styles.rankUCL, isUEL && styles.rankUEL, isRel && styles.rankRel]}>
                          <Text style={styles.rankText}>{row.standing_place || i + 1}</Text>
                        </View>
                        <Text style={[styles.tableCell, styles.teamCol, { fontWeight: '700', color: '#F1F5F9' }]} numberOfLines={1}>
                          {row.standing_team}
                        </Text>
                        <Text style={[styles.tableCell, styles.numCol]}>{row.standing_P || 0}</Text>
                        <Text style={[styles.tableCell, styles.numCol, { color: '#34D399' }]}>{row.standing_W || 0}</Text>
                        <Text style={[styles.tableCell, styles.numCol, { color: '#94A3B8' }]}>{row.standing_D || 0}</Text>
                        <Text style={[styles.tableCell, styles.numCol, { color: '#F87171' }]}>{row.standing_L || 0}</Text>
                        <Text style={[styles.tableCell, styles.numCol]}>{row.standing_GD || 0}</Text>
                        <Text style={[styles.tableCell, styles.numCol, { fontWeight: '900', color: '#FBBF24' }]}>{row.standing_PTS || 0}</Text>
                      </Pressable>
                    );
                  })
                )}
              </View>
            </ScrollView>
          )}

          {/* Top Scorers */}
          {activeTab === 'topscorers' && (
            <FlatList
              data={topscorers}
              keyExtractor={(_, i) => String(i)}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
              contentContainerStyle={{ padding: 12, paddingBottom: 100, gap: 8 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 36 }}>👟</Text>
                  <Text style={styles.emptyTitle}>No Scorer Data</Text>
                  <Text style={styles.emptyText}>Top scorer stats not available for this competition.</Text>
                </View>
              }
              renderItem={({ item, index }) => (
                <Pressable
                  style={styles.scorerCard}
                  onPress={() => item.player_key && router.push(`/(tabs)/home/football/players/${item.player_key}` as any)}
                >
                  <Text style={styles.scorerRank}>#{item.player_place || index + 1}</Text>
                  {item.player_image ? (
                    <Image source={{ uri: item.player_image }} style={styles.scorerPhoto} />
                  ) : (
                    <View style={[styles.scorerPhoto, styles.scorerPhotoPlaceholder]}>
                      <Text style={{ fontSize: 20 }}>👤</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={styles.scorerName}>{item.player_name}</Text>
                    <Text style={styles.scorerTeam}>{item.team_name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.scorerGoals}>{item.goals} ⚽</Text>
                    {item.penalty_goals && item.penalty_goals !== '0' && (
                      <Text style={styles.scorerPens}>({item.penalty_goals} pens)</Text>
                    )}
                  </View>
                </Pressable>
              )}
            />
          )}

          {/* AI Predictions */}
          {activeTab === 'predictions' && (
            <FlatList
              data={probabilities}
              keyExtractor={(_, i) => String(i)}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
              contentContainerStyle={{ padding: 12, paddingBottom: 100, gap: 10 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 36 }}>🤖</Text>
                  <Text style={styles.emptyTitle}>No Predictions</Text>
                  <Text style={styles.emptyText}>No probability forecasts available for the selected date.</Text>
                </View>
              }
              renderItem={({ item }) => {
                const hw = Number(item.event_HW) || 0;
                const d = Number(item.event_D) || 0;
                const aw = Number(item.event_AW) || 0;
                return (
                  <Pressable
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
                    {/* Prob Bar */}
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
                    </View>
                    <Text style={styles.predCTA}>Tap for Full Odds & Match Center →</Text>
                  </Pressable>
                );
              }}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },

  leagueBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  leagueBarContent: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  leagueChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  leagueChipActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  leagueChipFlag: { fontSize: 14 },
  leagueChipLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  leagueChipLabelActive: { color: '#F8FAFC' },

  controlBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0B1526', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 12 },
  refreshBtn: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: '#1D4ED8',
    alignItems: 'center', justifyContent: 'center',
  },

  tabBar: { flexGrow: 0 },
  tabBarContent: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabBtnActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  tabLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  tabLabelActive: { color: '#0F172A' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },

  dateBar: { flexGrow: 0 },
  dateBarContent: { paddingHorizontal: 10, paddingBottom: 8, gap: 6 },
  datePill: {
    alignItems: 'center', minWidth: 54, paddingVertical: 6, paddingHorizontal: 8,
    borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  datePillActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.15)' },
  datePillDay: { fontSize: 9, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  datePillNum: { fontSize: 14, fontWeight: '900', color: '#94A3B8' },

  standingToggleRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingBottom: 8,
  },
  standingToggleBtn: {
    flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  standingToggleBtnActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  standingToggleLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },

  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { color: '#64748B', fontSize: 12, fontWeight: '600' },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#080E18', paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    marginTop: 6,
  },
  sectionLogo: { width: 18, height: 18, resizeMode: 'contain' },
  sectionTitle: { flex: 1, fontSize: 11, fontWeight: '900', color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionLinkText: { fontSize: 11, fontWeight: '700', color: '#3B82F6' },

  // Standings Table
  tableCard: {
    margin: 12, backgroundColor: '#0B1526', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  tableHeaderRow: {
    flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  tableCell: { fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' },
  rankCol: { width: 28 },
  teamCol: { flex: 2.5, paddingRight: 4 },
  numCol: { width: 30, textAlign: 'center' },
  rankCell: {
    width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 6,
  },
  rankUCL: { backgroundColor: 'rgba(59,130,246,0.25)' },
  rankUEL: { backgroundColor: 'rgba(245,158,11,0.25)' },
  rankRel: { backgroundColor: 'rgba(239,68,68,0.25)' },
  rankText: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },

  // Scorers
  scorerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0B1526', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  scorerRank: { width: 26, fontSize: 12, fontWeight: '900', color: '#FBBF24', fontFamily: 'monospace' },
  scorerPhoto: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B' },
  scorerPhotoPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  scorerName: { fontSize: 13, fontWeight: '800', color: '#F1F5F9' },
  scorerTeam: { fontSize: 11, color: '#64748B', marginTop: 1 },
  scorerGoals: { fontSize: 18, fontWeight: '900', color: '#34D399' },
  scorerPens: { fontSize: 10, color: '#64748B', fontFamily: 'monospace' },

  // Predictions
  predCard: {
    backgroundColor: '#0B1526', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  predHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  predLeague: { fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', flex: 1 },
  predTime: { fontSize: 10, color: '#FBBF24', fontWeight: '800', fontFamily: 'monospace' },
  predTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  predTeamHome: { flex: 1, fontSize: 12, fontWeight: '800', color: '#60A5FA' },
  predVS: { fontSize: 10, color: '#475569', marginHorizontal: 8, fontWeight: '700' },
  predTeamAway: { flex: 1, fontSize: 12, fontWeight: '800', color: '#FBBF24', textAlign: 'right' },
  predBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  predBarLabel: { fontSize: 10, fontWeight: '800', fontFamily: 'monospace' },
  predBar: {
    flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden',
    backgroundColor: '#1E293B', marginBottom: 10,
  },
  predMetrics: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  predMetric: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  predCTA: { fontSize: 10, color: '#FBBF24', fontWeight: '800', textAlign: 'right' },

  // Empty
  emptyContainer: { padding: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#F8FAFC', marginTop: 8, marginBottom: 4 },
  emptyText: { fontSize: 12, color: '#475569', textAlign: 'center' },
});
