import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { BlogPost } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, formatDate } from '@goalmills/ui';

interface BlogCardProps {
  post: BlogPost;
  onPress?: () => void;
}

export function BlogCard({ post, onPress }: BlogCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image source={{ uri: post.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text style={styles.category}>{post.category}</Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={2}>
          {post.excerpt}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.author}>By {post.author}</Text>
          <Text style={styles.readTime}>📖 {post.readTime} min read</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: SPACING.md,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  category: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  author: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  readTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
});
