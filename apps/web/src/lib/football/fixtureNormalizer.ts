import { FootballEvent, NormalizedFixture } from '@goalmills/types';
import { resolveCompetitionForFixture, UNRESOLVED_COMPETITION_ID } from './competitionResolver';

/**
 * Normalizes raw AllSportsAPI FootballEvent into canonical GoalMills NormalizedFixture.
 */
export function normalizeFixture(event: FootballEvent): NormalizedFixture {
  const resolved = resolveCompetitionForFixture(event);
  const comp = resolved.competition;

  // Safe score parser
  let homeScore: number | undefined;
  let awayScore: number | undefined;
  const rawScore = event.event_final_result || event.event_ft_result;
  if (rawScore && rawScore.includes('-')) {
    const parts = rawScore.split('-').map((s) => parseInt(s.trim(), 10));
    if (!isNaN(parts[0]) && !isNaN(parts[1])) {
      homeScore = parts[0];
      awayScore = parts[1];
    }
  }

  // Halftime score parser
  let htHomeScore: number | undefined;
  let htAwayScore: number | undefined;
  if (event.event_halftime_result && event.event_halftime_result.includes('-')) {
    const htParts = event.event_halftime_result.split('-').map((s) => parseInt(s.trim(), 10));
    if (!isNaN(htParts[0]) && !isNaN(htParts[1])) {
      htHomeScore = htParts[0];
      htAwayScore = htParts[1];
    }
  }

  const scheduledAt =
    event.event_date && event.event_time
      ? `${event.event_date}T${event.event_time}:00Z`
      : event.event_date || new Date().toISOString();

  return {
    fixtureId: `gm-fix-${event.event_key}`,
    providerFixtureId: String(event.event_key || ''),
    competitionId: comp ? comp.id : UNRESOLVED_COMPETITION_ID,
    seasonId: event.league_season || comp?.season || '2026/2027',

    homeTeamId: String(event.home_team_key || ''),
    homeTeamName: event.event_home_team || 'Home Team',
    homeTeamLogo: event.home_team_logo || '',

    awayTeamId: String(event.away_team_key || ''),
    awayTeamName: event.event_away_team || 'Away Team',
    awayTeamLogo: event.away_team_logo || '',

    countryCode: comp ? comp.countryCode : event.country_name || 'UNKNOWN',
    confederationCode: comp ? comp.confederationCode : 'FIFA',

    gender: comp ? comp.gender : 'MALE',
    ageCategory: comp ? comp.ageCategory : 'SENIOR',

    status: event.event_status || 'Scheduled',
    classificationStatus: resolved.status,

    scheduledAt,
    homeScore,
    awayScore,
    htHomeScore,
    htAwayScore,
    penaltyResult: event.event_penalty_result || undefined,

    round: event.league_round || undefined,
    stage: event.stage_name || undefined,
    group: event.league_group || undefined,
    venue: event.event_stadium || undefined,
    referee: event.event_referee || undefined,

    priorityRank: comp ? comp.priorityRank : 999,
    isFeatured: comp ? comp.isFeatured : false,
    lastUpdatedAt: new Date().toISOString(),

    _raw: event as unknown as Record<string, unknown>,
  };
}

/**
 * Batch normalizes an array of raw football events.
 */
export function normalizeFixtures(events: FootballEvent[]): NormalizedFixture[] {
  if (!Array.isArray(events)) return [];
  return events.map(normalizeFixture);
}
