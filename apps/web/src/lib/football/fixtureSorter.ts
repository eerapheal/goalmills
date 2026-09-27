import { CanonicalCompetition, FootballEvent, NormalizedFixture } from '@goalmills/types';
import { resolveCompetitionForFixture } from './competitionResolver';

/**
 * Status priority weights for sorting fixtures:
 * 0 = LIVE (InProgress, 1H, 2H, HT, ET, etc.)
 * 1 = UPCOMING (Scheduled, NS, Not Started, etc.)
 * 2 = POSTPONED / SUSPENDED / CANCELLED
 * 3 = FINISHED (FT, AET, AP, Finished, etc.)
 */
export function getStatusPriority(status: string | undefined): number {
  if (!status) return 1;
  const s = status.trim().toLowerCase();

  // Live match conditions
  if (
    s === 'live' ||
    s === 'in progress' ||
    s === '1h' ||
    s === '2h' ||
    s === 'ht' ||
    s === 'half time' ||
    s === 'extra time' ||
    s === 'et' ||
    s === 'penalties' ||
    s === 'p' ||
    s === 'break' ||
    s.includes("'")
  ) {
    return 0;
  }

  // Upcoming
  if (
    s === 'ns' ||
    s === 'not started' ||
    s === 'scheduled' ||
    s === 'upcoming' ||
    s === '' ||
    s === '-'
  ) {
    return 1;
  }

  // Postponed / Suspended / Cancelled
  if (
    s.includes('postponed') ||
    s.includes('suspended') ||
    s.includes('cancelled') ||
    s.includes('delayed') ||
    s.includes('abandoned')
  ) {
    return 2;
  }

  // Finished
  if (
    s === 'ft' ||
    s === 'finished' ||
    s === 'after extra time' ||
    s === 'aet' ||
    s === 'after penalties' ||
    s === 'ap'
  ) {
    return 3;
  }

  return 1;
}

/**
 * Deterministic comparator for CanonicalCompetition objects.
 * priorityRank ASC -> tier ASC -> displayOrder ASC -> countryName ASC -> name ASC
 */
export function compareCompetitions(a: CanonicalCompetition, b: CanonicalCompetition): number {
  if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
  if (a.tier !== b.tier) return a.tier - b.tier;
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
  const countryDiff = a.countryName.localeCompare(b.countryName);
  if (countryDiff !== 0) return countryDiff;
  return a.name.localeCompare(b.name);
}

/**
 * Deterministic comparator for NormalizedFixture objects.
 * statusPriority -> competitionPriorityRank -> scheduledAt -> fixtureId tiebreaker
 */
export function compareNormalizedFixtures(a: NormalizedFixture, b: NormalizedFixture): number {
  const statusA = getStatusPriority(a.status);
  const statusB = getStatusPriority(b.status);
  if (statusA !== statusB) return statusA - statusB;

  if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;

  // Time ordering: ascending for live/upcoming, descending for finished
  const timeA = new Date(a.scheduledAt).getTime() || 0;
  const timeB = new Date(b.scheduledAt).getTime() || 0;
  if (timeA !== timeB) {
    return statusA === 3 ? timeB - timeA : timeA - timeB;
  }

  return a.fixtureId.localeCompare(b.fixtureId);
}

/**
 * Deterministic comparator for raw FootballEvent objects.
 */
export function compareFootballEvents(a: FootballEvent, b: FootballEvent): number {
  const isLiveA = a.event_live === '1' ? 0 : getStatusPriority(a.event_status);
  const isLiveB = b.event_live === '1' ? 0 : getStatusPriority(b.event_status);
  if (isLiveA !== isLiveB) return isLiveA - isLiveB;

  // Resolve competition rank
  const compA = resolveCompetitionForFixture(a).competition;
  const compB = resolveCompetitionForFixture(b).competition;
  const rankA = compA?.priorityRank ?? 999;
  const rankB = compB?.priorityRank ?? 999;
  if (rankA !== rankB) return rankA - rankB;

  // Time comparator
  const dtA = `${a.event_date || ''}T${a.event_time || '00:00'}`;
  const dtB = `${b.event_date || ''}T${b.event_time || '00:00'}`;
  if (dtA !== dtB) {
    return isLiveA === 3 ? dtB.localeCompare(dtA) : dtA.localeCompare(dtB);
  }

  return String(a.event_key || '').localeCompare(String(b.event_key || ''));
}

/**
 * Immutable sort functions
 */
export function sortCompetitions(competitions: CanonicalCompetition[]): CanonicalCompetition[] {
  return [...competitions].sort(compareCompetitions);
}

export function sortNormalizedFixtures(fixtures: NormalizedFixture[]): NormalizedFixture[] {
  return [...fixtures].sort(compareNormalizedFixtures);
}

export function sortFootballEvents(events: FootballEvent[]): FootballEvent[] {
  return [...events].sort(compareFootballEvents);
}
