import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { TennisEvent, TennisLeague, TennisStanding } from '@goalmills/types';
import { tennisApi } from '../../../../../services/tennisApi';
import { TennisMatchCard } from '../../../../../components/TennisMatchCard';

export default function TennisLeagueDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [league, setLeague] = useState<TennisLeague | null>(null);
    const [fixtures, setFixtures] = useState<TennisEvent[]>([]);
    const [standings, setStandings] = useState<TennisStanding[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const leagueId = Number(id);

                // Get League Info (mock: fetch all and find)
                const leaguesRes = await tennisApi.getLeagues({});
                const foundLeague = leaguesRes.result.find(l => Number(l.league_key) === leagueId);
                setLeague(foundLeague || null);

                // Get Fixtures
                const matchesRes = await tennisApi.getFixtures({
                    from: new Date().toISOString().split('T')[0],
                    to: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                    leagueId
                });
                setFixtures(matchesRes.result);

                // Get Standings (If ATP/WTA)
                if (foundLeague && (foundLeague.league_name.includes('ATP') || foundLeague.league_name.includes('WTA'))) {
                    const type = foundLeague.league_name.includes('WTA') ? 'WTA' : 'ATP';
                    const standRes = await tennisApi.getStandings({ league: type });
                    setStandings(standRes.result);
                }

            } catch (error) {
                console.error("Error loading league details", error);
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

    if (!league) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>League not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: league.league_name,
                headerStyle: { backgroundColor: COLORS.backgroundDark },
                headerTintColor: '#fff',
                headerLeft: () => (
                    <Text onPress={() => router.back()} style={{ color: '#fff', fontSize: 16, marginLeft: 10 }}>← Back</Text>
                ),
            }} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{league.league_name}</Text>
                    <Text style={styles.subtitle}>{league.country_name} • {league.league_surface}</Text>
                </View>

                {standings.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🏆 Standings</Text>
                        {standings.map(p => (
                            <View key={p.player_key} style={styles.standingRow}>
                                <Text style={styles.rank}>{p.place}</Text>
                                <Pressable
                                    style={{ flex: 1 }}
                                    onPress={() => router.push(`/home/tennis/players/${p.player_key}`)}
                                >
                                    <Text style={styles.player}>{p.player}</Text>
                                </Pressable>
                                <Text style={styles.points}>{p.points} pts</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Upcoming Matches</Text>
                    {fixtures.length > 0 ? (
                        fixtures.map(match => (
                            <TennisMatchCard key={match.event_key} match={match} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No upcoming matches available.</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: SPACING.md,
    },
    header: {
        marginBottom: SPACING.lg,
        padding: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.secondary,
        marginTop: SPACING.sm,
        fontSize: FONT_SIZES.md,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        color: 'white',
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    standingRow: {
        flexDirection: 'row',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    rank: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        width: 30,
    },
    player: {
        color: 'white',
        flex: 1,
    },
    points: {
        color: COLORS.textLight,
    },
    emptyText: {
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
        marginTop: 20
    }
});
