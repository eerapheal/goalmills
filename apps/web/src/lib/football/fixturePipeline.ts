import {
  FootballEvent,
  NormalizedFixture,
  CompetitionGender,
  CompetitionAgeCategory,
  CanonicalCompetition,
} from '@goalmills/types';
import { resolveCompetitionForFixture, UNRESOLVED_COMPETITION_ID } from './competitionResolver';
import { resolveTeam } from './teamResolver';
import { resolveCountry } from './countryResolver';
import { resolveGender } from './genderResolver';
import { resolveAgeCategory } from './ageGroupResolver';
import { validateFixture, validateFixtures, FixtureValidationResult } from './fixtureValidator';
import { getCanonicalCompetition } from './competitionRegistry';
import { sortNormalizedFixtures } from './fixtureSorter';

/**
 * Parses raw score strings (e.g. "2 - 1", "0-0", "3 - 2 (P)") safely.
 */
function parseScore(raw?: string): { home?: number; away?: number } {
  if (!raw || typeof raw !== 'string') return {};
  const cleaned = raw.replace(/\(.*?\)/g, '').trim();
  if (!cleaned.includes('-')) return {};

  const parts = cleaned.split('-').map((s) => parseInt(s.trim(), 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { home: parts[0], away: parts[1] };
  }
  return {};
}

/**
 * Stage-by-Stage Single Fixture Normalization Pipeline.
 *
 * Raw Event
 *   ↓
 * Provider mapping & Competition resolver
 *   ↓
 * Team resolver (home & away)
 *   ↓
 * Country resolver
 *   ↓
 * Gender resolver
 *   ↓
 * Age-group resolver
 *   ↓
 * Validation & Quarantine Gate
 */
export function processFixture(rawEvent: any): NormalizedFixture {
  if (!rawEvent) {
    return {
      fixtureId: `gm-fix-empty-${Date.now()}`,
      providerFixtureId: '',
      competitionId: UNRESOLVED_COMPETITION_ID,
      seasonId: '2026/2027',
      homeTeamId: 'unknown',
      homeTeamName: 'Unknown',
      homeTeamLogo: '',
      awayTeamId: 'unknown',
      awayTeamName: 'Unknown',
      awayTeamLogo: '',
      countryCode: 'GLOBAL',
      confederationCode: 'FIFA',
      gender: 'MALE',
      ageCategory: 'SENIOR',
      status: 'Scheduled',
      classificationStatus: 'UNRESOLVED',
      scheduledAt: new Date().toISOString(),
      priorityRank: 999,
      isFeatured: false,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  // 1. Competition Resolution (Strict Canonical Hierarchy)
  const resolvedComp = resolveCompetitionForFixture(rawEvent);
  const comp: CanonicalCompetition | null = resolvedComp.competition;

  // 2. Team Resolution (Priority Clubs, Logos, Aliases)
  const homeResolved = resolveTeam(
    rawEvent.home_team_key ?? rawEvent.homeTeamKey ?? rawEvent.home_team_id,
    rawEvent.event_home_team ?? rawEvent.homeTeam ?? rawEvent.home_team_name,
    rawEvent.home_team_logo ?? rawEvent.homeTeamLogo
  );

  const awayResolved = resolveTeam(
    rawEvent.away_team_key ?? rawEvent.awayTeamKey ?? rawEvent.away_team_id,
    rawEvent.event_away_team ?? rawEvent.awayTeam ?? rawEvent.away_team_name,
    rawEvent.away_team_logo ?? rawEvent.awayTeamLogo
  );

  // 3. Country Resolution
  const rawCountry = comp?.countryCode || rawEvent.country_name || rawEvent.country;
  const countryResolved = resolveCountry(rawCountry);

  // 4. Gender Resolution (Strict firewall: Competition -> regex -> MALE)
  const genderResolved = resolveGender(
    comp,
    rawEvent.league_name ?? rawEvent.leagueName,
    homeResolved.teamName,
    awayResolved.teamName
  );

  // 5. Age-Group Resolution (Strict firewall: Competition -> regex -> SENIOR)
  const ageResolved = resolveAgeCategory(
    comp,
    rawEvent.league_name ?? rawEvent.leagueName,
    homeResolved.teamName,
    awayResolved.teamName
  );

  // 6. Score Normalization
  const finalScore = parseScore(
    rawEvent.event_final_result ?? rawEvent.event_ft_result ?? rawEvent.final_result
  );
  const htScore = parseScore(rawEvent.event_halftime_result ?? rawEvent.halftime_result);

  // 7. Schedule & Status Normalization
  const scheduledAt =
    rawEvent.event_date && rawEvent.event_time
      ? `${rawEvent.event_date}T${rawEvent.event_time}:00Z`
      : rawEvent.event_date || new Date().toISOString();

  const isLive =
    rawEvent.event_live === '1' ||
    rawEvent.event_live === 1 ||
    ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(rawEvent.event_status || '') ||
    !isNaN(Number(rawEvent.event_status));

  const status = rawEvent.event_status || (isLive ? 'LIVE' : 'Scheduled');

  const rawKey = rawEvent.event_key ?? rawEvent.id ?? rawEvent.fixture_id ?? '';

  // 8. Assemble Normalized Candidate
  const candidateFixture: NormalizedFixture = {
    fixtureId: `gm-fix-${rawKey}`,
    providerFixtureId: String(rawKey),
    competitionId: comp ? comp.id : UNRESOLVED_COMPETITION_ID,
    seasonId: rawEvent.league_season || comp?.season || '2026/2027',

    homeTeamId: homeResolved.teamId,
    homeTeamName: homeResolved.teamName,
    homeTeamLogo: homeResolved.teamLogo,

    awayTeamId: awayResolved.teamId,
    awayTeamName: awayResolved.teamName,
    awayTeamLogo: awayResolved.teamLogo,

    countryCode: comp?.countryCode || countryResolved.countryCode,
    confederationCode: comp?.confederationCode || countryResolved.confederationCode,

    gender: genderResolved,
    ageCategory: ageResolved,

    status,
    classificationStatus: resolvedComp.status,

    scheduledAt,
    homeScore: finalScore.home,
    awayScore: finalScore.away,
    htHomeScore: htScore.home,
    htAwayScore: htScore.away,
    penaltyResult: rawEvent.event_penalty_result || undefined,

    round: rawEvent.league_round || undefined,
    stage: rawEvent.stage_name || undefined,
    group: rawEvent.league_group || undefined,
    venue: rawEvent.event_stadium || undefined,
    referee: rawEvent.event_referee || undefined,

    priorityRank: comp ? comp.priorityRank : 999,
    isFeatured: comp ? comp.isFeatured : false,
    lastUpdatedAt: new Date().toISOString(),

    _raw: rawEvent as Record<string, unknown>,
  };

  // 9. Automated Validation & Quarantine Gate
  const validated = validateFixture(candidateFixture);
  return validated.fixture;
}

/**
 * Ingests an array of raw fixtures through the complete pipeline,
 * returns sorted valid fixtures and quarantined fixtures.
 */
export function processFixtures(rawEvents: any[]): {
  validFixtures: NormalizedFixture[];
  quarantinedFixtures: NormalizedFixture[];
  allProcessed: NormalizedFixture[];
} {
  if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
    return { validFixtures: [], quarantinedFixtures: [], allProcessed: [] };
  }

  const allProcessed = rawEvents.map(processFixture);
  const { validFixtures, quarantinedFixtures } = validateFixtures(allProcessed);

  // Deterministically sort production fixtures
  const sortedValid = sortNormalizedFixtures(validFixtures);

  return {
    validFixtures: sortedValid,
    quarantinedFixtures,
    allProcessed,
  };
}

/**
 * Strict League Isolation Filter.
 *
 * When a user views a specific competition (e.g. /football/england/premier-league),
 * ONLY fixtures with fixture.competitionId === targetCompetition.id are returned.
 *
 * ZERO substring matching. ZERO country-only heuristics.
 */
export function filterFixturesByCompetition(
  fixtures: NormalizedFixture[],
  targetCompetitionIdOrSlug: string
): NormalizedFixture[] {
  if (!fixtures || fixtures.length === 0 || !targetCompetitionIdOrSlug) return [];

  const targetComp = getCanonicalCompetition(targetCompetitionIdOrSlug);
  if (!targetComp) return [];

  return fixtures.filter((f) => f.competitionId === targetComp.id);
}

/**
 * Strict Gender Isolation Filter.
 */
export function filterFixturesByGender(
  fixtures: NormalizedFixture[],
  gender: CompetitionGender | 'all'
): NormalizedFixture[] {
  if (!fixtures || fixtures.length === 0) return [];
  if (gender === 'all') return fixtures;

  return fixtures.filter((f) => f.gender === gender);
}

/**
 * Strict Age-Category Isolation Filter.
 */
export function filterFixturesByAgeCategory(
  fixtures: NormalizedFixture[],
  ageCategory: CompetitionAgeCategory | 'senior' | 'youth' | 'all'
): NormalizedFixture[] {
  if (!fixtures || fixtures.length === 0) return [];
  if (ageCategory === 'all') return fixtures;

  if (ageCategory === 'youth') {
    return fixtures.filter((f) => f.ageCategory !== 'SENIOR');
  }

  if (ageCategory === 'senior') {
    return fixtures.filter((f) => f.ageCategory === 'SENIOR');
  }

  return fixtures.filter((f) => f.ageCategory === ageCategory);
}
