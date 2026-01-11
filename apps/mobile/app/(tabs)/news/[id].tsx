import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';
import { goalmillsApi } from '../../../services/goalmillsApi';
import { BlogPost } from '@goalmills/types';
import { Ionicons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [news, setNews] = useState<BlogPost | null>(null);
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
      const data = await goalmillsApi.getNewsById(id);
      setNews(data);
    } catch (error) {
      console.error('Failed to load news detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!news) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Article not found</Text>
      </View>
    );
  }

  // Define tags styles for HTML rendering
  const tagsStyles = {
    body: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 16,
      lineHeight: 24,
    },
    p: {
      marginBottom: 16,
    },
    h1: { color: '#fff', fontSize: 24, fontWeight: 'bold' as const, marginBottom: 12 },
    h2: { color: '#fff', fontSize: 20, fontWeight: 'bold' as const, marginBottom: 10 },
    h3: { color: '#fff', fontSize: 18, fontWeight: 'bold' as const, marginBottom: 8 },
    strong: { fontWeight: 'bold' as const, color: '#fff' },
    em: { fontStyle: 'italic' as const },
    a: { color: COLORS.primary, textDecorationLine: 'underline' as const },
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#fff',
          title: '',
          headerBackTitle: 'News',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: news.image }} style={styles.image} resizeMode="cover" />
          <View style={styles.gradientOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{news.category}</Text>
            </View>
            <Text style={styles.title}>{news.title}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.metaRow}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{news.author.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.authorName}>{news.author}</Text>
                <Text style={styles.date}>{new Date(news.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={styles.readTime}>{news.readTime} min read</Text>
          </View>

          <Text style={styles.excerpt}>{news.excerpt}</Text>

          <View style={styles.divider} />

          {news.content ? (
            <RenderHTML
              contentWidth={width - SPACING.lg * 2}
              source={{ html: news.content }}
              tagsStyles={tagsStyles}
            />
          ) : (
            <Text style={styles.bodyText}>No content available for this article.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    height: 350,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    // We would use LinearGradient here ideally: colors={['transparent', 'rgba(0,31,63, 1)']}
  },
  heroContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20, // Overlap effect
    backgroundColor: COLORS.backgroundDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authorName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  date: {
    color: COLORS.textLight,
    fontSize: 11,
  },
  readTime: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '500',
  },
  excerpt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: SPACING.lg,
  },
  bodyText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: SPACING.lg,
  },
});
