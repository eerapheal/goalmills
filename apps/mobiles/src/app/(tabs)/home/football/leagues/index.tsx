import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import {
  ALL_COMPETITIONS,
  getCompetitionsByCategory,
  CompetitionEntry,
} from '../../../../../lib/competitionCategories';

export default function FootballLeaguesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const competitionGroups = useMemo(() => getCompetitionsByCategory(), []);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return competitionGroups;

    const query = searchQuery.toLowerCase();
    return competitionGroups
      .map(group => ({
        ...group,
        competitions: group.competitions.filter(
          c =>
            c.name.toLowerCase().includes(query) ||
            c.country.toLowerCase().includes(query) ||
            c.slug.toLowerCase().includes(query)
        ),
      }))
      .filter(g => g.competitions.length > 0);
  }, [competitionGroups, searchQuery]);

  const totalCount = ALL_COMPETITIONS.length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>All Competitions</Text>
          <Text style={styles.headerSubtitle}>{totalCount} Major Football Leagues & Tournaments</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search leagues, countries..."
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

      {/* Competition Groups */}
      {filteredGroups.map(group => (
        <View key={group.category} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>{group.icon}</Text>
            <Text style={styles.categoryLabel}>{group.label}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{group.competitions.length}</Text>
            </View>
          </View>

          <View style={styles.competitionGrid}>
            {group.competitions.map(comp => (
              <Pressable
                key={comp.slug}
                onPress={() => router.push(`/home/football/leagues/${comp.id}` as any)}
                style={({ pressed }) => [
                  styles.competitionCard,
                  pressed && styles.competitionCardPressed,
                ]}
              >
                <View style={styles.competitionLogo}>
                  <Image
                    source={{ uri: comp.logo }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.competitionInfo}>
                  <Text style={styles.competitionName} numberOfLines={1}>
                    {comp.name}
                  </Text>
                  <Text style={styles.competitionCountry} numberOfLines={1}>
                    {comp.flag} {comp.country}
                  </Text>
                </View>
                {comp.featured && (
                  <View style={styles.featuredDot} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {filteredGroups.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No leagues found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
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
    marginVertical: SPACING.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  categorySection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '900',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  competitionGrid: {
    gap: SPACING.xs,
  },
  competitionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  competitionCardPressed: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.3)',
  },
  competitionLogo: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logoImage: {
    width: 22,
    height: 22,
  },
  competitionInfo: {
    flex: 1,
  },
  competitionName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  competitionCountry: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  featuredDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
