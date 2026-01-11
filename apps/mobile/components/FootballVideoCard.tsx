import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { FootballVideo } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

interface FootballVideoCardProps {
    video: FootballVideo;
    onPress: () => void;
}

export const FootballVideoCard = ({ video, onPress }: FootballVideoCardProps) => {
    // Use a high-quality football related placeholder since mock videos don't have thumbnails
    const thumbnail = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop';

    return (
        <Pressable
            style={({ pressed }) => [styles.container, pressed && styles.pressed]}
            onPress={onPress}
        >
            <View style={styles.thumbnailContainer}>
                <Image
                    source={{ uri: thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                        <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 2 }} />
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {video.video_title_full}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                    {video.video_title}
                </Text>
            </View>
        </Pressable>
    );
};

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
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    thumbnailContainer: {
        width: '100%',
        height: 180,
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
    subtitle: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
    },
});
