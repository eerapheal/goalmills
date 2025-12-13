import { View, Text, StyleSheet, Image } from 'react-native';
import { Standing } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

interface StandingsTableProps {
    standings: Standing[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
    const getFormColor = (result: string) => {
        switch (result) {
            case 'W':
                return COLORS.success;
            case 'D':
                return COLORS.warning;
            case 'L':
                return COLORS.danger;
            default:
                return COLORS.textLight;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
                <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
                <Text style={[styles.headerCell, styles.statCell]}>P</Text>
                <Text style={[styles.headerCell, styles.statCell]}>W</Text>
                <Text style={[styles.headerCell, styles.statCell]}>D</Text>
                <Text style={[styles.headerCell, styles.statCell]}>L</Text>
                <Text style={[styles.headerCell, styles.statCell]}>GD</Text>
                <Text style={[styles.headerCell, styles.pointsCell]}>Pts</Text>
            </View>

            {/* Rows */}
            {standings.map((standing, index) => (
                <View
                    key={standing.team.id}
                    style={[
                        styles.row,
                        index === standings.length - 1 && styles.lastRow,
                        standing.rank <= 4 && styles.championsLeagueRow,
                        standing.rank === 5 && styles.europaLeagueRow,
                    ]}
                >
                    {/* Rank */}
                    <View style={styles.rankCell}>
                        <Text style={styles.rank}>{standing.rank}</Text>
                    </View>

                    {/* Team */}
                    <View style={styles.teamCell}>
                        <Image source={{ uri: standing.team.logo }} style={styles.teamLogo} />
                        <Text style={styles.teamName} numberOfLines={1}>
                            {standing.team.name}
                        </Text>
                    </View>

                    {/* Stats */}
                    <Text style={[styles.statCell, styles.statText]}>{standing.all.played}</Text>
                    <Text style={[styles.statCell, styles.statText]}>{standing.all.win}</Text>
                    <Text style={[styles.statCell, styles.statText]}>{standing.all.draw}</Text>
                    <Text style={[styles.statCell, styles.statText]}>{standing.all.lose}</Text>
                    <Text
                        style={[
                            styles.statCell,
                            styles.statText,
                            standing.goalsDiff > 0 && styles.positiveGD,
                            standing.goalsDiff < 0 && styles.negativeGD,
                        ]}
                    >
                        {standing.goalsDiff > 0 ? '+' : ''}
                        {standing.goalsDiff}
                    </Text>
                    <Text style={[styles.pointsCell, styles.points]}>{standing.points}</Text>
                </View>
            ))}

            {/* Form Legend */}
            <View style={styles.legend}>
                <Text style={styles.legendTitle}>Recent Form:</Text>
                <View style={styles.legendItems}>
                    <View style={styles.legendItem}>
                        <View style={[styles.formDot, { backgroundColor: COLORS.success }]} />
                        <Text style={styles.legendText}>Win</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.formDot, { backgroundColor: COLORS.warning }]} />
                        <Text style={styles.legendText}>Draw</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.formDot, { backgroundColor: COLORS.danger }]} />
                        <Text style={styles.legendText}>Loss</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 31, 63, 0.8)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xs,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    headerCell: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.background,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    championsLeagueRow: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.secondary,
    },
    europaLeagueRow: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.warning,
    },
    rankCell: {
        width: 30,
        alignItems: 'center',
    },
    rank: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.background,
    },
    teamCell: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.xs,
    },
    teamLogo: {
        width: 24,
        height: 24,
        marginRight: SPACING.xs,
    },
    teamName: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.background,
        flex: 1,
    },
    statCell: {
        width: 32,
        textAlign: 'center',
    },
    statText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
    pointsCell: {
        width: 40,
        textAlign: 'center',
    },
    points: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.background,
    },
    positiveGD: {
        color: COLORS.success,
    },
    negativeGD: {
        color: COLORS.danger,
    },
    legend: {
        padding: SPACING.md,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    legendTitle: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.background,
        marginBottom: SPACING.xs,
    },
    legendItems: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    formDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    legendText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
    },
});
