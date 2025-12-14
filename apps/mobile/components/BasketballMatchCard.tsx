import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BasketballEvent } from '@goalmills/types';
import { router } from 'expo-router';

interface BasketballMatchCardProps {
    match: BasketballEvent;
}

export const BasketballMatchCard: React.FC<BasketballMatchCardProps> = ({ match }) => {
    const isLive = match.event_live === '1';
    const isFinished = match.event_status === 'Finished';
    const isUpcoming = !isLive && !isFinished;

    const handlePress = () => {
        router.push(`/home/basketball/matches/${match.event_key}`);
    };

    const handleTeamPress = (teamKey: string, e: any) => {
        e.stopPropagation();
        router.push(`/home/basketball/teams/${teamKey}`);
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            {/* League Info */}
            <View style={styles.header}>
                <Text style={styles.leagueName}>{match.league_name}</Text>
                {isLive && (
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
                {isFinished && (
                    <Text style={styles.finishedText}>FT</Text>
                )}
            </View>

            {/* Match Info */}
            <View style={styles.matchContainer}>
                {/* Home Team */}
                <TouchableOpacity
                    style={styles.teamContainer}
                    onPress={(e) => handleTeamPress(match.home_team_key, e)}
                >
                    <View style={styles.teamRow}>
                        {match.event_home_team_logo ? (
                            <Image source={{ uri: match.event_home_team_logo }} style={styles.teamLogo} />
                        ) : (
                            <View style={styles.teamLogoPlaceholder} />
                        )}
                        <Text style={styles.teamName} numberOfLines={1}>{match.event_home_team}</Text>
                    </View>
                </TouchableOpacity>

                {/* Score or Time */}
                <View style={styles.scoreContainer}>
                    {isUpcoming ? (
                        <Text style={styles.timeText}>{match.event_time}</Text>
                    ) : (
                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreText}>{match.event_final_result}</Text>
                            {isLive && match.event_quarter && (
                                <Text style={styles.quarterText}>{match.event_quarter}</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Away Team */}
                <TouchableOpacity
                    style={styles.teamContainer}
                    onPress={(e) => handleTeamPress(match.away_team_key, e)}
                >
                    <View style={styles.teamRow}>
                        {match.event_away_team_logo ? (
                            <Image source={{ uri: match.event_away_team_logo }} style={styles.teamLogo} />
                        ) : (
                            <View style={styles.teamLogoPlaceholder} />
                        )}
                        <Text style={styles.teamName} numberOfLines={1}>{match.event_away_team}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Quarter Scores for Finished/Live matches */}
            {(isLive || isFinished) && match.scores && (
                <View style={styles.quartersContainer}>
                    <View style={styles.quarterRow}>
                        <Text style={styles.quarterLabel}>Q1</Text>
                        <Text style={styles.quarterLabel}>Q2</Text>
                        <Text style={styles.quarterLabel}>Q3</Text>
                        <Text style={styles.quarterLabel}>Q4</Text>
                        {match.scores.Overtime && <Text style={styles.quarterLabel}>OT</Text>}
                    </View>
                    <View style={styles.quarterRow}>
                        <Text style={styles.quarterScore}>
                            {match.scores['1stQuarter']?.[0]?.score_home || '-'}
                        </Text>
                        <Text style={styles.quarterScore}>
                            {match.scores['2ndQuarter']?.[0]?.score_home || '-'}
                        </Text>
                        <Text style={styles.quarterScore}>
                            {match.scores['3rdQuarter']?.[0]?.score_home || '-'}
                        </Text>
                        <Text style={styles.quarterScore}>
                            {match.scores['4thQuarter']?.[0]?.score_home || '-'}
                        </Text>
                        {match.scores.Overtime && (
                            <Text style={styles.quarterScore}>
                                {match.scores.Overtime[0]?.score_home || '-'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.quarterRow}>
                        <Text style={styles.quarterScore}>
                            {match.scores['1stQuarter']?.[0]?.score_away || '-'}
                        </Text>
                        <Text style={styles.quarterScore}>
                            {match.scores['2ndQuarter']?.[0]?.score_away || '-'}
                        </Text>
                        <Text style={styles.quarterScore}>
                            {match.scores['3rdQuarter']?.[0]?.score_away || '-'}
                        </Text>
                        <Text style={styles.quarterScore}>
                            {match.scores['4thQuarter']?.[0]?.score_away || '-'}
                        </Text>
                        {match.scores.Overtime && (
                            <Text style={styles.quarterScore}>
                                {match.scores.Overtime[0]?.score_away || '-'}
                            </Text>
                        )}
                    </View>
                </View>
            )}

            {/* Date for upcoming matches */}
            {isUpcoming && (
                <View style={styles.footer}>
                    <Text style={styles.dateText}>{new Date(match.event_date).toLocaleDateString()}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1a1f3a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a3150',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    leagueName: {
        color: '#8b92b0',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dc2626',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
        marginRight: 4,
    },
    liveText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    finishedText: {
        color: '#8b92b0',
        fontSize: 12,
        fontWeight: '600',
    },
    matchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamContainer: {
        flex: 1,
    },
    teamRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    teamLogoPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2a3150',
        marginRight: 8,
    },
    teamName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    scoreBox: {
        alignItems: 'center',
    },
    scoreText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    quarterText: {
        color: '#f59e0b',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    timeText: {
        color: '#8b92b0',
        fontSize: 14,
        fontWeight: '600',
    },
    quartersContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#2a3150',
    },
    quarterRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 4,
    },
    quarterLabel: {
        color: '#8b92b0',
        fontSize: 11,
        fontWeight: '600',
        width: 40,
        textAlign: 'center',
    },
    quarterScore: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        width: 40,
        textAlign: 'center',
    },
    footer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#2a3150',
    },
    dateText: {
        color: '#8b92b0',
        fontSize: 12,
        textAlign: 'center',
    },
});
