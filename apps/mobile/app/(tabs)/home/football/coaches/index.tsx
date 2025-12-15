import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballCoach } from '@goalmills/types';

export default function CoachesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [coaches, setCoaches] = useState<FootballCoach[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCoaches();
    }, []);

    const loadCoaches = async () => {
        try {
            const res = await advancedFootballApi.getCoaches();
            setCoaches(res.result);
        } catch (error) {
            console.error('Error loading coaches:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCoaches = coaches.filter((coach) =>
        coach.coache.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (coach.team_name && coach.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.background} />
                </Pressable>
                <Text style={styles.headerTitle}>👨‍💼 Football Coaches</Text>
                <Text style={styles.headerSubtitle}>
                    {filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''}
                </Text>
            </View>

            {/* Coaches List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {filteredCoaches.map((coach, index) => (
                    <Pressable
                        key={index}
                        style={({ pressed }) => [styles.coachCard, pressed && styles.pressed]}
                    >
                        <View style={styles.coachInfo}>
                            {coach.coache_image ? (
                                <Image source={{ uri: coach.coache_image }} style={styles.coachImage} />
                            ) : (
                                <View style={styles.coachInitials}>
                                    <Text style={styles.initialsText}>
                                        {coach.coache.split(' ').map(n => n[0]).join('')}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.coachText}>
                                <Text style={styles.coachName}>{coach.coache}</Text>
                                {coach.team_name && (
                                    <Text style={styles.coachTeam}>👕 {coach.team_name}</Text>
                                )}
                                <Text style={styles.coachCountry}>🌍 {coach.coache_country}</Text>
                            </View>
                        </View>
                        {coach.trophies && (
                            <View style={styles.coachStats}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>🏆 {coach.trophies}</Text>
                                    <Text style={styles.statLabel}>Trophies</Text>
                                </View>
                            </View>
                        )}
                    </Pressable>
                ))}

                {filteredCoaches.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No coaches found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        backgroundColor: 'rgba(0, 31, 63, 0.9)',
        padding: SPACING.lg,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.secondary,
        paddingTop: 50,
    },
    backButton: {
        marginBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '900',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.md,
    },
    coachCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    coachInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    coachImage: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.md,
    },
    coachInitials: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    initialsText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.background,
    },
    coachText: {
        flex: 1,
    },
    coachName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: 2,
    },
    coachTeam: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    coachCountry: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
    coachStats: {
        alignItems: 'center',
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
    },
});
