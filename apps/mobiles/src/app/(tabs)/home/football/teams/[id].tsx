import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballTeam, FootballPlayer, FootballEvent, FootballStanding } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballMatchCard } from '../../../../../components/FootballMatchCard';

type TeamTab = 'squad' | 'fixtures' | 'results' | 'table';

export default function TeamDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TeamTab>('squad');
  const [team, setTeam] = useState<FootballTeam | null>(null);
  const [players, setPlayers] = useState<FootballPlayer[]>([]);
  const [fixtures, setFixtures] = useState<FootballEvent[]>([]);
  const [standings, setStandings] = useState<FootballStanding[]>([]);

  useEffect(() => {
    loadTeamData();
  }, [id]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const teamId = Number(id);
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-11

      // Determine season start year (July to June)
      let seasonStartYear = currentYear;
      if (currentMonth < 6) {
        // Jan - Jun
        seasonStartYear = currentYear - 1;
      }

      const fromDate = `${seasonStartYear}-07-01`;
      const toDate = `${seasonStartYear + 1}-06-30`;

      console.log(
        `🔄 Mobile: Loading team details for ${teamId} (Season: ${seasonStartYear}/${seasonStartYear + 1})...`
      );

      const [teamsRes, playersRes, fixturesRes] = await Promise.all([
        advancedFootballApi.getTeams({ teamId }).catch(() => ({ result: [] })),
        advancedFootballApi.getPlayers({ teamId }).catch(() => ({ result: [] })),
        advancedFootballApi
          .getFixtures({
            from: fromDate,
            to: toDate,
            teamId: teamId,
          })
          .catch(() => ({ result: [] })),
      ]);

      const teamData = teamsRes.result[0];
      setTeam(teamData || null);
      setPlayers(playersRes.result || []);
      setFixtures(fixturesRes.result || []);

      // Process Standings with Intelligent Stage Handling
      if (fixturesRes.result?.[0]?.league_key) {
        const leagueId = Number(fixturesRes.result[0].league_key);
        const standingsRes = await advancedFootballApi.getStandings(leagueId).catch(() => null);

        if (standingsRes?.result?.total) {
          const rawStandings = standingsRes.result.total;
          const stageGroups: { [key: string]: FootballStanding[] } = {};

          if (Array.isArray(rawStandings)) {
            rawStandings.forEach((s) => {
              const stageId = s.fk_stage_key || 'default';
              if (!stageGroups[stageId]) stageGroups[stageId] = [];
              stageGroups[stageId].push(s);
            });
          } else if (typeof rawStandings === 'object') {
            // Handle object format if returned
            Object.keys(rawStandings).forEach((stageName) => {
              stageGroups[stageName] = (rawStandings as any)[stageName];
            });
          }

          let bestStage: FootballStanding[] = [];
          Object.values(stageGroups).forEach((stageTeams) => {
            if (stageTeams.length > bestStage.length) {
              bestStage = stageTeams;
            }
          });

          setStandings(bestStage);
        }
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Loading team details...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team not found</Text>
      </View>
    );
  }

  const groupedPlayers = players.reduce(
    (acc, player) => {
      const position = player.player_type || 'Unknown';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(player);
      return acc;
    },
    {} as { [key: string]: FootballPlayer[] }
  );

  const renderStandingsTable = () => (
    <View style={styles.standingsTable}>
      <View style={styles.standingsHeader}>
        <Text style={[styles.standingsHeaderText, styles.posCol]}>#</Text>
        <Text style={[styles.standingsHeaderText, styles.teamCol]}>Team</Text>
        <Text style={[styles.standingsHeaderText, styles.statCol]}>P</Text>
        <Text style={[styles.standingsHeaderText, styles.ptsCol]}>Pts</Text>
      </View>
      {standings.map((standing, index) => (
        <View
          key={`standing-${standing.team_key}-${index}`}
          style={[
            styles.standingsRow,
            String(standing.team_key) === String(id) && styles.highlightedRow,
          ]}
        >
          <Text style={[styles.standingsText, styles.posCol]}>{standing.standing_place}</Text>
          <Text style={[styles.standingsText, styles.teamCol]} numberOfLines={1}>
            {standing.standing_team}
          </Text>
          <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_P}</Text>
          <Text style={[styles.standingsText, styles.ptsCol, styles.ptsValue]}>
            {standing.standing_PTS}
          </Text>
        </View>
      ))}
    </View>
  );

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
        <View style={styles.headerContent}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </Pressable>
          {team.team_logo && <Image source={{ uri: team.team_logo }} style={styles.teamLogo} />}
          <Text style={styles.teamName}>{team.team_name}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            style={[styles.tab, activeTab === 'squad' && styles.activeTab]}
            onPress={() => setActiveTab('squad')}
          >
            <Text style={[styles.tabText, activeTab === 'squad' && styles.activeTabText]}>
              Squad
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'fixtures' && styles.activeTab]}
            onPress={() => setActiveTab('fixtures')}
          >
            <Text style={[styles.tabText, activeTab === 'fixtures' && styles.activeTabText]}>
              Fixtures
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'results' && styles.activeTab]}
            onPress={() => setActiveTab('results')}
          >
            <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
              Results
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'table' && styles.activeTab]}
            onPress={() => setActiveTab('table')}
          >
            <Text style={[styles.tabText, activeTab === 'table' && styles.activeTabText]}>
              Table
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'squad' && (
          <View style={styles.section}>
            {Object.entries(groupedPlayers).map(([position, positionPlayers]) => (
              <View key={position} style={styles.positionGroup}>
                <Text style={styles.positionTitle}>{position}</Text>
                {positionPlayers.map((player, playerIndex) => (
                  <Pressable
                    key={`player-${player.player_key}-${playerIndex}`}
                    style={({ pressed }) => [styles.playerCard, pressed && styles.pressed]}
                    onPress={() =>
                      router.push(`/home/football/players/${player.player_key}` as any)
                    }
                  >
                    <View style={styles.playerInfo}>
                      {player.player_image && (
                        <Image source={{ uri: player.player_image }} style={styles.playerImage} />
                      )}
                      <View style={styles.playerText}>
                        <Text style={styles.playerName}>{player.player_name}</Text>
                        <View style={styles.playerMeta}>
                          {player.player_number && (
                            <Text style={styles.playerNumber}>#{player.player_number}</Text>
                          )}
                          {player.player_age && (
                            <Text style={styles.playerAge}>• {player.player_age} years</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.playerStats}>
                      <Text style={styles.statText}>⚽ {player.player_goals}</Text>
                      {player.player_assists && (
                        <Text style={styles.statText}>🎯 {player.player_assists}</Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
            {players.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No players available</Text>
              </View>
            )}
          </View>
        )}
        {activeTab === 'fixtures' && (
          <View style={styles.section}>
            {fixtures
              .filter((f) => {
                const status = f.event_status?.toLowerCase();
                const isFinished =
                  status === 'finished' ||
                  f.event_status === 'FT' ||
                  f.event_status === 'AET' ||
                  f.event_status === 'AP';
                if (isFinished) return false;

                // Filter for next 90 days
                const eventDate = new Date(`${f.event_date} ${f.event_time || '00:00'}`);
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Start of today
                const dayDiff = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

                return dayDiff >= 0 && dayDiff <= 90;
              })
              .sort(
                (a, b) =>
                  new Date(`${a.event_date} ${a.event_time || '00:00'}`).getTime() -
                  new Date(`${b.event_date} ${b.event_time || '00:00'}`).getTime()
              )
              .map((event, index) => (
                <FootballMatchCard key={`fixture-${event.event_key || index}`} event={event} />
              ))}
            {fixtures.filter((f) => {
              const status = f.event_status?.toLowerCase();
              return (
                status !== 'finished' &&
                f.event_status !== 'FT' &&
                f.event_status !== 'AET' &&
                f.event_status !== 'AP'
              );
            }).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming matches available</Text>
              </View>
            )}
          </View>
        )}
        {activeTab === 'results' && (
          <View style={styles.section}>
            {fixtures
              .filter((f) => {
                const status = f.event_status?.toLowerCase();
                return (
                  status === 'finished' ||
                  f.event_status === 'FT' ||
                  f.event_status === 'AET' ||
                  f.event_status === 'AP'
                );
              })
              .sort(
                (a, b) =>
                  new Date(`${b.event_date} ${b.event_time || '00:00'}`).getTime() -
                  new Date(`${a.event_date} ${a.event_time || '00:00'}`).getTime()
              )
              .map((event, index) => (
                <FootballMatchCard key={`result-${event.event_key || index}`} event={event} />
              ))}
            {fixtures.filter((f) => {
              const status = f.event_status?.toLowerCase();
              return (
                status === 'finished' ||
                f.event_status === 'FT' ||
                f.event_status === 'AET' ||
                f.event_status === 'AP'
              );
            }).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No past results available</Text>
              </View>
            )}
          </View>
        )}
        {activeTab === 'table' && (
          <View style={styles.section}>
            {standings.length > 0 ? (
              renderStandingsTable()
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No table data available</Text>
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
    backgroundColor: '#141C2B',
    padding: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  teamLogo: {
    width: 32,
    height: 32,
    marginRight: SPACING.sm,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 70,
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.sm,
  },
  positionGroup: {
    marginBottom: SPACING.md,
  },
  positionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.sm,
    padding: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerText: {
    flex: 1,
  },
  playerName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 1,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerNumber: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '700',
  },
  playerAge: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: SPACING.xs,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 6,
  },
  statText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  standingsTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  standingsHeader: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  standingsHeaderText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#60A5FA',
    textTransform: 'uppercase',
  },
  standingsRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
  },
  highlightedRow: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  standingsText: {
    fontSize: 10,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  posCol: { width: 24 },
  teamCol: { flex: 1 },
  statCol: { width: 30, textAlign: 'center' },
  ptsCol: { width: 36, textAlign: 'right' },
  ptsValue: { color: '#60A5FA', fontWeight: '800' },
});
