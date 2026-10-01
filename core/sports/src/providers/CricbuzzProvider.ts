/**
 * Cricbuzz RapidAPI Provider Adapter
 * Implements SportsProvider interface for Cricket ingestion.
 */

import { SportsProvider, ProviderHealth, FixtureQueryOptions } from './SportsProvider';
import { UnifiedMatch, UnifiedStanding, SportType } from '../domain/types';

export class CricbuzzProvider implements SportsProvider {
  public readonly name = 'Cricbuzz';
  public readonly supportedSports: SportType[] = ['cricket'];

  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey = process.env.CRICKET_API_KEY || '', baseUrl = 'https://cricbuzz-cricket.p.rapidapi.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  public async checkHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    return {
      providerName: this.name,
      isAvailable: Boolean(this.apiKey),
      latencyMs: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  }

  public async getLiveMatches(sport: SportType): Promise<UnifiedMatch[]> {
    if (sport !== 'cricket') return [];
    return [];
  }

  public async getFixtures(options: FixtureQueryOptions): Promise<UnifiedMatch[]> {
    if (options.sport !== 'cricket') return [];
    return [];
  }

  public async getMatchDetails(matchId: string, sport: SportType): Promise<UnifiedMatch | null> {
    if (sport !== 'cricket') return null;
    return null;
  }

  public async getStandings(competitionId: string, sport: SportType): Promise<UnifiedStanding[]> {
    if (sport !== 'cricket') return [];
    return [];
  }
}
