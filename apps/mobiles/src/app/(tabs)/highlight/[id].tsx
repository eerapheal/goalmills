import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { goalmillsApi } from '../../../services/goalmillsApi';
import { mapInternalVideoToHighlight } from '../../../utils/footballAdapters';
import { VideoHighlight } from '@goalmills/types';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';

const getYoutubeId = (url: string) => {
  if (!url) return null;
  if (url.includes('embed/')) {
    return url.split('embed/')[1].split('?')[0];
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function HighlightDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<VideoHighlight | null>(null);
  const [related, setRelated] = useState<VideoHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadVideoDetail();
    }
  }, [id]);

  const loadVideoDetail = async () => {
    try {
      setLoading(true);
      const [data, allVideos] = await Promise.all([
        goalmillsApi.getVideoById(id),
        goalmillsApi.getVideos(),
      ]);

      if (data) {
        setVideo(mapInternalVideoToHighlight(data));
      } else {
        setVideo(null);
      }

      if (Array.isArray(allVideos)) {
        const mapped = allVideos
          .filter((v: any) => v._id !== id)
          .map(mapInternalVideoToHighlight);
        setRelated(mapped.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to load video detail:', error);
      setVideo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!video) return;
    try {
      await Share.share({
        title: video.title,
        message: `Watch ${video.title} on GoalMills! ${video.videoUrl}`,
        url: video.videoUrl,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading video replay...</Text>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.emptyTitle}>Highlight Not Found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const youtubeId = getYoutubeId(video.videoUrl || '');

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <Pressable style={styles.navActionBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {video.matchInfo?.league || 'Match Highlight'}
        </Text>
        <Pressable style={styles.navActionBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#F8FAFC" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Video Player Box */}
        <View style={styles.playerContainer}>
          {youtubeId ? (
            <YoutubePlayer
              height={220}
              play={isPlaying}
              videoId={youtubeId}
              onChangeState={(state: string) => {
                if (state === 'ended') setIsPlaying(false);
              }}
            />
          ) : (
            <Image
              source={{ uri: video.thumbnail }}
              style={styles.fallbackPlayerImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Video Metadata Card */}
        <View style={styles.metaCard}>
          <View style={styles.badgeRow}>
            {video.matchInfo?.league ? (
              <View style={styles.leagueBadge}>
                <Text style={styles.leagueBadgeText}>{video.matchInfo.league}</Text>
              </View>
            ) : null}
            {video.duration ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title}>{video.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color="#94A3B8" />
              <Text style={styles.statText}>{video.views || 0} views</Text>
            </View>
            {video.matchInfo?.date ? (
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                <Text style={styles.statText}>{video.matchInfo.date}</Text>
              </View>
            ) : null}
          </View>

          {video.description ? (
            <Text style={styles.description}>{video.description}</Text>
          ) : null}
        </View>

        {/* Related Highlights */}
        {related.length > 0 ? (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedHeaderTitle}>Related Highlights</Text>
            {related.map((item) => (
              <Pressable
                key={item.id}
                style={styles.relatedRow}
                onPress={() => router.push(`/highlight/${item.id}`)}
              >
                <Image
                  source={{ uri: item.thumbnail || 'https://picsum.photos/seed/rel/400/225' }}
                  style={styles.relatedThumb}
                  resizeMode="cover"
                />
                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.relatedMeta}>
                    {item.matchInfo?.league || 'Sports'} • {item.views || 0} views
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0B0F17',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 13,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#1E293B',
  },
  backBtnText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 13,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  navActionBtn: {
    padding: 6,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000000',
  },
  fallbackPlayerImage: {
    width: '100%',
    height: 220,
  },
  metaCard: {
    backgroundColor: '#141C2B',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  leagueBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  leagueBadgeText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '700',
  },
  durationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 24,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  description: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  relatedSection: {
    padding: SPACING.md,
  },
  relatedHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: SPACING.md,
  },
  relatedRow: {
    flexDirection: 'row',
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  relatedThumb: {
    width: 110,
    height: 70,
  },
  relatedInfo: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 17,
  },
  relatedMeta: {
    fontSize: 11,
    color: '#64748B',
  },
});
