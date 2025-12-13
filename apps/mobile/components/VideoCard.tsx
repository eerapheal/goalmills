import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { VideoHighlight } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

interface VideoCardProps {
    video: VideoHighlight;
    onPress?: () => void;
}

export function VideoCard({ video, onPress }: VideoCardProps) {
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
                <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
                <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                        <Text style={styles.playIcon}>▶</Text>
                    </View>
                </View>
                <View style={styles.durationBadge}>
                    <Text style={styles.duration}>{video.duration}</Text>
                </View>
            </View>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {video.title}
                </Text>
                {video.description && (
                    <Text style={styles.description} numberOfLines={1}>
                        {video.description}
                    </Text>
                )}
                <View style={styles.meta}>
                    <Text style={styles.views}>👁 {formatViews(video.views)} views</Text>
                    {video.teams.length > 0 && (
                        <Text style={styles.teams} numberOfLines={1}>
                            {video.teams.join(' vs ')}
                        </Text>
                    )}
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
    thumbnailContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        fontSize: 24,
        color: COLORS.primary,
        marginLeft: 4,
    },
    durationBadge: {
        position: 'absolute',
        bottom: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    duration: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.background,
    },
    content: {
        padding: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: SPACING.xs,
        lineHeight: 22,
    },
    description: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginBottom: SPACING.sm,
    },
    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    views: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    teams: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.secondary,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginLeft: SPACING.sm,
    },
});
