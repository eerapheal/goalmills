import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import {
    FootballEvent,
    FootballGoalScorer,
    FootballCard,
    FootballStatistic,
    FootballLineups,
    FootballOdds,
    FootballComment,
    FootballH2HResponse,
    FootballProbability,
} from '@goalmills/types';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';

export default function FootballMatchDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<FootballEvent | null>(null);
    const [odds, setOdds] = useState<FootballOdds | null>(null);
    const [comments, setComments] = useState<FootballComment[]>([]);
    const [h2h, setH2h] = useState<FootballH2HResponse['result'] | null>(null);
    const [probabilities, setProbabilities] = useState<FootballProbability | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'lineups' | 'odds' | 'commentary' | 'h2h' | 'probabilities'>('overview');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadMatchData();
    }, [id]);

    const loadMatchData = async () => {
        try {
            if (!refreshing) setLoading(true);
            const today = new Date();
            const past = new Date(today);
            past.setDate(past.getDate() - 30);
            const future = new Date(today);
            future.setDate(future.getDate() + 30);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            console.log('🔄 Mobile: Loading match details for', id);

            const [fixturesRes, oddsRes, commentsRes, probabilitiesRes] = await Promise.all([
                advancedFootballApi.getFixtures({
                    from: formatDate(past),
                    to: formatDate(future),
                    matchId: Number(id),
                }),
                advancedFootballApi.getOdds({ matchId: Number(id) }),
                advancedFootballApi.getComments({ matchId: Number(id) }),
                advancedFootballApi.getProbabilities({ matchId: Number(id) }),
            ]);

            if (fixturesRes.result && fixturesRes.result.length > 0) {
                const foundEvent = fixturesRes.result[0];
                setEvent(foundEvent);

                // Fetch H2H using team IDs from found event
                if (foundEvent.home_team_key && foundEvent.away_team_key) {
                    const h2hRes = await advancedFootballApi.getH2H(
                        Number(foundEvent.home_team_key),
                        Number(foundEvent.away_team_key)
                    ).catch(() => null);
                    if (h2hRes) setH2h(h2hRes.result);
                }
            }

            if (oddsRes.result && oddsRes.result[id]) {
                setOdds(oddsRes.result[id][0]);
            }

            if (commentsRes.result && commentsRes.result[id]) {
                setComments(commentsRes.result[id]);
            }

            if (probabilitiesRes.result && probabilitiesRes.result.length > 0) {
                setProbabilities(probabilitiesRes.result[0]);
            }
        } catch (error) {
            console.error('Error loading match data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading match details...</Text>
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Match not found</Text>
            </View>
        );
    }

    const isLive = event.event_live === '1';
    const isFinished = event.event_status === 'Finished';

    const renderOverview = () => (
        <View style={styles.section}>
            {/* Match Events - Goals */}
            {event.goalscorers && event.goalscorers.length > 0 && (
                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>⚽ Goals</Text>
                    {event.goalscorers.map((goal, index) => (
                        <View key={index} style={styles.eventRow}>
                            <Text style={styles.eventTime}>{goal.time}</Text>
                            <View style={styles.eventContent}>
                                {goal.home_scorer && (
                                    <Text style={styles.eventText}>⚽ {goal.home_scorer}</Text>
                                )}
                                {goal.away_scorer && (
                                    <Text style={[styles.eventText, styles.awayEvent]}>
                                        {goal.away_scorer} ⚽
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.eventScore}>{goal.score}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Match Events - Cards */}
            {event.cards && event.cards.length > 0 && (
                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>🟨 Cards</Text>
                    {event.cards.map((card, index) => (
                        <View key={index} style={styles.eventRow}>
                            <Text style={styles.eventTime}>{card.time}</Text>
                            <View style={styles.eventContent}>
                                {card.home_fault && (
                                    <Text style={styles.eventText}>
                                        {card.card === 'red card' ? '🟥' : '🟨'} {card.home_fault}
                                    </Text>
                                )}
                                {card.away_fault && (
                                    <Text style={[styles.eventText, styles.awayEvent]}>
                                        {card.away_fault} {card.card === 'red card' ? '🟥' : '🟨'}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Match Info */}
            <View style={styles.matchInfoSection}>
                <Text style={styles.sectionTitle}>ℹ️ Match Information</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Competition:</Text>
                    <Text style={styles.infoValue}>{event.league_name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Round:</Text>
                    <Text style={styles.infoValue}>{event.league_round}</Text>
                </View>
                {event.event_stadium && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Stadium:</Text>
                        <Text style={styles.infoValue}>{event.event_stadium}</Text>
                    </View>
                )}
                {event.event_referee && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Referee:</Text>
                        <Text style={styles.infoValue}>{event.event_referee}</Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>
                        {event.event_date} {event.event_time}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderStats = () => {
        if (!event.statistics || event.statistics.length === 0) {
            return (
                <View style={styles.section}>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No statistics available</Text>
                    </View>
                </View>
            );
        }

        const priorityOrder = ['Shots On Target', 'Shots Off Target', 'Shots Total'];
        const excludedTypes = ['Shot On Goal', 'Shot Off Goal'];

        const filteredAndSortedStats = [...event.statistics]
            .filter(stat => !excludedTypes.includes(stat.type))
            .sort((a, b) => {
                const indexA = priorityOrder.indexOf(a.type);
                const indexB = priorityOrder.indexOf(b.type);

                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return 0;
            });

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Match Statistics</Text>
                {filteredAndSortedStats.map((stat, index) => (
                    <View key={index} style={styles.statRow}>
                        <Text style={styles.statValue}>{stat.home}</Text>
                        <Text style={styles.statType}>{stat.type}</Text>
                        <Text style={styles.statValue}>{stat.away}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderLineups = () => (
        <View style={styles.section}>
            {event.lineups ? (
                <>
                    <Text style={styles.sectionTitle}>👥 Formations</Text>
                    <View style={styles.formationsRow}>
                        <View style={styles.formationBox}>
                            <Text style={styles.formationLabel}>Home</Text>
                            <Text style={styles.formationValue}>{event.event_home_formation}</Text>
                        </View>
                        <View style={styles.formationBox}>
                            <Text style={styles.formationLabel}>Away</Text>
                            <Text style={styles.formationValue}>{event.event_away_formation}</Text>
                        </View>
                    </View>

                    {[
                        { team: event.lineups.home_team, name: event.event_home_team, formation: event.event_home_formation },
                        { team: event.lineups.away_team, name: event.event_away_team, formation: event.event_away_formation }
                    ].map((teamData, teamIdx) => (
                        <View key={`team-lineup-${teamIdx}`} style={styles.teamLineupSection}>
                            <View style={styles.teamLineupHeader}>
                                <Text style={styles.teamLineupName}>{teamData.name}</Text>
                                <Text style={styles.teamLineupFormationBadge}>{teamData.formation}</Text>
                            </View>

                            <View style={styles.lineupSubsection}>
                                <Text style={styles.lineupSubsectionTitle}>Starting XI</Text>
                                {teamData.team.starting_lineups.map((player) => (
                                    <View key={player.player_key || player.player} style={styles.playerRow}>
                                        <Text style={styles.playerNumber}>{player.player_number}</Text>
                                        <Text style={styles.playerName}>{player.player}</Text>
                                        <Text style={styles.playerPositionIcon}>{player.player_position}</Text>
                                    </View>
                                ))}
                            </View>

                            {teamData.team.substitutes.length > 0 && (
                                <View style={styles.lineupSubsection}>
                                    <Text style={styles.lineupSubsectionTitle}>Substitutes</Text>
                                    {teamData.team.substitutes.map((player) => (
                                        <View key={player.player_key || player.player} style={[styles.playerRow, styles.substituteRow]}>
                                            <Text style={styles.playerNumber}>{player.player_number}</Text>
                                            <Text style={styles.playerName}>{player.player}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {teamData.team.coaches && teamData.team.coaches.length > 0 && (
                                <View style={styles.coachSection}>
                                    <Text style={styles.coachLabel}>Coach:</Text>
                                    <Text style={styles.coachName}>{teamData.team.coaches[0].coache}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Lineups not available yet</Text>
                </View>
            )}
        </View>
    );

    const renderOdds = () => (
        <View style={styles.section}>
            {odds ? (
                <>
                    <Text style={styles.sectionTitle}>💰 Betting Odds</Text>
                    <Text style={styles.bookmakerName}>{odds.odd_bookmakers}</Text>
                    <View style={styles.oddsGrid}>
                        {odds.odd_1 && (
                            <View style={styles.oddBox}>
                                <Text style={styles.oddLabel}>Home Win</Text>
                                <Text style={styles.oddValue}>{odds.odd_1}</Text>
                            </View>
                        )}
                        {odds.odd_x && (
                            <View style={styles.oddBox}>
                                <Text style={styles.oddLabel}>Draw</Text>
                                <Text style={styles.oddValue}>{odds.odd_x}</Text>
                            </View>
                        )}
                        {odds.odd_2 && (
                            <View style={styles.oddBox}>
                                <Text style={styles.oddLabel}>Away Win</Text>
                                <Text style={styles.oddValue}>{odds.odd_2}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.oddsGrid}>
                        {odds['o+2.5'] && (
                            <View style={styles.oddBox}>
                                <Text style={styles.oddLabel}>Over 2.5</Text>
                                <Text style={styles.oddValue}>{odds['o+2.5']}</Text>
                            </View>
                        )}
                        {odds['u+2.5'] && (
                            <View style={styles.oddBox}>
                                <Text style={styles.oddLabel}>Under 2.5</Text>
                                <Text style={styles.oddValue}>{odds['u+2.5']}</Text>
                            </View>
                        )}
                        {odds.bts_yes && (
                            <View style={styles.oddBox}>
                                <Text style={styles.oddLabel}>BTTS Yes</Text>
                                <Text style={styles.oddValue}>{odds.bts_yes}</Text>
                            </View>
                        )}
                    </View>
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Odds not available</Text>
                </View>
            )}
        </View>
    );

    const renderCommentary = () => (
        <View style={styles.section}>
            {comments.length > 0 ? (
                <>
                    <Text style={styles.sectionTitle}>💬 Live Commentary</Text>
                    {comments.map((comment, index) => (
                        <View key={index} style={styles.commentRow}>
                            <Text style={styles.commentTime}>{comment.comments_time}</Text>
                            <View style={styles.commentContent}>
                                <Text style={styles.commentText}>{comment.comments_text}</Text>
                                {comment.comments_state_info && (
                                    <Text style={styles.commentState}>{comment.comments_state_info}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No commentary available</Text>
                </View>
            )}
        </View>
    );

    const renderH2H = () => (
        <View style={styles.section}>
            {h2h ? (
                <>
                    <Text style={styles.sectionTitle}>🤝 Head to Head</Text>
                    {h2h.H2H.map((match: FootballEvent, index: number) => (
                        <View key={index} style={styles.h2hRow}>
                            <Text style={styles.h2hDate}>{match.event_date}</Text>
                            <View style={styles.h2hTeams}>
                                <Text style={styles.h2hTeamName}>{match.event_home_team}</Text>
                                <Text style={styles.h2hScore}>{match.event_final_result}</Text>
                                <Text style={styles.h2hTeamName}>{match.event_away_team}</Text>
                            </View>
                        </View>
                    ))}
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No H2H data available</Text>
                </View>
            )}
        </View>
    );

    const renderProbabilities = () => (
        <View style={styles.section}>
            {probabilities ? (
                <>
                    <Text style={styles.sectionTitle}>🎯 Match Probabilities</Text>
                    <View style={styles.probContainer}>
                        <View style={styles.probRow}>
                            <Text style={styles.probLabel}>Home Win</Text>
                            <View style={styles.probBarContainer}>
                                <View style={[styles.probBar, { width: `${probabilities.event_HW}%` as any, backgroundColor: COLORS.primary }]} />
                            </View>
                            <Text style={styles.probValue}>{probabilities.event_HW}%</Text>
                        </View>
                        <View style={styles.probRow}>
                            <Text style={styles.probLabel}>Draw</Text>
                            <View style={styles.probBarContainer}>
                                <View style={[styles.probBar, { width: `${probabilities.event_D}%` as any, backgroundColor: COLORS.secondary }]} />
                            </View>
                            <Text style={styles.probValue}>{probabilities.event_D}%</Text>
                        </View>
                        <View style={styles.probRow}>
                            <Text style={styles.probLabel}>Away Win</Text>
                            <View style={styles.probBarContainer}>
                                <View style={[styles.probBar, { width: `${probabilities.event_AW}%` as any, backgroundColor: COLORS.danger }]} />
                            </View>
                            <Text style={styles.probValue}>{probabilities.event_AW}%</Text>
                        </View>
                    </View>
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No probabilities available</Text>
                </View>
            )}
        </View>
    );

    const tabs = [
        { id: 'overview' as const, label: 'Overview' },
        { id: 'stats' as const, label: 'Stats' },
        { id: 'lineups' as const, label: 'Lineups' },
        { id: 'commentary' as const, label: 'Commentary' },
        { id: 'h2h' as const, label: 'H2H' },
        { id: 'probabilities' as const, label: 'Predictions' },
        { id: 'odds' as const, label: 'Odds' },
    ];

    return (
        <View style={styles.container}>
            {/* Match Header */}
            <View style={styles.header}>
                {/* Navigation Row with League Info */}
                <View style={styles.headerNavRow}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.background} />
                    </Pressable>
                    <View style={styles.leagueInfo}>
                        {event.league_logo && (
                            <Image source={{ uri: event.league_logo }} style={styles.leagueLogo} />
                        )}
                        <Text style={styles.leagueName}>{event.league_name}</Text>
                    </View>
                </View>

                <View style={styles.matchHeader}>
                    {/* Home Team */}
                    <View style={styles.teamHeader}>
                        {event.home_team_logo && (
                            <Image source={{ uri: event.home_team_logo }} style={styles.teamLogo} />
                        )}
                        <Text style={styles.teamName}>{event.event_home_team}</Text>
                    </View>

                    {/* Score */}
                    <View style={styles.scoreHeader}>
                        {isLive && (
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        )}
                        <Text style={[styles.score, isLive && styles.liveScore]}>
                            {isFinished || isLive
                                ? event.event_final_result || event.event_ft_result || '0 - 0'
                                : 'vs'}
                        </Text>
                        {event.event_halftime_result && (isLive || isFinished) && (
                            <Text style={styles.halftimeScore}>HT: {event.event_halftime_result}</Text>
                        )}
                        <Text style={styles.statusText}>
                            {isLive
                                ? !isNaN(Number(event.event_status))
                                    ? `${event.event_status}'`
                                    : 'LIVE'
                                : isFinished
                                    ? 'Full Time'
                                    : `${event.event_date} ${event.event_time}`}
                        </Text>
                    </View>

                    {/* Away Team */}
                    <View style={styles.teamHeader}>
                        {event.away_team_logo && (
                            <Image source={{ uri: event.away_team_logo }} style={styles.teamLogo} />
                        )}
                        <Text style={styles.teamName}>{event.event_away_team}</Text>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabsContainer}
                contentContainerStyle={styles.tabsContent}
            >
                {tabs.map((tab) => (
                    <Pressable
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'stats' && renderStats()}
                {activeTab === 'lineups' && renderLineups()}
                {activeTab === 'odds' && renderOdds()}
                {activeTab === 'commentary' && renderCommentary()}
                {activeTab === 'h2h' && renderH2H()}
                {activeTab === 'probabilities' && renderProbabilities()}
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
    headerNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    leagueInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    leagueLogo: {
        width: 24,
        height: 24,
        marginRight: SPACING.sm,
    },
    leagueName: {
        fontSize: FONT_SIZES.md,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    matchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamHeader: {
        flex: 1,
        alignItems: 'center',
        gap: SPACING.sm,
    },
    teamLogo: {
        width: 40,
        height: 40,
    },
    teamName: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '700',
        textAlign: 'center',
    },
    scoreHeader: {
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.danger,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: SPACING.xs,
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.background,
    },
    liveText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.background,
        fontWeight: '700',
    },
    score: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.background,
    },
    liveScore: {
        color: COLORS.danger,
    },
    halftimeScore: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginTop: SPACING.xs,
    },
    statusText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginTop: SPACING.xs,
    },
    tabsContainer: {
        flexGrow: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabsContent: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    tab: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: SPACING.sm,
    },
    activeTab: {
        backgroundColor: COLORS.secondary,
    },
    tabText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    activeTabText: {
        color: COLORS.background,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.md,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.md,
    },
    eventsSection: {
        marginBottom: SPACING.lg,
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
    },
    eventTime: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.secondary,
        width: 50,
    },
    eventContent: {
        flex: 1,
    },
    eventText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '600',
    },
    awayEvent: {
        textAlign: 'right',
    },
    eventScore: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        width: 50,
        textAlign: 'right',
    },
    matchInfoSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    infoLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '700',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
    },
    statValue: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.secondary,
        width: 60,
        textAlign: 'center',
    },
    statType: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '600',
        textAlign: 'center',
    },

    formationsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    formationBox: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
    },
    formationLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        marginBottom: SPACING.xs,
    },
    formationValue: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.secondary,
    },

    oddsGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    oddBox: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    oddLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        marginBottom: SPACING.xs,
    },
    oddValue: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    bookmakerName: {
        fontSize: FONT_SIZES.md,
        color: COLORS.background,
        fontWeight: '700',
        marginBottom: SPACING.md,
    },
    commentRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
    },
    commentTime: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.secondary,
        width: 50,
    },
    commentContent: {
        flex: 1,
    },
    commentText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    commentState: {
        fontSize: FONT_SIZES.xs,
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
    h2hRow: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
    },
    h2hDate: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        marginBottom: SPACING.xs,
    },
    h2hTeams: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    h2hTeamName: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '600',
    },
    h2hScore: {
        fontSize: FONT_SIZES.md,
        fontWeight: '800',
        color: COLORS.secondary,
        paddingHorizontal: SPACING.md,
    },
    probContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
    },
    probRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    probLabel: {
        width: 80,
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '600',
    },
    probBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        marginHorizontal: SPACING.md,
        overflow: 'hidden',
    },
    probBar: {
        height: '100%',
        borderRadius: 4,
    },
    probValue: {
        width: 40,
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.secondary,
        textAlign: 'right',
    },
    teamLineupSection: {
        marginTop: SPACING.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    teamLineupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    teamLineupName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '800',
        color: COLORS.background,
    },

    teamLineupFormationBadge: {
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
        color: COLORS.secondary,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },

    lineupSubsection: {
        marginBottom: SPACING.md,
    },
    lineupSubsectionTitle: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '800',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        gap: SPACING.sm,
    },
    substituteRow: {
        opacity: 0.7,
    },
    playerNumber: {
        width: 24,
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.secondary,
        textAlign: 'center',
        fontFamily: 'monospace',
    },
    playerName: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '600',
    },
    playerPositionIcon: {
        fontSize: 10,
        color: COLORS.textLight,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.xs,
        overflow: 'hidden',
    },
    coachSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        marginTop: SPACING.xs,
    },
    coachLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginRight: 6,
    },
    coachName: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '700',
    },
});
