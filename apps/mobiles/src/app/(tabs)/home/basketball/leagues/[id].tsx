import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BasketballEvent, BasketballStanding } from '@goalmills/types';
import { BasketballMatchCard } from '../../../../../components/BasketballMatchCard';
import { basketballApi } from '../../../../../services/basketballApi';

export default function BasketballLeagueDetailsPage() {
  const params = useLocalSearchParams();
  const [league, setLeague] = useState<any>(null);
  const [matches, setMatches] = useState<BasketballEvent[]>([]);
  const [standings, setStandings] = useState<BasketballStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'matches' | 'standings'>('matches');

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    if (!params.id) return;
    try {
      const leagueId = Number(params.id);

      // Fetch league info
      const leaguesRes = await basketballApi.getLeagues({});
      const foundLeague = leaguesRes.result.find((l: any) => Number(l.league_key) === leagueId);
      setLeague(foundLeague);

      // Fetch matches
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
        leagueId,
        from: formatDate(from),
        to: formatDate(to),
      });
      setMatches(matchesRes.result);

      // Fetch standings
      const standingsRes = await basketballApi.getStandings({ leagueId });
      setStandings(standingsRes.result.total);
    } catch (error) {
      console.error('Error loading league details:', error);
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

  if (!league) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>League Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const liveMatches = matches.filter((m) => m.event_live === '1');
  const upcomingMatches = matches.filter((m) => m.event_status === 'Not Started');
  const finishedMatches = matches.filter((m) => m.event_status === 'Finished');

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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{league.league_name}</Text>
          <Text style={styles.headerSubtitle}>{league.country_name}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'matches' && styles.activeTab]}
          onPress={() => setSelectedTab('matches')}
        >
          <Text style={[styles.tabText, selectedTab === 'matches' && styles.activeTabText]}>
            Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'standings' && styles.activeTab]}
          onPress={() => setSelectedTab('standings')}
        >
          <Text style={[styles.tabText, selectedTab === 'standings' && styles.activeTabText]}>
            Standings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'matches' ? (
          <>
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔴 Live Matches</Text>
                {liveMatches.map((match) => (
                  <BasketballMatchCard key={match.event_key} match={match} />
                ))}
              </View>
            )}

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Upcoming Matches</Text>
                {upcomingMatches.map((match) => (
                  <BasketballMatchCard key={match.event_key} match={match} />
                ))}
              </View>
            )}

            {/* Recent Results */}
            {finishedMatches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Recent Results</Text>
                {finishedMatches.slice(0, 10).map((match) => (
                  <BasketballMatchCard key={match.event_key} match={match} />
                ))}
              </View>
            )}

            {matches.length === 0 && <Text style={styles.emptyText}>No matches available</Text>}
          </>
        ) : (
          <View style={styles.standingsContainer}>
            <View style={styles.standingsHeader}>
              <Text style={[styles.standingsHeaderText, styles.posCol]}>#</Text>
              <Text style={[styles.standingsHeaderText, styles.teamCol]}>Team</Text>
              <Text style={[styles.standingsHeaderText, styles.statCol]}>P</Text>
              <Text style={[styles.standingsHeaderText, styles.statCol]}>W</Text>
              <Text style={[styles.standingsHeaderText, styles.statCol]}>L</Text>
              <Text style={[styles.standingsHeaderText, styles.statCol]}>PCT</Text>
            </View>
            {standings.map((standing) => (
              <TouchableOpacity
                key={standing.team_key}
                style={styles.standingRow}
                onPress={() => router.push(`/home/basketball/teams/${standing.team_key}`)}
              >
                <Text style={[styles.standingText, styles.posCol, styles.posText]}>
                  {standing.standing_place}
                </Text>
                <Text style={[styles.standingText, styles.teamCol, styles.teamText]}>
                  {standing.standing_team}
                </Text>
                <Text style={[styles.standingText, styles.statCol]}>{standing.standing_P}</Text>
                <Text style={[styles.standingText, styles.statCol]}>{standing.standing_W}</Text>
                <Text style={[styles.standingText, styles.statCol]}>{standing.standing_L}</Text>
                <Text style={[styles.standingText, styles.statCol, styles.pctText]}>
                  {standing.standing_PCT}
                </Text>
              </TouchableOpacity>
            ))}
            {standings.length === 0 && <Text style={styles.emptyText}>No standings available</Text>}
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
    borderBottomWidth: 1,
    borderBottomColor: '#2a3150',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1f3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#8b92b0',
    fontSize: 14,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: '#8b92b0',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 32,
  },
  standingsContainer: {
    padding: 16,
  },
  standingsHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1a1f3a',
    borderRadius: 8,
    marginBottom: 8,
  },
  standingsHeaderText: {
    color: '#8b92b0',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  standingRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1a1f3a',
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  standingText: {
    color: '#fff',
    fontSize: 14,
  },
  posCol: {
    width: 30,
  },
  teamCol: {
    flex: 1,
  },
  statCol: {
    width: 40,
    textAlign: 'center',
  },
  posText: {
    fontWeight: '700',
    color: '#f59e0b',
  },
  teamText: {
    fontWeight: '600',
  },
  pctText: {
    fontWeight: '600',
    color: '#10b981',
  },
});
