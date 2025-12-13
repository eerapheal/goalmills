import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { VideoHighlight } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

interface VideoCardProps {
    item: VideoHighlight;
    onPress: () => void;
}

export const VideoCard = ({ item, onPress }: VideoCardProps) => {
    const formatViews = (views: number): string => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`;
        }
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views.toString();
    };

    return (
        <Pressable
            style={({ pressed }) => [styles.container, pressed && styles.pressed]}
            onPress={onPress}
        >
            <View style={styles.thumbnailContainer}>
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="cover" />

                <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                        <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 2 }} />
                    </View>
                </View>

                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>

                {item.description ? (
                    <Text style={styles.description} numberOfLines={1}>
                        {item.description}
                    </Text>
                ) : null}

                <View style={styles.footer}>
                    <View style={styles.viewsContainer}>
                        <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.viewsText}>{formatViews(item.views)} views</Text>
                    </View>

                    {item.teams.length > 0 && (
                        <Text style={styles.teamsText} numberOfLines={1}>
                            {item.teams.join(' vs ')}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    thumbnailContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(4px)', // works on web, ignored on native but fallback is fine
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'BOLD',
    },
    content: {
        padding: SPACING.md,
    },
    title: {
        color: '#fff',
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        marginBottom: 4,
        lineHeight: 20,
    },
    description: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: FONT_SIZES.sm,
        marginBottom: SPACING.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    viewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewsText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
    },
    teamsText: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginLeft: 10,
    },
});
