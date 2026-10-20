import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { EntityService, PlayerMeta } from '../../lib/entityService';

interface AfricanFootballHeroSpotlightProps {
  initialPlayers?: PlayerMeta[];
}

export function AfricanFootballHeroSpotlight({ initialPlayers }: AfricanFootballHeroSpotlightProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'strikers' | 'playmakers' | 'defenders'
  >('all');

  const africanPlayers: PlayerMeta[] = useMemo(() => {
    if (initialPlayers && initialPlayers.length > 0) return initialPlayers;
    const fromEntity = EntityService.getAfricanPlayers();
    if (fromEntity && fromEntity.length > 0) return fromEntity;
    return EntityService.getAllPlayers().slice(0, 10);
  }, [initialPlayers]);

  const filteredPlayers = useMemo(() => {
    return africanPlayers.filter((p) => {
      const pos = (p.position || '').toLowerCase();
      if (selectedCategory === 'strikers') return /striker|forward|winger/i.test(pos);
      if (selectedCategory === 'playmakers') return /midfield|attacking|central/i.test(pos);
      if (selectedCategory === 'defenders') return /back|defender|goal/i.test(pos);
      return true;
    });
  }, [africanPlayers, selectedCategory]);

  const superstar = filteredPlayers[0] || africanPlayers[0] || null;
  const carouselPlayers = filteredPlayers.slice(1);

  if (!superstar) return null;

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#0A162B', '#091C36', '#06101E']}
        style={styles.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Glow Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.trophyIcon}>
              <Text style={{ fontSize: 14 }}>🏆</Text>
            </View>
            <View>
              <Text style={styles.headerBadge}>AFRICAN SPOTLIGHT</Text>
              <Text style={styles.headerTitle}>Continental Superstars</Text>
            </View>
          </View>

          {/* Category Filter Pills */}
          <View style={styles.categoryPills}>
            {(['all', 'strikers', 'playmakers', 'defenders'] as const).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  style={[styles.catPill, active && styles.catPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                    {cat === 'all'
                      ? 'All'
                      : cat === 'strikers'
                      ? 'Strikers'
                      : cat === 'playmakers'
                      ? 'Mids'
                      : 'Defs'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Featured Superstar Showcase ── */}
        <Pressable
          style={({ pressed }) => [styles.superstarCard, pressed && { opacity: 0.85 }]}
          onPress={() => router.push(`/home/football/players/${superstar.id || superstar.slug}` as any)}
        >
          <View style={styles.superstarImageWrap}>
            {superstar.photo ? (
              <Image source={{ uri: superstar.photo }} style={styles.superstarImage} />
            ) : (
              <View style={styles.superstarImagePlaceholder}>
                <Text style={{ fontSize: 28 }}>👤</Text>
              </View>
            )}
            <View style={styles.flagBadge}>
              <Text style={{ fontSize: 13 }}>{superstar.countryFlag ? '🌍' : '🇳🇬'}</Text>
            </View>
          </View>

          <View style={styles.superstarDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.superstarName} numberOfLines={1}>
                {superstar.name}
              </Text>
              <View style={styles.positionPill}>
                <Text style={styles.positionText}>{superstar.position}</Text>
              </View>
            </View>

            <Text style={styles.superstarClub} numberOfLines={1}>
              {superstar.clubName} • Age {superstar.age}
            </Text>

            {/* Quick Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>VALUE</Text>
                <Text style={styles.metricVal}>{superstar.marketValue || '€70M'}</Text>
              </View>
              {superstar.seasonStats && (
                <>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>GOALS</Text>
                    <Text style={[styles.metricVal, { color: '#34D399' }]}>
                      {superstar.seasonStats.goals || 0} ⚽
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>RATING</Text>
                    <Text style={[styles.metricVal, { color: '#FBBF24' }]}>
                      ★ {superstar.seasonStats.rating?.toFixed(1) || '8.2'}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </Pressable>

        {/* ── Horizontal Talent Carousel ── */}
        {carouselPlayers.length > 0 && (
          <View style={styles.carouselSection}>
            <Text style={styles.carouselTitle}>Rising Talents & Marquee Stars</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselScroll}
            >
              {carouselPlayers.map((p) => (
                <Pressable
                  key={p.id || p.slug}
                  style={({ pressed }) => [styles.miniPlayerCard, pressed && { opacity: 0.75 }]}
                  onPress={() => router.push(`/home/football/players/${p.id || p.slug}` as any)}
                >
                  <View style={styles.miniPhotoWrap}>
                    {p.photo ? (
                      <Image source={{ uri: p.photo }} style={styles.miniPhoto} />
                    ) : (
                      <Text style={{ fontSize: 16 }}>👤</Text>
                    )}
                  </View>
                  <Text style={styles.miniName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.miniClub} numberOfLines={1}>
                    {p.clubName}
                  </Text>
                  <View style={styles.miniValuePill}>
                    <Text style={styles.miniValueText}>{p.marketValue || '€35M'}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    overflow: 'hidden',
  },
  gradientCard: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  trophyIcon: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  categoryPills: {
    flexDirection: 'row',
    gap: 4,
  },
  catPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  catPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  catPillTextActive: {
    color: '#FBBF24',
    fontWeight: '800',
  },
  superstarCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.sm,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  superstarImageWrap: {
    width: 68,
    height: 68,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    position: 'relative',
  },
  superstarImage: {
    width: '100%',
    height: '100%',
  },
  superstarImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 2,
  },
  superstarDetails: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  superstarName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
  },
  positionPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  positionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#60A5FA',
    textTransform: 'uppercase',
  },
  superstarClub: {
    fontSize: FONT_SIZES.xs,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: SPACING.xs,
    marginTop: 4,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  carouselSection: {
    marginTop: SPACING.sm,
  },
  carouselTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  carouselScroll: {
    gap: SPACING.xs,
  },
  miniPlayerCard: {
    width: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
    alignItems: 'center',
    gap: 3,
  },
  miniPhotoWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPhoto: {
    width: '100%',
    height: '100%',
  },
  miniName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  miniClub: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
  },
  miniValuePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  miniValueText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FBBF24',
  },
});
