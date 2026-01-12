import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CricketEvent } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

interface CricketMatchCardProps {
    match: CricketEvent;
    onPress?: () => void;
}

export function CricketMatchCard({ match, onPress }: CricketMatchCardProps) {
    const router = useRouter();
    const isLive = match.event_status === 'Live';
    const isUpcoming = match.event_status === 'Upcoming' || !match.event_status; // or check date

    const handleMatchPress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/home/cricket/matches/${match.event_key}`);
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
                        {match.league_name} • {match.league_season}
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
                        // Navigate to team? API has home_team_key
                        if (match.home_team_key) router.push(`/home/cricket/teams/${match.home_team_key}`);
                    }}
                >
                    {match.event_home_team_logo ? (
                        <Image source={{ uri: match.event_home_team_logo }} style={styles.teamLogo} />
                    ) : (
                        <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
                            <Text style={styles.teamLogoText}>{match.event_home_team.charAt(0)}</Text>
                        </View>
                    )}
                    <View style={styles.teamInfo}>
                        <Text style={styles.teamName} numberOfLines={1}>
                            {match.event_home_team}
                        </Text>
                        {!isUpcoming && match.event_home_final_result && (
                            <Text style={styles.scoreText}>
                                {match.event_home_final_result}
                            </Text>
                        )}
                    </View>
                </Pressable>

                {/* Status/Time */}
                <View style={styles.statusContainer}>
                    {isUpcoming ? (
                        <View style={styles.timeContainer}>
                            <Text style={styles.time}>{match.event_time}</Text>
                            <Text style={styles.date}>{match.event_date_start}</Text>
                        </View>
                    ) : (
                        <Text style={styles.statusText}>{match.event_status}</Text>
                    )}
                </View>

                {/* Away Team */}
                <Pressable
                    style={[styles.teamContainer, styles.teamAway]}
                    onPress={(e) => {
                        e.stopPropagation();
                        if (match.away_team_key) router.push(`/home/cricket/teams/${match.away_team_key}`);
                    }}
                >
                    <View style={[styles.teamInfo, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>
                            {match.event_away_team}
                        </Text>
                        {!isUpcoming && match.event_away_final_result && (
                            <Text style={styles.scoreText}>
                                {match.event_away_final_result}
                            </Text>
                        )}
                    </View>
                    {match.event_away_team_logo ? (
                        <Image source={{ uri: match.event_away_team_logo }} style={styles.teamLogo} />
                    ) : (
                        <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
                            <Text style={styles.teamLogoText}>{match.event_away_team.charAt(0)}</Text>
                        </View>
                    )}
                </Pressable>
            </View>

            <Text style={styles.venueText} numberOfLines={1}>{match.event_stadium}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({

    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: 8, // Reduced from SPACING.sm (12)
        marginBottom: 6, // Reduced from SPACING.xs (8)
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    liveContainer: {
        borderColor: 'rgba(245, 158, 11, 0.3)', // amber-500/30
        borderWidth: 1.5,
        backgroundColor: 'rgba(245, 158, 11, 0.05)', // amber-500/5
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    leagueInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    leagueName: {
        fontSize: 9, // Reduced from 10
        fontWeight: '700',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)', // amber-500/20
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    liveDot: {
        width: 6, // Increased to 6 to match web relative size
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.yellow,
        marginRight: 4,
    },
    liveText: {
        fontSize: 8, // Reduced from 9
        fontWeight: '900',
        color: COLORS.yellow,
        letterSpacing: 1,
    },
    matchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    teamContainer: {
        flex: 1.2, // Increased flex ratio
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
        width: 20, // Reduced from 24
        height: 20,
        borderRadius: 4, // Rounded square
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        resizeMode: 'contain',
    },
    teamLogoPlaceholder: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    teamLogoText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '900',
    },
    teamName: {
        fontSize: 10, // Reduced
        fontWeight: '900', // Black
        color: COLORS.background,
        textTransform: 'uppercase',
    },
    scoreText: {
        fontSize: 14, // Slightly larger for emphasis
        fontWeight: '900',
        color: COLORS.background,
        marginTop: 0,
        fontVariant: ['tabular-nums'],
    },
    overs: {
        fontSize: 9,
        fontWeight: '700',
        color: COLORS.textLight,
    },
    statusContainer: {
        alignItems: 'center',
        width: 70, // Fixed width
        paddingHorizontal: 4,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginHorizontal: 4,
    },
    timeContainer: {
        alignItems: 'center',
    },
    time: {
        fontSize: 11,
        fontWeight: '900',
        color: COLORS.background,
        fontVariant: ['tabular-nums'],
    },
    date: {
        fontSize: 8,
        fontWeight: '700',
        color: COLORS.textLight,
        textTransform: 'uppercase',
    },
    statusText: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    venueText: {
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.4)', // Muted 
        marginTop: 6,
        textAlign: 'center',
        fontWeight: '500',
    },
});
