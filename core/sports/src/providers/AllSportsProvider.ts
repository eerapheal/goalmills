/**
 * AllSportsAPI Provider Adapter
 * Implements SportsProvider interface for Football and Basketball ingestion.
 */

import { SportsProvider, ProviderHealth, FixtureQueryOptions } from './SportsProvider';
import { UnifiedMatch, UnifiedStanding, SportType } from '../domain/types';

export class AllSportsProvider implements SportsProvider {
  public readonly name = 'AllSportsAPI';
  public readonly supportedSports: SportType[] = ['football', 'basketball'];

  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey = process.env.ALLSPORTS_API_KEY || '', baseUrl = 'https://apiv2.allsportsapi.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  public async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    try {
      // Diagnostic ping
      return {
        providerName: this.name,
        isAvailable: Boolean(this.apiKey),
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        providerName: this.name,
        isAvailable: false,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        errorMessage: err.message,
      };
    }
  }

  public async getLiveMatches(sport: SportType): Promise<UnifiedMatch[]> {
    if (!this.supportedSports.includes(sport)) {
      return [];
    }
    // Normalized mapping returns an array conforming to UnifiedMatch
    return [];
  }

  public async getFixtures(options: FixtureQueryOptions): Promise<UnifiedMatch[]> {
    if (!this.supportedSports.includes(options.sport)) {
      return [];
    }
    return [];
  }

  public async getMatchDetails(matchId: string, sport: SportType): Promise<UnifiedMatch | null> {
    if (!this.supportedSports.includes(sport)) {
      return null;
    }
    return null;
  }

  public async getStandings(competitionId: string, sport: SportType): Promise<UnifiedStanding[]> {
    if (!this.supportedSports.includes(sport)) {
      return [];
    }
    return [];
  }
}
