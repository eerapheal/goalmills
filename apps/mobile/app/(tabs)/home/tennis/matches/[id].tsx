import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { TennisEvent } from '@goalmills/types';
import { tennisApi } from '../../../../../services/tennisApi';
import { TennisMatchCard } from '../../../../../components/TennisMatchCard';

export default function TennisMatchDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<TennisEvent | null>(null);
    const [odds, setOdds] = useState<any>(null);
    const [h2hData, setH2HData] = useState<{ H2H: TennisEvent[], firstTeamResults: TennisEvent[], secondTeamResults: TennisEvent[] } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const matchId = Number(id);
                // Fetch match details
                const fixturesRes = await tennisApi.getFixtures({ matchId });
                const foundMatch = fixturesRes.result[0];
                setMatch(foundMatch || null);

                if (foundMatch) {
                    // Fetch Odds
                    if (foundMatch.event_live === '1') {
                        const liveOddsRes = await tennisApi.getLiveOdds({ matchId });
                        setOdds(liveOddsRes.result[matchId]);
                    } else {
                        const oddsRes = await tennisApi.getOdds({ matchId });
                        setOdds(oddsRes.result[matchId]);
                    }

                    // Fetch H2H
                    const h2hRes = await tennisApi.getH2H({
                        firstPlayerId: Number(foundMatch.first_player_key),
                        secondPlayerId: Number(foundMatch.second_player_key)
                    });
                    setH2HData(h2hRes.result);
                }

            } catch (error) {
                console.error("Error loading match details", error);
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

    if (!match) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Match not found</Text>
            </View>
        );
    }

    const renderOdds = () => {
        if (!odds) return (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Odds not available yet</Text>
            </View>
        );

        // Pre-match odds structure
        if (odds['Match Winner']) {
            return (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🎲 Match Odds</Text>
                    <View style={styles.oddsRow}>
                        <View style={styles.oddBox}>
                            <Text style={styles.oddLabel}>{match.event_first_player}</Text>
                            <Text style={styles.oddValue}>{odds['Match Winner']['Home']?.['Bet365'] || '-'}</Text>
                        </View>
                        <View style={styles.oddBox}>
                            <Text style={styles.oddLabel}>{match.event_second_player}</Text>
                            <Text style={styles.oddValue}>{odds['Match Winner']['Away']?.['Bet365'] || '-'}</Text>
                        </View>
                    </View>
                </View>
            );
        }

        // Live odds structure
        if (odds.live_odds) {
            const matchWinnerOdds = odds.live_odds.filter((o: any) => o.odd_name === 'Match Winner');
            return (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🔴 Live Odds</Text>
                    {matchWinnerOdds.length > 0 ? (
                        <View style={styles.oddsRow}>
                            {matchWinnerOdds.map((odd: any, index: number) => (
                                <View key={index} style={styles.oddBox}>
                                    <Text style={styles.oddLabel}>{odd.type === 'Home' ? match.event_first_player : match.event_second_player}</Text>
                                    <Text style={styles.oddValue}>{odd.value}</Text>
                                </View>
                            ))}
                        </View>
                    ) : <Text style={styles.textLight}>Markets suspended</Text>}
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: 'Match Details',
                headerStyle: { backgroundColor: COLORS.backgroundDark },
                headerTintColor: '#fff',
                headerLeft: () => (
                    <Pressable onPress={() => router.back()} style={{ marginLeft: 0 }}>
                        <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
                    </Pressable>
                ),
            }} />
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Scoreboard */}
                <View style={styles.headerCard}>
                    <Text style={styles.leagueName}>{match.league_name} - {match.league_round}</Text>
                    <Text style={styles.matchStatus}>{match.event_live === '1' ? 'LIVE' : match.event_status}</Text>

                    <View style={styles.scoreRow}>
                        <Pressable
                            style={styles.teamColumn}
                            onPress={() => router.push(`/home/tennis/players/${match.first_player_key}`)}
                        >
                            <Image source={{ uri: match.event_first_player_logo || '' }} style={styles.playerImage} />
                            <Text style={styles.playerName}>{match.event_first_player}</Text>
                        </Pressable>

                        <View style={styles.scoreColumn}>
                            <Text style={styles.scoreText}>{match.event_final_result}</Text>
                            {match.event_live === '1' && <Text style={styles.gameScore}>{match.event_game_result}</Text>}
                        </View>

                        <Pressable
                            style={styles.teamColumn}
                            onPress={() => router.push(`/home/tennis/players/${match.second_player_key}`)}
                        >
                            <Image source={{ uri: match.event_second_player_logo || '' }} style={styles.playerImage} />
                            <Text style={styles.playerName}>{match.event_second_player}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Odds */}
                {renderOdds()}

                {/* H2H */}
                {h2hData && (
                    <View>
                        <Text style={styles.sectionHeader}>Head to Head</Text>
                        {h2hData.H2H.length > 0 ? (
                            h2hData.H2H.map(h => (
                                <TennisMatchCard key={h.event_key} match={h} />
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No previous H2H matches.</Text>
                        )}
                    </View>
                )}

                {/* Team Form */}
                {h2hData && (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionHeader}>{match.event_first_player} Recent Form</Text>
                        {h2hData.firstTeamResults.map(h => <TennisMatchCard key={h.event_key} match={h} />)}

                        <Text style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>{match.event_second_player} Recent Form</Text>
                        {h2hData.secondTeamResults.map(h => <TennisMatchCard key={h.event_key} match={h} />)}
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
    content: {
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
        marginTop: 20
    },
    headerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    leagueName: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    matchStatus: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        marginBottom: SPACING.lg,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    teamColumn: {
        alignItems: 'center',
        width: '35%',
    },
    playerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: SPACING.sm,
        backgroundColor: '#333',
    },
    playerName: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: FONT_SIZES.sm,
    },
    scoreColumn: {
        alignItems: 'center',
    },
    scoreText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '900',
    },
    gameScore: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.md,
        marginTop: SPACING.xs,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        color: 'white',
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    oddsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    oddBox: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        alignItems: 'center',
    },
    oddLabel: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.xs,
        marginBottom: 4,
    },
    oddValue: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    textLight: {
        color: COLORS.textLight,
    },
    sectionHeader: {
        color: 'white',
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    emptyText: {
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
    formSection: {
        marginTop: SPACING.lg,
    }
});
