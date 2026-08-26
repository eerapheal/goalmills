import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { VideoHighlight } from '@goalmills/types';
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

interface VideoCardProps {
  item: VideoHighlight;
  onPress: () => void;
}

export const VideoCard = ({ item, onPress }: VideoCardProps) => {
  if (!item) return null;

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views ? views.toString() : '0';
  };

  const leagueName = item.matchInfo?.league || item.league?.name;
  const dateStr = item.matchInfo?.date || item.date;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnail || 'https://picsum.photos/seed/video/800/450' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        </View>

        {item.duration ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        ) : null}

        {leagueName ? (
          <View style={styles.leagueBadge}>
            <Text style={styles.leagueText} numberOfLines={1}>
              {leagueName}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Ionicons name="eye-outline" size={13} color="#94A3B8" />
            <Text style={styles.metaText}>{formatViews(item.views)} views</Text>
          </View>

          {dateStr ? (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color="#94A3B8" />
              <Text style={styles.metaText}>{dateStr}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  leagueBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  leagueText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
