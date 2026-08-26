import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { goalmillsApi } from '../../../services/goalmillsApi';
import { BlogPost } from '@goalmills/types';
import { Ionicons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';
import {
  newsHistoryUtil,
  MobileRecentlyViewedItem,
} from '../../../utils/newsHistory';

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [news, setNews] = useState<BlogPost | null>(null);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState<BlogPost[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<MobileRecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadNewsDetail();
    }
  }, [id]);

  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      const data = await goalmillsApi.getNewsById(id);
      setNews(data);

      if (data) {
        // Track view and history
        newsHistoryUtil.addRecentlyViewed(data);
        goalmillsApi.incrementNewsView(id);

        // Fetch You May Also Like recommendations (same category or general)
        const relatedData = await goalmillsApi.getNews({
          category: data.category,
          exclude: id,
          limit: 3,
        });
        if (Array.isArray(relatedData)) {
          setYouMayAlsoLike(relatedData.filter((n) => n._id !== id).slice(0, 3));
        }

        // Get Recently Viewed
        const recent = newsHistoryUtil.getRecentlyViewed().filter((r) => r._id !== id);
        setRecentlyViewed(recent.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to load news detail:', error);
      setNews(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!news) return;
    try {
      await Share.share({
        title: news.title,
        message: `${news.title}\n\nRead full story on GoalMills: https://goalmills-web.vercel.app/news/${id}`,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.emptyTitle}>Article Not Found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const contentSafeWidth = Math.max(260, width - 32);

  const tagsStyles = {
    body: {
      color: '#CBD5E1',
      fontSize: 15,
      lineHeight: 24,
      maxWidth: contentSafeWidth,
    },
    p: {
      marginBottom: 16,
      lineHeight: 24,
      color: '#CBD5E1',
    },
    h1: {
      color: '#F8FAFC',
      fontSize: 20,
      fontWeight: '800' as const,
      marginBottom: 12,
      marginTop: 8,
    },
    h2: {
      color: '#F8FAFC',
      fontSize: 18,
      fontWeight: '800' as const,
      marginBottom: 10,
      marginTop: 8,
    },
    h3: {
      color: '#F8FAFC',
      fontSize: 16,
      fontWeight: '700' as const,
      marginBottom: 8,
    },
    strong: { color: '#F8FAFC', fontWeight: 'bold' as const },
    a: { color: '#60A5FA', textDecorationLine: 'none' as const },
    li: { marginBottom: 6, color: '#CBD5E1', lineHeight: 22 },
    blockquote: {
      borderLeftColor: '#3B82F6',
      borderLeftWidth: 3,
      paddingLeft: 12,
      fontStyle: 'italic' as const,
      color: '#94A3B8',
      marginVertical: 12,
    },
  };

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <Pressable
          style={styles.navActionBtn}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {news.category || 'Article'}
        </Text>
        <Pressable
          style={styles.navActionBtn}
          onPress={handleShare}
          hitSlop={8}
        >
          <Ionicons name="share-social-outline" size={20} color="#F8FAFC" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        {news.image ? (
          <View style={styles.coverImageContainer}>
            <Image
              source={{ uri: news.image }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={styles.bodyContainer}>
          {/* Badge & Read Time Meta */}
          <View style={styles.badgeRow}>
            {news.isBreaking ? (
              <View style={styles.breakingBadge}>
                <Ionicons name="flame" size={12} color="#EF4444" />
                <Text style={styles.breakingBadgeText}>BREAKING</Text>
              </View>
            ) : null}

            {news.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{news.category}</Text>
              </View>
            ) : null}

            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.metaBadgeText}>
                {news.readTime || 3} min read
              </Text>
            </View>

            {typeof news.views === 'number' && (
              <View style={styles.metaBadge}>
                <Ionicons name="eye-outline" size={12} color="#94A3B8" />
                <Text style={styles.metaBadgeText}>{news.views}</Text>
              </View>
            )}
          </View>

          {/* Article Title */}
          <Text style={styles.articleTitle}>{news.title}</Text>

          {/* Author Row */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {news.author ? news.author.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>
                {news.author || 'GoalMills Staff'}
              </Text>
              <Text style={styles.publishDate}>
                {news.createdAt
                  ? new Date(news.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Today'}
              </Text>
            </View>
          </View>

          {/* Excerpt Lead */}
          {news.excerpt ? (
            <View style={styles.leadContainer}>
              <Text style={styles.leadExcerpt}>{news.excerpt}</Text>
            </View>
          ) : null}

          {/* Content HTML (Strict Mobile Width Constraint) */}
          <View style={[styles.contentSection, { maxWidth: contentSafeWidth }]}>
            {news.content ? (
              <RenderHTML
                contentWidth={contentSafeWidth}
                source={{ html: news.content }}
                tagsStyles={tagsStyles}
              />
            ) : null}
          </View>

          {/* Related Team & Tags */}
          {news.relatedTeam || (Array.isArray(news.tags) && news.tags.length > 0) ? (
            <View style={styles.tagsContainer}>
              {news.relatedTeam ? (
                <View style={styles.teamTag}>
                  <Ionicons name="shield-checkmark" size={13} color="#60A5FA" />
                  <Text style={styles.teamTagText}>
                    Team: {news.relatedTeam}
                  </Text>
                </View>
              ) : null}

              {Array.isArray(news.tags) &&
                news.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>#{tag}</Text>
                  </View>
                ))}
            </View>
          ) : null}
        </View>

        {/* You May Also Like Section */}
        {youMayAlsoLike.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionHeaderTitle}>💡 You May Also Like</Text>
            {youMayAlsoLike.map((item) => (
              <Pressable
                key={item._id}
                style={styles.relatedCard}
                onPress={() => router.push(`/news/${item._id}`)}
              >
                <Image
                  source={{
                    uri:
                      item.image ||
                      'https://picsum.photos/seed/news/200/200',
                  }}
                  style={styles.relatedThumb}
                  resizeMode="cover"
                />
                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedCategory}>
                    {item.category || 'News'}
                  </Text>
                  <Text style={styles.relatedTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.relatedDate}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <View style={styles.recentlyViewedSection}>
            <Text style={styles.sectionHeaderTitle}>👁️ Recently Viewed</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentSlider}
            >
              {recentlyViewed.map((item) => (
                <Pressable
                  key={item._id}
                  style={styles.recentMiniCard}
                  onPress={() => router.push(`/news/${item._id}`)}
                >
                  <Image
                    source={{
                      uri:
                        item.image ||
                        'https://picsum.photos/seed/news/200/200',
                    }}
                    style={styles.recentMiniThumb}
                    resizeMode="cover"
                  />
                  <Text style={styles.recentMiniTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B12',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#070B12',
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
    backgroundColor: '#070B12',
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
    paddingBottom: 50,
  },
  coverImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0E1522',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  bodyContainer: {
    padding: SPACING.md,
    overflow: 'hidden',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  breakingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  breakingBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
  },
  categoryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  categoryText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  articleTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    lineHeight: 28,
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 14,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  authorInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  publishDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  leadContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  leadExcerpt: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#E2E8F0',
    lineHeight: 22,
  },
  contentSection: {
    marginTop: 4,
    overflow: 'hidden',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  teamTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  teamTagText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tagChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  relatedSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 8,
  },
  recentlyViewedSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: SPACING.md,
  },
  relatedCard: {
    flexDirection: 'row',
    backgroundColor: '#0E1522',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  relatedThumb: {
    width: 90,
    height: 80,
  },
  relatedInfo: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  relatedCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  relatedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 16,
  },
  relatedDate: {
    fontSize: 10,
    color: '#64748B',
  },
  recentSlider: {
    gap: 10,
  },
  recentMiniCard: {
    width: 140,
    backgroundColor: '#0E1522',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  recentMiniThumb: {
    width: 140,
    height: 80,
  },
  recentMiniTitle: {
    padding: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 15,
  },
});
