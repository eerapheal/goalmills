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
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlogPost } from '@goalmills/types';
import { Ionicons } from '@expo/vector-icons';
import { GoalmillsLoader } from '../../../components/GoalmillsLoader';
import RenderHTML from 'react-native-render-html';
import { newsHistoryUtil, MobileRecentlyViewedItem } from '../../../utils/newsHistory';
import { goalmillsApi } from '../../../services/goalmillsApi';

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
  if (totalWords < 40) {
    return { firstHalf: content, secondHalf: '' };
  }

  const targetWords = totalWords * 0.5;
  const blockRegex = /(<\/(?:p|blockquote|figure|h2|h3|h4|div|section)>)/i;
  const parts = content.split(blockRegex);

  if (parts.length > 2) {
    let accumulatedWords = 0;
    let splitIndex = -1;

    for (let i = 0; i < parts.length; i += 2) {
      const segment = parts[i] + (parts[i + 1] || '');
      accumulatedWords += getWordCount(segment);

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
        newsHistoryUtil.addRecentlyViewed(data);
        goalmillsApi.incrementNewsView(id);

        const teamSlug = Array.isArray(data.teams) && data.teams[0]?.slug;
        const playerSlug = Array.isArray(data.players) && data.players[0]?.slug;

        const relatedData = await goalmillsApi.getNews({
          category: data.category,
          competition: data.competitionSlug,
          team: teamSlug || undefined,
          player: playerSlug || undefined,
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
        <GoalmillsLoader
          size="fullscreen"
          label="GoalMills News"
          sublabel="Loading story & exclusive analysis..."
        />
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
      marginVertical: 12,
      fontStyle: 'italic' as const,
      color: '#93C5FD',
    },
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/news');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Dynamic 4-Level Breadcrumb Bar on Mobile with Back Button */}
      <View style={styles.breadcrumbsBar}>
        <TouchableOpacity onPress={handleBack} style={{ marginRight: 6 }}>
          <Ionicons name="arrow-back" size={18} color="#F8FAFC" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home' as any)}>
          <Text style={styles.breadcrumbLink}>Home</Text>
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={10} color="#64748b" />
        <TouchableOpacity onPress={() => router.push('/(tabs)/home' as any)}>
          <Text style={styles.breadcrumbLink}>{news.sport || 'Football'}</Text>
        </TouchableOpacity>
        {news.competition ? (
          <>
            <Ionicons name="chevron-forward" size={10} color="#64748b" />
            <Text style={styles.breadcrumbLink} numberOfLines={1}>
              {news.competition}
            </Text>
          </>
        ) : null}
      </View>

      {/* Cover Image */}
      {news.image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: news.image }} style={styles.coverImage} resizeMode="cover" />
          <TouchableOpacity style={styles.shareFab} onPress={handleShare}>
            <Ionicons name="share-social" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.bodyContainer}>
        {/* Entity Badges Row */}
        <View style={styles.badgeRow}>
          {news.isBreaking ? (
            <View style={styles.breakingBadge}>
              <Ionicons name="flame" size={12} color="#EF4444" />
              <Text style={styles.breakingBadgeText}>BREAKING</Text>
            </View>
          ) : null}

          {news.competition ? (
            <View style={styles.competitionBadge}>
              <Text style={styles.competitionBadgeText}>{news.competition}</Text>
            </View>
          ) : null}

          {news.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{news.category}</Text>
            </View>
          ) : null}

          <View style={styles.metaBadge}>
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text style={styles.metaBadgeText}>{news.readTime || 3}m</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.articleTitle}>{news.title}</Text>

        {/* Author Meta */}
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {news.author ? news.author.charAt(0).toUpperCase() : 'G'}
            </Text>
          </View>
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{news.author || 'GoalMills Staff'}</Text>
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

        {/* Content Section 1 */}
        {firstHalf ? (
          <View style={[styles.contentSection, { maxWidth: contentSafeWidth }]}>
            <RenderHTML
              contentWidth={contentSafeWidth}
              source={{ html: firstHalf }}
              tagsStyles={tagsStyles}
            />
          </View>
        ) : null}

        {/* In-Article Recommendation */}
        {youMayAlsoLike.length > 0 && (
          <View style={styles.inContentRelatedBox}>
            <View style={styles.inContentHeader}>
              <Ionicons name="flash" size={14} color="#60A5FA" />
              <Text style={styles.inContentTitle}>RELATED INTELLIGENCE</Text>
            </View>
            {youMayAlsoLike.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.inContentCard}
                onPress={() => router.push(`/(tabs)/news/${item._id}` as any)}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.inContentThumb} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.inContentCategory}>{item.category || 'News'}</Text>
                  <Text style={styles.inContentCardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Content Section 2 */}
        {secondHalf ? (
          <View style={[styles.contentSection, { maxWidth: contentSafeWidth }]}>
            <RenderHTML
              contentWidth={contentSafeWidth}
              source={{ html: secondHalf }}
              tagsStyles={tagsStyles}
            />
          </View>
        ) : null}

        {/* More Stories */}
        {moreStories.length > 0 && (
          <View style={styles.bottomSection}>
            <Text style={styles.bottomSectionTitle}>More Sports Intelligence</Text>
            {moreStories.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.moreCard}
                onPress={() => router.push(`/(tabs)/news/${item._id}` as any)}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.moreThumb} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.moreCategory}>{item.category || 'News'}</Text>
                  <Text style={styles.moreTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B12',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#070B12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  breadcrumbsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0c162d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  breadcrumbLink: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#091224',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  shareFab: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyContainer: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  breakingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  breakingBadgeText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
  },
  competitionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  competitionBadgeText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '900',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '700',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  articleTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInitial: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  publishDate: {
    color: '#64748b',
    fontSize: 10,
  },
  leadContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  leadExcerpt: {
    color: '#e2e8f0',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  contentSection: {
    marginBottom: 16,
  },
  inContentRelatedBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginVertical: 14,
    gap: 8,
  },
  inContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  inContentTitle: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  inContentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 8,
  },
  inContentThumb: {
    width: 60,
    height: 45,
    borderRadius: 6,
  },
  inContentCategory: {
    color: '#3b82f6',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  inContentCardTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  bottomSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 16,
  },
  bottomSectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  moreCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  moreThumb: {
    width: 70,
    height: 50,
    borderRadius: 8,
  },
  moreCategory: {
    color: '#3b82f6',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  moreTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  backBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
