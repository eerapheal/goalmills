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
import { GoalmillsLoader } from '../../../components/GoalmillsLoader';
import RenderHTML from 'react-native-render-html';
import {
  newsHistoryUtil,
  MobileRecentlyViewedItem,
} from '../../../utils/newsHistory';

// Helper to cleanly split rich HTML article content at ~50% word count (before the next paragraph)
function splitContentAtMidpoint(content: string): { firstHalf: string; secondHalf: string } {
  if (!content) return { firstHalf: '', secondHalf: '' };

  const getWordCount = (html: string) => {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  };

  const totalWords = getWordCount(content);
  // If article is very short (< 40 words), don't split; render in full first
  if (totalWords < 40) {
    return { firstHalf: content, secondHalf: '' };
  }

  const targetWords = totalWords * 0.5;

  // Split on block closings (paragraphs, blockquotes, figures, headings, divs)
  const blockRegex = /(<\/(?:p|blockquote|figure|h2|h3|h4|div|section)>)/i;
  const parts = content.split(blockRegex);

  if (parts.length > 2) {
    let accumulatedWords = 0;
    let splitIndex = -1;

    for (let i = 0; i < parts.length; i += 2) {
      const segment = parts[i] + (parts[i + 1] || '');
      accumulatedWords += getWordCount(segment);

      // Once we pass ~50% words and have remaining content, split before next paragraph
      if (accumulatedWords >= targetWords && i + 2 < parts.length) {
        splitIndex = i + 2;
        break;
      }
    }

    if (splitIndex !== -1) {
      return {
        firstHalf: parts.slice(0, splitIndex).join(''),
        secondHalf: parts.slice(splitIndex).join(''),
      };
    }
  }

  // Fallback: split on double newlines if no HTML block tags
  const newlineParts = content.split(/(\n\s*\n)/);
  if (newlineParts.length > 2) {
    let accumulatedWords = 0;
    let splitIndex = -1;
    for (let i = 0; i < newlineParts.length; i += 2) {
      const segment = newlineParts[i] + (newlineParts[i + 1] || '');
      accumulatedWords += getWordCount(segment);
      if (accumulatedWords >= targetWords && i + 2 < newlineParts.length) {
        splitIndex = i + 2;
        break;
      }
    }
    if (splitIndex !== -1) {
      return {
        firstHalf: newlineParts.slice(0, splitIndex).join(''),
        secondHalf: newlineParts.slice(splitIndex).join(''),
      };
    }
  }

  return { firstHalf: content, secondHalf: '' };
}

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [news, setNews] = useState<BlogPost | null>(null);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState<BlogPost[]>([]);
  const [moreStories, setMoreStories] = useState<BlogPost[]>([]);
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

        // Fetch 3 filtered related articles for in-content recommendation
        const relatedData = await goalmillsApi.getNews({
          category: data.category,
          exclude: id,
          limit: 8,
        });

        let inContent: BlogPost[] = [];
        let bottomMore: BlogPost[] = [];

        if (Array.isArray(relatedData)) {
          const filtered = relatedData.filter((n: any) => n._id !== id);
          inContent = filtered.slice(0, 3);
          bottomMore = filtered.slice(3, 7);
        }

        // If fewer than 3 related found, backfill from general news
        if (inContent.length < 3) {
          const allNews = await goalmillsApi.getNews({ limit: 10 });
          if (Array.isArray(allNews)) {
            const usedIds = new Set([id, ...inContent.map((n) => n._id)]);
            const backfill = allNews.filter((n: any) => !usedIds.has(n._id));
            inContent = [...inContent, ...backfill.slice(0, 3 - inContent.length)];
            bottomMore = backfill.slice(3 - inContent.length, 7);
          }
        }

        setYouMayAlsoLike(inContent);
        setMoreStories(bottomMore);

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
        <GoalmillsLoader size="fullscreen" label="GoalMills News" sublabel="Loading story & exclusive analysis..." />
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
  const { firstHalf, secondHalf } = splitContentAtMidpoint(news.content || '');

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
        {/* Cover Image - Compact height */}
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

          {/* First Half of Content HTML */}
          {firstHalf ? (
            <View style={[styles.contentSection, { maxWidth: contentSafeWidth }]}>
              <RenderHTML
                contentWidth={contentSafeWidth}
                source={{ html: firstHalf }}
                tagsStyles={tagsStyles}
              />
            </View>
          ) : null}

          {/* In-Article "You May Also Like" - 3 Clickable Filtered Cards at ~50% mark */}
          {youMayAlsoLike.length > 0 && (
            <View style={styles.inContentRelatedBox}>
              <View style={styles.inContentHeader}>
                <View style={styles.inContentHeaderLeft}>
                  <View style={styles.inContentIconBadge}>
                    <Ionicons name="flash" size={12} color="#60A5FA" />
                  </View>
                  <View>
                    <Text style={styles.inContentTitle}>YOU MAY ALSO LIKE</Text>
                    <Text style={styles.inContentSubtitle}>
                      Recommended stories related to this article
                    </Text>
                  </View>
                </View>
                <View style={styles.suggestedBadge}>
                  <Text style={styles.suggestedBadgeText}>SUGGESTED</Text>
                </View>
              </View>

              <View style={styles.inContentCardList}>
                {youMayAlsoLike.map((item) => (
                  <Pressable
                    key={item._id}
                    style={({ pressed }) => [
                      styles.inContentCard,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => router.push(`/news/${item._id}`)}
                  >
                    <Image
                      source={{
                        uri:
                          item.image ||
                          'https://picsum.photos/seed/news/200/200',
                      }}
                      style={styles.inContentThumb}
                      resizeMode="cover"
                    />
                    <View style={styles.inContentInfo}>
                      <View style={styles.inContentMetaRow}>
                        <Text style={styles.inContentCategory} numberOfLines={1}>
                          {item.category || 'News'}
                        </Text>
                        <Text style={styles.inContentMetaDot}>•</Text>
                        <View style={styles.inContentTimeRow}>
                          <Ionicons name="time-outline" size={10} color="#94A3B8" />
                          <Text style={styles.inContentTimeText}>
                            {item.readTime || 3}m
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.inContentCardTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <View style={styles.inContentActionRow}>
                        <Text style={styles.readStoryText}>Read Story</Text>
                        <Ionicons name="arrow-forward" size={11} color="#60A5FA" />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Second Half of Content HTML (Rest of text) */}
          {secondHalf ? (
            <View style={[styles.contentSection, { maxWidth: contentSafeWidth }]}>
              <RenderHTML
                contentWidth={contentSafeWidth}
                source={{ html: secondHalf }}
                tagsStyles={tagsStyles}
              />
            </View>
          ) : null}

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

        {/* More Related Stories Section at bottom */}
        {moreStories.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionHeaderTitle}>💡 More Related Stories</Text>
            {moreStories.map((item) => (
              <Pressable
                key={item._id}
                style={({ pressed }) => [
                  styles.relatedCard,
                  pressed && styles.cardPressed,
                ]}
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
  inContentRelatedBox: {
    marginVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    backgroundColor: '#0A1122',
    padding: 12,
  },
  inContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  inContentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  inContentIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inContentTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  inContentSubtitle: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  suggestedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  suggestedBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.5,
  },
  inContentCardList: {
    gap: 7,
  },
  inContentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1522',
    borderRadius: 10,
    padding: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 9,
  },
  cardPressed: {
    opacity: 0.75,
  },
  inContentThumb: {
    width: 60,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#070B12',
  },
  inContentInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  inContentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  inContentCategory: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#60A5FA',
    textTransform: 'uppercase',
  },
  inContentMetaDot: {
    fontSize: 8.5,
    color: '#64748B',
  },
  inContentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inContentTimeText: {
    fontSize: 8.5,
    color: '#94A3B8',
  },
  inContentCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 15,
  },
  inContentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  readStoryText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#60A5FA',
  },
});
