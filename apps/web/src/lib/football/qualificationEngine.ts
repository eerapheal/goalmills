import {
  QualificationRule,
  StandingEntry,
  StandingTable,
  StandingsRuleset,
} from '@goalmills/types';
import { getStandingsRulesetById } from './standingsRulesets';
import { sortStandingEntries } from './groupStandingsEngine';

/**
 * Registry of qualification and advancement rules per competition.
 */
export const QUALIFICATION_RULES_REGISTRY: Record<string, QualificationRule[]> = {
  // FIFA World Cup 2026: 12 Groups of 4. Top 2 in each group (24) + top 8 third-place (8) = 32 teams in R32
  'FIFA-WORLD-CUP:2026': [
    { targetPosition: 1, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'round-of-32', label: 'Advances to Round of 32' },
    { targetPosition: 2, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'round-of-32', label: 'Advances to Round of 32' },
    { targetPosition: 3, ruleType: 'PLAYOFF', destinationRoundSlug: 'round-of-32', label: 'Possible Round of 32 (Top 8 3rd Place)', isWildcardThirdPlace: true },
  ],

  // AFCON: 6 Groups of 4. Top 2 in each group (12) + top 4 third-place (4) = 16 teams in R16
  'CAF-AFCON:default': [
    { targetPosition: 1, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'round-of-16', label: 'Advances to Round of 16' },
    { targetPosition: 2, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'round-of-16', label: 'Advances to Round of 16' },
    { targetPosition: 3, ruleType: 'PLAYOFF', destinationRoundSlug: 'round-of-16', label: 'Possible Round of 16 (Top 4 3rd Place)', isWildcardThirdPlace: true },
  ],

  // CAF Champions League: 4 Groups of 4. Top 2 in each group advance to Quarter-finals (8 teams)
  'CAF-CHAMPIONS-LEAGUE:default': [
    { targetPosition: 1, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'quarter-finals', label: 'Advances to Quarter-finals' },
    { targetPosition: 2, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'quarter-finals', label: 'Advances to Quarter-finals' },
  ],

  // UEFA Champions League 2024+ (Single 36-team Swiss League Phase):
  // 1st–8th -> Round of 16
  // 9th–24th -> Knockout Play-offs
  // 25th–36th -> Eliminated
  'UEFA-CHAMPIONS-LEAGUE:default': [
    { targetPosition: 1, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'round-of-16', label: 'Round of 16 (Top 8)' },
    { targetPosition: 8, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'round-of-16', label: 'Round of 16 (Top 8)' },
    { targetPosition: 9, ruleType: 'PLAYOFF', destinationRoundSlug: 'play-offs', label: 'Knockout Play-offs (9th–24th)' },
    { targetPosition: 24, ruleType: 'PLAYOFF', destinationRoundSlug: 'play-offs', label: 'Knockout Play-offs (9th–24th)' },
  ],

  // Premier League Standard:
  // 1st–4th: Champions League
  // 5th: Europa League
  // 18th–20th: Relegation
  'ENG-PREMIER-LEAGUE:default': [
    { targetPosition: 1, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'ucl', label: 'Champions League' },
    { targetPosition: 4, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'ucl', label: 'Champions League' },
    { targetPosition: 5, ruleType: 'AUTOMATIC_QUALIFICATION', destinationRoundSlug: 'uel', label: 'Europa League' },
    { targetPosition: 18, ruleType: 'RELEGATION', destinationRoundSlug: 'championship', label: 'Relegation to Championship' },
    { targetPosition: 20, ruleType: 'RELEGATION', destinationRoundSlug: 'championship', label: 'Relegation to Championship' },
  ],
};

/**
 * Retrieves the qualification rules for a competition and season.
 */
export function getCompetitionQualificationRules(
  competitionId: string,
  seasonId = 'default'
): QualificationRule[] {
  const exactKey = `${competitionId.toUpperCase()}:${seasonId}`;
  if (QUALIFICATION_RULES_REGISTRY[exactKey]) {
    return QUALIFICATION_RULES_REGISTRY[exactKey];
  }

  const defaultKey = `${competitionId.toUpperCase()}:default`;
  if (QUALIFICATION_RULES_REGISTRY[defaultKey]) {
    return QUALIFICATION_RULES_REGISTRY[defaultKey];
  }

  // Standard tournament fallback: Top 2 advance
  return [
    { targetPosition: 1, ruleType: 'AUTOMATIC_QUALIFICATION', label: 'Qualified' },
    { targetPosition: 2, ruleType: 'AUTOMATIC_QUALIFICATION', label: 'Qualified' },
  ];
}

/**
 * Evaluates the qualification status for a given standing table position.
 */
export function determineEntryQualification(
  position: number,
  rules: QualificationRule[],
  totalTeams = 4
): 'QUALIFIED' | 'PLAYOFF' | 'ELIMINATED' | 'PENDING' {
  if (position <= 0) return 'PENDING';

  for (const rule of rules) {
    if (rule.targetPosition === position) {
      if (rule.ruleType === 'AUTOMATIC_QUALIFICATION') return 'QUALIFIED';
      if (rule.ruleType === 'PLAYOFF') return 'PLAYOFF';
      if (rule.ruleType === 'RELEGATION') return 'ELIMINATED';
    }
  }

  // Top 2 default qualification if simple bracket
  if (rules.some((r) => r.targetPosition === 2 && r.ruleType === 'AUTOMATIC_QUALIFICATION')) {
    if (position <= 2) return 'QUALIFIED';
    if (position === 3 && rules.some((r) => r.targetPosition === 3 && r.ruleType === 'PLAYOFF')) {
      return 'PLAYOFF';
    }
    return 'ELIMINATED';
  }

  return position >= totalTeams ? 'ELIMINATED' : 'PENDING';
}

/**
 * Ranks all 3rd-placed teams across multiple tournament groups (e.g., World Cup 2026, AFCON)
 * using standard tiebreakers to determine who qualifies for the knockout phase.
 */
export function resolveWildcardThirdPlaceRanking(
  thirdPlaceEntries: StandingEntry[],
  countToAdvance: number,
  ruleset?: StandingsRuleset
): {
  ranked: StandingEntry[];
  qualified: StandingEntry[];
  eliminated: StandingEntry[];
} {
  const activeRuleset = ruleset || getStandingsRulesetById('RULESET-STANDARD-3PT');
  const sorted = sortStandingEntries(thirdPlaceEntries, activeRuleset);

  const qualified: StandingEntry[] = [];
  const eliminated: StandingEntry[] = [];

  sorted.forEach((entry, idx) => {
    if (idx < countToAdvance) {
      qualified.push({ ...entry, qualificationStatus: 'QUALIFIED' });
    } else {
      eliminated.push({ ...entry, qualificationStatus: 'ELIMINATED' });
    }
  });

  return {
    ranked: [...qualified, ...eliminated],
    qualified,
    eliminated,
  };
}
