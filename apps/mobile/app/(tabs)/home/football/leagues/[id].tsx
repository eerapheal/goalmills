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
import { FootballLeague, FootballEvent, FootballStanding } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballMatchCard } from '../../../../../components/FootballMatchCard';

type LeagueTab = 'fixtures' | 'standings';

export default function LeagueDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<LeagueTab>('fixtures');
    const [league, setLeague] = useState<FootballLeague | null>(null);
    const [fixtures, setFixtures] = useState<FootballEvent[]>([]);
    const [standings, setStandings] = useState<FootballStanding[]>([]);

    useEffect(() => {
        loadLeagueData();
    }, [id]);

    const loadLeagueData = async () => {
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 7);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 14);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            const [leaguesRes, fixturesRes, standingsRes] = await Promise.all([
                advancedFootballApi.getLeagues(),
                advancedFootballApi.getFixtures({
                    from: formatDate(yesterday),
                    to: formatDate(nextWeek),
                    leagueId: Number(id),
                }),
                advancedFootballApi.getStandings(Number(id)),
            ]);

            const foundLeague = leaguesRes.result.find((l) => l.league_key === id);
            setLeague(foundLeague || null);
            setFixtures(fixturesRes.result);
            setStandings(standingsRes.result.total);
        } catch (error) {
            console.error('Error loading league data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading league details...</Text>
            </View>
        );
    }

    if (!league) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>League not found</Text>
            </View>
        );
    }

    const renderStandingsTable = () => (
        <View style={styles.standingsTable}>
            {/* Header */}
            <View style={styles.standingsHeader}>
                <Text style={[styles.standingsHeaderText, styles.posCol]}>#</Text>
                <Text style={[styles.standingsHeaderText, styles.teamCol]}>Team</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol]}>P</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol]}>W</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol]}>D</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol]}>L</Text>
                <Text style={[styles.standingsHeaderText, styles.statCol]}>GD</Text>
                <Text style={[styles.standingsHeaderText, styles.ptsCol]}>Pts</Text>
            </View>

            {/* Rows */}
            {standings.map((standing, index) => (
                <Pressable
                    key={standing.team_key}
                    style={[
                        styles.standingsRow,
                        index < 4 && styles.championsLeagueRow,
                        index === 4 && styles.europaLeagueRow,
                    ]}
                    onPress={() => router.push(`/home/football/teams/${standing.team_key}` as any)}
                >
                    <Text style={[styles.standingsText, styles.posCol]}>{standing.standing_place}</Text>
                    <Text style={[styles.standingsText, styles.teamCol]} numberOfLines={1}>
                        {standing.standing_team}
                    </Text>
                    <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_P}</Text>
                    <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_W}</Text>
                    <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_D}</Text>
                    <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_L}</Text>
                    <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_GD}</Text>
                    <Text style={[styles.standingsText, styles.ptsCol, styles.ptsValue]}>
                        {standing.standing_PTS}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.background} />
                </Pressable>
                <View style={styles.headerContent}>
                    {league.league_logo && (
                        <Image source={{ uri: league.league_logo }} style={styles.leagueLogo} />
                    )}
                    <View style={styles.headerText}>
                        <Text style={styles.leagueName}>{league.league_name}</Text>
                        <View style={styles.countryInfo}>
                            {league.country_logo && (
                                <Image source={{ uri: league.country_logo }} style={styles.countryFlag} />
                            )}
                            <Text style={styles.countryName}>{league.country_name}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <Pressable
                    style={[styles.tab, activeTab === 'fixtures' && styles.activeTab]}
                    onPress={() => setActiveTab('fixtures')}
                >
                    <Text style={[styles.tabText, activeTab === 'fixtures' && styles.activeTabText]}>
                        Fixtures ({fixtures.length})
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, activeTab === 'standings' && styles.activeTab]}
                    onPress={() => setActiveTab('standings')}
                >
                    <Text style={[styles.tabText, activeTab === 'standings' && styles.activeTabText]}>
                        Standings ({standings.length})
                    </Text>
                </Pressable>
            </View>

            {/* Content */}
            <ScrollView style={styles.content}>
                {activeTab === 'fixtures' ? (
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
                ) : (
                    <View style={styles.section}>
                        {standings.length > 0 ? (
                            renderStandingsTable()
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No standings available</Text>
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
        padding: SPACING.lg,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.secondary,
        paddingTop: 50, // Added padding for status bar
    },
    backButton: {
        marginBottom: SPACING.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leagueLogo: {
        width: 80,
        height: 80,
        marginRight: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    headerText: {
        flex: 1,
    },
    leagueName: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '900',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    countryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryFlag: {
        width: 24,
        height: 24,
        marginRight: SPACING.xs,
        borderRadius: BORDER_RADIUS.xs,
    },
    countryName: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        fontWeight: '600',
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
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
    },
    standingsTable: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    standingsHeader: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.secondary,
    },
    standingsHeaderText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.secondary,
        textAlign: 'center',
    },
    standingsRow: {
        flexDirection: 'row',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    championsLeagueRow: {
        borderLeftColor: COLORS.primary,
    },
    europaLeagueRow: {
        borderLeftColor: COLORS.secondary,
    },
    standingsText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        textAlign: 'center',
    },
    posCol: {
        width: 30,
    },
    teamCol: {
        flex: 1,
        textAlign: 'left',
        paddingLeft: SPACING.sm,
    },
    statCol: {
        width: 30,
    },
    ptsCol: {
        width: 40,
    },
    ptsValue: {
        fontWeight: '700',
        color: COLORS.secondary,
    },
});
