import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { mapVideoToHighlight } from '../../../utils/footballAdapters';
import { VideoHighlight } from '@goalmills/types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HighlightDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [video, setVideo] = useState<VideoHighlight | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (id) {
            loadVideoDetail();
        }
    }, [id]);

    const loadVideoDetail = async () => {
        try {
            const response = await advancedFootballApi.getVideos(Number(id));
            if (response.success && response.result.length > 0) {
                // The API returns an array, possibly with one item matching the ID or multiple. 
                // If getVideos(id) filters by event_key correctly, we take the first one.
                // However, advancedFootballApi mock actually returns a list even with ID if it matches event_key.
                const videoData = response.result[0];
                setVideo(mapVideoToHighlight(videoData));
            } else {
                setVideo(null);
            }
        } catch (error) {
            console.error('Failed to load video detail:', error);
            setVideo(null);
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

    if (!video) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Video not found</Text>
            </View>
        );
    }

    const formatViews = (views: number): string => {
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(views);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTintColor: '#fff',
                    title: '',
                    headerBackTitle: 'Highlights',
                }}
            />
            <View style={styles.container}>
                <View style={styles.videoPlayerContainer}>
                    {isPlaying ? (
                        <View style={styles.fakePlayer}>
                            <Text style={styles.fakePlayerText}>Video Player Would Load Here</Text>
                            <TouchableOpacity onPress={() => setIsPlaying(false)} style={styles.stopButton}>
                                <Ionicons name="close-circle" size={40} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.thumbnailContainer}>
                            <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
                            <View style={styles.overlay}>
                                <TouchableOpacity onPress={() => setIsPlaying(true)} style={styles.playButton}>
                                    <Ionicons name="play" size={40} color="#fff" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <ScrollView style={styles.contentScroll}>
                    <View style={styles.infoContainer}>
                        <Text style={styles.title}>{video.title}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Ionicons name="eye" size={16} color={COLORS.textLight} />
                                <Text style={styles.statText}>{formatViews(video.views)} views</Text>
                            </View>
                            <View style={styles.dot} />
                            <View style={styles.statItem}>
                                <Ionicons name="time" size={16} color={COLORS.textLight} />
                                <Text style={styles.statText}>{new Date(video.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </View>

                        {video.teams.length > 0 && (
                            <View style={styles.teamsContainer}>
                                {video.teams.map((team, index) => (
                                    <View key={index} style={styles.teamBadge}>
                                        <Text style={styles.teamText}>{team}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {video.description || 'Watch the highlights of the match. Every goal, every chance, and all the action packed into this video.'}
                        </Text>

                        {/* Simulated related content */}
                        <View style={styles.relatedSection}>
                            <Text style={styles.sectionTitle}>Related Videos</Text>
                            {/* Just a placeholder for potential related list */}
                            <View style={styles.relatedPlaceholder}>
                                <Text style={styles.relatedText}>More highlights coming soon...</Text>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </View>
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
    videoPlayerContainer: {
        width: '100%',
        height: width * (9 / 16), // 16:9 aspect ratio
        backgroundColor: '#000',
        marginTop: 0, // Should be below header if translucent, or 0 if immersive
    },
    thumbnailContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    fakePlayer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    fakePlayerText: {
        color: '#fff',
        marginBottom: 20,
    },
    stopButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    contentScroll: {
        flex: 1,
    },
    infoContainer: {
        padding: SPACING.lg,
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        lineHeight: 28,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        color: COLORS.textLight,
        fontSize: 13,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.textLight,
        marginHorizontal: 10,
    },
    teamsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: SPACING.lg,
    },
    teamBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    teamText: {
        color: COLORS.secondary,
        fontWeight: '600',
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
    },
    description: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 15,
        lineHeight: 24,
        marginBottom: SPACING.xl,
    },
    relatedSection: {
        marginBottom: SPACING.xl,
    },
    relatedPlaceholder: {
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    relatedText: {
        color: COLORS.textLight,
    },
});
