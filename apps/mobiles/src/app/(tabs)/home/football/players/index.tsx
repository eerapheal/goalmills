import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballPlayer } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';

export default function FootballPlayersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<FootballPlayer[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<FootballPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlayers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Mobile: Searching players for', searchQuery);

      let response;
      if (searchQuery.trim() === '') {
        // Default to some major players/teams if empty
        response = await advancedFootballApi.getPlayers({ teamId: 102 }); // Real Madrid
      } else {
        response = await advancedFootballApi.getPlayers({ playerName: searchQuery });
      }

      if (response.result) {
        setPlayers(response.result);
        setFilteredPlayers(response.result);
      } else {
        setPlayers([]);
        setFilteredPlayers([]);
      }
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.background} />
        </Pressable>
        <Text style={styles.headerTitle}>🏃 Football Players</Text>
        <Text style={styles.headerSubtitle}>
          {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search players or teams..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Players List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredPlayers.map((player) => (
          <Pressable
            key={player.player_key}
            style={({ pressed }) => [styles.playerCard, pressed && styles.pressed]}
            onPress={() => router.push(`/home/football/players/${player.player_key}` as any)}
          >
            <View style={styles.playerInfo}>
              {player.player_image && (
                <Image source={{ uri: player.player_image }} style={styles.playerImage} />
              )}
              <View style={styles.playerText}>
                <Text style={styles.playerName}>{player.player_name}</Text>
                <View style={styles.playerMeta}>
                  {player.team_name && <Text style={styles.teamName}>👕 {player.team_name}</Text>}
                  {player.player_type && (
                    <Text style={styles.position}>• {player.player_type}</Text>
                  )}
                </View>
                {player.player_number && <Text style={styles.number}>#{player.player_number}</Text>}
              </View>
            </View>

            <View style={styles.playerStats}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>⚽ {player.player_goals}</Text>
                <Text style={styles.statLabel}>Goals</Text>
              </View>
              {player.player_assists && (
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>🎯 {player.player_assists}</Text>
                  <Text style={styles.statLabel}>Assists</Text>
                </View>
              )}
              {player.player_rating && (
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>⭐ {player.player_rating}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}

        {filteredPlayers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No players found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  header: {
    backgroundColor: 'rgba(0, 31, 63, 0.9)',
    padding: SPACING.lg,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerImage: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerText: {
    flex: 1,
  },
  playerName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  teamName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginRight: SPACING.xs,
  },
  position: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
  },
  number: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  playerStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
});
