import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BasketballEvent } from '@goalmills/types';
import { basketballApi } from '../../../../../services/basketballApi';
import { BasketballMatchCard } from '../../../../../components/BasketballMatchCard';

export default function BasketballMatchDetailsPage() {
    const params = useLocalSearchParams();
    const [match, setMatch] = useState<BasketballEvent | null>(null);
    const [odds, setOdds] = useState<any>(null);
    const [h2hData, setH2HData] = useState<{ H2H: BasketballEvent[], firstTeamResults: BasketballEvent[], secondTeamResults: BasketballEvent[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [params.id]);

    const loadData = async () => {
        if (!params.id) return;
        try {
            const matchId = Number(params.id);
            const today = new Date();
            const from = new Date(today);
            from.setDate(today.getDate() - 15);
            const to = new Date(today);
            to.setDate(today.getDate() + 15);

            const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const fixturesRes = await basketballApi.getFixtures({
                matchId,
                from: formatDate(from),
                to: formatDate(to)
            });
            const foundMatch = fixturesRes.result[0];
            setMatch(foundMatch || null);

            if (foundMatch) {
                // Fetch Odds
                const oddsRes = await basketballApi.getOdds({ matchId });
                setOdds(oddsRes.result[matchId]);

                // Fetch H2H
                const h2hRes = await basketballApi.getH2H({
                    firstTeamId: Number(foundMatch.home_team_key),
                    secondTeamId: Number(foundMatch.away_team_key)
                });
                setH2HData(h2hRes.result);
            }
        } catch (error) {
            console.error('Error loading match details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f59e0b" />
            </View>
        );
    }

    if (!match) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Match Not Found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderOdds = () => {
        if (!odds) return null;

        return (
            <View style={styles.oddsCard}>
                <Text style={styles.sectionTitle}>🎲 Match Odds</Text>
                {odds['Home/Away'] && (
                    <View style={styles.oddsGrid}>
                        <View style={styles.oddItem}>
                            <Text style={styles.oddLabel}>{match.event_home_team}</Text>
                            <Text style={styles.oddValue}>{(odds['Home/Away']['Home'] as any)?.['Bet365'] || '-'}</Text>
                        </View>
                        <View style={styles.oddItem}>
                            <Text style={styles.oddLabel}>{match.event_away_team}</Text>
                            <Text style={styles.oddValue}>{(odds['Home/Away']['Away'] as any)?.['Bet365'] || '-'}</Text>
                        </View>
                    </View>
                )}
                {odds['Total'] && (
                    <View style={styles.oddsGrid}>
                        <View style={styles.oddItem}>
                            <Text style={styles.oddLabel}>Over</Text>
                            <Text style={styles.oddValue}>
                                {Object.keys(odds['Total'])[0]} @ {(Object.values(odds['Total'])[0] as any)?.['Bet365'] || '-'}
                            </Text>
                        </View>
                        <View style={styles.oddItem}>
                            <Text style={styles.oddLabel}>Under</Text>
                            <Text style={styles.oddValue}>
                                {Object.keys(odds['Total'])[1]} @ {(Object.values(odds['Total'])[1] as any)?.['Bet365'] || '-'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Match Details</Text>
            </View>

            {/* Match Header Card */}
            <View style={styles.matchHeader}>
                <TouchableOpacity onPress={() => router.push(`/home/basketball/leagues/${match.league_key}`)}>
                    <Text style={styles.leagueName}>{match.league_name} - {match.league_round}</Text>
                </TouchableOpacity>
                <Text style={styles.matchStatus}>{match.event_status}</Text>

                <View style={styles.teamsContainer}>
                    {/* Home Team */}
                    <View style={styles.teamSection}>
                        {match.event_home_team_logo ? (
                            <Image source={{ uri: match.event_home_team_logo }} style={styles.teamLogo} />
                        ) : (
                            <View style={styles.teamLogoPlaceholder} />
                        )}
                        <Text style={styles.teamName}>{match.event_home_team}</Text>
                    </View>

                    {/* Score */}
                    <View style={styles.scoreSection}>
                        <Text style={styles.scoreText}>{match.event_final_result}</Text>
                        {match.event_live === '1' && match.event_quarter && (
                            <Text style={styles.quarterText}>{match.event_quarter}</Text>
                        )}
                    </View>

                    {/* Away Team */}
                    <View style={styles.teamSection}>
                        {match.event_away_team_logo ? (
                            <Image source={{ uri: match.event_away_team_logo }} style={styles.teamLogo} />
                        ) : (
                            <View style={styles.teamLogoPlaceholder} />
                        )}
                        <Text style={styles.teamName}>{match.event_away_team}</Text>
                    </View>
                </View>
            </View>

            {/* Odds */}
            {renderOdds()}

            {/* H2H */}
            {h2hData && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Head to Head</Text>
                    {h2hData.H2H.length > 0 ? (
                        h2hData.H2H.map(h => (
                            <BasketballMatchCard key={h.event_key} match={h} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No previous H2H matches.</Text>
                    )}
                </View>
            )}

            {/* Recent Form */}
            {h2hData && (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{match.event_home_team} Recent Form</Text>
                        {h2hData.firstTeamResults.map(h => <BasketballMatchCard key={h.event_key} match={h} />)}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{match.event_away_team} Recent Form</Text>
                        {h2hData.secondTeamResults.map(h => <BasketballMatchCard key={h.event_key} match={h} />)}
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e27',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0a0e27',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#0a0e27',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: '#f59e0b',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 48,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a1f3a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    backBtnText: {
        color: '#fff',
        fontSize: 24,
    },
    headerTitle: {
        color: '#8b92b0',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    matchHeader: {
        backgroundColor: '#1a1f3a',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a3150',
    },
    leagueName: {
        color: '#8b92b0',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 8,
    },
    matchStatus: {
        color: '#f59e0b',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamSection: {
        flex: 1,
        alignItems: 'center',
    },
    teamLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    teamLogoPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2a3150',
        marginBottom: 8,
    },
    teamName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    scoreSection: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    scoreText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
    },
    quarterText: {
        color: '#f59e0b',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    oddsCard: {
        backgroundColor: '#1a1f3a',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a3150',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    oddsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    oddItem: {
        flex: 1,
        backgroundColor: '#0a0e27',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    oddLabel: {
        color: '#8b92b0',
        fontSize: 12,
        marginBottom: 4,
    },
    oddValue: {
        color: '#f59e0b',
        fontSize: 18,
        fontWeight: '700',
    },
    section: {
        padding: 16,
    },
    emptyText: {
        color: '#8b92b0',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
        padding: 16,
    },
});
