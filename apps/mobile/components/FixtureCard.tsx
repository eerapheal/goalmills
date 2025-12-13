import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Fixture } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, formatDate, formatTime } from '@goalmills/ui';

interface FixtureCardProps {
    fixture: Fixture;
    onPress?: () => void;
}

export function FixtureCard({ fixture, onPress }: FixtureCardProps) {
    const { fixture: fixtureData, league, teams, goals, score } = fixture;
    const isLive = ['1H', '2H', 'HT'].includes(fixtureData.status.short);
    const isFinished = fixtureData.status.short === 'FT';
    const isUpcoming = fixtureData.status.short === 'NS';

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
                isLive && styles.liveContainer,
            ]}
            onPress={onPress}
        >
            {/* League Header */}
            <View style={styles.header}>
                <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
                <View style={styles.headerText}>
                    <Text style={styles.leagueName} numberOfLines={1}>
                        {league.name}
                    </Text>
                    {league.round && (
                        <Text style={styles.round} numberOfLines={1}>
                            {league.round}
                        </Text>
                    )}
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
                <View style={styles.teamContainer}>
                    <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
                    <Text style={styles.teamName} numberOfLines={1}>
                        {teams.home.name}
                    </Text>
                </View>

                {/* Score/Time */}
                <View style={styles.scoreContainer}>
                    {isUpcoming ? (
                        <View style={styles.timeContainer}>
                            <Text style={styles.time}>{formatTime(fixtureData.date)}</Text>
                            <Text style={styles.date}>{formatDate(fixtureData.date)}</Text>
                        </View>
                    ) : (
                        <View style={styles.scoreBox}>
                            <View style={styles.scoreRow}>
                                <Text style={[styles.score, teams.home.winner && styles.winnerScore]}>
                                    {goals.home ?? 0}
                                </Text>
                                <Text style={styles.scoreSeparator}>-</Text>
                                <Text style={[styles.score, teams.away.winner && styles.winnerScore]}>
                                    {goals.away ?? 0}
                                </Text>
                            </View>
                            <Text style={styles.status}>
                                {isLive ? `${fixtureData.status.elapsed}'` : fixtureData.status.short}
                            </Text>
                            {(isLive || isFinished) && score.halftime.home !== null && (
                                <Text style={styles.halftimeScore}>
                                    HT: {score.halftime.home}-{score.halftime.away}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Away Team */}
                <View style={styles.teamContainer}>
                    <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
                    <Text style={styles.teamName} numberOfLines={1}>
                        {teams.away.name}
                    </Text>
                </View>
            </View>

            {/* Venue Info */}
            {fixtureData.venue.name && (
                <View style={styles.footer}>
                    <Text style={styles.venue} numberOfLines={1}>
                        📍 {fixtureData.venue.name}
                        {fixtureData.venue.city && `, ${fixtureData.venue.city}`}
                    </Text>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    liveContainer: {
        borderColor: COLORS.danger,
        borderWidth: 2,
        backgroundColor: 'rgba(255, 65, 54, 0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    leagueLogo: {
        width: 24,
        height: 24,
        marginRight: SPACING.sm,
    },
    headerText: {
        flex: 1,
    },
    leagueName: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.background,
    },
    round: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        marginTop: 2,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.danger,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.background,
        marginRight: 4,
    },
    liveText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.background,
    },
    matchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamContainer: {
        flex: 1,
        alignItems: 'center',
    },
    teamLogo: {
        width: 48,
        height: 48,
        marginBottom: SPACING.xs,
    },
    teamName: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.background,
        textAlign: 'center',
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    timeContainer: {
        alignItems: 'center',
    },
    time: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.background,
    },
    date: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        marginTop: 2,
    },
    scoreBox: {
        alignItems: 'center',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    score: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.background,
    },
    winnerScore: {
        color: COLORS.success,
    },
    scoreSeparator: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.textLight,
        marginHorizontal: SPACING.sm,
    },
    status: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.textLight,
        marginTop: 4,
    },
    halftimeScore: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        marginTop: 2,
    },
    footer: {
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    venue: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
    },
});
