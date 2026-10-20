import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import {
  ALL_COMPETITIONS,
  COMPETITION_CATEGORY_LABELS,
  CompetitionEntry,
} from '../../lib/competitionCategories';
import { getLeagueRoute } from '../../lib/slugUtils';

interface CompetitionDirectoryProps {
  title?: string;
  showSearch?: boolean;
}

export function CompetitionDirectory({
  title = 'Major Competitions',
  showSearch = true,
}: CompetitionDirectoryProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCompetitions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_COMPETITIONS.filter((comp) => {
      if (selectedCategory !== 'all' && comp.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.country.toLowerCase().includes(q) ||
        comp.slug.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    return Object.entries(COMPETITION_CATEGORY_LABELS).sort(
      ([, a], [, b]) => a.order - b.order
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={{ fontSize: 16 }}>🌐</Text>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredCompetitions.length} Active</Text>
        </View>
      </View>

      {/* ── Search Bar ── */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={14} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search 75+ global & African leagues..."
            placeholderTextColor="#64748B"
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#64748B" />
            </Pressable>
          )}
        </View>
      )}

      {/* ── Category Filter Pills ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <Pressable
          style={[styles.categoryPill, selectedCategory === 'all' && styles.categoryPillActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.categoryPillText,
              selectedCategory === 'all' && styles.categoryPillTextActive,
            ]}
          >
            All ({ALL_COMPETITIONS.length})
          </Text>
        </Pressable>

        {categories.map(([catKey, meta]) => {
          const isActive = selectedCategory === catKey;
          return (
            <Pressable
              key={catKey}
              style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(catKey)}
            >
              <Text style={{ fontSize: 11 }}>{meta.icon}</Text>
              <Text
                style={[
                  styles.categoryPillText,
                  isActive && styles.categoryPillTextActive,
                ]}
              >
                {meta.label.split('(')[0].trim()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Competitions Grid ── */}
      <View style={styles.competitionsGrid}>
        {filteredCompetitions.slice(0, 30).map((comp: CompetitionEntry) => (
          <Pressable
            key={comp.slug}
            style={({ pressed }) => [styles.compCard, pressed && { opacity: 0.75 }]}
            onPress={() => router.push(getLeagueRoute(comp.slug) as any)}
          >
            <View style={styles.compLogoWrap}>
              {comp.logo ? (
                <Image
                  source={{ uri: comp.logo }}
                  style={styles.compLogo}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{comp.flag || '🏆'}</Text>
              )}
            </View>
            <View style={styles.compInfo}>
              <Text style={styles.compName} numberOfLines={1}>
                {comp.name}
              </Text>
              <Text style={styles.compCountry} numberOfLines={1}>
                {comp.country} · {comp.season}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
          </Pressable>
        ))}

        {filteredCompetitions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 28 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No competitions found</Text>
            <Text style={styles.emptySubtitle}>Try searching another league or country.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: 'rgba(10, 22, 43, 0.9)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: SPACING.xs,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06101E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
  },
  categoryScroll: {
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  categoryPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  competitionsGrid: {
    gap: 6,
  },
  compCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070F1E',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  compLogoWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  compLogo: {
    width: '100%',
    height: '100%',
  },
  compInfo: {
    flex: 1,
  },
  compName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  compCountry: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
