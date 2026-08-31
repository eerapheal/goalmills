import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballPlayer, FootballEvent } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballMatchCard } from '../../../../../components/FootballMatchCard';
import { UnifiedMatchEvent } from '../../../../../components/FootballMatchCard';

export default function PlayerDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [player, setPlayer] = useState<FootballPlayer | null>(null);
  const [recentMatches, setRecentMatches] = useState<UnifiedMatchEvent[]>([]);
  const [activeSection, setActiveSection] = useState<'stats' | 'matches'>('stats');

  useEffect(() => { loadPlayerData(); }, [id]);

  const loadPlayerData = async () => {
    try {
      const playersRes = await advancedFootballApi.getPlayers({
        playerId: Number(id),
      });
      const p = playersRes?.result?.[0] || null;
      setPlayer(p);

      // Load recent matches via team
      if (p?.team_key) {
        const teamId = Number(p.team_key);
        const today = new Date();
        const fromDate = `${today.getFullYear() - 1}-07-01`;
        const toDate = today.toISOString().split('T')[0];
        const fixRes = await advancedFootballApi
          .getFixtures({ from: fromDate, to: toDate, teamId })
          .catch(() => ({ result: [] }));
        const raw = (fixRes?.result as FootballEvent[]) || [];
        // last 8 completed
        const finished = raw
          .filter(
            (f) =>
              f.event_status === 'FT' ||
              f.event_status === 'Finished' ||
              f.event_status === 'AET'
          )
          .slice(-8)
          .reverse();
        setRecentMatches(
          finished.map((f): UnifiedMatchEvent => ({
            event_key: f.event_key,
            event_date: f.event_date,
            event_time: f.event_time,
            event_status: f.event_status,
            event_live: '0',
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
          }))
        );
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadPlayerData(); };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading player profile...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 40 }}>👤</Text>
        <Text style={styles.errorTitle}>Player Not Found</Text>
        <Pressable style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isInjured = player.player_injured === 'Yes';

  const attackingStats = [
    { label: 'Goals', value: player.player_goals, icon: '⚽', color: '#34D399' },
    { label: 'Assists', value: player.player_assists, icon: '🎯', color: '#60A5FA' },
    { label: 'Total Shots', value: player.player_shots_total, icon: '💨', color: '#94A3B8' },
    { label: 'Key Passes', value: player.player_key_passes, icon: '🔑', color: '#FBBF24' },
    { label: 'Penalties Scored', value: player.player_pen_scored, icon: '🅿️', color: '#34D399' },
    { label: 'Penalties Missed', value: player.player_pen_missed, icon: '❌', color: '#F87171' },
  ];

  const possessionStats = [
    { label: 'Pass Accuracy', value: player.player_passes_accuracy ? `${player.player_passes_accuracy}%` : 'N/A', icon: '🎯', color: '#60A5FA' },
    { label: 'Total Passes', value: player.player_passes, icon: '↗️', color: '#94A3B8' },
    { label: 'Dribbles Won', value: player.player_dribble_succ, icon: '🏃', color: '#34D399' },
    { label: 'Dribble Attempts', value: player.player_dribble_attempts, icon: '↪️', color: '#94A3B8' },
  ];

  const defensiveStats = [
    { label: 'Tackles', value: player.player_tackles, icon: '🛡️', color: '#60A5FA' },
    { label: 'Interceptions', value: player.player_interceptions, icon: '✋', color: '#34D399' },
    { label: 'Fouls Committed', value: player.player_fouls_commited, icon: '⚠️', color: '#FBBF24' },
    { label: 'Duels Won', value: player.player_duels_won, icon: '💪', color: '#34D399' },
    { label: 'Duels Total', value: player.player_duels_total, icon: '⚡', color: '#94A3B8' },
  ];

  const disciplineStats = [
    { label: 'Yellow Cards', value: player.player_yellow_cards, icon: '🟨', color: '#FBBF24' },
    { label: 'Red Cards', value: player.player_red_cards, icon: '🟥', color: '#EF4444' },
  ];

  const performanceStats = [
    { label: 'Matches Played', value: player.player_match_played, icon: '🎮', color: '#60A5FA' },
    { label: 'Minutes Played', value: player.player_minutes, icon: '⏱️', color: '#94A3B8' },
    { label: 'Rating', value: player.player_rating, icon: '⭐', color: '#FBBF24' },
  ];

  const renderStatGroup = (
    title: string,
    emoji: string,
    stats: { label: string; value: string | number | undefined; icon: string; color: string }[]
  ) => (
    <View style={styles.statGroup}>
      <Text style={styles.statGroupTitle}>{emoji} {title}</Text>
      <View style={styles.statGrid}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statCell}>
            <Text style={styles.statCellIcon}>{s.icon}</Text>
            <Text style={[styles.statCellValue, { color: s.color }]}>
              {s.value ?? 'N/A'}
            </Text>
            <Text style={styles.statCellLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO HEADER ── */}
      <View style={styles.hero}>
        <Pressable onPress={handleBack} style={styles.heroBack}>
          <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
        </Pressable>

        <View style={styles.heroContent}>
          {/* Photo */}
          {player.player_image ? (
            <Image source={{ uri: player.player_image }} style={styles.playerPhoto} />
          ) : (
            <View style={[styles.playerPhoto, styles.playerPhotoPlaceholder]}>
              <Text style={{ fontSize: 44 }}>👤</Text>
            </View>
          )}

          {/* Info */}
          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.playerName}>{player.player_name}</Text>
              {isInjured && (
                <View style={styles.injuredBadge}>
                  <Text style={styles.injuredText}>🚑 Injured</Text>
                </View>
              )}
            </View>

            <View style={styles.heroBadgeRow}>
              {player.player_number && (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>#{player.player_number}</Text>
                </View>
              )}
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{player.player_type || 'Player'}</Text>
              </View>
              {player.player_age && (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>Age {player.player_age}</Text>
                </View>
              )}
            </View>

            {/* Team */}
            {player.team_name && (
              <Pressable
                style={styles.teamLink}
                onPress={() => player.team_key && router.push(`/(tabs)/home/football/teams/${player.team_key}` as any)}
              >
                <Text style={styles.teamLinkName}>{player.team_name}</Text>
                <Ionicons name="chevron-forward" size={12} color="#3B82F6" />
              </Pressable>
            )}

            {/* Nationality */}
            {player.player_country && (
              <Text style={styles.nationality}>🌍 {player.player_country}</Text>
            )}
          </View>
        </View>

        {/* Rating pill */}
        {player.player_rating && (
          <View style={styles.ratingPill}>
            <Text style={styles.ratingValue}>{Number(player.player_rating).toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>Rating</Text>
          </View>
        )}
      </View>

      {/* ── SECTION TABS ── */}
      <View style={styles.sectionTabs}>
        <Pressable
          style={[styles.sectionTab, activeSection === 'stats' && styles.sectionTabActive]}
          onPress={() => setActiveSection('stats')}
        >
          <Ionicons name="bar-chart-outline" size={14} color={activeSection === 'stats' ? '#0F172A' : '#64748B'} />
          <Text style={[styles.sectionTabLabel, activeSection === 'stats' && styles.sectionTabLabelActive]}>
            Statistics
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sectionTab, activeSection === 'matches' && styles.sectionTabActive]}
          onPress={() => setActiveSection('matches')}
        >
          <Ionicons name="calendar-outline" size={14} color={activeSection === 'matches' ? '#0F172A' : '#64748B'} />
          <Text style={[styles.sectionTabLabel, activeSection === 'matches' && styles.sectionTabLabelActive]}>
            Recent Matches
          </Text>
        </Pressable>
      </View>

      {/* ── STATS ── */}
      {activeSection === 'stats' && (
        <View style={styles.statsContainer}>
          {renderStatGroup('Performance', '📊', performanceStats)}
          {renderStatGroup('Attacking', '⚽', attackingStats)}
          {renderStatGroup('Possession & Dribbles', '🎯', possessionStats)}
          {renderStatGroup('Defensive', '🛡️', defensiveStats)}
          {renderStatGroup('Discipline', '📋', disciplineStats)}
        </View>
      )}

      {/* ── RECENT MATCHES ── */}
      {activeSection === 'matches' && (
        <View style={styles.matchesContainer}>
          {recentMatches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 36 }}>📭</Text>
              <Text style={styles.emptyTitle}>No Recent Matches</Text>
              <Text style={styles.emptyText}>Match history could not be loaded.</Text>
            </View>
          ) : (
            recentMatches.map((match) => (
              <FootballMatchCard key={match.event_key} event={match} />
            ))
          )}
        </View>
      )}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080E18' },
  loadingContainer: {
    flex: 1, backgroundColor: '#080E18', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24,
  },
  loadingText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  errorTitle: { fontSize: 18, fontWeight: '900', color: '#F8FAFC', marginTop: 8 },
  backBtn: {
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#F59E0B', borderRadius: 12,
  },
  backBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 13 },

  // ─ Hero ─
  hero: {
    backgroundColor: '#0D1F3C',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.25)',
    position: 'relative',
  },
  heroBack: {
    position: 'absolute',
    top: 52,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginTop: 8 },
  playerPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.5)',
    backgroundColor: '#1E293B',
  },
  playerPhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: { flex: 1, paddingTop: 4 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  playerName: { fontSize: 20, fontWeight: '900', color: '#F8FAFC', flex: 1 },
  injuredBadge: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  injuredText: { fontSize: 10, fontWeight: '800', color: '#F87171' },
  heroBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  heroBadge: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '800', color: '#93C5FD', textTransform: 'uppercase' },
  teamLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  teamLinkLogo: { width: 18, height: 18, resizeMode: 'contain' },
  teamLinkName: { fontSize: 12, fontWeight: '700', color: '#60A5FA' },
  nationality: { fontSize: 11, color: '#64748B', marginTop: 4 },
  ratingPill: {
    position: 'absolute',
    top: 52,
    right: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 52,
  },
  ratingValue: { fontSize: 20, fontWeight: '900', color: '#0F172A', fontVariant: ['tabular-nums'] },
  ratingLabel: { fontSize: 8, fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', letterSpacing: 1 },

  // ─ Section Tabs ─
  sectionTabs: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sectionTabActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  sectionTabLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  sectionTabLabelActive: { color: '#0F172A' },

  // ─ Stats ─
  statsContainer: { padding: 12, gap: 12 },
  statGroup: {
    backgroundColor: '#0B1526',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statGroupTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  statCellIcon: { fontSize: 16, marginBottom: 2 },
  statCellValue: { fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  statCellLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },

  // ─ Matches ─
  matchesContainer: { padding: 12, gap: 8 },
  emptyContainer: { padding: 48, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '900', color: '#F8FAFC' },
  emptyText: { fontSize: 12, color: '#64748B', textAlign: 'center' },
});
