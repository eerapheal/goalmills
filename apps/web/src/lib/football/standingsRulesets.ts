import { StandingsRuleset } from '@goalmills/types';

/**
 * Standard Standings Rulesets and Tiebreaker Hierarchies for GoalMills.
 * Points and ranking regulations are explicitly configurable per competition/season.
 */
export const STANDINGS_RULESETS: Record<string, StandingsRuleset> = {
  // Standard Domestic League: Points -> Goal Difference -> Goals Scored -> H2H -> Playoff
  'RULESET-STANDARD-3PT': {
    id: 'RULESET-STANDARD-3PT',
    name: 'Standard 3-Point Goal Difference (EPL/Bundesliga/Ligue 1)',
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    tiebreakers: [
      'POINTS',
      'GOAL_DIFFERENCE',
      'GOALS_FOR',
      'HEAD_TO_HEAD',
      'PLAYOFF',
    ],
    rankingDirection: 'DESC',
  },

  // Head-to-Head First (La Liga, Serie A): Points -> H2H -> H2H GD -> Overall GD -> Overall GF
  'RULESET-H2H-FIRST': {
    id: 'RULESET-H2H-FIRST',
    name: 'Head-to-Head First (La Liga / Serie A)',
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    tiebreakers: [
      'POINTS',
      'HEAD_TO_HEAD',
      'HEAD_TO_HEAD_GOAL_DIFFERENCE',
      'GOAL_DIFFERENCE',
      'GOALS_FOR',
      'DISCIPLINARY_POINTS',
    ],
    rankingDirection: 'DESC',
  },

  // UEFA League Phase (New single 36-team table format from 2024/25)
  'RULESET-UEFA-LEAGUE-PHASE': {
    id: 'RULESET-UEFA-LEAGUE-PHASE',
    name: 'UEFA League Phase 36-Team System',
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    tiebreakers: [
      'POINTS',
      'GOAL_DIFFERENCE',
      'GOALS_FOR',
      'AWAY_GOALS',
      'WINS',
      'DISCIPLINARY_POINTS',
    ],
    rankingDirection: 'DESC',
  },

  // FIFA World Cup Group Stages: Points -> GD -> GF -> H2H -> Disciplinary -> Drawing of Lots
  'RULESET-FIFA-TOURNAMENT': {
    id: 'RULESET-FIFA-TOURNAMENT',
    name: 'FIFA World Cup Group Stage Ruleset',
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    tiebreakers: [
      'POINTS',
      'GOAL_DIFFERENCE',
      'GOALS_FOR',
      'HEAD_TO_HEAD',
      'HEAD_TO_HEAD_GOAL_DIFFERENCE',
      'HEAD_TO_HEAD_AWAY_GOALS',
      'DISCIPLINARY_POINTS',
      'DRAWING_OF_LOTS',
    ],
    rankingDirection: 'DESC',
  },

  // CAF Champions League & AFCON Group Stages: Points -> H2H -> H2H GD -> H2H Away Goals -> Overall GD
  'RULESET-CAF-GROUP-STAGE': {
    id: 'RULESET-CAF-GROUP-STAGE',
    name: 'CAF Group Stage Ruleset',
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    tiebreakers: [
      'POINTS',
      'HEAD_TO_HEAD',
      'HEAD_TO_HEAD_GOAL_DIFFERENCE',
      'HEAD_TO_HEAD_AWAY_GOALS',
      'GOAL_DIFFERENCE',
      'GOALS_FOR',
      'DRAWING_OF_LOTS',
    ],
    rankingDirection: 'DESC',
  },

  // Pure Knockout Tournaments (FA Cup, Copa del Rey, etc. - no standings points)
  'RULESET-KNOCKOUT': {
    id: 'RULESET-KNOCKOUT',
    name: 'Knockout Elimination (No Table)',
    winPoints: 0,
    drawPoints: 0,
    lossPoints: 0,
    tiebreakers: ['PLAYOFF'],
    rankingDirection: 'DESC',
  },
};

/**
 * Resolves a StandingsRuleset by ID, defaulting to standard 3-point system if not found.
 */
export function getStandingsRulesetById(rulesetId?: string): StandingsRuleset {
  if (rulesetId && STANDINGS_RULESETS[rulesetId]) {
    return STANDINGS_RULESETS[rulesetId];
  }
  return STANDINGS_RULESETS['RULESET-STANDARD-3PT'];
}
