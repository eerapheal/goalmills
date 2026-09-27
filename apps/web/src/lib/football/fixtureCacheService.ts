import { NormalizedFixture } from '@goalmills/types';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redisCache';

export const FIXTURE_CACHE_TTL = {
  LIVE: 15, // 15 seconds for live match telemetry
  TODAY: 120, // 2 minutes for today's matches
  UPCOMING: 600, // 10 minutes for upcoming fixtures
  HISTORICAL: 86400, // 24 hours for finalized past results
  QUARANTINE: 3600, // 1 hour for quarantined fixtures
};

export function makeCompetitionFixturesKey(competitionId: string, date: string): string {
  return `gm:football:competition:${competitionId.toLowerCase()}:fixtures:${date}`;
}

export function makeLiveFixturesKey(): string {
  return 'gm:football:live:all';
}

export function makeMatchKey(fixtureId: string): string {
  return `gm:football:match:${fixtureId}`;
}

export function makeQuarantineKey(date: string): string {
  return `gm:football:quarantine:${date}`;
}

/**
 * Cache fixtures partitioned strictly by canonical competition ID and date.
 * Ambiguous / global keys without competition partitioning are prohibited.
 */
export async function cacheCompetitionFixtures(
  competitionId: string,
  date: string,
  fixtures: NormalizedFixture[],
  ttlSeconds = FIXTURE_CACHE_TTL.TODAY
): Promise<void> {
  const key = makeCompetitionFixturesKey(competitionId, date);
  await cacheSet(key, fixtures, ttlSeconds);
}

export async function getCachedCompetitionFixtures(
  competitionId: string,
  date: string
): Promise<NormalizedFixture[] | null> {
  const key = makeCompetitionFixturesKey(competitionId, date);
  return cacheGet<NormalizedFixture[]>(key);
}

/**
 * Cache all active live fixtures.
 */
export async function cacheLiveFixtures(
  fixtures: NormalizedFixture[],
  ttlSeconds = FIXTURE_CACHE_TTL.LIVE
): Promise<void> {
  const key = makeLiveFixturesKey();
  await cacheSet(key, fixtures, ttlSeconds);
}

export async function getCachedLiveFixtures(): Promise<NormalizedFixture[] | null> {
  const key = makeLiveFixturesKey();
  return cacheGet<NormalizedFixture[]>(key);
}

/**
 * Cache single match by unique fixture ID.
 */
export async function cacheMatch(
  fixtureId: string,
  fixture: NormalizedFixture,
  ttlSeconds = FIXTURE_CACHE_TTL.TODAY
): Promise<void> {
  const key = makeMatchKey(fixtureId);
  await cacheSet(key, fixture, ttlSeconds);
}

export async function getCachedMatch(fixtureId: string): Promise<NormalizedFixture | null> {
  const key = makeMatchKey(fixtureId);
  return cacheGet<NormalizedFixture>(key);
}

/**
 * Quarantine cache store for flagged fixtures.
 */
export async function cacheQuarantinedFixtures(
  date: string,
  fixtures: NormalizedFixture[]
): Promise<void> {
  const key = makeQuarantineKey(date);
  await cacheSet(key, fixtures, FIXTURE_CACHE_TTL.QUARANTINE);
}

export async function getCachedQuarantinedFixtures(
  date: string
): Promise<NormalizedFixture[] | null> {
  const key = makeQuarantineKey(date);
  return cacheGet<NormalizedFixture[]>(key);
}

/**
 * Invalidate a specific competition cache (e.g. after score updates).
 */
export async function invalidateCompetitionCache(
  competitionId: string,
  date: string
): Promise<void> {
  const key = makeCompetitionFixturesKey(competitionId, date);
  await cacheDel(key);
}
