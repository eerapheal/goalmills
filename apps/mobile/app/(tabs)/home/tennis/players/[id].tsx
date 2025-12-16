import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { TennisEvent, TennisPlayer } from '@goalmills/types';
import { tennisApi } from '../../../../../services/tennisApi';
import { TennisMatchCard } from '../../../../../components/TennisMatchCard';

export default function TennisPlayerDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [player, setPlayer] = useState<TennisPlayer | null>(null);
    const [matches, setMatches] = useState<TennisEvent[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const playerId = Number(id);

                // Get Player Info
                const playersRes = await tennisApi.getPlayers({ playerId });
                const foundPlayer = playersRes.result[0]; // Assuming API returns filtered list or finding logical one
                setPlayer(foundPlayer || null);

                // Get Recent Matches
                const matchesRes = await tennisApi.getFixtures({
                    from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
                    to: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                    playerId
                });
                setMatches(matchesRes.result);

            } catch (error) {
                console.error("Error loading player details", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    if (!player) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Player not found</Text>
            </View>
        );
    }

    const currentStats = player.stats?.[0]; // Get latest season stats

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: player.player_name,
                headerStyle: { backgroundColor: COLORS.backgroundDark },
                headerTintColor: '#fff',
                headerLeft: () => (
                    <Text onPress={() => router.back()} style={{ color: '#fff', fontSize: 16, marginLeft: 10 }}>← Back</Text>
                ),
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Image source={{ uri: player.player_logo || 'https://via.placeholder.com/100' }} style={styles.avatar} />
                    <Text style={styles.name}>{player.player_name}</Text>
                    <Text style={styles.country}>{player.player_country}</Text>
                </View>

                {currentStats && (
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>{currentStats.season} Stats</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{currentStats.rank}</Text>
                                <Text style={styles.statLabel}>Rank</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{currentStats.titles}</Text>
                                <Text style={styles.statLabel}>Titles</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{currentStats.matches_won}/{currentStats.matches_lost}</Text>
                                <Text style={styles.statLabel}>W/L</Text>
                            </View>
                        </View>
                        <View style={styles.surfaceStats}>
                            <Text style={styles.surfaceText}>Hard: {currentStats.hard_won}-{currentStats.hard_lost}</Text>
                            <Text style={styles.surfaceText}>Clay: {currentStats.clay_won}-{currentStats.clay_lost}</Text>
                            <Text style={styles.surfaceText}>Grass: {currentStats.grass_won}-{currentStats.grass_lost}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎾 Recent & Upcoming Matches</Text>
                    {matches.length > 0 ? (
                        matches.map(match => (
                            <TennisMatchCard key={match.event_key} match={match} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No match history found.</Text>
                    )}
                </View>
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
        backgroundColor: COLORS.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: SPACING.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        marginTop: SPACING.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: COLORS.secondary,
    },
    name: {
        color: 'white',
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
    },
    country: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.md,
    },
    statsCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.xl,
    },
    statsTitle: {
        color: 'white',
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.md,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    statLabel: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.xs,
    },
    surfaceStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    surfaceText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.xs,
    },
    section: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        color: 'white',
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    emptyText: {
        color: COLORS.textLight,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
        marginTop: 20
    }
});
