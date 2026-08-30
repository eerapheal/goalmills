import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Share,
  Linking,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { goalmillsApi } from '../../../services/goalmillsApi';
import { mapInternalVideoToHighlight } from '../../../utils/footballAdapters';
import { VideoHighlight } from '@goalmills/types';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round((width * 9) / 16);

// Universal YouTube Video ID Parser
export const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  try {
    const trimmed = url.trim();
    if (trimmed.includes('youtube.com/embed/')) {
      return trimmed.split('embed/')[1].split('?')[0].split('/')[0];
    }
    if (trimmed.includes('youtube.com/shorts/')) {
      return trimmed.split('shorts/')[1].split('?')[0].split('/')[0];
    }
    if (trimmed.includes('youtu.be/')) {
      return trimmed.split('youtu.be/')[1].split('?')[0].split('/')[0];
    }
    if (trimmed.includes('youtube.com/watch')) {
      const match = trimmed.match(/[?&]v=([^&#]*)/);
      return match && match[1] ? match[1] : null;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return match && match[2] && match[2].length === 11 ? match[2] : null;
  } catch (e) {
    return null;
  }
};

export default function HighlightDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<VideoHighlight | null>(null);
  const [related, setRelated] = useState<VideoHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true); // Autoplay enabled
  const [playerReady, setPlayerReady] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const router = useRouter();

  const loadVideoDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setEmbedError(false);
      const [data, allVideos] = await Promise.all([
        goalmillsApi.getVideoById(id),
        goalmillsApi.getVideos(),
      ]);

      if (data) {
        setVideo(mapInternalVideoToHighlight(data));
        // Automatically track video view on click-through
        goalmillsApi.incrementVideoView(id);
      } else {
        setVideo(null);
      }

      if (Array.isArray(allVideos)) {
        const mapped = allVideos.filter((v: any) => v._id !== id).map(mapInternalVideoToHighlight);
        setRelated(mapped.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load video detail:', error);
      setVideo(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setIsPlaying(true);
    loadVideoDetail();
  }, [id, loadVideoDetail]);

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

  const handleOpenExternal = () => {
    if (video?.videoUrl) {
      Linking.openURL(video.videoUrl).catch((err) => console.error('Could not open URL:', err));
    }
  };

  const youtubeId = useMemo(() => {
    return video?.videoUrl ? getYoutubeId(video.videoUrl) : null;
  }, [video?.videoUrl]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading match replay...</Text>
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/highlight');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <Pressable style={styles.navActionBtn} onPress={handleBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {video.matchInfo?.league || video.title || 'HD Match Highlight'}
        </Text>
        <Pressable style={styles.navActionBtn} onPress={handleShare} hitSlop={10}>
          <Ionicons name="share-social-outline" size={20} color="#F8FAFC" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Video Player Box with Guaranteed Autoplay & Error 150/153 Fallback */}
        <View style={styles.playerContainer}>
          {embedError ? (
            <View style={styles.embedErrorBox}>
              <Ionicons name="lock-closed-outline" size={36} color="#F59E0B" />
              <Text style={styles.embedErrorTitle}>Broadcaster Embed Restricted</Text>
              <Text style={styles.embedErrorSubtitle}>
                The video owner requires watching directly on YouTube (Error 150/153).
              </Text>
              <Pressable style={styles.openYoutubeBtn} onPress={handleOpenExternal}>
                <Ionicons name="logo-youtube" size={18} color="#FFFFFF" />
                <Text style={styles.openYoutubeBtnText}>Watch on YouTube</Text>
              </Pressable>
            </View>
          ) : youtubeId ? (
            <YoutubePlayer
              height={PLAYER_HEIGHT}
              play={isPlaying}
              videoId={youtubeId}
              onReady={() => setPlayerReady(true)}
              onError={(error: string) => {
                console.warn('YouTube Player error:', error);
                if (
                  error === 'embed_not_allowed' ||
                  error === 'video_not_found' ||
                  error === 'invalid_parameter'
                ) {
                  setEmbedError(true);
                }
              }}
              onChangeState={(state: string) => {
                if (state === 'ended') setIsPlaying(false);
              }}
              initialPlayerParams={{
                preventFullScreen: false,
                cc_lang_pref: 'en',
                showClosedCaptions: false,
                loop: false,
                controls: true,
                origin: 'https://www.youtube.com',
              }}
              webViewProps={{
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
                androidLayerType: 'hardware',
                baseUrl: 'https://www.youtube-nocookie.com',
              }}
            />
          ) : video.videoUrl &&
            (video.videoUrl.endsWith('.mp4') || video.videoUrl.includes('stream')) ? (
            <View style={{ height: PLAYER_HEIGHT, width: '100%', backgroundColor: '#000' }}>
              <WebView
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                      <style>
                        body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                        video { width: 100%; height: 100%; object-fit: contain; }
                      </style>
                    </head>
                    <body>
                      <video src="${video.videoUrl}" poster="${video.thumbnail || ''}" autoplay playsinline controls></video>
                    </body>
                    </html>
                  `,
                }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                style={{ flex: 1, backgroundColor: '#000' }}
              />
            </View>
          ) : (
            <View style={styles.fallbackContainer}>
              <Image
                source={{
                  uri:
                    video.thumbnail ||
                    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
                }}
                style={styles.fallbackPlayerImage}
                resizeMode="cover"
              />
              <Pressable style={styles.playOverlay} onPress={handleOpenExternal}>
                <Ionicons name="play-circle" size={54} color="#3B82F6" />
                <Text style={styles.playOverlayText}>Play Stream</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Video Metadata Card */}
        <View style={styles.metaCard}>
          <View style={styles.badgeRow}>
            {video.matchInfo?.league ? (
              <View style={styles.leagueBadge}>
                <Text style={styles.leagueBadgeText}>{video.matchInfo.league}</Text>
              </View>
            ) : (
              <View style={styles.leagueBadge}>
                <Text style={styles.leagueBadgeText}>HD Replay</Text>
              </View>
            )}

            {video.duration ? (
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={11} color="#94A3B8" />
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            ) : null}

            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Autoplay Ready</Text>
            </View>
          </View>

          <Text style={styles.title}>{video.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color="#3B82F6" />
              <Text style={styles.statText}>{video.views || 0} views</Text>
            </View>
            {video.matchInfo?.date ? (
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                <Text style={styles.statText}>{video.matchInfo.date}</Text>
              </View>
            ) : null}
            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
              <Text style={styles.statText}>Verified</Text>
            </View>
          </View>

          {video.description ? <Text style={styles.description}>{video.description}</Text> : null}
        </View>

        {/* Related Highlights */}
        {related.length > 0 ? (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeaderRow}>
              <Text style={styles.relatedHeaderTitle}>Up Next & Related</Text>
              <Text style={styles.relatedCount}>{related.length} videos</Text>
            </View>

            {related.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.relatedRow,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
                ]}
                onPress={() => router.push(`/highlight/${item.id}`)}
              >
                <View style={styles.relatedThumbContainer}>
                  <Image
                    source={{
                      uri:
                        item.thumbnail ||
                        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
                    }}
                    style={styles.relatedThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.miniPlayBtn}>
                    <Ionicons name="play" size={10} color="#FFFFFF" />
                  </View>
                  {item.duration ? (
                    <View style={styles.durationPill}>
                      <Text style={styles.durationPillText}>{item.duration}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.relatedMetaRow}>
                    <Text style={styles.relatedMeta}>{item.matchInfo?.league || 'Sports'}</Text>
                    <Text style={styles.relatedMeta}>•</Text>
                    <Text style={styles.relatedMeta}>{item.views || 0} views</Text>
                  </View>
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
    fontWeight: '600',
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
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  fallbackContainer: {
    width: '100%',
    height: PLAYER_HEIGHT,
    position: 'relative',
  },
  fallbackPlayerImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  embedErrorBox: {
    width: '100%',
    height: PLAYER_HEIGHT,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  embedErrorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 8,
  },
  embedErrorSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    maxWidth: 260,
  },
  openYoutubeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  openYoutubeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    marginBottom: 10,
  },
  leagueBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  leagueBadgeText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  liveIndicator: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
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
    gap: 14,
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
    fontWeight: '600',
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
  relatedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  relatedHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  relatedCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
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
  relatedThumbContainer: {
    position: 'relative',
    width: 120,
    height: 75,
    backgroundColor: '#000',
  },
  relatedThumb: {
    width: '100%',
    height: '100%',
  },
  miniPlayBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPill: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  durationPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  relatedInfo: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  relatedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 16,
  },
  relatedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  relatedMeta: {
    fontSize: 11,
    color: '#64748B',
  },
});
