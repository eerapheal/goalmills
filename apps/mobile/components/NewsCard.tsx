import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { BlogPost } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';

interface NewsCardProps {
    item: BlogPost;
    onPress: () => void;
}

const { width } = Dimensions.get('window');

export const NewsCard = ({ item, onPress }: NewsCardProps) => {
    return (
        <Pressable
            style={({ pressed }) => [styles.container, pressed && styles.pressed]}
            onPress={onPress}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View style={styles.gradientOverlay} />
            </View>

            <View style={styles.content}>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.metaText}>{item.readTime} min read</Text>
                </View>

                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>

                <Text style={styles.excerpt} numberOfLines={2}>
                    {item.excerpt}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.authorContainer}>
                        <View style={styles.authorAvatar}>
                            <Text style={styles.authorInitial}>{item.author.charAt(0)}</Text>
                        </View>
                        <Text style={styles.authorName}>By {item.author}</Text>
                    </View>
                    <Text style={styles.readMore}>Read More →</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    imageContainer: {
        height: 200,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    categoryBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 10,
    },
    categoryText: {
        color: COLORS.background,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    content: {
        padding: SPACING.md,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    metaText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        marginHorizontal: 8,
    },
    title: {
        color: '#fff',
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
        lineHeight: 24,
    },
    excerpt: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: FONT_SIZES.sm,
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
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    authorInitial: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    authorName: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        fontWeight: '500',
    },
    readMore: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: 'bold',
    },
});
