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
    const [matches, setMatches] = useState<CricketEvent[]>([]);
    const [activeTab, setActiveTab] = useState<TeamTab>('squad');

    useEffect(() => {
        const loadTeamData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [teamRes, playersRes, matchesRes] = await Promise.all([
                    advancedCricketApi.getTeams({ teamId: Number(id) }),
                    advancedCricketApi.getPlayers({ teamId: id }),
                    advancedCricketApi.getFixtures({
                        from: advancedCricketApi.getFormattedDate(-60),
                        to: advancedCricketApi.getFormattedDate(60),
                    }),
                ]);

                if (teamRes.result && teamRes.result.length > 0) {
                    const found = teamRes.result.find(t => String(t.team_key) === String(id)) || teamRes.result[0];
                    setTeam(found);
                }

                setPlayers(playersRes.result || []);

                const teamMatches = (matchesRes.result || []).filter(
                    m => String(m.home_team_key) === String(id) || String(m.away_team_key) === String(id)
                );
                setMatches(teamMatches);
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

    const displayMatches = matches.filter(m => {
        if (activeTab === 'schedule') return m.event_status === 'Not Started';
        if (activeTab === 'results') return m.event_status !== 'Not Started';
        return true;
    });

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: team.team_name,
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
                        {team.team_logo ? (
                            <Image source={{ uri: team.team_logo }} style={styles.logo} />
                        ) : (
                            <Text style={styles.logoText}>{team.team_name.charAt(0)}</Text>
                        )}
                    </View>
                    <Text style={styles.name}>{team.team_name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>OFFICIAL CRICKET SQUAD</Text>
                    </View>
                    <Text style={styles.statsOverview}>
                        {players.length} Squad Athletes • {matches.length} Fixtures Logged
                    </Text>
                </View>

                {/* Sub Tab Navigation */}
                <View style={styles.tabBar}>
                    {[
                        { id: 'squad', label: `Squad (${players.length})` },
                        { id: 'schedule', label: 'Schedule' },
                        { id: 'results', label: 'Results' },
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
                        {displayMatches.length > 0 ? (
                            displayMatches.map((m) => (
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0e27',
    },
    loadingText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: SPACING.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: '#0a0e27',
    },
    errorTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '900',
        color: '#fff',
        marginTop: SPACING.md,
        textTransform: 'uppercase',
    },
    btnReturn: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.secondary,
    },
    btnReturnText: {
        color: '#fff',
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    heroCard: {
        alignItems: 'center',
        marginBottom: 16,
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    logo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    logoText: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.secondary,
    },
    name: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 6,
    },
    badge: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        marginBottom: 8,
    },
    badgeText: {
        color: COLORS.secondary,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    statsOverview: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '700',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        padding: 4,
        gap: 4,
        marginBottom: 16,
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
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
    },
    tabLabelActive: {
        color: '#fff',
    },
    sectionContainer: {
        gap: 8,
    },
    sectionTitle: {
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    playerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    playerAvatarImage: {
        width: '100%',
        height: '100%',
    },
    playerAvatarText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: '900',
    },
    playerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    playerName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    playerRole: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    playerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    playerActionText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        marginTop: 12,
        textTransform: 'uppercase',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        marginTop: 4,
    },
});
