import { CanonicalCompetition, FixtureClassificationStatus, FootballEvent } from '@goalmills/types';
import { CANONICAL_COMPETITIONS, getCanonicalCompetition } from './competitionRegistry';
import { resolveCompetitionFromProvider } from './providerMapping';

export interface CompetitionResolutionResult {
  competition: CanonicalCompetition | null;
  competitionId: string;
  status: FixtureClassificationStatus;
  isResolved: boolean;
}

/**
 * Fallback empty representation when a fixture cannot be resolved.
 */
export const UNRESOLVED_COMPETITION_ID = 'GOALMILLS-UNRESOLVED';

/**
 * Resolves the canonical GoalMills competition for a raw football event or fixture.
 * Strictly eliminates substring matching pollution.
 */
export function resolveCompetitionForFixture(
  event: any
): CompetitionResolutionResult {
  if (!event) {
    return {
      competition: null,
      competitionId: UNRESOLVED_COMPETITION_ID,
      status: 'UNRESOLVED',
      isResolved: false,
    };
  }

  const leagueKey = event.league_key ?? event.leagueId ?? event.league_id;
  const leagueName = event.league_name ?? event.leagueName ?? event.league;
  const countryName = event.country_name ?? event.countryName ?? event.country;

  const resolution = resolveCompetitionFromProvider(
    leagueKey as string | number | undefined,
    typeof leagueName === 'string' ? leagueName : undefined,
    typeof countryName === 'string' ? countryName : undefined
  );

  if (resolution.competitionId && CANONICAL_COMPETITIONS[resolution.competitionId]) {
    const canonical = CANONICAL_COMPETITIONS[resolution.competitionId];
    return {
      competition: canonical,
      competitionId: canonical.id,
      status: 'RESOLVED',
      isResolved: true,
    };
  }

  return {
    competition: null,
    competitionId: UNRESOLVED_COMPETITION_ID,
    status: resolution.status,
    isResolved: false,
  };
}

/**
 * Evaluates whether a fixture strictly belongs to a specific target competition.
 * Eliminates cross-competition contamination (e.g. Serie A vs Serie A Femminile).
 */
export function isFixtureInCompetition(
  fixture: any,
  targetCompetitionIdOrSlug: string
): boolean {
  if (!fixture || !targetCompetitionIdOrSlug) return false;

  const targetComp = getCanonicalCompetition(targetCompetitionIdOrSlug);
  if (!targetComp) return false;

  // Primary: Check if the fixture's providerId strictly equals the target's providerId
  const fLeagueKey = fixture.league_key ?? fixture.leagueId;
  if (fLeagueKey !== undefined && fLeagueKey !== null) {
    const numericKey = typeof fLeagueKey === 'string' ? parseInt(fLeagueKey, 10) : fLeagueKey;
    if (numericKey === targetComp.providerId && targetComp.providerId > 0) {
      return true;
    }
  }

  // Secondary: Resolve through the strict canonical pipeline
  const resolved = resolveCompetitionForFixture(fixture);
  if (resolved.isResolved && resolved.competitionId === targetComp.id) {
    return true;
  }

  return false;
}
