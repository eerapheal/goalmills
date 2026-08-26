import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketEvent, CricketH2HResponse, CricketMatchOdds } from '@goalmills/types';
import { advancedCricketApi } from '../../../../../services/advancedCricketApi';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'scorecard' | 'commentary' | 'squads' | 'h2h' | 'odds' | 'info';

export default function CricketMatchDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('scorecard');
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<CricketEvent | null>(null);
    const [h2h, setH2h] = useState<CricketH2HResponse['result'] | null>(null);
    const [odds, setOdds] = useState<CricketMatchOdds | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const from = advancedCricketApi.getFormattedDate(-30);
                const to = advancedCricketApi.getFormattedDate(30);

                const response = await advancedCricketApi.getFixtures({
                    matchId: Number(id),
                    from,
                    to,
                });

                let foundMatch = response.result && response.result.length > 0 ? response.result[0] : null;

                if (!foundMatch) {
                    const liveResponse = await advancedCricketApi.getLivescore({ matchId: Number(id) });
                    if (liveResponse.result && liveResponse.result.length > 0) {
                        foundMatch = liveResponse.result[0];
                    }
                }

                setMatch(foundMatch);

                if (foundMatch) {
                    const [h2hRes, oddsRes] = await Promise.all([
                        advancedCricketApi.getH2H({
                            firstTeamId: Number(foundMatch.home_team_key),
                            secondTeamId: Number(foundMatch.away_team_key),
                        }).catch(() => null),
                        advancedCricketApi.getOdds({ matchId: Number(id) }).catch(() => null),
                    ]);
                    if (h2hRes?.result) setH2h(h2hRes.result);
                    if (oddsRes?.result?.[id]) setOdds(oddsRes.result[id]);
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
                <Text style={styles.loadingText}>Syncing Match Intelligence...</Text>
            </View>
        );
    }

    if (!match) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={COLORS.secondary} />
                <Text style={styles.errorText}>Match Matrix Unavailable</Text>
                <Text style={styles.errorSubtext}>The match data could not be retrieved from the worldwide feed.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Return to Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isLive = match.event_live === '1' || match.event_status === 'In Progress' || match.event_status === 'Live';
    const isUpcoming = match.event_status === 'Not Started';

    const renderScorecard = () => {
        if (!match.scorecard || Object.keys(match.scorecard).length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="stats-chart-outline" size={48} color="rgba(255,255,255,0.1)" />
                    <Text style={styles.emptyText}>Scorecard is being initialized...</Text>
                </View>
            );
        }

        return (
            <View style={{ gap: 12 }}>
                {Object.entries(match.scorecard).map(([innings, players]) => {
                    if (!Array.isArray(players)) return null;

                    const batters = players.filter(p => p.type === 'Batsman' || (p.R !== undefined && p.O === null));
                    const bowlers = players.filter(p => p.type === 'Bowler' || p.O !== null);

                    return (
                        <View key={innings} style={styles.card}>
                            <Text style={styles.sectionTitle}>{innings.replace('_', ' ').toUpperCase()}</Text>

                            {/* Batting Section */}
                            {batters.length > 0 && (
                                <>
                                    <Text style={styles.subSectionTitle}>Batting Matrix</Text>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeadText, { flex: 3 }]}>Batter</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>R</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>B</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>4s</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>6s</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>SR</Text>
                                    </View>
                                    {batters.map((batter, idx) => (
                                        <TouchableOpacity
                                            key={`${batter.player}-${idx}`}
                                            style={styles.tableRow}
                                            onPress={() => router.push(`/home/cricket/players/${(batter as any).player_id || (batter as any).player_key || encodeURIComponent(batter.player)}`)}
                                        >
                                            <View style={{ flex: 3 }}>
                                                <Text style={[styles.playerName, { color: '#fff' }]}>{batter.player}</Text>
                                                <Text style={styles.dismissal}>{batter.status}</Text>
                                            </View>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{batter.R}</Text>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter.B}</Text>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter['4s']}</Text>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter['6s']}</Text>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{batter.SR}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}

                            {batters.length > 0 && bowlers.length > 0 && <View style={styles.divider} />}

                            {/* Bowling Section */}
                            {bowlers.length > 0 && (
                                <>
                                    <Text style={styles.subSectionTitle}>Bowling Matrix</Text>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeadText, { flex: 3 }]}>Bowler</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>O</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>M</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>R</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>W</Text>
                                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>ER</Text>
                                    </View>
                                    {bowlers.map((bowler, idx) => (
                                        <TouchableOpacity
                                            key={`bowler-${bowler.player}-${idx}`}
                                            style={styles.tableRow}
                                            onPress={() => router.push(`/home/cricket/players/${(bowler as any).player_id || (bowler as any).player_key || encodeURIComponent(bowler.player)}`)}
                                        >
                                            <View style={{ flex: 3 }}>
                                                <Text style={[styles.playerName, { color: '#fff' }]}>{bowler.player}</Text>
                                            </View>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{bowler.O}</Text>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{bowler.M || '0'}</Text>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{bowler.R}</Text>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right', fontWeight: 'bold', color: COLORS.secondary }]}>{bowler.W}</Text>
                                            <Text style={[styles.tableText, { flex: 1, textAlign: 'right' }]}>{bowler.ER}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderCommentary = () => {
        if (!match.comments || Object.keys(match.comments).length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="chatbubbles-outline" size={48} color="rgba(255,255,255,0.1)" />
                    <Text style={styles.emptyText}>Live ball-by-ball commentary will initiate shortly.</Text>
                </View>
            );
        }

        return (
            <View style={{ gap: 10 }}>
                {Object.entries(match.comments).map(([innings, comments]) => (
                    <View key={innings} style={styles.card}>
                        <Text style={styles.sectionTitle}>{innings.toUpperCase()} COMMENTARY</Text>
                        {comments.map((c, i) => (
                            <View key={i} style={styles.commentRow}>
                                <View style={styles.overBadge}>
                                    <Text style={styles.overText}>{c.overs || c.balls}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.commentPost}>{c.post}</Text>
                                    {c.runs !== '0' && (
                                        <Text style={[styles.commentRuns, parseInt(c.runs) >= 4 && styles.boundaryRuns]}>
                                            {c.runs} Runs Scored
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    const renderSquads = () => {
        if (!match.lineups) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.1)" />
                    <Text style={styles.emptyText}>Playing XI announcements pending toss.</Text>
                </View>
            );
        }

        return (
            <View style={{ gap: 12 }}>
                <View style={styles.card}>
                    <TouchableOpacity onPress={() => match.home_team_key && router.push(`/home/cricket/teams/${match.home_team_key}`)}>
                        <Text style={[styles.sectionTitle, { color: '#fff' }]}>{match.event_home_team} Playing XI →</Text>
                    </TouchableOpacity>
                    {match.lineups.home_team.starting_lineups.map((p, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.lineupRow}
                            onPress={() => router.push(`/home/cricket/players/${(p as any).player_id || (p as any).player_key || encodeURIComponent(p.player)}`)}
                        >
                            <Text style={styles.lineupNumber}>{i + 1}</Text>
                            <Text style={styles.lineupName}>{p.player}</Text>
                            <Text style={styles.lineupRole}>{p.player_country || 'Squad'}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.card}>
                    <TouchableOpacity onPress={() => match.away_team_key && router.push(`/home/cricket/teams/${match.away_team_key}`)}>
                        <Text style={[styles.sectionTitle, { color: '#fff' }]}>{match.event_away_team} Playing XI →</Text>
                    </TouchableOpacity>
                    {match.lineups.away_team.starting_lineups.map((p, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.lineupRow}
                            onPress={() => router.push(`/home/cricket/players/${(p as any).player_id || (p as any).player_key || encodeURIComponent(p.player)}`)}
                        >
                            <Text style={styles.lineupNumber}>{i + 1}</Text>
                            <Text style={styles.lineupName}>{p.player}</Text>
                            <Text style={styles.lineupRole}>{p.player_country || 'Squad'}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };


    const renderH2H = () => {
        if (!h2h || !h2h.H2H || h2h.H2H.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="git-compare-outline" size={48} color="rgba(255,255,255,0.1)" />
                    <Text style={styles.emptyText}>Comparative head-to-head records processing.</Text>
                </View>
            );
        }

        return (
            <View style={{ gap: 10 }}>
                {h2h.H2H.map((item, idx) => (
                    <View key={idx} style={styles.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={styles.h2hLeague}>{item.league_name}</Text>
                            <Text style={styles.h2hDate}>{item.event_date_start}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={styles.h2hTeam}>{item.event_home_team}</Text>
                                <Text style={styles.h2hTeam}>{item.event_away_team}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.h2hScore}>{item.event_home_final_result || '-'}</Text>
                                <Text style={styles.h2hScore}>{item.event_away_final_result || '-'}</Text>
                            </View>
                        </View>
                        {item.event_status_info && (
                            <Text style={styles.h2hInfo}>{item.event_status_info}</Text>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    const renderOdds = () => {
        return (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>📈 Win Projections & Match Markets</Text>
                <View style={styles.probabilityBarContainer}>
                    <View style={[styles.probHome, { flex: 58 }]}>
                        <Text style={styles.probText}>{match.event_home_team} 58%</Text>
                    </View>
                    <View style={[styles.probAway, { flex: 42 }]}>
                        <Text style={styles.probText}>{match.event_away_team} 42%</Text>
                    </View>
                </View>

                <View style={{ marginTop: 16 }}>
                    <Text style={styles.subSectionTitle}>Betfair Match Odds</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <View style={styles.oddsBox}>
                            <Text style={styles.oddsLabel}>{match.event_home_team}</Text>
                            <Text style={styles.oddsVal}>1.78</Text>
                        </View>
                        <View style={styles.oddsBox}>
                            <Text style={styles.oddsLabel}>{match.event_away_team}</Text>
                            <Text style={styles.oddsVal}>2.10</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderInfo = () => (
        <View style={styles.card}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Match</Text>
                <Text style={styles.infoValue}>{match.league_round || 'Group Stage'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Series</Text>
                <Text style={styles.infoValue}>{match.league_name} {match.league_season}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{match.event_date_start}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{match.event_time}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{match.event_stadium || 'Global Stadium'}</Text>
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

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: `${match.event_home_team} vs ${match.event_away_team}`,
                    headerStyle: { backgroundColor: '#0a0e27' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Scoreboard Hero Header */}
                <View style={styles.heroCard}>
                    <View style={styles.heroTopRow}>
                        <View style={styles.formatTag}>
                            <Text style={styles.formatTagText}>{match.event_type || 'ODI'} • {match.league_season}</Text>
                        </View>
                        {isLive && (
                            <View style={styles.liveTag}>
                                <View style={styles.livePulseDot} />
                                <Text style={styles.liveTagText}>LIVE</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.teamsRow}>
                        {/* Home Team */}
                        <View style={styles.teamHero}>
                            <View style={styles.teamHeroLogo}>
                                {match.event_home_team_logo ? (
                                    <Image source={{ uri: match.event_home_team_logo }} style={styles.heroLogoImg} />
                                ) : (
                                    <Text style={styles.heroLogoText}>{match.event_home_team.charAt(0)}</Text>
                                )}
                            </View>
                            <Text style={styles.teamHeroName} numberOfLines={1}>{match.event_home_team}</Text>
                            {!isUpcoming && (
                                <Text style={styles.teamHeroScore}>{match.event_home_final_result || '0'}</Text>
                            )}
                        </View>

                        {/* VS Center */}
                        <View style={styles.vsCenter}>
                            <Text style={styles.vsText}>VS</Text>
                            <Text style={styles.timeText}>{match.event_time}</Text>
                        </View>

                        {/* Away Team */}
                        <View style={styles.teamHero}>
                            <View style={styles.teamHeroLogo}>
                                {match.event_away_team_logo ? (
                                    <Image source={{ uri: match.event_away_team_logo }} style={styles.heroLogoImg} />
                                ) : (
                                    <Text style={styles.heroLogoText}>{match.event_away_team.charAt(0)}</Text>
                                )}
                            </View>
                            <Text style={styles.teamHeroName} numberOfLines={1}>{match.event_away_team}</Text>
                            {!isUpcoming && (
                                <Text style={styles.teamHeroScore}>{match.event_away_final_result || '0'}</Text>
                            )}
                        </View>
                    </View>

                    {match.event_status_info && (
                        <View style={styles.equationBar}>
                            <Text style={styles.equationText}>{match.event_status_info}</Text>
                        </View>
                    )}
                </View>

                {/* Tabs Bar */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
                    {[
                        { id: 'scorecard', label: 'Scorecard' },
                        { id: 'commentary', label: 'Commentary' },
                        { id: 'squads', label: 'Playing XI' },
                        { id: 'h2h', label: 'H2H' },
                        { id: 'odds', label: 'Odds' },
                        { id: 'info', label: 'Info' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
                            onPress={() => setActiveTab(tab.id as Tab)}
                        >
                            <Text style={[styles.tabBtnText, activeTab === tab.id && styles.tabBtnTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Tab Views */}
                {activeTab === 'scorecard' && renderScorecard()}
                {activeTab === 'commentary' && renderCommentary()}
                {activeTab === 'squads' && renderSquads()}
                {activeTab === 'h2h' && renderH2H()}
                {activeTab === 'odds' && renderOdds()}
                {activeTab === 'info' && renderInfo()}
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
        fontSize: 11,
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
    errorText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '900',
        color: '#fff',
        marginTop: SPACING.md,
        textTransform: 'uppercase',
    },
    errorSubtext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: FONT_SIZES.sm,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: SPACING.lg,
    },
    backButton: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.secondary,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    content: {
        padding: SPACING.md,
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        marginBottom: 16,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    formatTag: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    formatTagText: {
        color: '#60a5fa',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    liveTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    livePulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fbbf24',
    },
    liveTagText: {
        color: '#fbbf24',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    teamsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamHero: {
        flex: 1,
        alignItems: 'center',
    },
    teamHeroLogo: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    heroLogoImg: {
        width: 44,
        height: 44,
        resizeMode: 'contain',
    },
    heroLogoText: {
        color: '#60a5fa',
        fontSize: 24,
        fontWeight: '900',
    },
    teamHeroName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    teamHeroScore: {
        color: '#fbbf24',
        fontSize: 18,
        fontWeight: '900',
        marginTop: 4,
    },
    vsCenter: {
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    vsText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 24,
        fontWeight: '900',
    },
    timeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '800',
        marginTop: 2,
    },
    equationBar: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
    },
    equationText: {
        color: '#fbbf24',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    tabsContainer: {
        marginBottom: 16,
    },
    tabsContent: {
        gap: 6,
    },
    tabBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    tabBtnActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    tabBtnText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    tabBtnTextActive: {
        color: '#fff',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    sectionTitle: {
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    subSectionTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    tableHeadText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    playerName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    dismissal: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        marginTop: 1,
    },
    tableText: {
        color: '#fff',
        fontSize: 11,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginVertical: 12,
    },
    commentRow: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    overBadge: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    overText: {
        color: '#fbbf24',
        fontSize: 10,
        fontWeight: '900',
    },
    commentPost: {
        color: '#fff',
        fontSize: 12,
        lineHeight: 18,
    },
    commentRuns: {
        color: '#60a5fa',
        fontSize: 10,
        fontWeight: '800',
        marginTop: 4,
    },
    boundaryRuns: {
        color: '#fbbf24',
    },
    lineupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    lineupNumber: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '900',
        width: 24,
    },
    lineupName: {
        flex: 1,
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    lineupRole: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700',
    },
    h2hLeague: {
        color: '#60a5fa',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    h2hDate: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
    },
    h2hTeam: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        lineHeight: 18,
    },
    h2hScore: {
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: '900',
        lineHeight: 18,
    },
    h2hInfo: {
        color: '#34d399',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.04)',
    },
    probabilityBarContainer: {
        flexDirection: 'row',
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
    },
    probHome: {
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    probAway: {
        backgroundColor: '#d97706',
        alignItems: 'center',
        justifyContent: 'center',
    },
    probText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    oddsBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
    },
    oddsLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    oddsVal: {
        color: '#fbbf24',
        fontSize: 14,
        fontWeight: '900',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    infoLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '700',
    },
    infoValue: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },
});
