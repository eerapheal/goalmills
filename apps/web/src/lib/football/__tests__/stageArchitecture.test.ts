import { describe, it, expect } from 'vitest';
import {
  getStagesForCompetition,
  getStageBySlug,
  getStageGroups,
  getStageKnockoutRounds,
  getGroupBySlug,
  resolveStageForFixture,
  generateAlphabeticGroups,
  generateStandardKnockoutRounds,
} from '../stageService';

describe('Phase 2 — Stage & Group Architecture', () => {
  // ─── Test 1: World Cup 2026 Multi-Group & Knockout Architecture ────────────
  it('correctly builds 12 groups (A to L) and 6 knockout rounds for FIFA World Cup 2026', () => {
    const stages = getStagesForCompetition('FIFA-WORLD-CUP', '2026');
    expect(stages).toHaveLength(2);

    const groupStage = stages.find((s) => s.isGroupStage);
    expect(groupStage).toBeDefined();
    expect(groupStage?.groups).toHaveLength(12);
    expect(groupStage?.groups?.[0].name).toBe('Group A');
    expect(groupStage?.groups?.[0].slug).toBe('group-a');
    expect(groupStage?.groups?.[11].name).toBe('Group L');
    expect(groupStage?.groups?.[11].slug).toBe('group-l');

    const knockoutStage = stages.find((s) => s.isKnockout);
    expect(knockoutStage).toBeDefined();
    expect(knockoutStage?.knockoutRounds?.length).toBeGreaterThanOrEqual(5);

    const roundNames = knockoutStage?.knockoutRounds?.map((r) => r.name);
    expect(roundNames).toContain('Round of 32');
    expect(roundNames).toContain('Round of 16');
    expect(roundNames).toContain('Quarter-finals');
    expect(roundNames).toContain('Semi-finals');
    expect(roundNames).toContain('Final');
  });

  // ─── Test 2: AFCON 6 Groups & Knockout ──────────────────────────────────────
  it('correctly builds 6 groups (A to F) for AFCON group stage', () => {
    const groups = getStageGroups('CAF-AFCON', 'group-stage');
    expect(groups).toHaveLength(6);
    expect(groups.map((g) => g.name)).toEqual([
      'Group A',
      'Group B',
      'Group C',
      'Group D',
      'Group E',
      'Group F',
    ]);
  });

  // ─── Test 3: CAF Champions League Group Stage (4 Groups) ───────────────────
  it('correctly builds 4 groups (A to D) for CAF Champions League', () => {
    const groups = getStageGroups('CAF-CHAMPIONS-LEAGUE', 'group-stage');
    expect(groups).toHaveLength(4);
    expect(groups[0].name).toBe('Group A');
    expect(groups[3].name).toBe('Group D');
  });

  // ─── Test 4: Pure Domestic League Isolation ────────────────────────────────
  it('verifies Premier League has a single stage and zero groups', () => {
    const stages = getStagesForCompetition('ENG-PREMIER-LEAGUE');
    expect(stages).toHaveLength(1);
    expect(stages[0].isGroupStage).toBe(false);
    expect(stages[0].isKnockout).toBe(false);

    const groups = getStageGroups('ENG-PREMIER-LEAGUE', 'regular-season');
    expect(groups).toHaveLength(0);
  });

  // ─── Test 5: Group Lookup by Slug ──────────────────────────────────────────
  it('resolves individual groups by slug without case sensitivity', () => {
    const groupA = getGroupBySlug('FIFA-WORLD-CUP', 'group-a', '2026');
    expect(groupA).toBeDefined();
    expect(groupA?.name).toBe('Group A');
    expect(groupA?.shortName).toBe('A');

    const groupL = getGroupBySlug('FIFA-WORLD-CUP', 'GROUP-L', '2026');
    expect(groupL).toBeDefined();
    expect(groupL?.name).toBe('Group L');
    expect(groupL?.displayOrder).toBe(12);

    const nonExistent = getGroupBySlug('FIFA-WORLD-CUP', 'group-z', '2026');
    expect(nonExistent).toBeUndefined();
  });

  // ─── Test 6: Fixture to Stage Resolution ───────────────────────────────────
  it('strictly maps fixture round and group strings to canonical competition stages', () => {
    // Group stage match
    const groupMatch = { group: 'Group B', event_home_team: 'Brazil', event_away_team: 'Croatia' };
    const resolvedGroupStage = resolveStageForFixture(groupMatch, 'FIFA-WORLD-CUP', '2026');
    expect(resolvedGroupStage?.isGroupStage).toBe(true);
    expect(resolvedGroupStage?.slug).toBe('group-stage');

    // Round of 16 match
    const r16Match = { round: 'Round of 16', event_home_team: 'England', event_away_team: 'Senegal' };
    const resolvedKnockoutStage = resolveStageForFixture(r16Match, 'FIFA-WORLD-CUP', '2026');
    expect(resolvedKnockoutStage?.isKnockout).toBe(true);
    expect(resolvedKnockoutStage?.slug).toBe('knockout-stage');

    // Quarter-finals in CAF Champions League
    const qfMatch = { stage: 'Quarter-finals', event_home_team: 'Al Ahly', event_away_team: 'Mamelodi Sundowns' };
    const resolvedCclQf = resolveStageForFixture(qfMatch, 'CAF-CHAMPIONS-LEAGUE');
    expect(resolvedCclQf?.isKnockout).toBe(true);

    // League Phase in UEFA Champions League 2024/2025
    const leaguePhaseMatch = { stage: 'League Phase', event_home_team: 'Real Madrid', event_away_team: 'Milan' };
    const resolvedUclPhase = resolveStageForFixture(leaguePhaseMatch, 'UEFA-CHAMPIONS-LEAGUE', '2024/2025');
    expect(resolvedUclPhase?.isLeaguePhase).toBe(true);
  });

  // ─── Test 7: Helper Generators Determinism ──────────────────────────────────
  it('generates deterministic group and round structures', () => {
    const groups = generateAlphabeticGroups('stage-1', 3, 4, 2);
    expect(groups).toHaveLength(3);
    expect(groups.map((g) => g.slug)).toEqual(['group-a', 'group-b', 'group-c']);

    const knockoutRounds = generateStandardKnockoutRounds('stage-2', 'QF', 'TWO_LEGGED');
    expect(knockoutRounds).toHaveLength(3);
    expect(knockoutRounds[0].name).toBe('Quarter-finals');
    expect(knockoutRounds[0].legType).toBe('TWO_LEGGED');
    expect(knockoutRounds[2].name).toBe('Final');
    expect(knockoutRounds[2].legType).toBe('SINGLE');
  });
});
