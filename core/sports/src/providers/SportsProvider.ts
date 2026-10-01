/**
 * GoalMills Sports Provider Interface
 * Isolates third-party sports data suppliers behind a standardized contract.
 */

import { UnifiedMatch, UnifiedStanding, SportType, LiveEventUpdate } from '../domain/types';

export interface ProviderHealth {
  providerName: string;
  isAvailable: boolean;
  latencyMs: number;
  lastChecked: string;
  errorMessage?: string;
}

export interface FixtureQueryOptions {
  sport: SportType;
  date?: string; // YYYY-MM-DD
  competitionId?: string;
  teamId?: string;
  limit?: number;
}

export interface SportsProvider {
  readonly name: string;
  readonly supportedSports: SportType[];

  /**
   * Health check for upstream API readiness
   */
  checkHealth(): Promise<ProviderHealth>;

  /**
   * Fetch currently active live matches
   */
  getLiveMatches(sport: SportType): Promise<UnifiedMatch[]>;

  /**
   * Fetch scheduled fixtures for a given date or competition
   */
  getFixtures(options: FixtureQueryOptions): Promise<UnifiedMatch[]>;

  /**
   * Fetch detailed match center data including lineups, timeline, and stats
   */
  getMatchDetails(matchId: string, sport: SportType): Promise<UnifiedMatch | null>;

  /**
   * Fetch league/tournament standings
   */
  getStandings(competitionId: string, sport: SportType): Promise<UnifiedStanding[]>;

  /**
   * Stream or poll live match events (goals, cards, wickets)
   */
  getLiveEvents?(matchId: string, sport: SportType): Promise<LiveEventUpdate[]>;
}
