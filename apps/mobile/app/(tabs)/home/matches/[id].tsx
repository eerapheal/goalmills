import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { advancedFootballApi } from '../../../../services/advancedFootballApi';
import { mapEventToFixture, mapEventToMatchEvents, mapLineupsToLineups } from '../../../../utils/footballAdapters';
import { Fixture, MatchEvent, Lineup } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { SvgUri } from 'react-native-svg';

type MatchTab = 'summary' | 'lineups' | 'stats' | 'info';

export default function MatchDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<MatchTab>('summary');
    const [loading, setLoading] = useState(true);
    const [fixture, setFixture] = useState<Fixture | null>(null);
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [lineups, setLineups] = useState<Lineup[]>([]);

    useEffect(() => {
        if (id) {
            loadMatchData();
        }
    }, [id]);

    const loadMatchData = async () => {
        try {
            const fixtureId = Number(id);
            // In advanced api, getting specific match by ID is done via getFixtures({ matchId })
            // We need to provide date range even when filtering by matchId
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(today.getFullYear() - 1);

            const response = await advancedFootballApi.getFixtures({
                from: oneYearAgo.toISOString().split('T')[0],
                to: today.toISOString().split('T')[0],
                matchId: fixtureId
            });

            if (response.success && response.result.length > 0) {
                const event = response.result[0];

                // Map the single event to all 3 data structures
                setFixture(mapEventToFixture(event));
                setEvents(mapEventToMatchEvents(event));
                setLineups(mapLineupsToLineups(event));
            } else {
                console.error('Match not found');
            }
        } catch (error) {
            console.error('Error loading match data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    if (!fixture) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Match not found</Text>
            </View>
        );
    }

    const { league, teams, goals, fixture: fixtureInfo, score } = fixture;
    const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixtureInfo.status.short);

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {(['summary', 'lineups', 'stats', 'info'] as MatchTab[]).map((tab) => (
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
    );

    const renderSummary = () => (
        <View style={styles.sectionContent}>
            <Text style={styles.sectionHeader}>Match Events</Text>
            {events.length === 0 ? (
                <Text style={styles.emptyText}>No major events yet.</Text>
            ) : (
                events.map((event, index) => {
                    const isHome = event.team.id === teams.home.id;
                    return (
                        <View key={index} style={[styles.eventRow, isHome ? styles.eventRowHome : styles.eventRowAway]}>
                            {/* Time */}
                            <View style={styles.eventTime}>
                                <Text style={styles.eventTimeText}>{event.time.elapsed}'</Text>
                            </View>

                            {/* Event Details */}
                            <View style={[styles.eventCard, isHome ? styles.eventCardHome : styles.eventCardAway]}>
                                <View style={styles.eventHeader}>
                                    <Text style={[
                                        styles.eventType,
                                        event.type === 'Goal' ? styles.textGreen :
                                            event.type === 'Card' ? styles.textYellow :
                                                styles.textBlue
                                    ]}>{event.type}</Text>
                                    <Text style={styles.eventDetail}>{event.detail}</Text>
                                </View>
                                <TouchableOpacity onPress={() => router.push(`/home/players/${event.player.id}`)}>
                                    <Text style={styles.playerName}>{event.player.name}</Text>
                                </TouchableOpacity>
                                {event.assist.name && (
                                    <Text style={styles.assistName}>Ast: {event.assist.name}</Text>
                                )}
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );

    const renderLineups = () => (
        <View style={styles.sectionContent}>
            <View style={styles.lineupsContainer}>
                {lineups.map((lineup, i) => (
                    <View key={i} style={styles.lineupColumn}>
                        <View style={styles.lineupHeader}>
                            <Text style={styles.teamNameHeader}>{lineup.team.name}</Text>
                            <Text style={styles.formation}>{lineup.formation}</Text>
                        </View>

                        <View style={styles.lineupSection}>
                            <Text style={styles.lineupTitle}>Starting XI</Text>
                            {lineup.startXI.map((player, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.playerRow}
                                    onPress={() => router.push(`/home/players/${player.player.id}`)}
                                >
                                    <Text style={styles.playerNumber}>{player.player.number}</Text>
                                    <Text style={styles.lineupPlayerName} numberOfLines={1}>{player.player.name}</Text>
                                    <Text style={styles.playerPos}>{player.player.pos}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.lineupSection}>
                            <Text style={styles.lineupTitle}>Substitutes</Text>
                            {lineup.substitutes.map((player, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.playerRow}
                                    onPress={() => router.push(`/home/players/${player.player.id}`)}
                                >
                                    <Text style={styles.playerNumber}>{player.player.number}</Text>
                                    <Text style={[styles.lineupPlayerName, styles.textMuted]} numberOfLines={1}>{player.player.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.coachRow}>
                            <Text style={styles.textMuted}>Coach: </Text>
                            <Text style={styles.coachName}>{lineup.coach.name}</Text>
                        </View>
                    </View>
                ))}
                {lineups.length === 0 && <Text style={styles.emptyText}>Lineups not available.</Text>}
            </View>
        </View>
    );

    const renderStats = () => (
        <View style={[styles.center, { padding: 40 }]}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>📊</Text>
            <Text style={styles.sectionHeader}>Detailed Statistics</Text>
            <Text style={[styles.emptyText, { textAlign: 'center' }]}>Possession, shots, and passes coming soon.</Text>
        </View>
    );

    const renderInfo = () => (
        <View style={styles.sectionContent}>
            <Text style={styles.sectionHeader}>Match Info</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{fixtureInfo.venue.name}, {fixtureInfo.venue.city}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Referee</Text>
                <Text style={styles.infoValue}>{fixtureInfo.referee || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{new Date(fixtureInfo.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>League</Text>
                <Text style={styles.infoValue}>{league.name} - {league.round}</Text>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: 'Match Details',
                headerStyle: { backgroundColor: '#001f3f' },
                headerTintColor: '#fff',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
                        <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
                    </TouchableOpacity>
                ),
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Scoreboard Header */}
                <View style={styles.header}>
                    <View style={styles.leagueTag}>
                        <Image source={{ uri: league.logo }} style={styles.leagueLogo} resizeMode="contain" />
                        <Text style={styles.leagueName}>{league.name}</Text>
                    </View>

                    <View style={styles.scoreBoard}>
                        <TouchableOpacity style={styles.teamCol} onPress={() => router.push(`/home/teams/${teams.home.id}`)}>
                            <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} resizeMode="contain" />
                            <Text style={styles.teamName}>{teams.home.name}</Text>
                        </TouchableOpacity>

                        <View style={styles.scoreCol}>
                            <View style={styles.scoreRow}>
                                <Text style={styles.scoreText}>{goals.home ?? 0}</Text>
                                <Text style={styles.scoreSeparator}>:</Text>
                                <Text style={styles.scoreText}>{goals.away ?? 0}</Text>
                            </View>
                            <View style={[styles.statusBadge, isLive && styles.statusBadgeLive]}>
                                <Text style={[styles.statusText, isLive && styles.statusTextLive]}>
                                    {isLive ? `${fixtureInfo.status.elapsed}'` : fixtureInfo.status.long}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.teamCol} onPress={() => router.push(`/home/teams/${teams.away.id}`)}>
                            <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} resizeMode="contain" />
                            <Text style={styles.teamName}>{teams.away.name}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {renderTabs()}

                {activeTab === 'summary' && renderSummary()}
                {activeTab === 'lineups' && renderLineups()}
                {activeTab === 'stats' && renderStats()}
                {activeTab === 'info' && renderInfo()}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 40 },
    errorText: { color: 'red', fontSize: 16 },

    // Header
    header: { backgroundColor: '#001f3f', padding: 20, paddingBottom: 30 },
    leagueTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 20, opacity: 0.8 },
    leagueLogo: { width: 20, height: 20, marginRight: 8 },
    leagueName: { color: 'white', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },

    scoreBoard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    teamCol: { alignItems: 'center', flex: 1 },
    teamLogo: { width: 60, height: 60, marginBottom: 8 },
    teamName: { color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },

    scoreCol: { alignItems: 'center', marginHorizontal: 10 },
    scoreRow: { flexDirection: 'row' },
    scoreText: { color: 'white', fontSize: 36, fontWeight: '900' },
    scoreSeparator: { color: 'rgba(255,255,255,0.5)', fontSize: 32, marginHorizontal: 4 },
    statusBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginTop: 8 },
    statusBadgeLive: { backgroundColor: '#FF4136' },
    statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    statusTextLive: { color: 'white' },

    // Tabs
    tabsContainer: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
    tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: COLORS.secondary },
    tabText: { color: '#666', fontWeight: '600', fontSize: 14, textTransform: 'uppercase' },
    activeTabText: { color: COLORS.secondary },

    // Content
    sectionContent: { padding: 16 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
    emptyText: { textAlign: 'center', color: '#666', marginTop: 16, fontStyle: 'italic' },

    // Events
    eventRow: { flexDirection: 'row', marginBottom: 16 },
    eventRowHome: { justifyContent: 'flex-start' },
    eventRowAway: { justifyContent: 'flex-end', flexDirection: 'row-reverse' },
    eventTime: { width: 40, alignItems: 'center', justifyContent: 'center' },
    eventTimeText: { fontSize: 12, fontWeight: 'bold', color: '#666', backgroundColor: '#e0e0e0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
    eventCard: { backgroundColor: 'white', padding: 12, borderRadius: 8, maxWidth: '80%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    eventCardHome: { marginLeft: 8 },
    eventCardAway: { marginRight: 8 },
    eventHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    eventType: { fontSize: 12, fontWeight: 'bold', marginRight: 6 },
    eventDetail: { fontSize: 12, color: '#666' },
    playerName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    assistName: { fontSize: 12, color: '#888' },
    textGreen: { color: '#2ECC40' },
    textYellow: { color: '#FFDC00' },
    textBlue: { color: '#007AFF' },

    // Lineups
    lineupsContainer: { flexDirection: 'row', gap: 16 },
    lineupColumn: { flex: 1 },
    lineupHeader: { alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    teamNameHeader: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, textAlign: 'center' },
    formation: { fontSize: 12, color: '#666', backgroundColor: '#eee', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    lineupSection: { marginBottom: 16 },
    lineupTitle: { fontSize: 12, fontWeight: 'bold', color: '#888', textTransform: 'uppercase', marginBottom: 8 },
    playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
    playerNumber: { width: 24, fontSize: 12, color: '#888', textAlign: 'center', fontWeight: 'bold' },
    lineupPlayerName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#333' },
    playerPos: { fontSize: 10, color: '#999', backgroundColor: '#f0f0f0', paddingHorizontal: 4, borderRadius: 2 },
    textMuted: { color: '#888' },
    coachRow: { flexDirection: 'row', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' },
    coachName: { fontWeight: '600', color: '#333' },

    // Info
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    infoLabel: { color: '#666' },
    infoValue: { fontWeight: '600', color: '#333', textAlign: 'right' }
});
