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
        padding: SPACING.sm,
        marginBottom: SPACING.xs,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    liveContainer: {
        borderColor: COLORS.yellow,
        borderWidth: 1.5,
        backgroundColor: 'rgba(255, 215, 0, 0.08)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    leagueInfo: {
        flex: 1,
    },
    leagueName: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textLight,
        textTransform: 'uppercase',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.yellow,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    liveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.text,
        marginRight: 3,
    },
    liveText: {
        fontSize: 9,
        fontWeight: '700',
        color: COLORS.text,
    },
    matchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    teamContainer: {
        flex: 1,
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
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    teamLogoPlaceholder: {
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamLogoText: {
        color: COLORS.backgroundDark,
        fontSize: 11,
        fontWeight: 'bold',
    },
    teamName: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.background,
    },
    scoreText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.background,
        marginTop: 1,
    },
    overs: {
        fontSize: 10,
        fontWeight: '400',
        color: COLORS.textLight,
    },
    statusContainer: {
        alignItems: 'center',
        width: 70,
    },
    timeContainer: {
        alignItems: 'center',
    },
    time: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.background,
    },
    date: {
        fontSize: 9,
        color: COLORS.textLight,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    venueText: {
        fontSize: 9,
        color: COLORS.textLight,
        marginTop: 4,
        textAlign: 'center',
    },
});
