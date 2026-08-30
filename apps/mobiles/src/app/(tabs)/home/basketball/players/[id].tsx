import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { basketballApi } from '../../../../../services/basketballApi';
import { BasketballPlayer, BasketballEvent } from '@goalmills/types';
import { BasketballMatchCard } from '../../../../../components/BasketballMatchCard';

export default function BasketballPlayerDetailsPage() {
  const params = useLocalSearchParams();
  const [player, setPlayer] = useState<BasketballPlayer | null>(null);
  const [playerMatches, setPlayerMatches] = useState<BasketballEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    if (!params.id) return;
    try {
      const playerId = Number(params.id);

      // Fetch player info
      const playersRes = await basketballApi.getPlayers({ playerId });
      const foundPlayer = playersRes.result[0];
      setPlayer(foundPlayer || null);

      if (foundPlayer && foundPlayer.team_key) {
        // Fetch team matches
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 30);
        const to = new Date(today);
        to.setDate(today.getDate() + 30);

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const matchesRes = await basketballApi.getFixtures({
          teamId: Number(foundPlayer.team_key),
          from: formatDate(from),
          to: formatDate(to),
        });
        setPlayerMatches(matchesRes.result.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading player details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Player Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Player Info Card */}
        <View style={styles.playerCard}>
          {player.player_image ? (
            <Image source={{ uri: player.player_image }} style={styles.playerImage} />
          ) : (
            <View style={styles.playerImagePlaceholder}>
              <Text style={styles.playerInitials}>
                {player.player_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </View>
          )}
          <Text style={styles.playerName}>{player.player_name}</Text>
          {player.player_number && <Text style={styles.playerNumber}>#{player.player_number}</Text>}
          {player.player_type && <Text style={styles.playerPosition}>{player.player_type}</Text>}
          {player.team_name && (
            <TouchableOpacity
              onPress={() => router.push(`/home/basketball/teams/${player.team_key}`)}
            >
              <Text style={styles.teamName}>{player.team_name}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Season Averages</Text>
          <View style={styles.statsGrid}>
            {player.player_points_per_game && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{player.player_points_per_game}</Text>
                <Text style={styles.statLabel}>PPG</Text>
              </View>
            )}
            {player.player_rebounds_per_game && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{player.player_rebounds_per_game}</Text>
                <Text style={styles.statLabel}>RPG</Text>
              </View>
            )}
            {player.player_assists_per_game && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{player.player_assists_per_game}</Text>
                <Text style={styles.statLabel}>APG</Text>
              </View>
            )}
          </View>

          <View style={styles.statsGrid}>
            {player.player_field_goal_percentage && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{player.player_field_goal_percentage}%</Text>
                <Text style={styles.statLabel}>FG%</Text>
              </View>
            )}
            {player.player_three_point_percentage && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{player.player_three_point_percentage}%</Text>
                <Text style={styles.statLabel}>3P%</Text>
              </View>
            )}
            {player.player_free_throw_percentage && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{player.player_free_throw_percentage}%</Text>
                <Text style={styles.statLabel}>FT%</Text>
              </View>
            )}
          </View>

          {player.player_rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Player Rating</Text>
              <Text style={styles.ratingValue}>{player.player_rating}</Text>
            </View>
          )}
        </View>

        {/* Recent Matches */}
        {playerMatches.length > 0 && (
          <View style={styles.matchesSection}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            {playerMatches.map((match) => (
              <BasketballMatchCard key={match.event_key} match={match} />
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
    backgroundColor: '#0a0e27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0e27',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1f3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: '#1a1f3a',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3150',
  },
  playerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  playerImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a3150',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  playerInitials: {
    color: '#60A5FA',
    fontSize: 32,
    fontWeight: '700',
  },
  playerName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  playerNumber: {
    color: '#f59e0b',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  playerPosition: {
    color: '#8b92b0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  teamName: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  statsSection: {
    backgroundColor: '#1a1f3a',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a3150',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#f59e0b',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8b92b0',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  ratingLabel: {
    color: '#8b92b0',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingValue: {
    color: '#10b981',
    fontSize: 28,
    fontWeight: '700',
  },
  matchesSection: {
    padding: 16,
  },
});
