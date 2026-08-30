import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { advancedCricketApi } from '../../../../../services/advancedCricketApi';
import { CricketPlayer } from '@goalmills/types';

type FormatTab = 'test' | 'odi' | 't20i' | 'ipl';

export default function CricketPlayerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<CricketPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFormat, setActiveFormat] = useState<FormatTab>('odi');

  useEffect(() => {
    const loadPlayer = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await advancedCricketApi.getPlayerById(id);
        setPlayer(data);
      } catch (error) {
        console.error('Error loading mobile player:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlayer();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Syncing Athlete Profile...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.secondary} />
        <Text style={styles.errorTitle}>Player Intel Unavailable</Text>
        <Text style={styles.errorSubtext}>
          Could not retrieve athlete record from the cricket matrix.
        </Text>
        <TouchableOpacity style={styles.btnReturn} onPress={() => router.back()}>
          <Text style={styles.btnReturnText}>Return</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStats =
    player.career_stats?.[activeFormat] || player.career_stats?.odi || player.career_stats?.test;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: player.player_name,
          headerStyle: { backgroundColor: '#0a0e27' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={{ marginLeft: 0 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrapper}>
            {player.player_image ? (
              <Image source={{ uri: player.player_image }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>{player.player_name.charAt(0)}</Text>
              </View>
            )}
            {player.jersey_number && (
              <View style={styles.jerseyBadge}>
                <Text style={styles.jerseyText}>#{player.jersey_number}</Text>
              </View>
            )}
          </View>

          <Text style={styles.playerName}>{player.player_name}</Text>
          <Text style={styles.playerTeam}>{player.team_name || player.player_country}</Text>

          <View style={styles.chipsRow}>
            <View style={[styles.chip, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={[styles.chipText, { color: '#60a5fa' }]}>
                {player.player_country || 'International'}
              </Text>
            </View>
            <View style={[styles.chip, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Text style={[styles.chipText, { color: '#fbbf24' }]}>
                {player.player_type || player.player_role || 'Athlete'}
              </Text>
            </View>
            {player.is_captain && (
              <View style={[styles.chip, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Text style={[styles.chipText, { color: '#34d399' }]}>Captain</Text>
              </View>
            )}
          </View>

          {player.bio && <Text style={styles.bioText}>{player.bio}</Text>}

          {/* Quick Specs */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Batting</Text>
              <Text style={styles.specValue}>{player.batting_style || 'Right-hand'}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Bowling</Text>
              <Text style={styles.specValue}>{player.bowling_style || 'Medium'}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Age</Text>
              <Text style={styles.specValue}>
                {player.player_age ? `${player.player_age} yrs` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Format Switcher */}
        <View style={styles.formatTabs}>
          {(['test', 'odi', 't20i', 'ipl'] as FormatTab[]).map((fmt) => (
            <TouchableOpacity
              key={fmt}
              style={[styles.formatTabBtn, activeFormat === fmt && styles.formatTabBtnActive]}
              onPress={() => setActiveFormat(fmt)}
            >
              <Text
                style={[styles.formatTabText, activeFormat === fmt && styles.formatTabTextActive]}
              >
                {fmt.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Career Statistics */}
        {currentStats ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              🏏 Batting Record ({activeFormat.toUpperCase()})
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Matches</Text>
                <Text style={styles.statCellValue}>{currentStats.matches}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Innings</Text>
                <Text style={styles.statCellValue}>{currentStats.innings}</Text>
              </View>
              <View style={[styles.statCell, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={[styles.statCellLabel, { color: COLORS.secondary }]}>Runs</Text>
                <Text style={[styles.statCellValue, { color: '#fbbf24' }]}>
                  {currentStats.runs}
                </Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>High Score</Text>
                <Text style={styles.statCellValue}>{currentStats.highestScore}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Average</Text>
                <Text style={[styles.statCellValue, { color: '#34d399' }]}>
                  {currentStats.average}
                </Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Strike Rate</Text>
                <Text style={[styles.statCellValue, { color: '#60a5fa' }]}>
                  {currentStats.strikeRate}
                </Text>
              </View>
            </View>

            <View style={[styles.statsGrid, { marginTop: SPACING.sm }]}>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>100s</Text>
                <Text style={[styles.statCellValue, { color: '#c084fc' }]}>
                  {currentStats.centuries}
                </Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>50s</Text>
                <Text style={[styles.statCellValue, { color: '#60a5fa' }]}>
                  {currentStats.fifties}
                </Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>4s / Fours</Text>
                <Text style={styles.statCellValue}>{currentStats.fours}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>6s / Sixes</Text>
                <Text style={styles.statCellValue}>{currentStats.sixes}</Text>
              </View>
            </View>

            {/* Bowling stats if present */}
            {currentStats.wickets !== undefined && currentStats.wickets > 0 && (
              <View
                style={{
                  marginTop: SPACING.lg,
                  paddingTop: SPACING.md,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Text style={[styles.sectionTitle, { color: '#22d3ee' }]}>🎯 Bowling Record</Text>
                <View style={styles.statsGrid}>
                  <View style={[styles.statCell, { backgroundColor: 'rgba(34, 211, 238, 0.15)' }]}>
                    <Text style={[styles.statCellLabel, { color: '#22d3ee' }]}>Wickets</Text>
                    <Text style={[styles.statCellValue, { color: '#22d3ee' }]}>
                      {currentStats.wickets}
                    </Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statCellLabel}>Economy</Text>
                    <Text style={styles.statCellValue}>{currentStats.economy || 'N/A'}</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statCellLabel}>Average</Text>
                    <Text style={styles.statCellValue}>{currentStats.bowlingAverage || 'N/A'}</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statCellLabel}>Best</Text>
                    <Text style={styles.statCellValue}>
                      {currentStats.bestBowlingInnings || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyStatsCard}>
            <Text style={styles.emptyStatsText}>No recorded data for this format.</Text>
          </View>
        )}

        {/* Recent Outings */}
        {player.recent_matches && player.recent_matches.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🔥 Recent Outings</Text>
            {player.recent_matches.map((m, idx) => (
              <View key={idx} style={styles.recentMatchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentMatchName}>{m.match_name}</Text>
                  <Text style={styles.recentMatchSub}>
                    vs {m.opponent} • {m.date}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.recentMatchScore}>
                    {m.runs} ({m.balls}b)
                  </Text>
                  {m.wickets !== '0' && <Text style={styles.recentMatchWickets}>{m.wickets}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
  },
  loadingText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    marginTop: SPACING.md,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: '#0a0e27',
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: '#fff',
    marginTop: SPACING.md,
    textTransform: 'uppercase',
  },
  errorSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  btnReturn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
  },
  btnReturnText: {
    color: '#fff',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: FONT_SIZES.xs,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  jerseyBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0a0e27',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  jerseyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  playerName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  playerTeam: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bioText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: SPACING.md,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  specBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },
  formatTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
    gap: 2,
    marginBottom: SPACING.xs,
  },
  formatTabBtn: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  formatTabBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  formatTabText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  formatTabTextActive: {
    color: '#60A5FA',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: '#fbbf24',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCell: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    alignItems: 'center',
  },
  statCellLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statCellValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
  },
  emptyStatsCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  emptyStatsText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  recentMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  recentMatchName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  recentMatchSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  recentMatchScore: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '900',
  },
  recentMatchWickets: {
    color: '#22d3ee',
    fontSize: 11,
    fontWeight: '800',
  },
});
