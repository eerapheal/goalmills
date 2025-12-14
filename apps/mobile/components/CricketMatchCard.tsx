import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CricketMatchInfo } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, formatDate, formatTime } from '@goalmills/ui';

interface CricketMatchCardProps {
    match: CricketMatchInfo;
    onPress?: () => void;
}

export function CricketMatchCard({ match, onPress }: CricketMatchCardProps) {
    const router = useRouter();
    const { status, teamInfo, score, date, matchType } = match;
    const isLive = status === 'Live';
    const isUpcoming = status === 'Upcoming';

    // Get scores for home and away teams
    const homeScore = score?.find(s => s.teamId === teamInfo[0].id);
    const awayScore = score?.find(s => s.teamId === teamInfo[1].id);

    const handleMatchPress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/home/cricket/matches/${match.id}`);
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
                isLive && styles.liveContainer,
            ]}
            onPress={handleMatchPress}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.leagueInfo}>
                    <Text style={styles.leagueName} numberOfLines={1}>
                        {match.series} • {matchType}
                    </Text>
                </View>
                {isLive && (
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
            </View>

            {/* Match Info */}
            <View style={styles.matchContainer}>
                {/* Home Team */}
                <Pressable
                    style={[styles.teamContainer, styles.teamHome]}
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/home/cricket/teams/${teamInfo[0].id}`);
                    }}
                >
                    <Image source={{ uri: teamInfo[0].logo }} style={styles.teamLogo} />
                    <View style={styles.teamInfo}>
                        <Text style={styles.teamName} numberOfLines={1}>
                            {teamInfo[0].shortName || teamInfo[0].name}
                        </Text>
                        {!isUpcoming && homeScore && (
                            <Text style={styles.scoreText}>
                                {homeScore.runs}/{homeScore.wickets} <Text style={styles.overs}>({homeScore.overs})</Text>
                            </Text>
                        )}
                    </View>
                </Pressable>

                {/* Status/Time */}
                <View style={styles.statusContainer}>
                    {isUpcoming ? (
                        <View style={styles.timeContainer}>
                            <Text style={styles.time}>{formatTime(date)}</Text>
                            <Text style={styles.date}>{formatDate(date)}</Text>
                        </View>
                    ) : (
                        <Text style={styles.statusText}>{status}</Text>
                    )}
                </View>

                {/* Away Team */}
                <Pressable
                    style={[styles.teamContainer, styles.teamAway]}
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/home/cricket/teams/${teamInfo[1].id}`);
                    }}
                >
                    <View style={[styles.teamInfo, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>
                            {teamInfo[1].shortName || teamInfo[1].name}
                        </Text>
                        {!isUpcoming && awayScore && (
                            <Text style={styles.scoreText}>
                                {awayScore.runs}/{awayScore.wickets} <Text style={styles.overs}>({awayScore.overs})</Text>
                            </Text>
                        )}
                    </View>
                    <Image source={{ uri: teamInfo[1].logo }} style={styles.teamLogo} />
                </Pressable>
            </View>

            <Text style={styles.venueText} numberOfLines={1}>{match.venue.name}, {match.venue.city}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    liveContainer: {
        borderColor: COLORS.yellow,
        borderWidth: 2,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
        paddingBottom: SPACING.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    leagueInfo: {
        flex: 1,
    },
    leagueName: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.textLight,
        textTransform: 'uppercase',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.yellow,
        paddingHorizontal: SPACING.xs,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    liveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.text,
        marginRight: 4,
    },
    liveText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.text,
    },
    matchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    teamContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    teamHome: {
        justifyContent: 'flex-start',
    },
    teamAway: {
        justifyContent: 'flex-end',
    },
    teamInfo: {
        flex: 1,
    },
    teamLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    teamName: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.background,
    },
    scoreText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '800',
        color: COLORS.background,
        marginTop: 2,
    },
    overs: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '400',
        color: COLORS.textLight,
    },
    statusContainer: {
        alignItems: 'center',
        width: 80,
    },
    timeContainer: {
        alignItems: 'center',
    },
    time: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
    },
    date: {
        fontSize: 10,
        color: COLORS.textLight,
    },
    statusText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    venueText: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
});
