import type { SportType } from '@goalmills/types';

/**
 * Builds a deterministic partition key for warehouse time-series archives.
 * Format: `<sport>:<season-or-year>:<normalized-competition>`
 * Example: `football:2025:premier-league`
 */
export function buildPartitionKey(sport: SportType, seasonOrYear: string | number, competitionId: string): string {
  const cleanSport = sport.toLowerCase().trim();
  const cleanSeason = String(seasonOrYear).replace(/[^a-zA-Z0-9_-]/g, '').trim();
  const cleanComp = competitionId
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${cleanSport}:${cleanSeason}:${cleanComp}`;
}

/**
 * Parses a partition key back into its domain components.
 */
export function parsePartitionKey(partitionKey: string): {
  sport: string;
  seasonOrYear: string;
  competitionId: string;
} | null {
  const parts = partitionKey.split(':');
  if (parts.length < 3) return null;

  return {
    sport: parts[0],
    seasonOrYear: parts[1],
    competitionId: parts.slice(2).join(':'),
  };
}
