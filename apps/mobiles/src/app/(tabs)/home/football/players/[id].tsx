import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballPlayer } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';

export default function PlayerDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<FootballPlayer | null>(null);

  useEffect(() => {
    loadPlayerData();
  }, [id]);

  const loadPlayerData = async () => {
    try {
      const playersRes = await advancedFootballApi.getPlayers({ playerId: Number(id) });
      setPlayer(playersRes.result[0] || null);
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Loading player details...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Player not found</Text>
      </View>
    );
  }

  const stats = [
    { label: 'Matches Played', value: player.player_match_played, icon: '🎮' },
    { label: 'Goals', value: player.player_goals, icon: '⚽' },
    { label: 'Assists', value: player.player_assists || '0', icon: '🎯' },
    { label: 'Yellow Cards', value: player.player_yellow_cards, icon: '🟨' },
    { label: 'Red Cards', value: player.player_red_cards, icon: '🟥' },
    { label: 'Rating', value: player.player_rating || 'N/A', icon: '⭐' },
  ];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </Pressable>
        </View>
        {player.player_image && (
          <Image source={{ uri: player.player_image }} style={styles.playerImage} />
        )}
        <Text style={styles.playerName}>{player.player_name}</Text>
        {player.player_number && (
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>#{player.player_number}</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Player Information</Text>
        <View style={styles.infoGrid}>
          {player.team_name && (
            <Pressable
              style={styles.infoItem}
              onPress={() => router.push(`/home/football/teams/${player.team_key}` as any)}
            >
              <Text style={styles.infoLabel}>Team</Text>
              <Text style={[styles.infoValue, { color: COLORS.secondary }]}>
                {player.team_name}
              </Text>
            </Pressable>
          )}
          {player.player_type && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Position</Text>
              <Text style={styles.infoValue}>{player.player_type}</Text>
            </View>
          )}
          {player.player_age && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{player.player_age} years</Text>
            </View>
          )}
          {player.player_country && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nationality</Text>
              <Text style={styles.infoValue}>{player.player_country}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Season Statistics</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Additional Stats */}
      {(player.player_passes || player.player_tackles || player.player_duels_won) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Advanced Statistics</Text>
          <View style={styles.advancedStats}>
            {player.player_passes && (
              <View style={styles.advancedStatRow}>
                <Text style={styles.advancedStatLabel}>Passes</Text>
                <Text style={styles.advancedStatValue}>{player.player_passes}</Text>
              </View>
            )}
            {player.player_passes_accuracy && (
              <View style={styles.advancedStatRow}>
                <Text style={styles.advancedStatLabel}>Pass Accuracy</Text>
                <Text style={styles.advancedStatValue}>{player.player_passes_accuracy}%</Text>
              </View>
            )}
            {player.player_tackles && (
              <View style={styles.advancedStatRow}>
                <Text style={styles.advancedStatLabel}>Tackles</Text>
                <Text style={styles.advancedStatValue}>{player.player_tackles}</Text>
              </View>
            )}
            {player.player_duels_won && (
              <View style={styles.advancedStatRow}>
                <Text style={styles.advancedStatLabel}>Duels Won</Text>
                <Text style={styles.advancedStatValue}>{player.player_duels_won}</Text>
              </View>
            )}
            {player.player_dribble_succ && (
              <View style={styles.advancedStatRow}>
                <Text style={styles.advancedStatLabel}>Successful Dribbles</Text>
                <Text style={styles.advancedStatValue}>{player.player_dribble_succ}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.danger,
  },
  header: {
    backgroundColor: 'rgba(0, 31, 63, 0.9)',
    padding: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
    paddingTop: 50,
  },
  headerTop: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  playerImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 4,
    borderColor: COLORS.secondary,
  },
  playerName: {
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: '900',
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  numberBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  numberText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.background,
  },
  section: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.background,
    marginBottom: SPACING.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  infoItem: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.sm,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#60A5FA',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },
  advancedStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  advancedStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  advancedStatLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  advancedStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});
