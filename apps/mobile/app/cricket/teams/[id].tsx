import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketTeam, CricketPlayer } from '@goalmills/types';
import { cricketApi } from '../../../services/cricketApi';
import { Ionicons } from '@expo/vector-icons';

export default function CricketTeamDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<CricketTeam | null>(null);
    const [players, setPlayers] = useState<CricketPlayer[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                // We need to fetch team info. API doesn't have getTeamById directly mocked well aside from filtering getTeams
                const teamRes = await cricketApi.getTeams();
                const foundTeam = teamRes.teams.find(t => t.id === parseInt(id));
                setTeam(foundTeam || null);

                if (foundTeam) {
                    const playersRes = await cricketApi.getPlayersByTeamId({ teamId: foundTeam.id });
                    setPlayers(playersRes.players);
                }
            } catch (error) {
                console.error('Error loading team details:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.secondary} size="large" /></View>;
    if (!team) return <View style={styles.container}><Text style={styles.errorText}>Team not found</Text></View>;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: team.name, // Dynamic title
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
                    <Image source={{ uri: team.logo }} style={styles.logo} />
                    <Text style={styles.name}>{team.name}</Text>
                    <Text style={styles.country}>{team.country}</Text>
                </View>

                <Text style={styles.sectionTitle}>Squad</Text>
                {players.length > 0 ? (
                    players.map(player => (
                        <TouchableOpacity
                            key={player.id}
                            style={styles.playerRow}
                            onPress={() => router.push(`/cricket/players/${player.id}`)}
                        >
                            <Image source={{ uri: player.image }} style={styles.playerImage} />
                            <View style={styles.playerInfo}>
                                <Text style={styles.playerName}>{player.name}</Text>
                                <Text style={styles.playerRole}>{player.role} • {player.battingStyle}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No players found for this team.</Text>
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
    content: {
        padding: SPACING.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        padding: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: BORDER_RADIUS.lg,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: SPACING.md,
    },
    name: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    country: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: SPACING.md,
        marginTop: SPACING.md,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
    },
    playerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    playerInfo: {
        marginLeft: SPACING.md,
    },
    playerName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
    },
    playerRole: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        marginTop: 2,
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
