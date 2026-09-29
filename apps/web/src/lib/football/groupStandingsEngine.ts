import {
  CompetitionGroup,
  StandingEntry,
  StandingTable,
  StandingTableType,
  StandingsRuleset,
} from '@goalmills/types';
import { getStandingsRulesetForCompetition } from './competitionFormatEngine';
import { getStagesForCompetition, getStageBySlug } from './stageService';
import { slugify } from '../slugUtils';

/**
 * Creates a deterministic tiebreaker comparator based on the competition's ruleset.
 * Adheres strictly to the tiebreaker sequence:
 * Points -> GD -> GF -> Wins -> Alphabetical (or H2H if provided).
 * Never mutates the source array.
 */
export function createStandingsComparator(
  ruleset: StandingsRuleset
): (a: StandingEntry, b: StandingEntry) => number {
  return (a: StandingEntry, b: StandingEntry) => {
    for (const rule of ruleset.tiebreakers) {
      if (rule === 'POINTS') {
        const diff = b.points - a.points;
        if (diff !== 0) return diff;
      } else if (rule === 'GOAL_DIFFERENCE' || rule === 'HEAD_TO_HEAD_GOAL_DIFFERENCE') {
        const diff = b.goalDifference - a.goalDifference;
        if (diff !== 0) return diff;
      } else if (rule === 'GOALS_FOR') {
        const diff = b.goalsFor - a.goalsFor;
        if (diff !== 0) return diff;
      } else if (rule === 'WINS') {
        const diff = b.won - a.won;
        if (diff !== 0) return diff;
      }
    }

    // Deterministic final tiebreaker: Team Name Alphabetical
    return a.teamName.localeCompare(b.teamName);
  };
}

/**
 * Sorts standing entries deterministically according to the ruleset.
 * Assigns consecutive position indexes (1, 2, 3, 4...).
 * Never mutates original array.
 */
export function sortStandingEntries(
  entries: StandingEntry[],
  ruleset: StandingsRuleset
): StandingEntry[] {
  const comparator = createStandingsComparator(ruleset);
  const cloned = [...entries].sort(comparator);

  return cloned.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));
}

/**
 * Parses raw provider standing items into normalized StandingEntry objects.
 */
export function normalizeRawStandingEntry(
  raw: any,
  standingTableId: string,
  index: number
): StandingEntry {
  const played = parseInt(raw.standing_P ?? raw.played ?? raw.all?.played ?? 0, 10) || 0;
  const won = parseInt(raw.standing_W ?? raw.won ?? raw.all?.win ?? 0, 10) || 0;
  const drawn = parseInt(raw.standing_D ?? raw.drawn ?? raw.all?.draw ?? 0, 10) || 0;
  const lost = parseInt(raw.standing_L ?? raw.lost ?? raw.all?.lose ?? 0, 10) || 0;

  const goalsFor =
    parseInt(raw.standing_F ?? raw.goalsFor ?? raw.all?.goals?.for ?? 0, 10) || 0;
  const goalsAgainst =
    parseInt(raw.standing_A ?? raw.goalsAgainst ?? raw.all?.goals?.against ?? 0, 10) || 0;
  const goalDifference =
    parseInt(raw.standing_GD ?? raw.goalDifference ?? raw.goalsDiff ?? (goalsFor - goalsAgainst), 10) ||
    goalsFor - goalsAgainst;

  const points = parseInt(raw.standing_PTS ?? raw.points ?? 0, 10) || 0;

  const rawForm = raw.standing_form || raw.form || '';
  const formArr =
    typeof rawForm === 'string'
      ? (rawForm
          .toUpperCase()
          .split('')
          .filter((c: string) => ['W', 'D', 'L'].includes(c)) as ('W' | 'D' | 'L')[])
      : undefined;

  const teamName =
    raw.standing_team || raw.team_name || raw.team?.name || raw.teamName || `Team ${index + 1}`;
  const teamId = slugify(teamName);

  return {
    id: `${standingTableId}-${teamId}`,
    standingTableId,
    teamId,
    teamName,
    teamLogo: raw.team_logo || raw.team?.logo || raw.logo,
    position: parseInt(raw.standing_place ?? raw.rank ?? raw.position ?? index + 1, 10) || index + 1,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDifference,
    points,
    form: formArr,
  };
}

/**
 * Normalizes raw group names into clean standard titles (e.g. "Group A", "Group B", "League Phase").
 */
function cleanGroupName(rawGroup?: string): string {
  if (!rawGroup) return 'Group A';
  const trimmed = rawGroup.trim();

  // If already "Group A", "Group B"
  if (/^group\s+[a-z]$/i.test(trimmed)) {
    return `Group ${trimmed.slice(-1).toUpperCase()}`;
  }
  // If just "A", "B", "C"
  if (/^[a-z]$/i.test(trimmed)) {
    return `Group ${trimmed.toUpperCase()}`;
  }
  // If "League Phase"
  if (/league\s+phase/i.test(trimmed)) {
    return 'League Phase';
  }

  return trimmed;
}

/**
 * Separates provider standings into distinct StandingTable instances.
 *
 * Core Architectural Rule:
 * DO NOT merge Group A and Group B into one table.
 * Each group is an independent entity with its own standings table.
 */
export function separateProviderStandingsByGroup(
  rawStandings: any[],
  competitionId: string,
  seasonId = 'default',
  stageSlug?: string
): StandingTable[] {
  if (!Array.isArray(rawStandings) || rawStandings.length === 0) {
    return [];
  }

  const stages = getStagesForCompetition(competitionId, seasonId);
  const targetStage = stageSlug
    ? getStageBySlug(competitionId, stageSlug, seasonId)
    : stages.find((s) => s.isGroupStage || s.isLeaguePhase) || stages[0];

  const ruleset = getStandingsRulesetForCompetition(competitionId, seasonId);
  const isGroupStage = targetStage?.isGroupStage ?? false;
  const isLeaguePhase = targetStage?.isLeaguePhase ?? false;

  // 1. Single Domestic League Table (Premier League, La Liga, etc.)
  if (!isGroupStage && !isLeaguePhase) {
    const tableId = `table-${competitionId.toLowerCase()}-${seasonId}`;
    const normalizedEntries = rawStandings.map((r, idx) =>
      normalizeRawStandingEntry(r, tableId, idx)
    );
    const sortedEntries = sortStandingEntries(normalizedEntries, ruleset);

    return [
      {
        id: tableId,
        competitionId,
        seasonId,
        stageId: targetStage?.id || 'stage-league',
        type: 'LEAGUE',
        name: `${targetStage?.name || 'League'} Standings`,
        slug: targetStage?.slug || 'regular-season',
        rulesetId: ruleset.id,
        displayOrder: 1,
        status: 'IN_PROGRESS',
        entries: sortedEntries,
      },
    ];
  }

  // 2. Single 36-Team Swiss League Phase (e.g. UEFA Champions League 2024+)
  if (isLeaguePhase) {
    const tableId = `table-${competitionId.toLowerCase()}-league-phase-${seasonId}`;
    const normalizedEntries = rawStandings.map((r, idx) =>
      normalizeRawStandingEntry(r, tableId, idx)
    );
    const sortedEntries = sortStandingEntries(normalizedEntries, ruleset);

    return [
      {
        id: tableId,
        competitionId,
        seasonId,
        stageId: targetStage?.id || 'stage-league-phase',
        groupId: 'league-phase',
        type: 'LEAGUE_PHASE',
        name: 'League Phase',
        slug: 'league-phase',
        rulesetId: ruleset.id,
        displayOrder: 1,
        status: 'IN_PROGRESS',
        entries: sortedEntries,
      },
    ];
  }

  // 3. Multi-Group Tournament (World Cup, AFCON, CAF Champions League, etc.)
  // Bucket entries by group key
  const groupBuckets = new Map<string, any[]>();

  for (const raw of rawStandings) {
    const rawGroupName =
      raw.league_group ||
      raw.group_name ||
      raw.group ||
      raw.standing_group ||
      raw.stage_name ||
      'Group A';

    const groupTitle = cleanGroupName(rawGroupName);
    if (!groupBuckets.has(groupTitle)) {
      groupBuckets.set(groupTitle, []);
    }
    groupBuckets.get(groupTitle)!.push(raw);
  }

  // Build independent StandingTable per group
  const groupTables: StandingTable[] = [];
  let displayOrder = 1;

  for (const [groupName, groupRawItems] of groupBuckets.entries()) {
    const groupSlug = slugify(groupName);
    const tableId = `table-${competitionId.toLowerCase()}-${groupSlug}-${seasonId}`;

    const normalizedEntries = groupRawItems.map((r, idx) =>
      normalizeRawStandingEntry(r, tableId, idx)
    );
    const sortedEntries = sortStandingEntries(normalizedEntries, ruleset);

    groupTables.push({
      id: tableId,
      competitionId,
      seasonId,
      stageId: targetStage?.id || 'stage-groups',
      groupId: `${targetStage?.id || 'stage-groups'}-${groupSlug}`,
      type: 'GROUP',
      name: groupName,
      slug: groupSlug,
      rulesetId: ruleset.id,
      displayOrder: displayOrder++,
      status: 'IN_PROGRESS',
      entries: sortedEntries,
    });
  }

  // Sort group tables by name/displayOrder (Group A, Group B, Group C...)
  return groupTables.sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Retrieves the specific group standings table for a single group (e.g. 'group-a').
 */
export function getGroupStandings(
  competitionId: string,
  groupSlug: string,
  seasonId = 'default',
  rawStandings: any[] = []
): StandingTable | undefined {
  const allTables = separateProviderStandingsByGroup(rawStandings, competitionId, seasonId);
  const target = groupSlug.trim().toLowerCase();
  return allTables.find((t) => t.slug.toLowerCase() === target || t.name.toLowerCase() === target);
}

/**
 * Retrieves all group tables for a specific stage within a competition.
 */
export function getAllGroupStandingsForStage(
  competitionId: string,
  stageSlug: string,
  seasonId = 'default',
  rawStandings: any[] = []
): StandingTable[] {
  return separateProviderStandingsByGroup(rawStandings, competitionId, seasonId, stageSlug);
}
