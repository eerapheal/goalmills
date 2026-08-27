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
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballTeam } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';

export default function FootballTeamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<FootballTeam[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<FootballTeam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTeams();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      console.log('🔄 Mobile: Searching teams for', searchQuery);

      let response;
      if (searchQuery.trim() === '') {
        // Fetch teams from major leagues as default
        response = await advancedFootballApi.getTeams({ leagueId: 152 }); // Premier League
      } else {
        response = await advancedFootballApi.getTeams({ teamName: searchQuery });
      }

      if (response.result) {
        setTeams(response.result);
        setFilteredTeams(response.result);
      } else {
        setTeams([]);
        setFilteredTeams([]);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👕 Football Teams</Text>
        <Text style={styles.headerSubtitle}>
          {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Teams Grid */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.teamsGrid}>
          {filteredTeams.map((team) => (
            <Pressable
              key={team.team_key}
              style={({ pressed }) => [styles.teamCard, pressed && styles.pressed]}
              onPress={() => router.push(`/home/football/teams/${team.team_key}` as any)}
            >
              {team.team_logo && <Image source={{ uri: team.team_logo }} style={styles.teamLogo} />}
              <Text style={styles.teamName} numberOfLines={2}>
                {team.team_name}
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredTeams.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No teams found</Text>
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
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  teamCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 140,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  teamLogo: {
    width: 64,
    height: 64,
    marginBottom: SPACING.sm,
  },
  teamName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.background,
    textAlign: 'center',
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
