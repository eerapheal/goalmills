import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Fixture } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, formatDate, formatTime } from '@goalmills/ui';

interface FixtureCardProps {
    fixture: Fixture;
    onPress?: () => void;
}

export function FixtureCard({ fixture, onPress }: FixtureCardProps) {
    const router = useRouter();
    const { fixture: fixtureData, league, teams, goals, score } = fixture;
    const isLive = ['1H', '2H', 'HT'].includes(fixtureData.status.short);
    const isFinished = fixtureData.status.short === 'FT';
    const isUpcoming = fixtureData.status.short === 'NS';

    const handleMatchPress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/matches/${fixtureData.id}`);
        }
    };

    const handleTeamPress = (teamId: number) => {
        router.push(`/teams/${teamId}`);
    };

    const handleLeaguePress = (leagueId: number) => {
        router.push(`/leagues/${leagueId}`);
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
            {/* League Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.leagueInfo}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleLeaguePress(league.id);
                    }}
                >
                    <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
                    <Text style={styles.leagueName} numberOfLines={1}>
                        {league.name}
                    </Text>
                </Pressable>
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
                        handleTeamPress(teams.home.id);
                    }}
                >
                    <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
                    <Text style={[styles.teamName, styles.textRight]} numberOfLines={1}>
                        {teams.home.name}
                    </Text>
                </Pressable>

                {/* Score/Time */}
                <View style={styles.scoreContainer}>
                    {isUpcoming ? (
                        <View style={styles.timeContainer}>
                            <Text style={styles.time}>{formatTime(fixtureData.date)}</Text>
                            {/* Removed date to reduce height further as requested? Or keep it? User said "reduce height". Keeping date is minimal but maybe user wants super compact. I'll keep date for now as it wasn't explicitly asked to remove, unlike venue/round. */}
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
                        </View>
                    )}
                </View>

                {/* Away Team */}
                <Pressable
                    style={[styles.teamContainer, styles.teamAway]}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleTeamPress(teams.away.id);
                    }}
                >
                    <Text style={[styles.teamName, styles.textLeft]} numberOfLines={1}>
                        {teams.away.name}
                    </Text>
                    <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
                </Pressable>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.sm, // Reduced padding
        marginBottom: SPACING.sm, // Reduced margin
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
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    leagueLogo: {
        width: 16, // Smaller header logo
        height: 16,
        marginRight: SPACING.xs,
    },
    leagueName: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.textLight, // Muted color for header
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
        paddingVertical: SPACING.xs,
    },
    teamContainer: {
        flex: 1,
        flexDirection: 'row', // Row layout
        alignItems: 'center',
        gap: 8,
    },
    teamHome: {
        justifyContent: 'flex-start',
    },
    teamAway: {
        justifyContent: 'flex-end',
    },
    teamLogo: {
        width: 28, // Reduced size
        height: 28,
    },
    teamName: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.background,
        flex: 1, // Allow text to take space and truncate
    },
    textRight: {
        textAlign: 'left', // Home team: Logo [Name ->] . Actually, standard is Logo Name. Name should align Left? No, adjacent to logo.
    },
    textLeft: {
        textAlign: 'right', // Away team: [<- Name] Logo. Name should align Right.
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70, // Fixed width to prevent jumping
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
    scoreBox: {
        alignItems: 'center',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    score: {
        fontSize: 20, // Smaller score
        fontWeight: '800',
        color: COLORS.background,
    },
    winnerScore: {
        color: COLORS.success,
    },
    scoreSeparator: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textLight,
        marginHorizontal: 4,
    },
    status: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.success, // Use success color for status/minute
        marginTop: 2,
    },
});
