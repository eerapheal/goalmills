import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { TournamentBracket, KnockoutRound, KnockoutMatchNode } from '@goalmills/types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { useRouter } from 'expo-router';
import { buildTeamSlug, buildMatchSlug } from '../../lib/slugUtils';

interface TournamentBracketViewProps {
  bracket: TournamentBracket;
}

export function TournamentBracketView({ bracket }: TournamentBracketViewProps) {
  const router = useRouter();
  const [selectedRoundSlug, setSelectedRoundSlug] = useState<string>(
    bracket?.rounds?.[0]?.slug || ''
  );

  if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 32 }}>🏆</Text>
        <Text style={styles.emptyTitle}>Knockout Tournament Tree</Text>
        <Text style={styles.emptySubtitle}>
          Knockout bracket and fixture pairings will appear as matches are scheduled.
        </Text>
      </View>
    );
  }

  const champion = bracket.championTeam;
  const activeRound =
    bracket.rounds.find((r) => r.slug === selectedRoundSlug) || bracket.rounds[0];

  return (
    <View style={styles.container}>
      {/* ── Champion Banner ── */}
      {champion && (
        <View style={styles.championBanner}>
          <Text style={{ fontSize: 28 }}>🏆</Text>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.champSub}>TOURNAMENT CHAMPION</Text>
            <Text style={styles.champName}>{champion.teamName}</Text>
          </View>
          {bracket.runnerUpTeam && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.runnerUpSub}>RUNNER-UP</Text>
              <Text style={styles.runnerUpName}>{bracket.runnerUpTeam.teamName}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Round Selector Horizontal Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.roundTabsScroll}
      >
        {bracket.rounds.map((round: KnockoutRound) => {
          const isActive = activeRound.id === round.id;
          return (
            <Pressable
              key={round.id}
              style={[styles.roundTab, isActive && styles.roundTabActive]}
              onPress={() => setSelectedRoundSlug(round.slug)}
            >
              <Text style={[styles.roundTabText, isActive && styles.roundTabTextActive]}>
                {round.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Round Matches List ── */}
      <View style={styles.matchesList}>
        {(activeRound.matches || []).map((match: KnockoutMatchNode) => {
          const homeScore = match.homeTeam.score;
          const awayScore = match.awayTeam.score;
          const homeWins =
            match.homeTeam.isWinner ??
            (homeScore !== undefined && awayScore !== undefined && homeScore > awayScore);
          const awayWins =
            match.awayTeam.isWinner ??
            (homeScore !== undefined && awayScore !== undefined && awayScore > homeScore);
          const aggScore = match.legs?.aggregateScore
            ? `${match.legs.aggregateScore.home} - ${match.legs.aggregateScore.away}`
            : undefined;

          return (
            <Pressable
              key={match.id}
              style={({ pressed }) => [styles.matchNodeCard, pressed && { opacity: 0.85 }]}
              onPress={() => {
                if (match.id) {
                  const slug = buildMatchSlug({
                    home: match.homeTeam.teamName,
                    away: match.awayTeam.teamName,
                    event_key: match.id,
                  });
                  router.push(`/home/football/matches/${slug}` as any);
                }
              }}
            >
              <View style={styles.matchMetaRow}>
                <Text style={styles.matchStage}>Match {match.matchNumber || ''}</Text>
                {match.status && <Text style={styles.matchStatus}>{match.status}</Text>}
              </View>

              {/* Home Team Row */}
              <View style={[styles.teamRow, homeWins && styles.teamRowWinner]}>
                <Text
                  style={[styles.teamName, homeWins && styles.teamNameWinner]}
                  numberOfLines={1}
                >
                  {match.homeTeam.teamName}
                </Text>
                <Text style={[styles.scoreText, homeWins && styles.scoreWinner]}>
                  {homeScore !== undefined ? homeScore : '-'}
                </Text>
              </View>

              {/* Away Team Row */}
              <View style={[styles.teamRow, awayWins && styles.teamRowWinner]}>
                <Text
                  style={[styles.teamName, awayWins && styles.teamNameWinner]}
                  numberOfLines={1}
                >
                  {match.awayTeam.teamName}
                </Text>
                <Text style={[styles.scoreText, awayWins && styles.scoreWinner]}>
                  {awayScore !== undefined ? awayScore : '-'}
                </Text>
              </View>

              {aggScore && (
                <View style={styles.aggRow}>
                  <Text style={styles.aggText}>Agg: {aggScore}</Text>
                </View>
              )}
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
  championBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  champSub: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: 0.5,
  },
  champName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  runnerUpSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
  },
  runnerUpName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  roundTabsScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  roundTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roundTabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6',
  },
  roundTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  roundTabTextActive: {
    color: '#FFFFFF',
  },
  matchesList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  matchNodeCard: {
    backgroundColor: 'rgba(10, 22, 43, 0.6)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.sm,
    gap: 4,
  },
  matchMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  matchStage: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  matchStatus: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    textTransform: 'uppercase',
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.xs,
  },
  teamRowWinner: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    flex: 1,
  },
  teamNameWinner: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: SPACING.sm,
  },
  scoreWinner: {
    color: '#FBBF24',
    fontWeight: '900',
  },
  aggRow: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 3,
    marginTop: 2,
  },
  aggText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F59E0B',
  },
});
