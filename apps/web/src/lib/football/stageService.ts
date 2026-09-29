import {
  CompetitionStage,
  StageGroupSummary,
  StageKnockoutRoundSummary,
} from '@goalmills/types';
import { getCompetitionStages, getStageById } from './competitionFormatEngine';

/**
 * Generates an alphabetic sequence of groups (Group A, Group B, ...)
 * for a group stage.
 */
export function generateAlphabeticGroups(
  stageId: string,
  count: number,
  teamsPerGroup = 4,
  advancingPerGroup = 2
): StageGroupSummary[] {
  const groups: StageGroupSummary[] = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < count && i < alphabet.length; i++) {
    const letter = alphabet[i];
    groups.push({
      id: `${stageId}-group-${letter.toLowerCase()}`,
      stageId,
      name: `Group ${letter}`,
      shortName: letter,
      slug: `group-${letter.toLowerCase()}`,
      displayOrder: i + 1,
      status: 'UPCOMING',
      teamsCount: teamsPerGroup,
      advancingTeamsCount: advancingPerGroup,
    });
  }

  return groups;
}

/**
 * Generates canonical knockout rounds structure from starting round down to the Final.
 */
export function generateStandardKnockoutRounds(
  stageId: string,
  startingRound: 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL',
  legType: 'SINGLE' | 'TWO_LEGGED' = 'SINGLE',
  includeThirdPlace = false
): StageKnockoutRoundSummary[] {
  const roundTemplates = [
    { key: 'R32', name: 'Round of 32', slug: 'round-of-32', matchCount: 16 },
    { key: 'R16', name: 'Round of 16', slug: 'round-of-16', matchCount: 8 },
    { key: 'QF', name: 'Quarter-finals', slug: 'quarter-finals', matchCount: 4 },
    { key: 'SF', name: 'Semi-finals', slug: 'semi-finals', matchCount: 2 },
    { key: 'FINAL', name: 'Final', slug: 'final', matchCount: 1 },
  ];

  const startIndex = roundTemplates.findIndex((r) => r.key === startingRound);
  if (startIndex === -1) return [];

  const rounds: StageKnockoutRoundSummary[] = [];
  let order = 1;

  for (let i = startIndex; i < roundTemplates.length; i++) {
    const tmpl = roundTemplates[i];

    if (tmpl.key === 'FINAL' && includeThirdPlace) {
      rounds.push({
        id: `${stageId}-third-place`,
        stageId,
        name: 'Third-place Play-off',
        slug: 'third-place',
        order: order++,
        matchCount: 1,
        legType: 'SINGLE',
        status: 'UPCOMING',
      });
    }

    rounds.push({
      id: `${stageId}-${tmpl.slug}`,
      stageId,
      name: tmpl.name,
      slug: tmpl.slug,
      order: order++,
      matchCount: tmpl.matchCount,
      legType: tmpl.key === 'FINAL' ? 'SINGLE' : legType,
      status: 'UPCOMING',
    });
  }

  return rounds;
}

/**
 * Enriches a CompetitionStage with its canonical groups or knockout rounds
 * if not already populated.
 */
export function enrichStageWithArchitecture(stage: CompetitionStage): CompetitionStage {
  const enriched: CompetitionStage = { ...stage };

  if (enriched.isGroupStage && (!enriched.groups || enriched.groups.length === 0)) {
    const count = enriched.groupsCount || 4;
    enriched.groups = generateAlphabeticGroups(enriched.id, count);
  }

  if (enriched.isKnockout && (!enriched.knockoutRounds || enriched.knockoutRounds.length === 0)) {
    // Determine starting round based on competition characteristics
    const cid = enriched.competitionId.toUpperCase();
    if (cid.includes('WORLD-CUP') && enriched.seasonId === '2026') {
      enriched.knockoutRounds = generateStandardKnockoutRounds(
        enriched.id,
        'R32',
        'SINGLE',
        true
      );
    } else if (cid.includes('AFCON') || cid.includes('CHAMPIONS-LEAGUE')) {
      const starting = cid.includes('AFCON') ? 'R16' : 'QF';
      enriched.knockoutRounds = generateStandardKnockoutRounds(
        enriched.id,
        starting,
        cid.includes('AFCON') ? 'SINGLE' : 'TWO_LEGGED',
        cid.includes('AFCON')
      );
    } else {
      enriched.knockoutRounds = generateStandardKnockoutRounds(enriched.id, 'QF', 'SINGLE');
    }
  }

  return enriched;
}

/**
 * Returns all enriched stages for a competition and season.
 */
export function getStagesForCompetition(
  competitionId: string,
  seasonId?: string
): CompetitionStage[] {
  const stages = getCompetitionStages(competitionId, seasonId);
  return stages.map(enrichStageWithArchitecture);
}

/**
 * Retrieves a specific stage by slug with groups and knockout rounds attached.
 */
export function getStageBySlug(
  competitionId: string,
  stageSlug: string,
  seasonId?: string
): CompetitionStage | undefined {
  const stage = getStageById(competitionId, stageSlug, seasonId);
  if (!stage) return undefined;
  return enrichStageWithArchitecture(stage);
}

/**
 * Retrieves all groups for a given stage within a competition.
 */
export function getStageGroups(
  competitionId: string,
  stageIdOrSlug: string,
  seasonId?: string
): StageGroupSummary[] {
  const stage = getStageBySlug(competitionId, stageIdOrSlug, seasonId);
  if (!stage || !stage.isGroupStage) return [];
  return stage.groups || [];
}

/**
 * Retrieves a specific group by slug (e.g. 'group-a') within a competition.
 */
export function getGroupBySlug(
  competitionId: string,
  groupSlug: string,
  seasonId?: string
): StageGroupSummary | undefined {
  const stages = getStagesForCompetition(competitionId, seasonId);
  const target = groupSlug.trim().toLowerCase();

  for (const stage of stages) {
    if (stage.groups) {
      const match = stage.groups.find(
        (g) => g.slug.toLowerCase() === target || g.name.toLowerCase() === target
      );
      if (match) return match;
    }
  }
  return undefined;
}

/**
 * Retrieves all knockout rounds for a given stage within a competition.
 */
export function getStageKnockoutRounds(
  competitionId: string,
  stageIdOrSlug: string,
  seasonId?: string
): StageKnockoutRoundSummary[] {
  const stage = getStageBySlug(competitionId, stageIdOrSlug, seasonId);
  if (!stage || !stage.isKnockout) return [];
  return stage.knockoutRounds || [];
}

/**
 * Resolves the canonical CompetitionStage for a raw provider fixture or event.
 * Eliminates cross-stage pollution.
 */
export function resolveStageForFixture(
  fixture: any,
  competitionId: string,
  seasonId?: string
): CompetitionStage | undefined {
  if (!fixture || !competitionId) return undefined;

  const stages = getStagesForCompetition(competitionId, seasonId);
  if (stages.length === 1) {
    return stages[0];
  }

  const rawStage = (fixture.stage || fixture.stage_name || '').trim().toLowerCase();
  const rawRound = (fixture.round || fixture.round_name || '').trim().toLowerCase();
  const rawGroup = (fixture.group || fixture.group_name || '').trim().toLowerCase();

  // 1. Direct group matching -> maps to Group Stage
  if (rawGroup || rawStage.includes('group') || rawRound.includes('group')) {
    const groupStage = stages.find((s) => s.isGroupStage);
    if (groupStage) return groupStage;
  }

  // 2. League Phase matching
  if (rawStage.includes('league phase') || rawRound.includes('league phase')) {
    const leaguePhase = stages.find((s) => s.isLeaguePhase);
    if (leaguePhase) return leaguePhase;
  }

  // 3. Play-off matching
  if (rawStage.includes('play-off') || rawRound.includes('play-off')) {
    const playoffStage = stages.find((s) => s.type === 'PLAYOFF');
    if (playoffStage) return playoffStage;
  }

  // 4. Knockout matching (Round of 16, Quarter-final, etc.)
  const isKnockoutMatch =
    rawStage.includes('knockout') ||
    rawStage.includes('final') ||
    rawRound.includes('round of') ||
    rawRound.includes('quarter') ||
    rawRound.includes('semi') ||
    rawRound.includes('final');

  if (isKnockoutMatch) {
    const knockoutStage = stages.find((s) => s.isKnockout && s.type !== 'QUALIFICATION');
    if (knockoutStage) return knockoutStage;
  }

  // 5. Qualification matching
  if (rawStage.includes('qualif') || rawRound.includes('qualif')) {
    const qualStage = stages.find((s) => s.isQualification);
    if (qualStage) return qualStage;
  }

  // Default to the first stage
  return stages[0];
}
