import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';
import { goalmillsApi } from '../../../services/goalmillsApi';
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
      const data = await goalmillsApi.getNews();
      setNews(data || []);
    } catch (error) {
      console.error('Failed to load news:', error);
      setNews([]);
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
        <ActivityIndicator size="large" color={COLORS.primary || '#000'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        keyExtractor={(item) => item._id || Math.random().toString()}
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
    backgroundColor: COLORS.backgroundDark || '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md || 16,
  },
  header: {
    marginBottom: SPACING.lg || 24,
    paddingHorizontal: SPACING.xs || 4,
  },
  heading: {
    fontSize: FONT_SIZES.xxl || 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  subheading: {
    fontSize: FONT_SIZES.md || 16,
    color: COLORS.textLight || '#aaa',
  },
});
