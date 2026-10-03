import type { SportType } from '@goalmills/types';

export interface HistoricalMatchArchive {
  archiveId: string;
  sport: SportType;
  matchId: string;
  season: string; // e.g. '2025/2026'
  competitionId: string;
  competitionName: string;
  homeTeam: {
    id: string;
    name: string;
    score: number;
  };
  awayTeam: {
    id: string;
    name: string;
    score: number;
  };
  outcome: 'home_win' | 'away_win' | 'draw' | 'cancelled';
  playedAt: Date;
  archivedAt: Date;
  statsSummary?: Record<string, number | string>;
  partitionKey: string; // e.g. 'football:2025:premier-league'
}

export interface StandingsSnapshot {
  snapshotId: string;
  sport: SportType;
  competitionId: string;
  season: string;
  roundOrWeek?: number;
  capturedAt: Date;
  table: Array<{
    rank: number;
    teamId: string;
    teamName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;
    goalDifference: number;
  }>;
  partitionKey: string;
}

export interface WarehouseRetentionPolicy {
  sport: SportType;
  liveDataRetentionDays: number;
  archiveSnapshotFrequency: 'hourly' | 'daily' | 'weekly' | 'season_end';
  coldStorageAfterMonths: number;
}
