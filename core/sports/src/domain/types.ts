/**
 * GoalMills Core Sports Domain — Types & Scalar Enums
 * Defines the canonical data structures for all sports supported across the platform.
 */

export type SportType = 'football' | 'cricket' | 'basketball' | 'tennis' | 'baseball' | 'hockey';

export type MatchStatus = 
  | 'LIVE' 
  | 'FT' 
  | 'HT' 
  | 'UPCOMING' 
  | 'PPD' 
  | 'CANC' 
  | 'AET' 
  | 'PEN'
  | 'IN_PROGRESS'
  | 'DELAYED';

export type MatchPeriod = 
  | 'PRE_MATCH' 
  | 'FIRST_HALF' 
  | 'HALF_TIME' 
  | 'SECOND_HALF' 
  | 'EXTRA_TIME' 
  | 'PENALTIES' 
  | 'FULL_TIME' 
  | 'INNINGS_1' 
  | 'INNINGS_2' 
  | 'Q1' 
  | 'Q2' 
  | 'Q3' 
  | 'Q4' 
  | 'OVERTIME';

export interface ScoreState {
  home: number | string | null;
  away: number | string | null;
  period?: string;
  minute?: number | string | null;
  extraTime?: string;
  penalties?: {
    home: number;
    away: number;
  };
}

export interface UnifiedTeam {
  id: string;
  name: string;
  shortName?: string;
  code?: string;
  logo: string;
  country?: string;
  gender?: 'MALE' | 'FEMALE';
}

export interface UnifiedCompetition {
  id: string;
  name: string;
  slug: string;
  sport: SportType;
  category: string;
  country?: string;
  countryCode?: string;
  flag?: string;
  logo?: string;
  tier?: number | string;
  isDomestic?: boolean;
}

export interface UnifiedMatch {
  id: string;
  canonicalId: string;
  sport: SportType;
  status: MatchStatus;
  period?: MatchPeriod;
  minute?: number | string | null;
  startTime: string; // ISO 8601
  date: string; // YYYY-MM-DD
  competition: UnifiedCompetition;
  homeTeam: UnifiedTeam;
  awayTeam: UnifiedTeam;
  score: ScoreState;
  venue?: {
    name: string;
    city?: string;
    capacity?: number;
  };
  referee?: {
    name: string;
    country?: string;
  };
  provider: string;
  providerEventId: string;
  lastUpdated: string;
}

export interface UnifiedStanding {
  position: number;
  team: UnifiedTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[]; // e.g. ['W', 'D', 'L', 'W', 'W']
  zone?: 'champions' | 'europa' | 'conference' | 'relegation' | 'playoff' | 'default';
  description?: string;
}

export interface LiveEventUpdate {
  eventId: string;
  matchId: string;
  sport: SportType;
  minute: number | string;
  type: 'GOAL' | 'CARD_YELLOW' | 'CARD_RED' | 'SUBSTITUTION' | 'VAR' | 'WICKET' | 'SIX' | 'FOUR' | 'BASKET' | 'FOUL';
  teamId?: string;
  playerId?: string;
  playerName?: string;
  detail?: string;
  scoreSnapshot?: ScoreState;
  timestamp: string;
}
