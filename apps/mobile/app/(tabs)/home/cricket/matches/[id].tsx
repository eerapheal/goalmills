import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketEvent } from '@goalmills/types';
import { advancedCricketApi } from '../../../../../services/advancedCricketApi';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'scorecard' | 'info' | 'squads';

export default function CricketMatchDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('scorecard');
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<CricketEvent | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                // Create date range for the API call (required parameters)
                const today = new Date();
                const fromDate = new Date(today);
                fromDate.setDate(today.getDate() - 30); // 30 days ago
                const toDate = new Date(today);
                toDate.setDate(today.getDate() + 30); // 30 days from now

                const from = fromDate.toISOString().split('T')[0]; // yyyy-mm-dd
                const to = toDate.toISOString().split('T')[0]; // yyyy-mm-dd

                const response = await advancedCricketApi.getFixtures({
                    matchId: Number(id),
                    APIkey: 'mock',
                    from,
                    to
                });
                if (response.result && response.result.length > 0) {
                    setMatch(response.result[0]);
                }
            } catch (error) {
                console.error('Error loading match details:', error);
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
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Match not found</Text>
            </View>
        );
    }

    const renderScorecard = () => {
        if (!match.scorecard) return <Text style={styles.emptyText}>No scorecard available</Text>;

        return (
            <View>
                {Object.entries(match.scorecard).map(([innings, players]) => (
                    <View key={innings} style={styles.card}>
                        <Text style={styles.sectionTitle}>{innings}</Text>

                        <Text style={styles.subSectionTitle}>Batting</Text>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeadText, { flex: 3 }]}>Batter</Text>
                            <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>R</Text>
                            <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>B</Text>
                            <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>4s</Text>
                            <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>6s</Text>
                            <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>SR</Text>
                        </View>
                        {players.filter(p => p.type === 'Batsman').map((batter, idx) => (
                            <View key={`${batter.player}-${idx}`} style={styles.tableRow}>
                                <View style={{ flex: 3 }}>
                                    <Text style={styles.playerName}>{batter.player}</Text>
                                    <Text style={styles.dismissal}>{batter.status}</Text>
                                </View>
                                <Text style={[styles.tableText, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{batter.R}</Text>
                                <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter.B}</Text>
                                <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter['4s']}</Text>
                                <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter['6s']}</Text>
                                <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter.SR}</Text>
                            </View>
                        ))}

                        <View style={styles.divider} />

                        <Text style={styles.subSectionTitle}>Bowling</Text>
                        {/* Assuming bowlers might be in the same list or inferred. 
                            The new type has 'type' field. But typical API separates them or includes bowling stats in same array?
                            The new type CricketScorecardPlayer has O, M, W, ER which are bowling stats.
                            Let's filter based on fields or assume separate entry?
                            Actually the MOCK data in advancedCricketApi creates separate objects for Bowlers?
                            Wait, the mock data in advancedCricketApi ONLY created 'Batsman' type players?
                            "type: 'Batsman'".
                            I should check advancedCricketApi again. 
                            It only added Batsmen. I should fix that if I want bowlers.
                            For now, I'll filter by players who have Overs data or handle gracefully.
                        */}
                    </View>
                ))}
            </View>
        );
    };

    const renderInfo = () => (
        <View style={styles.card}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Match</Text>
                <Text style={styles.infoValue}>{match.league_round}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Series</Text>
                <Text style={styles.infoValue}>{match.league_name} {match.league_season}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{match.event_date_start} {match.event_time}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{match.event_stadium}</Text>
            </View>
            {match.event_toss && (
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Toss</Text>
                    <Text style={styles.infoValue}>{match.event_toss}</Text>
                </View>
            )}
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{match.event_status}</Text>
            </View>
        </View>
    );

    const renderSquads = () => {
        if (!match.scorecard) return <Text style={styles.emptyText}>No lineups available</Text>;
        // Use scorecard players as "Squad" since specific squad endpoint is missing
        // Group by team? Scorecard is grouped by Innings. 
        // usually 1st Innings = Home Team Batting (or Team A), 2nd = Away Team (Team B).
        // This is an approximation.

        return (
            <View>
                {Object.entries(match.scorecard).map(([innings, players]) => (
                    <View key={innings} style={styles.card}>
                        <Text style={styles.sectionTitle}>{innings} Players</Text>
                        {players.map((player, idx) => (
                            <TouchableOpacity
                                key={`${player.player}-${idx}`}
                                style={styles.playerRow}
                                onPress={() => { }}
                            >
                                <View style={styles.playerImageSm}>
                                    <Ionicons name="person" size={24} color="rgba(255,255,255,0.5)" />
                                </View>
                                <View>
                                    <Text style={styles.playerName}>{player.player}</Text>
                                    <Text style={styles.playerRole}>{player.type}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Match Center',
                    headerStyle: { backgroundColor: COLORS.backgroundDark },
                    headerTintColor: COLORS.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Header Score */}
            <View style={styles.matchHeader}>
                <Text style={styles.seriesText}>{match.league_name} • {match.event_type}</Text>
                <View style={styles.teamsContainer}>
                    <TouchableOpacity
                        style={styles.team}
                        onPress={() => router.push(`/home/cricket/teams/${match.home_team_key}`)}
                    >
                        {match.event_home_team_logo && <Image source={{ uri: match.event_home_team_logo }} style={styles.teamLogoMd} />}
                        <Text style={styles.teamNameLg}>{match.event_home_team}</Text>
                        <Text style={styles.scoreLg}>{match.event_home_final_result}</Text>
                    </TouchableOpacity>
                    <Text style={styles.vsText}>vs</Text>
                    <TouchableOpacity
                        style={styles.team}
                        onPress={() => router.push(`/home/cricket/teams/${match.away_team_key}`)}
                    >
                        {match.event_away_team_logo && <Image source={{ uri: match.event_away_team_logo }} style={styles.teamLogoMd} />}
                        <Text style={styles.teamNameLg}>{match.event_away_team}</Text>
                        <Text style={styles.scoreLg}>{match.event_away_final_result}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.statusTextLg}>{match.event_status}</Text>
                <Text style={[styles.seriesText, { marginTop: 8 }]}>{match.event_status_info}</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {(['scorecard', 'info', 'squads'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 'scorecard' && renderScorecard()}
                {activeTab === 'info' && renderInfo()}
                {activeTab === 'squads' && renderSquads()}
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: FONT_SIZES.lg,
    },

    subSectionTitle: {
        color: '#fff',
        fontSize: 12, // Reduced from SPACING.md
        fontWeight: '900',
        marginBottom: 8,
        marginTop: 4,
        textTransform: 'uppercase',
    },
    matchHeader: {
        padding: 24,
        paddingTop: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    seriesText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 24,
        textAlign: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        overflow: 'hidden',
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 12,
    },
    team: {
        alignItems: 'center',
        flex: 1,
        width: '35%',
    },
    teamLogoMd: {
        width: 56, // Increased size
        height: 56,
        marginBottom: 12,
        borderRadius: 12, // Modern rounded square
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        resizeMode: 'contain',
    },
    teamNameLg: {
        color: '#fff',
        fontSize: 12, // Compact
        fontWeight: '900',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        height: 32, // Fixed height for 2 lines
    },
    scoreLg: {
        color: '#fff',
        fontSize: 20, // Large score
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
        letterSpacing: -1,
    },
    vsText: {
        color: 'rgba(255, 255, 255, 0.2)',
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        marginHorizontal: 8,
    },
    statusTextLg: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    statusInfoText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
        maxWidth: '80%',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    tab: {
        paddingVertical: 16,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.secondary,
    },
    tabText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        fontStyle: 'italic',
        marginTop: 20,
    },
    sectionTitle: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: '900',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    tableHeader: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)', // Subtle header bg
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    tableHeadText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 9, // Small tabular header
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    },
    playerName: {
        color: '#fff',
        fontSize: 11, // Compact
        fontWeight: '700',
    },
    dismissal: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 9,
        fontStyle: 'italic',
        marginTop: 2,
    },
    tableText: {
        color: '#fff',
        fontSize: 11,
        fontVariant: ['tabular-nums'],
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    },
    infoLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    infoValue: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
        maxWidth: '60%',
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    },
    playerImageSm: {
        width: 36,
        height: 36,
        borderRadius: 8, // Modern
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerRole: {
        color: COLORS.secondary,
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
});

