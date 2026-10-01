/**
 * GoalMills Core Sports — Cricket Sub-domain
 */

export interface CricketInningsScore {
  teamName: string;
  runs: number;
  wickets: number;
  overs: number | string;
  isDeclared?: boolean;
}

export interface CricketMatchSummary {
  matchId: string;
  seriesName: string;
  format: 'T20' | 'ODI' | 'TEST';
  status: string;
  team1: string;
  team2: string;
  scores: {
    team1?: CricketInningsScore[];
    team2?: CricketInningsScore[];
  };
  resultNote?: string;
}
