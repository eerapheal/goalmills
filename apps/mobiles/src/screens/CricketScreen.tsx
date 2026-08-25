import { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Image,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketEvent, CricketLeague, CricketTeam, CricketStanding, CricketPlayer } from '@goalmills/types';
import { advancedCricketApi } from '../services/advancedCricketApi';
import { CricketMatchCard } from '../components/CricketMatchCard';
import { Ionicons } from '@expo/vector-icons';

type CricketTab = 'live' | 'upcoming' | 'recent' | 'series' | 'teams' | 'athletes' | 'rankings';

// Global league priority for consistent sorting
const LEAGUE_PRIORITY: Record<string, number> = {
    'ICC World Cup': 1,
    'ICC T20 World Cup': 1,
    'Indian Premier League': 2,
    'IPL': 2,
    'Big Bash League': 3,
    'BBL': 3,
    'Pakistan Super League': 4,
    'PSL': 4,
    'SA20': 5,
    'The Hundred': 6,
    'Caribbean Premier League': 7,
    'CPL': 7,
    'International': 10
};

const getLeagueRank = (name: string = '') => {
    for (const [key, rank] of Object.entries(LEAGUE_PRIORITY)) {
        if (name.toLowerCase().includes(key.toLowerCase())) return rank;
    }
    return 100;
};

const sortMatches = (matches: CricketEvent[]) => {
    return [...matches].sort((a, b) => {
        const rankA = getLeagueRank(a.league_name);
        const rankB = getLeagueRank(b.league_name);
        if (rankA !== rankB) return rankA - rankB;
        return new Date(a.event_date_start + ' ' + (a.event_time || '00:00')).getTime() -
            new Date(b.event_date_start + ' ' + (b.event_time || '00:00')).getTime();
    });
};

export function CricketScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<CricketTab>('live');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Data states
    const [liveMatches, setLiveMatches] = useState<CricketEvent[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<CricketEvent[]>([]);
    const [recentMatches, setRecentMatches] = useState<CricketEvent[]>([]);
    const [seriesList, setSeriesList] = useState<CricketLeague[]>([]);
    const [teamsList, setTeamsList] = useState<CricketTeam[]>([]);
    const [playersList, setPlayersList] = useState<CricketPlayer[]>([]);
    const [rankings, setRankings] = useState<Record<string, CricketStanding[]>>({});

    const getDateString = (daysOffset: number = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    };

    const loadData = async () => {
        try {
            const today = getDateString();
            const futureDate = getDateString(14);
            const pastDate = getDateString(-14);

            const [live, upcoming, recent, series, players] = await Promise.all([
                advancedCricketApi.getLivescore().catch(() => ({ result: [] })),
                advancedCricketApi.getFixtures({ from: today, to: futureDate }).catch(() => ({ result: [] })),
                advancedCricketApi.getFixtures({ from: pastDate, to: today }).catch(() => ({ result: [] })),
                advancedCricketApi.getLeagues().catch(() => ({ result: [] })),
                advancedCricketApi.getPlayers().catch(() => ({ result: [] })),
            ]);

            const teamProms = [
                advancedCricketApi.getTeams({ leagueId: 9785 }),
                advancedCricketApi.getTeams({ leagueId: 9843 }),
                advancedCricketApi.getTeams({ leagueId: 9779 }),
                advancedCricketApi.getTeams({ leagueId: 9683 }),
            ];
            const teamResults = await Promise.all(teamProms);
            const allTeams = teamResults.flatMap(r => r.result || []);
            const uniqueTeams = Array.from(new Map(allTeams.map(t => [t.team_key, t])).values());

            const [iplRank, t20Rank, bblRank] = await Promise.all([
                advancedCricketApi.getStandings({ leagueId: 9785 }).catch(() => ({ result: { total: [] } })),
                advancedCricketApi.getStandings({ leagueId: 9843 }).catch(() => ({ result: { total: [] } })),
                advancedCricketApi.getStandings({ leagueId: 9779 }).catch(() => ({ result: { total: [] } })),
            ]);

            setLiveMatches(sortMatches(live.result || []));
            setUpcomingMatches(sortMatches(upcoming.result || []));
            setRecentMatches(sortMatches(recent.result || []).reverse());
            setSeriesList(series.result || []);
            setTeamsList(uniqueTeams);
            setPlayersList(players.result || []);

            setRankings({
                'IPL': iplRank.result?.total || (Array.isArray(iplRank.result) ? iplRank.result : []),
                'T20 WC': t20Rank.result?.total || (Array.isArray(t20Rank.result) ? t20Rank.result : []),
                'BBL': bblRank.result?.total || (Array.isArray(bblRank.result) ? bblRank.result : []),
            });
        } catch (error) {
            console.error('Error loading mobile cricket:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const filteredSeries = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return seriesList
            .filter(s => {
                const name = s.league_name?.toLowerCase() || '';
                const search = searchQuery.toLowerCase();
                const matchesSearch = name.includes(search) || (s.country_name && s.country_name.toLowerCase().includes(search));

                const seasonStr = s.league_season || name;
                const years = seasonStr.match(/\d{4}/g) || [];
                const isModern = years.length === 0 || years.some(y => parseInt(y) >= currentYear - 1);

                return matchesSearch && isModern;
            })
            .sort((a, b) => {
                const rankA = getLeagueRank(a.league_name);
                const rankB = getLeagueRank(b.league_name);
                if (rankA !== rankB) return rankA - rankB;
                return (a.league_name || '').localeCompare(b.league_name || '');
            });
    }, [seriesList, searchQuery]);

    const filteredTeams = useMemo(() => {
        return teamsList.filter(t =>
            t.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [teamsList, searchQuery]);

    const filteredPlayers = useMemo(() => {
        return playersList.filter(p =>
            p.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.player_country && p.player_country.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [playersList, searchQuery]);

    const tabs: { id: CricketTab; label: string; icon: string }[] = [
        { id: 'live', label: 'Live Action', icon: '⚡' },
        { id: 'upcoming', label: 'Schedule', icon: '🗓️' },
        { id: 'recent', label: 'Results', icon: '✅' },
        { id: 'series', label: 'Series', icon: '🏆' },
        { id: 'athletes', label: 'Athletes', icon: '🏏' },
        { id: 'teams', label: 'Squads', icon: '🛡️' },
        { id: 'rankings', label: 'Standings', icon: '📈' },
    ];

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <View style={styles.heroContent}>
                <Text style={styles.heroBadge}>CRICKET INTELLIGENCE MATRIX</Text>
                <Text style={styles.heroTitle}>CRICKET</Text>
                <Text style={styles.heroSubtitle}>
                    Real-time match analytics, ball-by-ball scorecards, athlete profiles, and ICC world leaderboards.
                </Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search teams, players, tournaments..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                    <Text style={styles.loadingText}>Syncing Global Feed...</Text>
                </View>
            );
        }

        switch (activeTab) {
            case 'live':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.liveDot} />
                            <Text style={styles.sectionTitle}>PLAYING NOW ({liveMatches.length})</Text>
                        </View>
                        {liveMatches.length > 0 ? (
                            liveMatches.map((match) => (
                                <CricketMatchCard key={match.event_key} match={match} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🏏</Text>
                                <Text style={styles.emptyText}>OFF-HOURS</Text>
                                <Text style={styles.emptySubtext}>No live professional wickets at this hour.</Text>
                            </View>
                        )}
                    </View>
                );

            case 'upcoming':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>🗓️ FUTURE FIXTURES ({upcomingMatches.length})</Text>
                        {upcomingMatches.map((match) => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))}
                    </View>
                );

            case 'recent':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>✅ RECENT RESULTS ({recentMatches.length})</Text>
                        {recentMatches.map((match) => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))}
                    </View>
                );

            case 'series':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>🏆 GLOBAL SERIES & CUPS ({filteredSeries.length})</Text>
                        <View style={styles.seriesGrid}>
                            {filteredSeries.map((series) => (
                                <Pressable
                                    key={series.league_key}
                                    style={styles.seriesItem}
                                    onPress={() => router.push(`/home/cricket/series/${series.league_key}`)}
                                >
                                    <View style={styles.seriesLogoContainer}>
                                        <Text style={styles.seriesInitial}>{series.league_name.charAt(0)}</Text>
                                    </View>
                                    <Text style={styles.seriesTitleText} numberOfLines={1}>{series.league_name}</Text>
                                    <Text style={styles.seriesSubtitleText}>{series.league_season || '2026'}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                );

            case 'athletes':
                return (
                    <View style={styles.tabContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={styles.sectionTitle}>🏏 STAR ATHLETES ({filteredPlayers.length})</Text>
                            <TouchableOpacity onPress={() => router.push('/home/cricket/players')}>
                                <Text style={{ color: COLORS.secondary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>All Athletes →</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.playersList}>
                            {filteredPlayers.map((player) => (
                                <TouchableOpacity
                                    key={player.player_key}
                                    style={styles.playerCard}
                                    onPress={() => router.push(`/home/cricket/players/${player.player_key}`)}
                                >
                                    <View style={styles.playerAvatar}>
                                        {player.player_image ? (
                                            <Image source={{ uri: player.player_image }} style={{ width: '100%', height: '100%' }} />
                                        ) : (
                                            <Text style={styles.playerAvatarText}>{player.player_name.charAt(0)}</Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.playerName}>{player.player_name}</Text>
                                        <Text style={styles.playerRole}>{player.player_type || player.player_role || 'Athlete'} • {player.player_country}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'teams':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>🛡️ SQUAD MATRIX ({filteredTeams.length})</Text>
                        <View style={styles.teamsGrid}>
                            {filteredTeams.map((team) => (
                                <Pressable
                                    key={team.team_key}
                                    style={styles.teamItem}
                                    onPress={() => router.push(`/home/cricket/teams/${team.team_key}`)}
                                >
                                    <View style={styles.teamLogoContainer}>
                                        {team.team_logo ? (
                                            <Image source={{ uri: team.team_logo }} style={styles.teamLogo} />
                                        ) : (
                                            <Text style={styles.teamInitial}>{team.team_name.charAt(0)}</Text>
                                        )}
                                    </View>
                                    <Text style={styles.teamNameText} numberOfLines={1}>{team.team_name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                );

            case 'rankings':
                return (
                    <View style={styles.tabContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={styles.sectionTitle}>📈 STANDINGS & ICC MATRIX</Text>
                            <TouchableOpacity onPress={() => router.push('/home/cricket/rankings')}>
                                <Text style={{ color: COLORS.secondary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>ICC World Rankings →</Text>
                            </TouchableOpacity>
                        </View>
                        {['IPL', 'T20 WC', 'BBL'].map((format) => {
                            const list = rankings[format] || [];
                            return (
                                <View key={format} style={styles.rankingCard}>
                                    <Text style={styles.rankingTitle}>{format} POINTS TABLE</Text>
                                    {list.length > 0 ? (
                                        <View style={styles.rankingList}>
                                            {list.slice(0, 5).map((rank, idx) => (
                                                <View key={idx} style={styles.rankingRow}>
                                                    <View style={styles.rankTeam}>
                                                        <Text style={styles.rankNumber}>{(idx + 1).toString().padStart(2, '0')}</Text>
                                                        <Text style={styles.rankName}>{rank.standing_team}</Text>
                                                    </View>
                                                    <View style={styles.rankStats}>
                                                        <Text style={styles.rankPts}>{rank.standing_Pts} pts</Text>
                                                        <Text style={[styles.rankNrr, parseFloat(rank.standing_NRR) >= 0 ? styles.positive : styles.negative]}>
                                                            {rank.standing_NRR}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    ) : (
                                        <View style={styles.rankingEmpty}>
                                            <Text style={styles.rankingEmptyText}>SEASON INITIALIZING</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                stickyHeaderIndices={[1]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.secondary}
                    />
                }
            >
                {renderHeader()}

                <View style={styles.tabsWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContainer}
                    >
                        {tabs.map((tab) => (
                            <Pressable
                                key={tab.id}
                                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <Text style={styles.tabIcon}>{tab.icon}</Text>
                                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {renderContent()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e27',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerSection: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    heroContent: {
        marginBottom: 8,
    },
    heroBadge: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    heroTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 8,
    },
    heroSubtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    tabsWrapper: {
        backgroundColor: '#0a0e27',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 12,
    },
    tabsContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 8,
    },
    activeTab: {
        backgroundColor: COLORS.secondary,
    },
    tabIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    tabText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeTabText: {
        color: '#fff',
    },
    tabContent: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.secondary,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    loadingContainer: {
        padding: 60,
        alignItems: 'center',
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginTop: 16,
        letterSpacing: 2,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    emptyEmoji: {
        fontSize: 40,
        marginBottom: 16,
    },
    emptyText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 4,
    },
    emptySubtext: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
    },
    seriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    seriesItem: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    seriesLogoContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    seriesInitial: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: '900',
    },
    seriesTitleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    seriesSubtitleText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    teamsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    teamItem: {
        width: '30%',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    teamLogoContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    teamLogo: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
    },
    teamInitial: {
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: '900',
    },
    teamNameText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    playersList: {
        gap: 8,
        marginTop: 8,
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
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
    playerAvatarText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: '900',
    },
    playerName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    playerRole: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    rankingCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 16,
    },
    rankingTitle: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    rankingList: {
        gap: 8,
    },
    rankingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    rankTeam: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rankNumber: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 10,
        fontWeight: '900',
        width: 24,
    },
    rankName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    rankStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankPts: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
    },
    rankNrr: {
        fontSize: 9,
        fontWeight: '800',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    positive: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
    },
    negative: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
    },
    rankingEmpty: {
        padding: 24,
        alignItems: 'center',
    },
    rankingEmptyText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
});
