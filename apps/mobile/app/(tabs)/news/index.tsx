import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { BlogPost } from '@goalmills/types';
import { NewsCard } from '../../../components/NewsCard';

export default function NewsScreen() {
  const router = useRouter();
  const [news, setNews] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await advancedFootballApi.getBlogPosts();
      setNews(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (id: string) => {
    router.push(`/news/${id}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NewsCard item={item} onPress={() => handlePress(item._id)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>Latest News</Text>
            <Text style={styles.subheading}>Stay updated with the football world</Text>
          </View>
        }
      />
    </View>
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
  listContent: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  heading: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  subheading: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 18, fontWeight: '600', color: '#001f3f' },
  summary: { fontSize: 14, color: '#555' },
});
