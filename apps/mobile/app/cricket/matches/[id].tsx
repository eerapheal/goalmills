import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketMatchDetailResponse, CricketScoreboardResponse, CricketPlayer } from '@goalmills/types';
import { cricketApi } from '../../../services/cricketApi';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'scorecard' | 'info' | 'squads';

export default function CricketMatchDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('scorecard');
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<CricketMatchDetailResponse | null>(null);
    const [scoreboardData, setScoreboardData] = useState<CricketScoreboardResponse | null>(null);
    const [homeSquad, setHomeSquad] = useState<CricketPlayer[]>([]);
    const [awaySquad, setAwaySquad] = useState<CricketPlayer[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const matchId = parseInt(id);
                const [info, scoreboard] = await Promise.all([
                    cricketApi.getMatchInfo({ matchId }),
                    cricketApi.getMatchScoreboard({ matchId })
                ]);
                setMatchData(info);
                setScoreboardData(scoreboard);

                // Fetch squads if we have team IDs
                if (info.matchInfo.teamInfo.length >= 2) {
                    const [homeRes, awayRes] = await Promise.all([
                        cricketApi.getPlayersByTeamId({ teamId: info.matchInfo.teamInfo[0].id }),
                        cricketApi.getPlayersByTeamId({ teamId: info.matchInfo.teamInfo[1].id })
                    ]);
                    setHomeSquad(homeRes.players);
                    setAwaySquad(awayRes.players);
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

    if (!matchData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Match not found</Text>
            </View>
        );
    }

    const { matchInfo, venueInfo, tossResults } = matchData;
    const { scoreboard } = scoreboardData || {};

    const renderScorecard = () => {
        if (!scoreboard) return <Text style={styles.emptyText}>No scorecard available</Text>;

        return (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Batting</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeadText, { flex: 3 }]}>Batter</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>R</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>B</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>4s</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>6s</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>SR</Text>
                </View>
                {scoreboard.batsmen.map((batter) => (
                    <View key={batter.playerId} style={styles.tableRow}>
                        <View style={{ flex: 3 }}>
                            <Text style={styles.playerName}>{batter.name}</Text>
                            <Text style={styles.dismissal}>{batter.dismissal || 'not out'}</Text>
                        </View>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{batter.runs}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter.balls}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter.fours}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter.sixes}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter.strikeRate}</Text>
                    </View>
                ))}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Bowling</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeadText, { flex: 3 }]}>Bowler</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>O</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>M</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>R</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>W</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>ECO</Text>
                </View>
                {scoreboard.bowlers.map((bowler) => (
                    <View key={bowler.playerId} style={styles.tableRow}>
                        <Text style={[styles.playerName, { flex: 3 }]}>{bowler.name}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{bowler.overs}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{bowler.maidens}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{bowler.runs}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{bowler.wickets}</Text>
                        <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{bowler.economy}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderInfo = () => (
        <View style={styles.card}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Match</Text>
                <Text style={styles.infoValue}>{matchInfo.name}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Series</Text>
                <Text style={styles.infoValue}>{matchInfo.series}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{new Date(matchInfo.date).toLocaleString()}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{venueInfo?.name}, {venueInfo?.city}</Text>
            </View>
            {tossResults && (
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Toss</Text>
                    <Text style={styles.infoValue}>{tossResults.winner} chose to {tossResults.decision}</Text>
                </View>
            )}
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{matchInfo.status}</Text>
            </View>
        </View>
    );

    const renderSquads = () => (
        <View style={styles.squadsContainer}>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>{matchInfo.teamInfo[0].name} Squad</Text>
                {homeSquad.map(player => (
                    <TouchableOpacity
                        key={player.id}
                        style={styles.playerRow}
                        onPress={() => router.push(`/cricket/players/${player.id}`)}
                    >
                        <Image source={{ uri: player.image }} style={styles.playerImageSm} />
                        <View>
                            <Text style={styles.playerName}>{player.name}</Text>
                            <Text style={styles.playerRole}>{player.role}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>{matchInfo.teamInfo[1].name} Squad</Text>
                {awaySquad.map(player => (
                    <TouchableOpacity
                        key={player.id}
                        style={styles.playerRow}
                        onPress={() => router.push(`/cricket/players/${player.id}`)}
                    >
                        <Image source={{ uri: player.image }} style={styles.playerImageSm} />
                        <View>
                            <Text style={styles.playerName}>{player.name}</Text>
                            <Text style={styles.playerRole}>{player.role}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

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
                <Text style={styles.seriesText}>{matchInfo.series} • {matchInfo.matchType}</Text>
                <View style={styles.teamsContainer}>
                    <TouchableOpacity
                        style={styles.team}
                        onPress={() => router.push(`/cricket/teams/${matchInfo.teamInfo[0].id}`)}
                    >
                        <Image source={{ uri: matchInfo.teamInfo[0].logo }} style={styles.teamLogoMd} />
                        <Text style={styles.teamNameLg}>{matchInfo.teamInfo[0].shortName}</Text>
                        {matchInfo.score?.[0] && (
                            <Text style={styles.scoreLg}>
                                {matchInfo.score[0].runs}/{matchInfo.score[0].wickets}
                                <Text style={styles.oversLg}> ({matchInfo.score[0].overs})</Text>
                            </Text>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.vsText}>vs</Text>
                    <TouchableOpacity
                        style={styles.team}
                        onPress={() => router.push(`/cricket/teams/${matchInfo.teamInfo[1].id}`)}
                    >
                        <Image source={{ uri: matchInfo.teamInfo[1].logo }} style={styles.teamLogoMd} />
                        <Text style={styles.teamNameLg}>{matchInfo.teamInfo[1].shortName}</Text>
                        {matchInfo.score?.[1] && (
                            <Text style={styles.scoreLg}>
                                {matchInfo.score[1].runs}/{matchInfo.score[1].wickets}
                                <Text style={styles.oversLg}> ({matchInfo.score[1].overs})</Text>
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                <Text style={styles.statusTextLg}>{matchInfo.status}</Text>
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
    matchHeader: {
        padding: SPACING.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    seriesText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
        marginBottom: SPACING.md,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SPACING.md,
    },
    team: {
        alignItems: 'center',
        flex: 1,
    },
    teamLogoMd: {
        width: 48,
        height: 48,
        marginBottom: SPACING.xs,
        borderRadius: 24,
    },
    teamNameLg: {
        color: COLORS.background,
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        marginBottom: 4,
    },
    scoreLg: {
        color: COLORS.background,
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
    },
    oversLg: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '400',
        color: COLORS.textLight,
    },
    vsText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginHorizontal: SPACING.md,
    },
    statusTextLg: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    tab: {
        paddingVertical: SPACING.md,
        marginRight: SPACING.lg,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.secondary,
    },
    tabText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.background,
    },
    content: {
        flex: 1,
        padding: SPACING.md,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    emptyText: {
        color: COLORS.textLight,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    sectionTitle: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        marginBottom: SPACING.md,
        textTransform: 'uppercase',
    },
    tableHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
        paddingBottom: SPACING.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tableHeadText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    playerName: {
        color: COLORS.background,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    dismissal: {
        color: COLORS.textLight,
        fontSize: 10,
    },
    tableText: {
        color: COLORS.background,
        fontSize: FONT_SIZES.sm,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginTop: SPACING.md,
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    infoLabel: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
    },
    infoValue: {
        color: COLORS.background,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        textAlign: 'right',
        maxWidth: '60%',
    },
    squadsContainer: {
        paddingBottom: SPACING.md,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    playerImageSm: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: SPACING.md,
    },
    playerRole: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.xs,
        marginTop: 2,
    },
});
