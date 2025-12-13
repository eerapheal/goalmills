import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';
import { footballApi } from '../../../services/footballApi';
import { BlogPost } from '@goalmills/types';
import { Ionicons } from '@expo/vector-icons';

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [news, setNews] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadNewsDetail();
    }
  }, [id]);

  const loadNewsDetail = async () => {
    try {
      const data = await footballApi.getBlogPostById(id);
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

          <Text style={styles.bodyText}>
            {news.content || 'Full article content would go here. This is a mock implementation so we are just showing the structure. Imagine rich text content here with images strings, quotes, and deeper analysis of the match/topic.'}
          </Text>

          {/* Mock longer content */}
          <Text style={styles.bodyText}>
            To give you an idea of how the layout looks with more text: {"\n\n"}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            {"\n\n"}
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Text>
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
