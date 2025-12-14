import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketPlayer } from '@goalmills/types';
import { cricketApi } from '../../../../../services/cricketApi';
import { Ionicons } from '@expo/vector-icons';

export default function CricketPlayersListScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState<CricketPlayer[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch teams first to get IDs, then fetch players for first few teams
                const teamsRes = await cricketApi.getTeams();
                const teamIds = teamsRes.teams.map(t => t.id).slice(0, 3); // Update: just grab a few

                const playersArrays = await Promise.all(
                    teamIds.map(id => cricketApi.getPlayersByTeamId({ teamId: id }))
                );

                // Flatten results
                const allPlayers = playersArrays.flatMap(p => p.players);
                setPlayers(allPlayers);
            } catch (error) {
                console.error('Error loading players:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const renderItem = ({ item }: { item: CricketPlayer }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/cricket/players/${item.id}`)}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.role}</Text>
                <Text style={styles.style}>{item.battingStyle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Players',
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
            ) : (
                <FlatList
                    data={players}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                />
            )}
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
    },
    listContent: {
        padding: SPACING.sm,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        width: '48%',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: SPACING.sm,
    },
    info: {
        alignItems: 'center',
    },
    name: {
        color: COLORS.background,
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    role: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    style: {
        color: COLORS.textLight,
        fontSize: 10,
        textAlign: 'center',
    },
});
