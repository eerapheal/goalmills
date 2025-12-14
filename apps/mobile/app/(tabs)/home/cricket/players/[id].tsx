import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketPlayer } from '@goalmills/types';
import { cricketApi } from '../../../../../services/cricketApi';
import { Ionicons } from '@expo/vector-icons';

export default function CricketPlayerDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [player, setPlayer] = useState<CricketPlayer | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                // Mock API doesn't have direct getPlayerById. efficiently. 
                // We'll fetch teams, then players from a team... or just iterate through all mocked players we can find.
                // For demo, we'll fetch teams, then all players from first few teams to find the match.
                // In real app, we'd have getPlayer(id).

                const teamsRes = await cricketApi.getTeams();
                // Check first few teams
                for (const team of teamsRes.teams) {
                    const playersRes = await cricketApi.getPlayersByTeamId({ teamId: team.id });
                    const found = playersRes.players.find(p => p.id === parseInt(id));
                    if (found) {
                        setPlayer(found);
                        break;
                    }
                }
            } catch (error) {
                console.error('Error loading player details:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.secondary} size="large" /></View>;
    if (!player) return <View style={styles.container}><Text style={styles.errorText}>Player not found</Text></View>;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: player.name,
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Image source={{ uri: player.image }} style={styles.image} />
                    <Text style={styles.name}>{player.name}</Text>
                    <Text style={styles.role}>{player.role}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Personal Info</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Batting Style</Text>
                        <Text style={styles.value}>{player.battingStyle}</Text>
                    </View>
                    {player.bowlingStyle && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Bowling Style</Text>
                            <Text style={styles.value}>{player.bowlingStyle}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Stats</Text>
                    <Text style={styles.emptyText}>Detailed statistics coming soon...</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
    },
    content: {
        padding: SPACING.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: SPACING.md,
    },
    name: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    role: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.secondary,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    label: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.md,
    },
    value: {
        color: COLORS.background,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: FONT_SIZES.md,
        textAlign: 'center',
        marginTop: SPACING.xl,
    },
    emptyText: {
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
});
