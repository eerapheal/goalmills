/**
 * GoalMills Core Sports — Basketball Sub-domain
 */

export interface BasketballQuarterScores {
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  ot?: number;
}

export interface BasketballMatchSummary {
  matchId: string;
  league: string;
  status: string;
  period?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarterScores?: {
    home: BasketballQuarterScores;
    away: BasketballQuarterScores;
  };
}

export * from './normalizer';
