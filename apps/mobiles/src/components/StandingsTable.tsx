import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Standing } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

interface StandingsTableProps {
  standings: Standing[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  const router = useRouter();

  const getFormColor = (result: string) => {
    switch (result) {
      case 'W':
        return COLORS.success;
      case 'D':
        return '#F59E0B';
      case 'L':
        return COLORS.danger;
      default:
        return '#475569';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
        <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
        <Text style={[styles.headerCell, styles.statCell]}>P</Text>
        <Text style={[styles.headerCell, styles.statCell]}>GD</Text>
        <Text style={[styles.headerCell, styles.formCell]}>Form</Text>
        <Text style={[styles.headerCell, styles.pointsCell]}>Pts</Text>
      </View>

      {/* Rows */}
      {standings.map((standing, index) => (
        <View
          key={standing.team.id}
          style={[
            styles.row,
            index % 2 === 0 && styles.evenRow,
            index === standings.length - 1 && styles.lastRow,
            standing.rank <= 4 && styles.championsLeagueRow,
            standing.rank === 5 && styles.europaLeagueRow,
          ]}
        >
          {/* Rank */}
          <View style={[styles.rankCell, styles.rankContainer]}>
            <Text style={[styles.rank, standing.rank <= 4 && styles.champRank, standing.rank === 5 && styles.europaRank]}>
              {standing.rank}
            </Text>
          </View>

          {/* Team */}
          <Pressable
            style={styles.teamCell}
            onPress={() => router.push(`/home/teams/${standing.team.id}`)}
          >
            <Image source={{ uri: standing.team.logo }} style={styles.teamLogo} />
            <Text style={styles.teamName} numberOfLines={1}>
              {standing.team.name}
            </Text>
          </Pressable>

          {/* Stats */}
          <Text style={[styles.statCell, styles.statText]}>{standing.all.played}</Text>
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

          {/* Form */}
          <View style={styles.formCell}>
            {standing.form?.split('').slice(-5).map((result, i) => (
              <View key={i} style={[styles.matchDot, { backgroundColor: getFormColor(result) }]} />
            ))}
          </View>

          <Text style={[styles.pointsCell, styles.points]}>{standing.points}</Text>
        </View>
      ))}

      {/* Zone Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Champions League</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Europa League</Text>
          </View>
        </View>
        <View style={styles.formLegend}>
          <Text style={styles.legendTitle}>Form: </Text>
          <View style={[styles.formDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendText}>W  </Text>
          <View style={[styles.formDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>D  </Text>
          <View style={[styles.formDot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.legendText}>L</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0E1726',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#0A1220',
    paddingVertical: 10,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
  },
  headerCell: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.018)',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  championsLeagueRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  europaLeagueRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  rankCell: {
    width: 22,
    textAlign: 'center',
    alignItems: 'center',
  },
  rankContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#64748B',
  },
  champRank: {
    color: '#60A5FA',
  },
  europaRank: {
    color: '#FBBF24',
  },
  teamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  teamLogo: {
    width: 18,
    height: 18,
    marginRight: 7,
  },
  teamName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#F1F5F9',
    flex: 1,
  },
  statCell: {
    width: 26,
    textAlign: 'center',
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    color: '#94A3B8',
    fontWeight: '500',
  },
  pointsCell: {
    width: 32,
    textAlign: 'center',
  },
  points: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: '#FBBF24',
  },
  positiveGD: {
    color: '#10B981',
    fontWeight: '700',
  },
  negativeGD: {
    color: '#EF4444',
    fontWeight: '700',
  },
  legend: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
  },
  legendTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  legendItems: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendBar: {
    width: 10,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: FONT_SIZES.xs,
    color: '#64748B',
  },
  formLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  formCell: {
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  matchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
