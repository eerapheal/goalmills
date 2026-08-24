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
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { goalmillsApi } from '../../../services/goalmillsApi';
import { BlogPost } from '@goalmills/types';
import { Ionicons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [news, setNews] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
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
      const [data, allNews] = await Promise.all([
        goalmillsApi.getNewsById(id),
        goalmillsApi.getNews(),
      ]);

      setNews(data);

      if (Array.isArray(allNews)) {
        const filtered = allNews.filter((n: any) => n._id !== id);
        setRelated(filtered.slice(0, 3));
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
        message: `${news.title} - Read on GoalMills!`,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading article...</Text>
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

  const tagsStyles = {
    body: {
      color: '#CBD5E1',
      fontSize: 15,
      lineHeight: 24,
    },
    p: {
      marginBottom: 16,
    },
    h1: { color: '#F8FAFC', fontSize: 22, fontWeight: 'bold' as const, marginBottom: 12 },
    h2: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' as const, marginBottom: 10 },
    h3: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' as const, marginBottom: 8 },
    strong: { color: '#F8FAFC', fontWeight: 'bold' as const },
    a: { color: '#3B82F6', textDecorationLine: 'none' as const },
    li: { marginBottom: 6, color: '#CBD5E1' },
    blockquote: {
      borderLeftColor: '#3B82F6',
      borderLeftWidth: 4,
      paddingLeft: 12,
      fontStyle: 'italic' as const,
      color: '#94A3B8',
      marginVertical: 12,
    },
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navBar}>
        <Pressable style={styles.navActionBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {news.category || 'Article'}
        </Text>
        <Pressable style={styles.navActionBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#F8FAFC" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cover Image */}
        {news.image ? (
          <Image source={{ uri: news.image }} style={styles.coverImage} resizeMode="cover" />
        ) : null}

        <View style={styles.bodyContainer}>
          {/* Category & Read Time Badge */}
          <View style={styles.badgeRow}>
            {news.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{news.category}</Text>
              </View>
            ) : null}
            <View style={styles.readTimeBadge}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.readTimeText}>{news.readTime || 3} min read</Text>
            </View>
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
            <View>
              <Text style={styles.authorName}>{news.author || 'GoalMills Staff'}</Text>
              <Text style={styles.publishDate}>
                {news.createdAt ? new Date(news.createdAt).toLocaleDateString() : 'Today'}
              </Text>
            </View>
          </View>

          {/* Excerpt Lead */}
          {news.excerpt ? (
            <Text style={styles.leadExcerpt}>{news.excerpt}</Text>
          ) : null}

          {/* Content HTML */}
          <View style={styles.contentSection}>
            {news.content ? (
              <RenderHTML
                contentWidth={width - 32}
                source={{ html: news.content }}
                tagsStyles={tagsStyles}
              />
            ) : null}
          </View>
        </View>

        {/* Related Articles */}
        {related.length > 0 ? (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedHeaderTitle}>More Stories</Text>
            {related.map((item) => (
              <Pressable
                key={item._id}
                style={styles.relatedCard}
                onPress={() => router.push(`/news/${item._id}`)}
              >
                <Image
                  source={{ uri: item.image || 'https://picsum.photos/seed/news/200/200' }}
                  style={styles.relatedThumb}
                  resizeMode="cover"
                />
                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedCategory}>{item.category || 'News'}</Text>
                  <Text style={styles.relatedTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.relatedDate}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
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
  coverImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F172A',
  },
  bodyContainer: {
    padding: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    color: '#94A3B8',
    fontSize: 12,
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
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  authorInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
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
  leadExcerpt: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 16,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  contentSection: {
    marginTop: 8,
  },
  relatedSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 16,
  },
  relatedHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: SPACING.md,
  },
  relatedCard: {
    flexDirection: 'row',
    backgroundColor: '#141C2B',
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
});
