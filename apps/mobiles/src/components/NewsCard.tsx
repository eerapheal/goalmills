import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { BlogPost } from '@goalmills/types';
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

interface NewsCardProps {
  item: BlogPost;
  onPress: () => void;
}

export const NewsCard = ({ item, onPress }: NewsCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || 'https://picsum.photos/seed/news/800/450' }}
          style={styles.image}
          resizeMode="cover"
        />
        {item.category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{item.readTime || 3} min read</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {item.excerpt ? (
          <Text style={styles.excerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.authorContainer}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {item.author ? item.author.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
            <Text style={styles.authorName} numberOfLines={1}>
              {item.author || 'GoalMills Staff'}
            </Text>
          </View>
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMore}>Read Article</Text>
            <Ionicons name="arrow-forward" size={12} color="#3B82F6" />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  categoryText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#64748B',
    marginHorizontal: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 21,
    marginBottom: 6,
  },
  excerpt: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  authorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  authorInitial: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  authorName: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMore: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
});
