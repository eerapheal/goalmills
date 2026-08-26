import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketTeam, CricketPlayer, CricketEvent } from '@goalmills/types';
import { advancedCricketApi } from '../../../../../services/advancedCricketApi';
import { Ionicons } from '@expo/vector-icons';
import { CricketMatchCard } from '../../../../../components/CricketMatchCard';

type TeamTab = 'squad' | 'schedule' | 'results';

export default function CricketTeamDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<CricketTeam | null>(null);
    const [players, setPlayers] = useState<CricketPlayer[]>([]);
    const [schedules, setSchedules] = useState<CricketEvent[]>([]);
    const [results, setResults] = useState<CricketEvent[]>([]);
    const [activeTab, setActiveTab] = useState<TeamTab>('squad');

    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        const loadTeamData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [intTeams, leagueTeams, womenTeams, schedRes, resultsRes, playersRes] = await Promise.all([
                    advancedCricketApi.getTeamsList('international').catch(() => []),
                    advancedCricketApi.getTeamsList('league').catch(() => []),
                    advancedCricketApi.getTeamsList('women').catch(() => []),
                    advancedCricketApi.getTeamSchedules(id).catch(() => []),
                    advancedCricketApi.getTeamResults(id).catch(() => []),
                    advancedCricketApi.getTeamPlayers(id).catch(() => []),
                ]);

                const teamList = [
                    ...(Array.isArray(intTeams) ? intTeams : ((intTeams as any).result || [])),
                    ...(Array.isArray(leagueTeams) ? leagueTeams : ((leagueTeams as any).result || [])),
                    ...(Array.isArray(womenTeams) ? womenTeams : ((womenTeams as any).result || [])),
                ];

                let found = teamList.find((t: any) => String(t.team_key) === String(id));

                const allMatches = [...(schedRes || []), ...(resultsRes || [])];
                const matchFixture = allMatches.find(
                    (m: any) => String(m.home_team_key) === String(id) || String(m.away_team_key) === String(id)
                );

                if (!found) {
                    const isHome = matchFixture ? String(matchFixture.home_team_key) === String(id) : false;
                    const inferredName = matchFixture
                        ? (isHome ? matchFixture.event_home_team : matchFixture.event_away_team)
                        : `Cricket Team #${id}`;
                    const inferredLogo = matchFixture
                        ? (isHome ? matchFixture.event_home_team_logo : matchFixture.event_away_team_logo)
                        : undefined;

                    found = {
                        team_key: String(id),
                        team_name: inferredName,
                        team_short_name: (inferredName || '').slice(0, 3).toUpperCase(),
                        team_logo: inferredLogo,
                        country_name: matchFixture?.country_name || matchFixture?.league_name || 'Official Team',
                    };
                } else if (!found.team_logo && matchFixture) {
                    const isHome = String(matchFixture.home_team_key) === String(id);
                    const matchLogo = isHome ? matchFixture.event_home_team_logo : matchFixture.event_away_team_logo;
                    if (matchLogo) {
                        found = { ...found, team_logo: matchLogo };
                    }
                }

                setTeam(found);
                setSchedules(schedRes || []);
                setResults(resultsRes || []);
                setPlayers(playersRes || []);
            } catch (error) {
                console.error('Error loading mobile team details:', error);
            } finally {
                setLoading(false);
            }
        };
        loadTeamData();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.secondary} size="large" />
                <Text style={styles.loadingText}>Deploying Team Matrix...</Text>
            </View>
        );
    }

    if (!team) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="shield-outline" size={64} color={COLORS.secondary} />
                <Text style={styles.errorTitle}>Team Record Unavailable</Text>
                <TouchableOpacity style={styles.btnReturn} onPress={() => router.back()}>
                    <Text style={styles.btnReturnText}>Return</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentMatches = activeTab === 'schedule' ? schedules : results;

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: team.team_name || 'Cricket Squad',
                    headerStyle: { backgroundColor: '#0a0e27' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Header */}
                <View style={styles.heroCard}>
                    <View style={styles.logoContainer}>
                        {team.team_logo && !logoError ? (
                            <Image
                                source={{ uri: team.team_logo }}
                                style={styles.logo}
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <Text style={styles.logoText}>{(team.team_name || 'T').charAt(0)}</Text>
                        )}
                    </View>
                    <Text style={styles.name}>{team.team_name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{(team as any).country_name || 'OFFICIAL CRICKET SQUAD'}</Text>
                    </View>
                    <Text style={styles.statsOverview}>
                        {players.length} Squad Athletes • {schedules.length} Upcoming • {results.length} Completed
                    </Text>
                </View>

                {/* Sub Tab Navigation */}
                <View style={styles.tabBar}>
                    {[
                        { id: 'squad', label: `Squad (${players.length})` },
                        { id: 'schedule', label: `Schedule (${schedules.length})` },
                        { id: 'results', label: `Results (${results.length})` },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
                            onPress={() => setActiveTab(tab.id as TeamTab)}
                        >
                            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                {activeTab === 'squad' && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>🏏 Official Squad Roster</Text>
                        {players.length > 0 ? (
                            players.map((player) => (
                                <TouchableOpacity
                                    key={player.player_key}
                                    style={styles.playerCard}
                                    onPress={() => router.push(`/home/cricket/players/${player.player_key}`)}
                                >
                                    <View style={styles.playerAvatar}>
                                        {player.player_image ? (
                                            <Image source={{ uri: player.player_image }} style={styles.playerAvatarImage} />
                                        ) : (
                                            <Text style={styles.playerAvatarText}>{player.player_name.charAt(0)}</Text>
                                        )}
                                    </View>
                                    <View style={styles.playerInfo}>
                                        <Text style={styles.playerName}>{player.player_name}</Text>
                                        <Text style={styles.playerRole}>{player.player_type || player.player_role || 'Athlete'}</Text>
                                        {player.batting_style && (
                                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>{player.batting_style}</Text>
                                        )}
                                    </View>
                                    <View style={styles.playerAction}>
                                        <Text style={styles.playerActionText}>Intel</Text>
                                        <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} />
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.1)" />
                                <Text style={styles.emptyTitle}>SQUAD MANIFEST PENDING</Text>
                                <Text style={styles.emptyText}>Roster announcements are currently processing.</Text>
                            </View>
                        )}
                    </View>
                )}

                {(activeTab === 'schedule' || activeTab === 'results') && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>
                            {activeTab === 'schedule' ? '🗓️ Upcoming Schedule' : '📊 Recent Results'}
                        </Text>
                        {currentMatches.length > 0 ? (
                            currentMatches.map((m) => (
                                <CricketMatchCard key={m.event_key} match={m} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.1)" />
                                <Text style={styles.emptyTitle}>NO MATCHES RECORDED</Text>
                                <Text style={styles.emptyText}>No fixtures matching this category.</Text>
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
        backgroundColor: '#0a0e27',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0e27',
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 12,
        textTransform: 'uppercase',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0e27',
        padding: 20,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        marginVertical: 12,
        textTransform: 'uppercase',
    },
    btnReturn: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    btnReturnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    heroCard: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 20,
    },
    logoContainer: {
        width: 88,
        height: 88,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    logoText: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.secondary,
    },
    name: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    badge: {
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.2)',
    },
    badgeText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    statsOverview: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '600',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    tabItem: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabItemActive: {
        backgroundColor: COLORS.secondary,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.6)',
        textTransform: 'uppercase',
    },
    tabLabelActive: {
        color: '#000',
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    playerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    playerAvatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    playerAvatarText: {
        color: COLORS.secondary,
        fontWeight: '900',
        fontSize: 16,
    },
    playerInfo: {
        flex: 1,
    },
    playerName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    playerRole: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        marginTop: 2,
    },
    playerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    playerActionText: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        marginTop: 12,
        marginBottom: 4,
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 11,
        textAlign: 'center',
    },
});
