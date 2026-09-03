import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { RecommendationCandidate } from '@goalmills/types';
import { mobileRecommendationService } from '../services/recommendationService';

interface RecommendedFeedProps {
  sportSlug?: string;
  categorySlug?: string;
  teamSlug?: string;
  title?: string;
  limit?: number;
}

export function RecommendedFeed({
  sportSlug,
  categorySlug,
  teamSlug,
  title = 'Recommended For You',
  limit = 5,
}: RecommendedFeedProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<RecommendationCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    mobileRecommendationService
      .getRecommendations({
        sportSlug,
        categorySlug,
        teamSlug,
        context: 'mobile_feed',
        limit,
      })
      .then((items) => {
        if (isMounted) {
          setCandidates(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sportSlug, categorySlug, teamSlug, limit]);

  const handlePress = (item: RecommendationCandidate) => {
    mobileRecommendationService.trackClick(item.id, item.type, 'mobile_feed');
    if (item.type === 'video') {
      router.push(`/(tabs)/highlight/${item.id}` as any);
    } else {
      router.push(`/(tabs)/news/${item.id}` as any);
    }
  };

  if (loading || candidates.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={16} color={COLORS.accent || '#F59E0B'} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.sublabel}>Personalized Discovery</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {candidates.map((item, idx) => (
          <Pressable
            key={item.id + idx}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handlePress(item)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.thumbnail} resizeMode="cover" />
            ) : (
              <View style={styles.fallbackThumbnail}>
                <Ionicons
                  name={item.type === 'video' ? 'videocam' : 'newspaper'}
                  size={24}
                  color="#94A3B8"
                />
              </View>
            )}

            <View style={styles.cardBody}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.reasonBadge || 'Top Story'}</Text>
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.sportText}>
                  {(item.sportSlug || 'General').toUpperCase()}
                </Text>
                <Ionicons name="arrow-forward-circle" size={16} color="#F59E0B" />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sublabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  card: {
    width: 200,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  thumbnail: {
    width: '100%',
    height: 100,
  },
  fallbackThumbnail: {
    width: '100%',
    height: 100,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: SPACING.sm,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FCD34D',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 16,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sportText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default RecommendedFeed;
