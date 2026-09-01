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
import { FootballTeam } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';

const FEATURED_LEAGUES = [
  { id: '152', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: '302', name: 'La Liga', flag: '🇪🇸' },
  { id: '207', name: 'Serie A', flag: '🇮🇹' },
  { id: '175', name: 'Bundesliga', flag: '🇩🇪' },
  { id: '168', name: 'Ligue 1', flag: '🇫🇷' },
  { id: '278', name: 'Saudi Pro', flag: '🇸🇦' },
  { id: '244', name: 'Eredivisie', flag: '🇳🇱' },
  { id: '266', name: 'Liga Portugal', flag: '🇵🇹' },
  { id: '322', name: 'Süper Lig', flag: '🇹🇷' },
  { id: '99', name: 'Brasileirão', flag: '🇧🇷' },
];

export default function FootballTeamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<FootballTeam[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<FootballTeam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('152');

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTeams();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedLeagueId]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      let response;
      if (searchQuery.trim() === '') {
        response = await advancedFootballApi.getTeams({ leagueId: Number(selectedLeagueId) });
      } else {
        response = await advancedFootballApi.getTeams({ teamName: searchQuery });
      }

      if (response?.result) {
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Football Clubs</Text>
          <Text style={styles.headerSubtitle}>
            {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} listed
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams across all leagues..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* League Filter Pills (shown when not searching) */}
      {!searchQuery.trim() && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          {FEATURED_LEAGUES.map((l) => {
            const active = selectedLeagueId === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => setSelectedLeagueId(l.id)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={styles.pillFlag}>{l.flag}</Text>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{l.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Teams Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brandBlue} />
          <Text style={styles.loadingText}>Loading clubs...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.teamsGrid}>
            {filteredTeams.map((team) => (
              <Pressable
                key={team.team_key}
                style={({ pressed }) => [styles.teamCard, pressed && styles.pressed]}
                onPress={() => router.push(`/home/football/teams/${team.team_key}` as any)}
              >
                <View style={styles.logoWrap}>
                  {team.team_logo ? (
                    <Image source={{ uri: team.team_logo }} style={styles.teamLogo} resizeMode="contain" />
                  ) : (
                    <Text style={styles.logoPlaceholder}>{team.team_name.charAt(0)}</Text>
                  )}
                </View>
                <Text style={styles.teamName} numberOfLines={2}>
                  {team.team_name}
                </Text>
              </Pressable>
            ))}
          </View>

          {filteredTeams.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No clubs found</Text>
              <Text style={styles.emptySubtext}>Try selecting another league or search term</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  pillsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  pillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: COLORS.brandBlue,
  },
  pillFlag: {
    fontSize: 13,
  },
  pillText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  teamCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    padding: 6,
  },
  teamLogo: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  teamName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
