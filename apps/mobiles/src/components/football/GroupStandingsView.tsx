import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { StandingTable, StandingEntry } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { buildTeamSlug } from '../../lib/slugUtils';
import { useRouter } from 'expo-router';

interface GroupStandingsViewProps {
  groups: StandingTable[];
  leagueId?: string | number;
}

export function GroupStandingsView({ groups, leagueId }: GroupStandingsViewProps) {
  const router = useRouter();
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);

  if (!groups || groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 32 }}>🏆</Text>
        <Text style={styles.emptyTitle}>Group Standings</Text>
        <Text style={styles.emptySubtitle}>
          Tournament group standings will appear once matchday 1 is scheduled.
        </Text>
      </View>
    );
  }

  const activeGroup = groups[selectedGroupIdx] || groups[0];

  return (
    <View style={styles.container}>
      {/* ── Group Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {groups.map((group, idx) => {
          const isActive = selectedGroupIdx === idx;
          return (
            <Pressable
              key={group.id || idx}
              style={[styles.groupTab, isActive && styles.groupTabActive]}
              onPress={() => setSelectedGroupIdx(idx)}
            >
              <Text style={[styles.groupTabText, isActive && styles.groupTabTextActive]}>
                {group.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Qualification Legend ── */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Top 2 Advance</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Best 3rd Place</Text>
        </View>
      </View>

      {/* ── Active Group Table ── */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.thPos]}>#</Text>
          <Text style={[styles.thText, styles.thTeam]}>Team</Text>
          <Text style={[styles.thText, styles.thNum]}>P</Text>
          <Text style={[styles.thText, styles.thNum]}>GD</Text>
          <Text style={[styles.thText, styles.thPts]}>PTS</Text>
        </View>

        {activeGroup.entries.map((entry: StandingEntry, idx: number) => {
          const rank = entry.position || idx + 1;
          const isTop2 = rank <= 2;
          const is3rd = rank === 3;
          return (
            <Pressable
              key={entry.teamId || idx}
              style={({ pressed }) => [
                styles.tableRow,
                isTop2 && styles.tableRowTop2,
                is3rd && styles.tableRow3rd,
                pressed && { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
              ]}
              onPress={() => {
                if (entry.teamId) {
                  const slug = buildTeamSlug(entry.teamName, entry.teamId);
                  router.push(`/home/football/teams/${slug}` as any);
                }
              }}
            >
              <Text style={[styles.tdPos, isTop2 && { color: '#34D399' }]}>{rank}</Text>
              <Text style={styles.tdTeam} numberOfLines={1}>
                {entry.teamName}
              </Text>
              <Text style={styles.tdNum}>{entry.played}</Text>
              <Text
                style={[
                  styles.tdNum,
                  entry.goalDifference > 0
                    ? { color: '#34D399', fontWeight: '700' }
                    : entry.goalDifference < 0
                    ? { color: '#F87171' }
                    : {},
                ]}
              >
                {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
              </Text>
              <View style={styles.ptsPill}>
                <Text style={styles.ptsText}>{entry.points}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  emptyContainer: {
    backgroundColor: 'rgba(11, 21, 38, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.xs,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  groupTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  groupTabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6',
  },
  groupTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  groupTabTextActive: {
    color: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tableCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: 'rgba(10, 22, 43, 0.6)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
  },
  thText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  thPos: {
    width: 24,
    textAlign: 'center',
  },
  thTeam: {
    flex: 1,
    paddingLeft: 6,
  },
  thNum: {
    width: 32,
    textAlign: 'center',
  },
  thPts: {
    width: 40,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tableRowTop2: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  tableRow3rd: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  tdPos: {
    width: 24,
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textAlign: 'center',
  },
  tdTeam: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingLeft: 6,
  },
  tdNum: {
    width: 32,
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  ptsPill: {
    width: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.xs,
    paddingVertical: 2,
    alignItems: 'center',
    marginLeft: 4,
  },
  ptsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FBBF24',
  },
});
