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
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketEvent, CricketLeague, CricketTeam, CricketStanding } from '@goalmills/types';
import { advancedCricketApi } from '../services/advancedCricketApi';
import { CricketMatchCard } from '../components/CricketMatchCard';


type CricketTab = 'live' | 'upcoming' | 'recent' | 'series' | 'teams' | 'rankings';

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

            // Fetch core data first
            const [live, upcoming, recent, series] = await Promise.all([
                advancedCricketApi.getLivescore().catch(e => ({ result: [] })),
                advancedCricketApi.getFixtures({ from: today, to: futureDate }).catch(e => ({ result: [] })),
                advancedCricketApi.getFixtures({ from: pastDate, to: today }).catch(e => ({ result: [] })),
                advancedCricketApi.getLeagues().catch(e => ({ result: [] })),
            ]);

            // Fetch Teams for major leagues to ensure we get data
            // Mobile APIs might struggle with "all teams", so we fetch for specific popular leagues
            const teamProms = [
                advancedCricketApi.getTeams({ leagueId: 9785 }), // IPL
                advancedCricketApi.getTeams({ leagueId: 9843 }), // T20 WC
                advancedCricketApi.getTeams({ leagueId: 9779 }), // BBL
                advancedCricketApi.getTeams({ leagueId: 9683 }), // PSL
            ];
            const teamResults = await Promise.all(teamProms);
            const allTeams = teamResults.flatMap(r => r.result || []);
            // Deduplicate teams by ID
            const uniqueTeams = Array.from(new Map(allTeams.map(t => [t.team_key, t])).values());

            // Fetch Standings
            const [iplRank, t20Rank, bblRank] = await Promise.all([
                advancedCricketApi.getStandings({ leagueId: 9785 }).catch(e => ({ result: { total: [] } })),
                advancedCricketApi.getStandings({ leagueId: 9843 }).catch(e => ({ result: { total: [] } })),
                advancedCricketApi.getStandings({ leagueId: 9779 }).catch(e => ({ result: { total: [] } })),
            ]);

            setLiveMatches(sortMatches(live.result || []));
            setUpcomingMatches(sortMatches(upcoming.result || []));
            setRecentMatches(sortMatches(recent.result || []).reverse());
            setSeriesList(series.result || []);
            setTeamsList(uniqueTeams);
            setRankings({
                'IPL': iplRank.result?.total || iplRank.result || [],
                'T20 WC': t20Rank.result?.total || t20Rank.result || [],
                'BBL': bblRank.result?.total || bblRank.result || [],
            });

        } catch (error) {
            console.error('Error loading cricket data:', error);
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
                const matchesSearch = name.includes(search) ||
                    s.country_name?.toLowerCase().includes(search);
                const years = (s.league_season || name).match(/\d{4}/g) || [];
                const isModern = years.length === 0 || years.some(y => parseInt(y) >= currentYear - 1);
                return matchesSearch && isModern;
            })
            .sort((a, b) => getLeagueRank(a.league_name) - getLeagueRank(b.league_name));
    }, [seriesList, searchQuery]);

    const filteredTeams = useMemo(() => {
        return teamsList.filter(t =>
            t.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [teamsList, searchQuery]);

    const tabs: { id: CricketTab; label: string; icon: string }[] = [
        { id: 'live', label: 'Live', icon: '⚡' },
        { id: 'upcoming', label: 'Schedule', icon: '🗓️' },
        { id: 'recent', label: 'Recent', icon: '📊' },
        { id: 'series', label: 'Series', icon: '🏆' },
        { id: 'teams', label: 'Squads', icon: '🛡️' },
        { id: 'rankings', label: 'Standings', icon: '📈' },
    ];

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <View style={styles.heroContent}>
                <Text style={styles.heroBadge}>Worldwide Coverage</Text>
                <Text style={styles.heroTitle}>Cricket Intelligence</Text>
                <Text style={styles.heroSubtitle}>Live scores, series intel, and squad analytics.</Text>
            </View>

            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="SEARCH CRICKET INTELLIGENCE..."
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
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
                            <Text style={styles.sectionTitle}>PLAYING NOW</Text>
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
                        <Text style={styles.sectionTitle}>🗓️ FUTURE FIXTURES</Text>
                        {upcomingMatches.map((match) => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))}
                    </View>
                );

            case 'recent':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>✅ RECENT RESULTS</Text>
                        {recentMatches.map((match) => (
                            <CricketMatchCard key={match.event_key} match={match} />
                        ))}
                    </View>
                );

            case 'series':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>🏆 GLOBAL SERIES</Text>
                        <View style={styles.seriesGrid}>
                            {filteredSeries.map((series) => {
                                // Fallback logic for missing logos: check if we have teams for this series
                                const leagueName = series.league_name || '';
                                const detectedLogos = teamsList
                                    .filter(t => {
                                        const tName = t.team_name || '';
                                        return tName && leagueName.toLowerCase().includes(tName.toLowerCase());
                                    })
                                    .map(t => t.team_logo)
                                    .filter((l): l is string => !!l);

                                return (
                                    <Pressable
                                        key={series.league_key}
                                        style={styles.seriesItem}
                                        onPress={() => router.push(`/home/cricket/series/${series.league_key}`)}
                                    >
                                        <View style={styles.seriesLogoContainer}>
                                            {series.league_logo ? (
                                                <Image source={{ uri: series.league_logo }} style={styles.seriesLogo} />
                                            ) : detectedLogos.length > 0 ? (
                                                <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                                                    {detectedLogos.slice(0, 2).map((logo, idx) => (
                                                        <Image
                                                            key={idx}
                                                            source={{ uri: logo }}
                                                            style={[
                                                                styles.seriesLogo,
                                                                {
                                                                    marginLeft: -10,
                                                                    borderRadius: 16,
                                                                    borderWidth: 1,
                                                                    borderColor: '#0a0e27',
                                                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                                                }
                                                            ]}
                                                        />
                                                    ))}
                                                </View>
                                            ) : (
                                                <Text style={styles.seriesInitial}>{series.league_name.charAt(0)}</Text>
                                            )}
                                        </View>
                                        <Text style={styles.seriesTitleText} numberOfLines={1}>{series.league_name}</Text>
                                        <Text style={styles.seriesSubtitleText}>{series.league_season}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                );

            case 'teams':
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>🛡️ SQUAD MATRIX</Text>
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
                        <Text style={styles.sectionTitle}>📈 STANDINGS MATRIX</Text>
                        {['IPL', 'T20 WC', 'BBL'].map((format) => {
                            const list = rankings[format] || [];
                            return (
                                <View key={format} style={styles.rankingCard}>
                                    <Text style={styles.rankingTitle}>{format} LEADERBOARD</Text>
                                    {list.length > 0 ? (
                                        <View style={styles.rankingList}>
                                            {list.slice(0, 5).map((rank, idx) => (
                                                <View key={idx} style={styles.rankingRow}>
                                                    <View style={styles.rankTeam}>
                                                        <Text style={styles.rankNumber}>{(idx + 1).toString().padStart(2, '0')}</Text>
                                                        <Text style={styles.rankName}>{rank.standing_team}</Text>
                                                    </View>
                                                    <View style={styles.rankStats}>
                                                        <Text style={styles.rankPts}>{rank.standing_Pts}</Text>
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
        marginBottom: 24,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 10,
        opacity: 0.5,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
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
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
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
        letterSpacing: 2,
        marginBottom: 16,
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
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    seriesLogo: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    seriesInitial: {
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: '900',
    },
    seriesTitleText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    seriesSubtitleText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 9,
        fontWeight: '700',
        marginTop: 2,
    },
    teamsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    teamItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 16,
    },
    teamLogoContainer: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    teamLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    teamInitial: {
        color: COLORS.secondary,
        fontSize: 24,
        fontWeight: '900',
    },
    teamNameText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '100%',
    },
    rankingCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    rankingTitle: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        paddingBottom: 8,
    },
    rankingList: {
        gap: 12,
    },
    rankingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rankTeam: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankNumber: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 10,
        fontWeight: '900',
        width: 20,
    },
    rankName: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
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
        fontWeight: '900',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    positive: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
    },
    negative: {
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        color: '#f43f5e',
    },
    rankingEmpty: {
        padding: 20,
        alignItems: 'center',
    },
    rankingEmptyText: {
        color: 'rgba(255, 255, 255, 0.2)',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
});

