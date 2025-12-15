import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { FootballEvent } from '@goalmills/types';

interface FootballMatchCardProps {
    event: FootballEvent;
}

export function FootballMatchCard({ event }: FootballMatchCardProps) {
    const router = useRouter();

    const isLive = event.event_live === '1';
    const isFinished = event.event_status === 'Finished';
    const isUpcoming = event.event_status === 'Not Started';

    // Mock odds for live and upcoming matches - use useMemo to prevent regeneration
    const mockOdds = useMemo(() => ({
        home: (1.5 + Math.random() * 2).toFixed(2),
        draw: (2.8 + Math.random() * 1.5).toFixed(2),
        away: (1.8 + Math.random() * 2.5).toFixed(2),
    }), [event.event_key]);

    const getStatusDisplay = () => {
        if (isLive) {
            if (!isNaN(Number(event.event_status))) {
                return `${event.event_status}'`;
            }
            return 'LIVE';
        }
        if (isFinished) return 'FT';
        if (isUpcoming) return event.event_time;
        return event.event_status;
    };

    const getScoreDisplay = () => {
        if (isFinished) {
            return event.event_final_result || event.event_ft_result;
        }
        if (isLive) {
            const homeGoals = event.goalscorers?.filter(g => g.home_scorer).length || 0;
            const awayGoals = event.goalscorers?.filter(g => g.away_scorer).length || 0;
            return `${homeGoals} - ${awayGoals}`;
        }
        return 'vs';
    };

    const statusColor = isLive ? COLORS.danger : isFinished ? COLORS.textLight : COLORS.secondary;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
                isLive && styles.liveContainer,
            ]}
            onPress={() => router.push(`/home/football/matches/${event.event_key}` as any)}
        >
            {/* League Info - Compact */}
            <View style={styles.leagueInfo}>
                {event.league_logo && (
                    <Image source={{ uri: event.league_logo }} style={styles.leagueLogo} />
                )}
                <Pressable
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/home/football/leagues/${event.league_key}` as any);
                    }}
                >
                    <Text style={styles.leagueName} numberOfLines={1}>
                        {event.league_name}
                    </Text>
                </Pressable>
                {isLive && (
                    <View style={styles.liveIndicatorSmall}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveTextSmall}>LIVE</Text>
                    </View>
                )}
            </View>

            {/* Match Info - Compact */}
            <View style={styles.matchInfo}>
                {/* Home Team */}
                <Pressable
                    style={styles.team}
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/home/football/teams/${event.home_team_key}` as any);
                    }}
                >
                    {event.home_team_logo && (
                        <Image source={{ uri: event.home_team_logo }} style={styles.teamLogo} />
                    )}
                    <Text style={styles.teamName} numberOfLines={1}>
                        {event.event_home_team}
                    </Text>
                </Pressable>

                {/* Score/Status */}
                <View style={styles.scoreContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{getStatusDisplay()}</Text>
                    </View>
                    <Text style={[styles.score, isLive && styles.liveScore]}>
                        {getScoreDisplay()}
                    </Text>
                </View>

                {/* Away Team */}
                <Pressable
                    style={styles.team}
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/home/football/teams/${event.away_team_key}` as any);
                    }}
                >
                    {event.away_team_logo && (
                        <Image source={{ uri: event.away_team_logo }} style={styles.teamLogo} />
                    )}
                    <Text style={styles.teamName} numberOfLines={1}>
                        {event.event_away_team}
                    </Text>
                </Pressable>
            </View>

            {/* Odds - Only for Live and Upcoming */}
            {(isLive || isUpcoming) && (
                <View style={styles.oddsContainer}>
                    <View style={styles.oddBox}>
                        <Text style={styles.oddLabel}>1</Text>
                        <Text style={styles.oddValue}>{mockOdds.home}</Text>
                    </View>
                    <View style={styles.oddBox}>
                        <Text style={styles.oddLabel}>X</Text>
                        <Text style={styles.oddValue}>{mockOdds.draw}</Text>
                    </View>
                    <View style={styles.oddBox}>
                        <Text style={styles.oddLabel}>2</Text>
                        <Text style={styles.oddValue}>{mockOdds.away}</Text>
                    </View>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    liveContainer: {
        borderColor: COLORS.danger,
        borderWidth: 1.5,
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    leagueInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
        paddingBottom: SPACING.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    leagueLogo: {
        width: 16,
        height: 16,
        marginRight: SPACING.xs,
        borderRadius: BORDER_RADIUS.xs,
    },
    leagueName: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.secondary,
        fontWeight: '600',
        flex: 1,
    },
    liveIndicatorSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.danger,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
    },
    liveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.background,
    },
    liveTextSmall: {
        fontSize: 9,
        color: COLORS.background,
        fontWeight: '700',
    },
    matchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    team: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    teamLogo: {
        width: 28,
        height: 28,
    },
    teamName: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: '600',
        flex: 1,
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.sm,
        gap: 4,
        minWidth: 60,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
        minWidth: 40,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 9,
        color: COLORS.background,
        fontWeight: '700',
    },
    score: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.background,
    },
    liveScore: {
        color: COLORS.danger,
    },
    oddsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        gap: SPACING.xs,
    },
    oddBox: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.sm,
        padding: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    oddLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        fontWeight: '600',
        marginBottom: 2,
    },
    oddValue: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.secondary,
        fontWeight: '700',
    },
});
