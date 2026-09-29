import { describe, it, expect } from 'vitest';
import {
  getCompetitionFormat,
  getCompetitionStages,
  getStageById,
  getStandingsRulesetForCompetition,
  isLeagueCompetition,
  hasGroupStage,
  hasKnockoutStage,
  hasLeaguePhase,
  determineCompetitionFormatType,
  getStandingsRulesetById,
} from '../competitionFormatEngine';

describe('Phase 1 — Competition Format Engine', () => {
  // ─── Test 1: Premier League Pure Domestic League Format ─────────────────────
  it('correctly classifies Premier League as a pure LEAGUE with single standings table', () => {
    const format = getCompetitionFormat('ENG-PREMIER-LEAGUE');

    expect(format.formatType).toBe('LEAGUE');
    expect(format.hasLeagueTable).toBe(true);
    expect(format.hasGroups).toBe(false);
    expect(format.hasKnockout).toBe(false);

    expect(isLeagueCompetition('ENG-PREMIER-LEAGUE')).toBe(true);
    expect(hasGroupStage('ENG-PREMIER-LEAGUE')).toBe(false);
    expect(hasKnockoutStage('ENG-PREMIER-LEAGUE')).toBe(false);
    expect(hasLeaguePhase('ENG-PREMIER-LEAGUE')).toBe(false);

    const stages = getCompetitionStages('ENG-PREMIER-LEAGUE');
    expect(stages).toHaveLength(1);
    expect(stages[0].type).toBe('LEAGUE');
    expect(stages[0].isGroupStage).toBe(false);
    expect(stages[0].isKnockout).toBe(false);
  });

  // ─── Test 2: FA Cup Pure Knockout Tournament ────────────────────────────────
  it('correctly classifies FA Cup as a KNOCKOUT tournament with zero league table', () => {
    const format = getCompetitionFormat('ENG-FA-CUP');

    expect(format.formatType).toBe('KNOCKOUT');
    expect(format.hasLeagueTable).toBe(false);
    expect(format.hasGroups).toBe(false);
    expect(format.hasKnockout).toBe(true);

    expect(isLeagueCompetition('ENG-FA-CUP')).toBe(false);
    expect(hasKnockoutStage('ENG-FA-CUP')).toBe(true);
    expect(hasGroupStage('ENG-FA-CUP')).toBe(false);

    const ruleset = getStandingsRulesetForCompetition('ENG-FA-CUP');
    expect(ruleset.id).toBe('RULESET-KNOCKOUT');
    expect(ruleset.winPoints).toBe(0);
  });

  // ─── Test 3: FIFA World Cup 2026 Hybrid Format ──────────────────────────────
  it('correctly classifies FIFA World Cup 2026 as HYBRID with 12 groups and knockout', () => {
    const format = getCompetitionFormat('FIFA-WORLD-CUP', '2026');

    expect(format.formatType).toBe('HYBRID');
    expect(format.hasGroups).toBe(true);
    expect(format.hasKnockout).toBe(true);
    expect(format.hasLeagueTable).toBe(false);

    const stages = getCompetitionStages('FIFA-WORLD-CUP', '2026');
    expect(stages).toHaveLength(2);

    const groupStage = stages.find((s) => s.isGroupStage);
    expect(groupStage).toBeDefined();
    expect(groupStage?.groupsCount).toBe(12);
    expect(groupStage?.advancingTeamsCount).toBe(32);

    const knockoutStage = stages.find((s) => s.isKnockout);
    expect(knockoutStage).toBeDefined();
    expect(knockoutStage?.type).toBe('KNOCKOUT');
  });

  // ─── Test 4: CAF Champions League Hybrid Format ─────────────────────────────
  it('correctly classifies CAF Champions League as HYBRID with Group Stage and Knockout', () => {
    const format = getCompetitionFormat('CAF-CHAMPIONS-LEAGUE');

    expect(format.formatType).toBe('HYBRID');
    expect(format.hasGroups).toBe(true);
    expect(format.hasKnockout).toBe(true);

    const stages = getCompetitionStages('CAF-CHAMPIONS-LEAGUE');
    expect(stages.length).toBeGreaterThanOrEqual(2);

    const groupStage = stages.find((s) => s.type === 'GROUP_STAGE');
    expect(groupStage?.groupsCount).toBe(4);
    expect(groupStage?.advancingTeamsCount).toBe(8);

    const ruleset = getStandingsRulesetForCompetition('CAF-CHAMPIONS-LEAGUE');
    expect(ruleset.id).toBe('RULESET-CAF-GROUP-STAGE');
    expect(ruleset.tiebreakers[1]).toBe('HEAD_TO_HEAD');
  });

  // ─── Test 5: Season-Specific Format Evolution (UEFA Champions League) ───────
  it('strictly handles season-specific format changes between 2023/24 (Groups) and 2024/25+ (League Phase)', () => {
    // 2023/2024: 8 Groups of 4 (Historic)
    const historicFormat = getCompetitionFormat('UEFA-CHAMPIONS-LEAGUE', '2023/2024');
    expect(historicFormat.formatType).toBe('HYBRID');
    expect(historicFormat.hasGroups).toBe(true);
    expect(historicFormat.hasLeagueTable).toBe(false);
    expect(historicFormat.stages[0].type).toBe('GROUP_STAGE');
    expect(historicFormat.stages[0].groupsCount).toBe(8);

    // 2024/2025 onwards: Single 36-team Swiss League Phase table
    const modernFormat = getCompetitionFormat('UEFA-CHAMPIONS-LEAGUE', '2024/2025');
    expect(modernFormat.formatType).toBe('HYBRID');
    expect(modernFormat.hasGroups).toBe(false);
    expect(modernFormat.hasLeagueTable).toBe(true);
    expect(modernFormat.stages[0].type).toBe('LEAGUE_PHASE');
    expect(modernFormat.stages[0].isLeaguePhase).toBe(true);

    expect(hasLeaguePhase('UEFA-CHAMPIONS-LEAGUE', '2024/2025')).toBe(true);
    expect(hasLeaguePhase('UEFA-CHAMPIONS-LEAGUE', '2023/2024')).toBe(false);
  });

  // ─── Test 6: Ruleset Differences and Tiebreaker Sequences ───────────────────
  it('correctly resolves distinct rulesets for Premier League (GD) vs La Liga (H2H)', () => {
    const eplRuleset = getStandingsRulesetForCompetition('ENG-PREMIER-LEAGUE');
    expect(eplRuleset.tiebreakers[0]).toBe('POINTS');
    expect(eplRuleset.tiebreakers[1]).toBe('GOAL_DIFFERENCE');
    expect(eplRuleset.tiebreakers[2]).toBe('GOALS_FOR');

    const laLigaRuleset = getStandingsRulesetForCompetition('ESP-LA-LIGA');
    expect(laLigaRuleset.tiebreakers[0]).toBe('POINTS');
    expect(laLigaRuleset.tiebreakers[1]).toBe('HEAD_TO_HEAD');
    expect(laLigaRuleset.tiebreakers[2]).toBe('HEAD_TO_HEAD_GOAL_DIFFERENCE');
  });

  // ─── Test 7: Stage Resolution by ID and Slug ────────────────────────────────
  it('resolves stages by ID or slug without case sensitivity', () => {
    const stageBySlug = getStageById('ENG-PREMIER-LEAGUE', 'regular-season');
    expect(stageBySlug).toBeDefined();
    expect(stageBySlug?.type).toBe('LEAGUE');

    const stageById = getStageById('ENG-PREMIER-LEAGUE', 'stage-epl-league');
    expect(stageById).toBeDefined();
    expect(stageById?.name).toBe('Regular Season');

    const nonExistent = getStageById('ENG-PREMIER-LEAGUE', 'non-existent-stage');
    expect(nonExistent).toBeUndefined();
  });

  // ─── Test 8: Deterministic Fallback for Arbitrary / Unregistered Competitions ─
  it('provides deterministic fallbacks without guessing or crashing on unconfigured competitions', () => {
    const fallbackLeague = getCompetitionFormat('RANDOM-DOMESTIC-LEAGUE');
    expect(fallbackLeague.formatType).toBe('LEAGUE');
    expect(fallbackLeague.hasLeagueTable).toBe(true);

    const fallbackCup = getCompetitionFormat('GER-DFB-POKAL');
    expect(fallbackCup.formatType).toBe('KNOCKOUT');
    expect(fallbackCup.hasKnockout).toBe(true);

    const fallbackAfcon = determineCompetitionFormatType('CAF-AFCON');
    expect(fallbackAfcon).toBe('HYBRID');
  });
});
