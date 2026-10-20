import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Standing } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { buildTeamSlug } from '../lib/slugUtils';

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
      {standings.map((standing, index) => {
        const isLeader = standing.rank === 1;
        const isUCL = standing.rank >= 1 && standing.rank <= 4;
        const isUEL = standing.rank === 5;
        const isUECL = standing.rank === 6;
        const isRel = standings.length > 10 ? standing.rank >= standings.length - 2 : standing.rank >= 18;

        return (
          <View
            key={standing.team.id}
            style={[
              styles.row,
              index % 2 === 0 && styles.evenRow,
              index === standings.length - 1 && styles.lastRow,
              isUCL && styles.championsLeagueRow,
              isUEL && styles.europaLeagueRow,
              isUECL && styles.conferenceLeagueRow,
              isRel && styles.relegationRow,
            ]}
          >
            {/* Rank Badge */}
            <View
              style={[
                styles.rankBadge,
                isLeader && styles.leaderBadge,
                !isLeader && isUCL && styles.uclBadge,
                isUEL && styles.uelBadge,
                isUECL && styles.ueclBadge,
                isRel && styles.relBadge,
              ]}
            >
              <Text
                style={[
                  styles.rank,
                  isLeader && styles.leaderRank,
                  !isLeader && isUCL && styles.champRank,
                  isUEL && styles.europaRank,
                  isUECL && styles.ueclRank,
                  isRel && styles.relRank,
                ]}
              >
                {standing.rank}
              </Text>
            </View>

            {/* Team */}
            <Pressable
              style={styles.teamCell}
              onPress={() => {
                const target = buildTeamSlug(standing.team.name, standing.team.id);
                router.push(`/home/football/teams/${target}`);
              }}
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
              {standing.form
                ?.split('')
                .slice(-5)
                .map((result, i) => (
                  <View
                    key={i}
                    style={[styles.matchDot, { backgroundColor: getFormColor(result) }]}
                  />
                ))}
            </View>

            {/* Points Pill */}
            <View style={styles.pointsPill}>
              <Text style={styles.points}>{standing.points}</Text>
            </View>
          </View>
        );
      })}

      {/* Zone Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>1-4: UCL</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>5: UEL</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>6: UECL</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Relegation</Text>
          </View>
        </View>
        <View style={styles.formLegend}>
          <Text style={styles.legendTitle}>Form: </Text>
          <View style={[styles.formDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendText}>W </Text>
          <View style={[styles.formDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>D </Text>
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
  conferenceLeagueRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  relegationRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    backgroundColor: 'transparent',
  },
  leaderBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  uclBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  uelBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  ueclBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  relBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  rank: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#64748B',
  },
  leaderRank: {
    color: '#FBBF24',
    fontWeight: '900',
  },
  champRank: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  europaRank: {
    color: '#FBBF24',
    fontWeight: '800',
  },
  ueclRank: {
    color: '#34D399',
    fontWeight: '800',
  },
  relRank: {
    color: '#F87171',
    fontWeight: '800',
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
  pointsPill: {
    minWidth: 32,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  points: {
    fontSize: FONT_SIZES.xs,
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
    gap: 6,
  },
  legendTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBar: {
    width: 10,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: FONT_SIZES.xs,
    color: '#94A3B8',
    fontWeight: '600',
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
  rankCell: {
    width: 22,
    textAlign: 'center',
    alignItems: 'center',
  },
  pointsCell: {
    width: 32,
    textAlign: 'center',
  },
});
