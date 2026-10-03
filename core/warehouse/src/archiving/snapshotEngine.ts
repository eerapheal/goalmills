import type { HistoricalMatchArchive, StandingsSnapshot } from '../domain/types';
import { buildPartitionKey } from '../partitioning/partitionKey';

export interface CreateArchiveMatchInput {
  sport: HistoricalMatchArchive['sport'];
  matchId: string;
  season: string;
  competitionId: string;
  competitionName: string;
  homeTeam: HistoricalMatchArchive['homeTeam'];
  awayTeam: HistoricalMatchArchive['awayTeam'];
  playedAt: Date | string;
  statsSummary?: Record<string, number | string>;
}

/**
 * Creates an immutable HistoricalMatchArchive with partition key and outcome determination.
 */
export function createHistoricalMatchArchive(input: CreateArchiveMatchInput): HistoricalMatchArchive {
  const homeScore = input.homeTeam.score;
  const awayScore = input.awayTeam.score;

  let outcome: HistoricalMatchArchive['outcome'] = 'draw';
  if (homeScore > awayScore) {
    outcome = 'home_win';
  } else if (awayScore > homeScore) {
    outcome = 'away_win';
  }

  const playedAt = typeof input.playedAt === 'string' ? new Date(input.playedAt) : input.playedAt;
  const partitionKey = buildPartitionKey(input.sport, input.season, input.competitionId);

  return {
    archiveId: `arc_${input.sport}_${input.matchId}`,
    sport: input.sport,
    matchId: input.matchId,
    season: input.season,
    competitionId: input.competitionId,
    competitionName: input.competitionName,
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    outcome,
    playedAt,
    archivedAt: new Date(),
    statsSummary: input.statsSummary,
    partitionKey,
  };
}

/**
 * Creates an immutable StandingsSnapshot for historical points progression.
 */
export function createStandingsSnapshot(
  input: Omit<StandingsSnapshot, 'snapshotId' | 'capturedAt' | 'partitionKey'>
): StandingsSnapshot {
  const capturedAt = new Date();
  const partitionKey = buildPartitionKey(input.sport, input.season, input.competitionId);

  return {
    ...input,
    snapshotId: `snap_${input.sport}_${input.competitionId}_${capturedAt.toISOString().slice(0, 10)}`,
    capturedAt,
    partitionKey,
  };
}
