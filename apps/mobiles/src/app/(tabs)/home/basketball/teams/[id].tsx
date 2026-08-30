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
import { BasketballEvent, BasketballTeam } from '@goalmills/types';
import { BasketballMatchCard } from '../../../../../components/BasketballMatchCard';

export default function BasketballTeamDetailsPage() {
  const params = useLocalSearchParams();
  const [team, setTeam] = useState<BasketballTeam | null>(null);
  const [matches, setMatches] = useState<BasketballEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'results'>('upcoming');

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    if (!params.id) return;
    try {
      const teamId = Number(params.id);

      // Fetch team info
      const teamsRes = await basketballApi.getTeams({ teamId });
      const foundTeam = teamsRes.result[0];
      setTeam(foundTeam || null);

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
        teamId,
        from: formatDate(from),
        to: formatDate(to),
      });
      setMatches(matchesRes.result);
    } catch (error) {
      console.error('Error loading team details:', error);
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

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const upcomingMatches = matches.filter(
    (m) => m.event_status === 'Not Started' || m.event_live === '1'
  );
  const finishedMatches = matches.filter((m) => m.event_status === 'Finished');

  // Calculate team stats
  const totalMatches = finishedMatches.length;
  const wins = finishedMatches.filter((m) => {
    const [homeScore, awayScore] = m.event_final_result.split(' - ').map((s) => parseInt(s.trim()));
    if (m.home_team_key === params.id) {
      return homeScore > awayScore;
    } else {
      return awayScore > homeScore;
    }
  }).length;
  const losses = totalMatches - wins;
  const winPercentage = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';

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
        {/* Team Info Card */}
        <View style={styles.teamCard}>
          {team.team_logo ? (
            <Image source={{ uri: team.team_logo }} style={styles.teamLogo} />
          ) : (
            <View style={styles.teamLogoPlaceholder} />
          )}
          <Text style={styles.teamName}>{team.team_name}</Text>

          {/* Team Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalMatches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, styles.winText]}>{wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, styles.lossText]}>{losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, styles.pctText]}>{winPercentage}%</Text>
              <Text style={styles.statLabel}>Win %</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
            onPress={() => setSelectedTab('upcoming')}
          >
            <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
              Upcoming ({upcomingMatches.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'results' && styles.activeTab]}
            onPress={() => setSelectedTab('results')}
          >
            <Text style={[styles.tabText, selectedTab === 'results' && styles.activeTabText]}>
              Results ({finishedMatches.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Matches */}
        <View style={styles.matchesContainer}>
          {selectedTab === 'upcoming' ? (
            upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <BasketballMatchCard key={match.event_key} match={match} />
              ))
            ) : (
              <Text style={styles.emptyText}>No upcoming matches</Text>
            )
          ) : finishedMatches.length > 0 ? (
            finishedMatches.map((match) => (
              <BasketballMatchCard key={match.event_key} match={match} />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent results</Text>
          )}
        </View>
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
  teamCard: {
    backgroundColor: '#1a1f3a',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  teamLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 8,
  },
  teamLogoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2a3150',
    marginBottom: 8,
  },
  teamName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#8b92b0',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  winText: {
    color: '#10b981',
  },
  lossText: {
    color: '#ef4444',
  },
  pctText: {
    color: '#60A5FA',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#1a1f3a',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  tabText: {
    color: '#8b92b0',
    fontSize: 11,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  matchesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  emptyText: {
    color: '#8b92b0',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
});
