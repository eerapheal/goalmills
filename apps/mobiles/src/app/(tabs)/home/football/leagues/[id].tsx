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
import { FootballLeague, FootballEvent, FootballStanding, FootballTopscorer, FootballTeam } from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballMatchCard } from '../../../../../components/FootballMatchCard';

type LeagueTab = 'fixtures' | 'results' | 'standings' | 'topscorers';

export default function LeagueDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<LeagueTab>('fixtures');
    const [league, setLeague] = useState<FootballLeague | null>(null);
    const [fixtures, setFixtures] = useState<FootballEvent[]>([]);
    const [standings, setStandings] = useState<{ name: string; teams: FootballStanding[] }[]>([]);
    const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
    const [teams, setTeams] = useState<FootballTeam[]>([]);

    useEffect(() => {
        loadLeagueData();
    }, [id]);

    const loadLeagueData = async () => {
        try {
            const leagueId = Number(id);
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth(); // 0-11

            // Fetch a wider range to ensure we capture the full current/upcoming season regardless of league schedule type
            const fromDate = `${currentYear - 1}-01-01`;
            const toDate = `${currentYear + 2}-01-01`;

            const [leaguesRes, fixturesRes, standingsRes, topscorersRes, teamsRes] = await Promise.all([
                advancedFootballApi.getLeagues(undefined, leagueId).catch(() => ({ result: [] })),
                advancedFootballApi.getFixtures({
                    from: fromDate,
                    to: toDate,
                    leagueId: leagueId,
                }).catch(() => ({ result: [] })),
                advancedFootballApi.getStandings(leagueId).catch(() => ({ result: { total: [] } })),
                advancedFootballApi.getTopscorers(leagueId).catch(() => ({ result: [] })),
                advancedFootballApi.getTeams({ leagueId: leagueId }).catch(() => ({ result: [] })),
            ]);

            const leagues = leaguesRes.result || [];
            let foundLeague = leagues.find((l) => String(l.league_key) === String(id));

            let rawFixtures = fixturesRes.result || [];

            let latestSeason: string | null = null;
            if (rawFixtures.length > 0) {
                // Collect all unique seasons
                const seasons = Array.from(new Set(rawFixtures.map(f => f.league_season).filter(s => s)));
                if (seasons.length > 0) {
                    // Sort seasons descending
                    seasons.sort((a, b) => {
                        return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
                    });
                    latestSeason = seasons[0];
                    console.log(`Mobile: Filtering league ${id} for latest season: ${latestSeason}`);
                    rawFixtures = rawFixtures.filter(f => f.league_season === latestSeason);
                }
            }

            // If league not found in leagues list, try to get it from fixtures
            if (!foundLeague && rawFixtures.length > 0) {
                const firstFixture = rawFixtures[0];
                foundLeague = {
                    league_key: String(id),
                    league_name: firstFixture.league_name,
                    league_logo: firstFixture.league_logo || '',
                    country_key: firstFixture.event_country_key || '',
                    country_name: firstFixture.country_name,
                    country_logo: firstFixture.country_logo || '',
                } as FootballLeague;
            }
            setLeague(foundLeague || null);

            // Sort individual tab data
            setFixtures(rawFixtures);

            // Process Standings: Group by stage_name to support multi-group competitions (e.g. World Cup, UCL)
            let rawStandings: FootballStanding[] = [];
            const result = standingsRes.result;

            if (result) {
                if (Array.isArray(result)) {
                    rawStandings = result;
                } else if (result.total && Array.isArray(result.total)) {
                    rawStandings = result.total;
                }
            }

            // FILTER STANDINGS BY LATEST SEASON (Synced with Fixtures)
            if (latestSeason) {
                rawStandings = rawStandings.filter(s => s.league_season === latestSeason);
            }

            const groupedStandings: { [key: string]: FootballStanding[] } = {};
            const processedGroups = new Set<string>();

            rawStandings.forEach(s => {
                // Try to find the most specific group name
                let groupName = s.stage_name || 'League Table';

                // Normalize variations
                if (groupName === 'League Stage' || groupName === 'League Phase') {
                    groupName = 'League Table';
                }

                const specificGroup = (s as any).group || (s as any).league_group;
                const round = s.league_round;

                // Priority 1: Specific Group found in hidden fields
                if (specificGroup) {
                    groupName = specificGroup;
                }
                // Priority 2: Use Round Logic
                else if (round && round.length < 25) {
                    if (groupName === 'Group Stage' || groupName === 'League Table') {
                         groupName = round;
                    } else if (round !== groupName && !groupName.includes(round)) {
                         // Concatenate for cases like "League A" + "Group 1"
                         groupName = `${groupName} - ${round}`;
                    }
                }

                groupName = groupName.trim();

                if (!groupedStandings[groupName]) {
                    groupedStandings[groupName] = [];
                }
                groupedStandings[groupName].push(s);
            });

            // Remove generic "Group Stage" if specific groups exist
            if (Object.keys(groupedStandings).length > 1 && groupedStandings['Group Stage']) {
                delete groupedStandings['Group Stage'];
            }

            // Convert to array and sort groups
            const standingsData = Object.entries(groupedStandings).map(([name, teams]) => ({
                name,
                teams: teams.sort((a, b) => parseInt(a.standing_place) - parseInt(b.standing_place))
            }));

            // Sort groups alphabetically (e.g. Group A, Group B, ...)
            standingsData.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

            setStandings(standingsData);

            setTopscorers(topscorersRes.result || []);

            // Merge team data (Web App Logic)
            const teamMap = new Map<string, FootballTeam>();
            if (teamsRes.result) {
                teamsRes.result.forEach((t: FootballTeam) => teamMap.set(String(t.team_key), t));
            }

            // Supplement logos from fixtures
            rawFixtures.forEach((f: FootballEvent) => {
                if (f.home_team_key && f.home_team_logo) {
                    const key = String(f.home_team_key);
                    const existing = teamMap.get(key);
                    if (!existing) {
                        teamMap.set(key, { team_key: key, team_name: f.event_home_team, team_logo: f.home_team_logo } as FootballTeam);
                    } else if (!existing.team_logo || existing.team_logo === "") {
                        existing.team_logo = f.home_team_logo;
                    }
                }
                if (f.away_team_key && f.away_team_logo) {
                    const key = String(f.away_team_key);
                    const existing = teamMap.get(key);
                    if (!existing) {
                        teamMap.set(key, { team_key: key, team_name: f.event_away_team, team_logo: f.away_team_logo } as FootballTeam);
                    } else if (!existing.team_logo || existing.team_logo === "") {
                        existing.team_logo = f.away_team_logo;
                    }
                }
            });
            setTeams(Array.from(teamMap.values()));

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

    const renderStandingsTable = () => {
        const getTeamLogo = (teamKey: string) => {
            const team = teams.find(t => String(t.team_key) === String(teamKey));
            return team?.team_logo;
        };

        return (
            <View>
                {standings.map((group, groupIndex) => (
                    <View key={`group-${groupIndex}`} style={styles.standingsGroup}>
                        {standings.length > 1 && (
                            <Text style={styles.groupTitle}>{group.name}</Text>
                        )}
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
                            {group.teams.map((standing, index) => {
                                const teamLogo = getTeamLogo(standing.team_key);
                                return (
                                    <Pressable
                                        key={`${group.name || 'group'}-${standing.team_key || 'unknown'}-${index}`}
                                        style={[
                                            styles.standingsRow,
                                            index < 4 && styles.championsLeagueRow,
                                        ]}
                                        onPress={() => {
                                            if (standing.team_key) {
                                                router.push(`/home/football/teams/${standing.team_key}` as any);
                                            }
                                        }}
                                    >
                                        <Text style={[styles.standingsText, styles.posCol]}>{standing.standing_place}</Text>
                                        <View style={styles.teamColContainer}>
                                            {teamLogo && (
                                                <Image source={{ uri: teamLogo }} style={styles.standingsTeamLogo} />
                                            )}
                                            <Text style={[styles.standingsText, styles.teamColText]} numberOfLines={1}>
                                                {standing.standing_team}
                                            </Text>
                                        </View>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_P}</Text>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_W}</Text>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_D}</Text>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_L}</Text>
                                        <Text style={[styles.standingsText, styles.statCol]}>{standing.standing_GD}</Text>
                                        <Text style={[styles.standingsText, styles.ptsCol, styles.ptsValue]}>
                                            {standing.standing_PTS}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderTopscorers = () => {
        const getTeamLogo = (teamKey: string) => {
            const team = teams.find(t => String(t.team_key) === String(teamKey));
            return team?.team_logo;
        };

        const sortedScorers = [...topscorers].sort((a, b) => {
            const goalsA = parseInt(a.goals) || 0;
            const goalsB = parseInt(b.goals) || 0;
            if (goalsB !== goalsA) return goalsB - goalsA;
            const assistsA = parseInt(a.assists || '0') || 0;
            const assistsB = parseInt(b.assists || '0') || 0;
            return assistsB - assistsA;
        });

        return (
            <View style={styles.topscorersContainer}>
                {sortedScorers.map((scorer) => {
                    const teamLogo = getTeamLogo(scorer.team_key);
                    return (
                        <Pressable
                            key={scorer.player_key}
                            style={styles.topscorerCard}
                            onPress={() => router.push(`/home/football/players/${scorer.player_key}` as any)}
                        >
                            <View style={styles.topscorerRank}>
                                <Text style={styles.topscorerRankText}>{scorer.player_place}</Text>
                            </View>
                            <View style={styles.topscorerInfo}>
                                <Text style={styles.topscorerName}>{scorer.player_name}</Text>
                                <View style={styles.topscorerTeamContainer}>
                                    {teamLogo && (
                                        <Image source={{ uri: teamLogo }} style={styles.topscorerTeamLogo} />
                                    )}
                                    <Text style={styles.topscorerTeam}>{scorer.team_name}</Text>
                                </View>
                            </View>
                            <View style={styles.topscorerStats}>
                                <View style={styles.topscorerStat}>
                                    <Text style={styles.topscorerStatValue}>⚽ {scorer.goals}</Text>
                                    <Text style={styles.topscorerStatLabel}>Goals</Text>
                                </View>
                                {scorer.assists && (
                                    <View style={styles.topscorerStat}>
                                        <Text style={styles.topscorerStatValue}>🎯 {scorer.assists}</Text>
                                        <Text style={styles.topscorerStatLabel}>Assists</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.background} />
                    </Pressable>
                    {league.league_logo && (
                        <Image source={{ uri: league.league_logo }} style={styles.leagueLogo} />
                    )}
                    <View style={styles.headerText}>
                        <Text style={styles.leagueName}>{league.league_name}</Text>
                        <Pressable
                            style={styles.countryInfo}
                            onPress={() => {
                                if (league.country_key) {
                                    router.push(`/home/football/countries/${league.country_key}` as any);
                                }
                            }}
                        >
                            {league.country_logo && (
                                <Image source={{ uri: league.country_logo }} style={styles.countryFlag} />
                            )}
                            <Text style={styles.countryName}>{league.country_name}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Pressable
                        style={[styles.tab, activeTab === 'fixtures' && styles.activeTab]}
                        onPress={() => setActiveTab('fixtures')}
                    >
                        <Text style={[styles.tabText, activeTab === 'fixtures' && styles.activeTabText]}>
                            Fixtures
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, activeTab === 'results' && styles.activeTab]}
                        onPress={() => setActiveTab('results')}
                    >
                        <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
                            Results
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, activeTab === 'standings' && styles.activeTab]}
                        onPress={() => setActiveTab('standings')}
                    >
                        <Text style={[styles.tabText, activeTab === 'standings' && styles.activeTabText]}>
                            Standings
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, activeTab === 'topscorers' && styles.activeTab]}
                        onPress={() => setActiveTab('topscorers')}
                    >
                        <Text style={[styles.tabText, activeTab === 'topscorers' && styles.activeTabText]}>
                            Top Scorers
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>

            {/* Content */}
            <ScrollView style={styles.content}>
                {activeTab === 'fixtures' && (
                    <View style={styles.section}>
                        {fixtures
                            .filter(f => {
                                const status = f.event_status?.toLowerCase();
                                const isFinished = status === 'finished' || f.event_status === 'FT' || f.event_status === 'AET' || f.event_status === 'AP';
                                if (isFinished) return false;

                                // Filter for next 90 days
                                const eventDate = new Date(`${f.event_date} ${f.event_time || '00:00'}`);
                                const now = new Date();
                                now.setHours(0, 0, 0, 0); // Start of today
                                const dayDiff = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

                                return dayDiff >= 0 && dayDiff <= 90;
                            })
                            .sort((a, b) => new Date(`${a.event_date} ${a.event_time || '00:00'}`).getTime() - new Date(`${b.event_date} ${b.event_time || '00:00'}`).getTime())
                            .map((event, index) => (
                                <FootballMatchCard key={`fixture-${event.event_key || index}`} event={event} />
                            ))}
                        {fixtures.filter(f => {
                            const status = f.event_status?.toLowerCase();
                            return status !== 'finished' && f.event_status !== 'FT' && f.event_status !== 'AET' && f.event_status !== 'AP';
                        }).length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No upcoming matches available</Text>
                                </View>
                            )}
                    </View>
                )}
                {activeTab === 'results' && (
                    <View style={styles.section}>
                        {fixtures
                            .filter(f => {
                                const status = f.event_status?.toLowerCase();
                                return status === 'finished' || f.event_status === 'FT' || f.event_status === 'AET' || f.event_status === 'AP';
                            })
                            .sort((a, b) => new Date(`${b.event_date} ${b.event_time || '00:00'}`).getTime() - new Date(`${a.event_date} ${a.event_time || '00:00'}`).getTime())
                            .map((event, index) => (
                                <FootballMatchCard key={`result-${event.event_key || index}`} event={event} />
                            ))}
                        {fixtures.filter(f => {
                            const status = f.event_status?.toLowerCase();
                            return status === 'finished' || f.event_status === 'FT' || f.event_status === 'AET' || f.event_status === 'AP';
                        }).length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No recent results available</Text>
                                </View>
                            )}
                    </View>
                )}
                {activeTab === 'standings' && (
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
                {activeTab === 'topscorers' && (
                    <View style={styles.section}>
                        {topscorers.length > 0 ? (
                            renderTopscorers()
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No top scorers available</Text>
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
        padding: SPACING.md,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.secondary,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leagueLogo: {
        width: 40,
        height: 40,
        marginRight: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    headerText: {
        flex: 1,
    },
    leagueName: {
        fontSize: FONT_SIZES.lg,
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
        minWidth: 100,
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
    teamColContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: SPACING.sm,
    },
    teamColText: {
        flex: 1,
        textAlign: 'left',
    },
    standingsTeamLogo: {
        width: 18,
        height: 18,
        marginRight: SPACING.xs,
    },
    topscorersContainer: {
        gap: SPACING.md,
    },
    topscorerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: SPACING.sm,
    },
    topscorerRank: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    topscorerRankText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '800',
        color: COLORS.background,
    },
    topscorerInfo: {
        flex: 1,
    },
    topscorerName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
        marginBottom: 2,
    },
    topscorerTeamContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topscorerTeamLogo: {
        width: 14,
        height: 14,
        marginRight: SPACING.xs,
    },
    topscorerTeam: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
    topscorerStats: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    topscorerStat: {
        alignItems: 'center',
    },
    topscorerStatValue: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    topscorerStatLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
    },
    standingsGroup: {
        marginBottom: SPACING.lg,
    },
    groupTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: SPACING.sm,
        paddingLeft: SPACING.xs,
    },
});
