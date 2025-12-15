import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballTeam, FootballPlayer, FootballEvent } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballMatchCard } from '../../../../../components/FootballMatchCard';

type TeamTab = 'squad' | 'fixtures';

export default function TeamDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TeamTab>('squad');
    const [team, setTeam] = useState<FootballTeam | null>(null);
    const [players, setPlayers] = useState<FootballPlayer[]>([]);
    const [fixtures, setFixtures] = useState<FootballEvent[]>([]);

    useEffect(() => {
        loadTeamData();
    }, [id]);

    const loadTeamData = async () => {
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 7);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 14);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            const [teamsRes, playersRes, fixturesRes] = await Promise.all([
                advancedFootballApi.getTeams({ teamId: Number(id) }),
                advancedFootballApi.getPlayers({ teamId: Number(id) }),
                advancedFootballApi.getFixtures({
                    from: formatDate(yesterday),
                    to: formatDate(nextWeek),
                    teamId: Number(id),
                }),
            ]);

            setTeam(teamsRes.result[0] || null);
            setPlayers(playersRes.result);
            setFixtures(fixturesRes.result);
        } catch (error) {
            console.error('Error loading team data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading team details...</Text>
            </View>
        );
    }

    if (!team) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Team not found</Text>
            </View>
        );
    }

    const groupedPlayers = players.reduce((acc, player) => {
        const position = player.player_type || 'Unknown';
        if (!acc[position]) {
            acc[position] = [];
        }
        acc[position].push(player);
        return acc;
    }, {} as { [key: string]: FootballPlayer[] });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.background} />
                    </Pressable>
                </View>
                {team.team_logo && (
                    <Image source={{ uri: team.team_logo }} style={styles.teamLogo} />
                )}
                <Text style={styles.teamName}>{team.team_name}</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <Pressable
                    style={[styles.tab, activeTab === 'squad' && styles.activeTab]}
                    onPress={() => setActiveTab('squad')}
                >
                    <Text style={[styles.tabText, activeTab === 'squad' && styles.activeTabText]}>
                        Squad ({players.length})
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, activeTab === 'fixtures' && styles.activeTab]}
                    onPress={() => setActiveTab('fixtures')}
                >
                    <Text style={[styles.tabText, activeTab === 'fixtures' && styles.activeTabText]}>
                        Fixtures ({fixtures.length})
                    </Text>
                </Pressable>
            </View>

            {/* Content */}
            <ScrollView style={styles.content}>
                {activeTab === 'squad' ? (
                    <View style={styles.section}>
                        {Object.entries(groupedPlayers).map(([position, positionPlayers]) => (
                            <View key={position} style={styles.positionGroup}>
                                <Text style={styles.positionTitle}>{position}</Text>
                                {positionPlayers.map((player) => (
                                    <Pressable
                                        key={player.player_key}
                                        style={({ pressed }) => [styles.playerCard, pressed && styles.pressed]}
                                        onPress={() => router.push(`/home/football/players/${player.player_key}` as any)}
                                    >
                                        <View style={styles.playerInfo}>
                                            {player.player_image && (
                                                <Image source={{ uri: player.player_image }} style={styles.playerImage} />
                                            )}
                                            <View style={styles.playerText}>
                                                <Text style={styles.playerName}>{player.player_name}</Text>
                                                <View style={styles.playerMeta}>
                                                    {player.player_number && (
                                                        <Text style={styles.playerNumber}>#{player.player_number}</Text>
                                                    )}
                                                    {player.player_age && (
                                                        <Text style={styles.playerAge}>• {player.player_age} years</Text>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.playerStats}>
                                            <Text style={styles.statText}>⚽ {player.player_goals}</Text>
                                            {player.player_assists && (
                                                <Text style={styles.statText}>🎯 {player.player_assists}</Text>
                                            )}
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        ))}
                        {players.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No players available</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.section}>
                        {fixtures.map((event) => (
                            <FootballMatchCard key={event.event_key} event={event} />
                        ))}
                        {fixtures.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No fixtures available</Text>
                            </View>
                        )}
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
    loadingText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        marginTop: SPACING.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
    },
    errorText: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.danger,
    },
    header: {
        backgroundColor: 'rgba(0, 31, 63, 0.9)',
        padding: SPACING.xl,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: COLORS.secondary,
        paddingTop: 50,
    },
    headerTop: {
        width: '100%',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    backButton: {
        padding: SPACING.xs,
    },
    teamLogo: {
        width: 100,
        height: 100,
        marginBottom: SPACING.md,
    },
    teamName: {
        fontSize: FONT_SIZES.xxl + 4,
        fontWeight: '900',
        color: COLORS.background,
        textAlign: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.secondary,
    },
    tabText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    activeTabText: {
        color: COLORS.secondary,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    section: {
        padding: SPACING.md,
    },
    positionGroup: {
        marginBottom: SPACING.lg,
    },
    positionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.secondary,
        marginBottom: SPACING.md,
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    playerImage: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.md,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    playerText: {
        flex: 1,
    },
    playerName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: 2,
    },
    playerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playerNumber: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    playerAge: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginLeft: SPACING.xs,
    },
    playerStats: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    statText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        fontWeight: '600',
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
