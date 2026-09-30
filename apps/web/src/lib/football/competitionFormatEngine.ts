import {
  CompetitionFormatConfig,
  CompetitionFormatType,
  CompetitionStage,
  StandingsRuleset,
} from '@goalmills/types';
import { COMPETITION_FORMAT_REGISTRY } from './competitionFormatRegistry';
import { getStandingsRulesetById, STANDINGS_RULESETS } from './standingsRulesets';
import { getCanonicalCompetition } from './competitionRegistry';

/**
 * Normalizes season IDs to match registry format (e.g., '2026/2027', '2026', '2025/26').
 */
function normalizeSeason(season?: string): string {
  if (!season) return 'default';
  const trimmed = season.trim();
  return trimmed || 'default';
}

/**
 * Generates a deterministic fallback format configuration when a competition
 * does not have an explicit registry override.
 * Governed strictly by canonical metadata (competitionType, isDomestic, isCup),
 * NEVER by loose substring matching on names.
 */
function generateDeterministicFallback(
  competitionId: string,
  seasonId: string
): CompetitionFormatConfig {
  const canonical = getCanonicalCompetition(competitionId);
  const compType = canonical?.competitionType;
  const isCup = compType === 'CUP' || canonical?.name.toLowerCase().includes('cup');

  if (compType === 'CUP' || isCup) {
    const stage: CompetitionStage = {
      id: `${competitionId}-knockout-stage`,
      competitionId,
      seasonId,
      name: 'Knockout Stage',
      slug: 'knockout',
      type: 'KNOCKOUT',
      order: 1,
      status: 'IN_PROGRESS',
      isGroupStage: false,
      isLeaguePhase: false,
      isKnockout: true,
      isQualification: false,
      rulesetId: 'RULESET-KNOCKOUT',
    };
    return {
      id: `${competitionId}:${seasonId}`,
      competitionId,
      seasonId,
      formatType: 'KNOCKOUT',
      name: `${canonical?.name || competitionId} Knockout Format`,
      description: 'Single-elimination knockout tournament.',
      stages: [stage],
      defaultStageId: stage.id,
      hasGroups: false,
      hasKnockout: true,
      hasLeagueTable: false,
      rulesetId: 'RULESET-KNOCKOUT',
    };
  }

  if (
    compType === 'WORLD_CUP' ||
    compType === 'CONTINENTAL_NATIONAL' ||
    compType === 'CONTINENTAL_CLUB'
  ) {
    const groupStage: CompetitionStage = {
      id: `${competitionId}-groups-stage`,
      competitionId,
      seasonId,
      name: 'Group Stage',
      slug: 'group-stage',
      type: 'GROUP_STAGE',
      order: 1,
      status: 'IN_PROGRESS',
      isGroupStage: true,
      isLeaguePhase: false,
      isKnockout: false,
      isQualification: false,
      rulesetId: 'RULESET-STANDARD-3PT',
    };
    const knockoutStage: CompetitionStage = {
      id: `${competitionId}-knockout-stage`,
      competitionId,
      seasonId,
      name: 'Knockout Stage',
      slug: 'knockout-stage',
      type: 'KNOCKOUT',
      order: 2,
      status: 'UPCOMING',
      isGroupStage: false,
      isLeaguePhase: false,
      isKnockout: true,
      isQualification: false,
      rulesetId: 'RULESET-KNOCKOUT',
    };
    return {
      id: `${competitionId}:${seasonId}`,
      competitionId,
      seasonId,
      formatType: 'HYBRID',
      name: `${canonical?.name || competitionId} Tournament Format`,
      description: 'Group Stage followed by Knockout bracket.',
      stages: [groupStage, knockoutStage],
      defaultStageId: groupStage.id,
      hasGroups: true,
      hasKnockout: true,
      hasLeagueTable: false,
      rulesetId: 'RULESET-STANDARD-3PT',
    };
  }

  // Default: Standard Single League Table
  const leagueStage: CompetitionStage = {
    id: `${competitionId}-league-stage`,
    competitionId,
    seasonId,
    name: 'Regular Season',
    slug: 'regular-season',
    type: 'LEAGUE',
    order: 1,
    status: 'IN_PROGRESS',
    isGroupStage: false,
    isLeaguePhase: false,
    isKnockout: false,
    isQualification: false,
    rulesetId: 'RULESET-STANDARD-3PT',
  };

  return {
    id: `${competitionId}:${seasonId}`,
    competitionId,
    seasonId,
    formatType: 'LEAGUE',
    name: `${canonical?.name || competitionId} League Format`,
    description: 'Double round-robin single standings table.',
    stages: [leagueStage],
    defaultStageId: leagueStage.id,
    hasGroups: false,
    hasKnockout: false,
    hasLeagueTable: true,
    rulesetId: 'RULESET-STANDARD-3PT',
  };
}

/**
 * Primary Entry Point: Resolves the canonical season-specific format for any competition.
 *
 * Evaluation hierarchy:
 * 1. Exact match on `${competitionId}:${seasonId}`
 * 2. Default match on `${competitionId}:default`
 * 3. Deterministic canonical fallback by canonical competition type
 */
export function getCompetitionFormat(
  competitionId: string,
  seasonId?: string
): CompetitionFormatConfig {
  const normSeason = normalizeSeason(seasonId);
  const canonical = getCanonicalCompetition(competitionId);
  const targetIds = [competitionId.toUpperCase()];
  if (canonical && canonical.id.toUpperCase() !== competitionId.toUpperCase()) {
    targetIds.unshift(canonical.id.toUpperCase());
  }

  for (const cid of targetIds) {
    const exactKey = `${cid}:${normSeason}`;
    if (COMPETITION_FORMAT_REGISTRY[exactKey]) {
      return COMPETITION_FORMAT_REGISTRY[exactKey];
    }

    const defaultKey = `${cid}:default`;
    if (COMPETITION_FORMAT_REGISTRY[defaultKey]) {
      return COMPETITION_FORMAT_REGISTRY[defaultKey];
    }
  }

  return generateDeterministicFallback(targetIds[0], normSeason);
}

/**
 * Returns all stages for a given competition and season in ascending order.
 */
export function getCompetitionStages(
  competitionId: string,
  seasonId?: string
): CompetitionStage[] {
  const format = getCompetitionFormat(competitionId, seasonId);
  return [...format.stages].sort((a, b) => a.order - b.order);
}

/**
 * Retrieves a specific stage by ID or slug within a competition season.
 */
export function getStageById(
  competitionId: string,
  stageIdOrSlug: string,
  seasonId?: string
): CompetitionStage | undefined {
  const stages = getCompetitionStages(competitionId, seasonId);
  const target = stageIdOrSlug.trim().toLowerCase();
  return stages.find((s) => s.id.toLowerCase() === target || s.slug.toLowerCase() === target);
}

/**
 * Retrieves the standings ruleset applied to this competition and season.
 */
export function getStandingsRulesetForCompetition(
  competitionId: string,
  seasonId?: string
): StandingsRuleset {
  const format = getCompetitionFormat(competitionId, seasonId);
  return getStandingsRulesetById(format.rulesetId);
}

/**
 * Returns true if the competition is formatted as a single domestic-style league.
 */
export function isLeagueCompetition(competitionId: string, seasonId?: string): boolean {
  const format = getCompetitionFormat(competitionId, seasonId);
  return format.formatType === 'LEAGUE' || format.hasLeagueTable;
}

/**
 * Returns true if the competition contains a multi-group stage (e.g. Group A, Group B).
 */
export function hasGroupStage(competitionId: string, seasonId?: string): boolean {
  const format = getCompetitionFormat(competitionId, seasonId);
  return format.hasGroups || format.stages.some((s) => s.isGroupStage);
}

/**
 * Returns true if the competition contains a knockout elimination bracket.
 */
export function hasKnockoutStage(competitionId: string, seasonId?: string): boolean {
  const format = getCompetitionFormat(competitionId, seasonId);
  return format.hasKnockout || format.stages.some((s) => s.isKnockout);
}

/**
 * Returns true if the competition uses the single 36-team Swiss League Phase (e.g., UCL 2024+).
 */
export function hasLeaguePhase(competitionId: string, seasonId?: string): boolean {
  const format = getCompetitionFormat(competitionId, seasonId);
  return format.stages.some((s) => s.isLeaguePhase);
}

/**
 * Returns the high-level format type (LEAGUE, HYBRID, KNOCKOUT, etc.).
 */
export function determineCompetitionFormatType(
  competitionId: string,
  seasonId?: string
): CompetitionFormatType {
  const format = getCompetitionFormat(competitionId, seasonId);
  return format.formatType;
}

/**
 * Returns all pre-configured formats in the registry.
 */
export function getAllRegisteredFormats(): CompetitionFormatConfig[] {
  return Object.values(COMPETITION_FORMAT_REGISTRY);
}

export { getStandingsRulesetById, STANDINGS_RULESETS };
