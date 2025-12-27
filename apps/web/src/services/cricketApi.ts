
import {
  CricbuzzAPIClient,
  CricketEvent,
  CricketSeries,
  CricketTeam,
  CricketPlayer,
  CricketScoreboard,
  GetCricketFixturesParams,
  CricketFixturesResponse,
  CricketSeriesResponse,
  GetCricketSeriesParams,
  GetCricketMatchesParams,
  CricketLiveMatchResponse,
  GetCricketMatchInfoParams,
  CricketMatchDetailResponse,
  GetCricketScoreboardParams,
  CricketScoreboardResponse,
  GetCricketSchedulesParams,
  CricketSchedulesResponse,
  CricketTeamsResponse,
  GetCricketTeamsParams,
  GetCricketPlayersParams,
  CricketPlayersResponse,
} from '@goalmills/types';

// Mock Data
const mockTeams: CricketTeam[] = [
  { team_key: '1', team_name: 'India', team_logo: 'https://flagcdn.com/w320/in.png', country_name: 'India', country_key: '1' } as any,
  { team_key: '2', team_name: 'Australia', team_logo: 'https://flagcdn.com/w320/au.png', country_name: 'Australia', country_key: '2' } as any,
  { team_key: '3', team_name: 'England', team_logo: 'https://flagcdn.com/w320/gb-eng.png', country_name: 'England', country_key: '3' } as any,
  { team_key: '4', team_name: 'South Africa', team_logo: 'https://flagcdn.com/w320/za.png', country_name: 'South Africa', country_key: '4' } as any,
  { team_key: '5', team_name: 'New Zealand', team_logo: 'https://flagcdn.com/w320/nz.png', country_name: 'New Zealand', country_key: '5' } as any,
  { team_key: '6', team_name: 'Pakistan', team_logo: 'https://flagcdn.com/w320/pk.png', country_name: 'Pakistan', country_key: '6' } as any,
];

const mockPlayers: CricketPlayer[] = [
  // India
  { player_key: '1', player_name: 'Virat Kohli', team_key: '1', player_type: 'Batsman', player_image: 'https://randomuser.me/api/portraits/men/1.jpg' } as any,
  { player_key: '2', player_name: 'Rohit Sharma', team_key: '1', player_type: 'Batsman', player_image: 'https://randomuser.me/api/portraits/men/2.jpg' } as any,
  // Australia
  { player_key: '12', player_name: 'Pat Cummins', team_key: '2', player_type: 'Bowler', player_image: 'https://randomuser.me/api/portraits/men/12.jpg' } as any,
  { player_key: '13', player_name: 'Steve Smith', team_key: '2', player_type: 'Batsman', player_image: 'https://randomuser.me/api/portraits/men/13.jpg' } as any,
];

const mockSeries: CricketSeries[] = [
  { series_key: '1', series_name: 'Border-Gavaskar Trophy', series_date_start: '2024-11-22', series_date_end: '2025-01-07', series_type: 'Test' } as any,
  { series_key: '2', series_name: 'The Ashes', series_date_start: '2025-06-16', series_date_end: '2025-07-29', series_type: 'Test' } as any,
];

const generateMockMatches = (count: number, status: string, startId: number): CricketEvent[] => {
  return Array.from({ length: count }).map((_, i) => {
    const homeTeam = mockTeams[i % mockTeams.length];
    const awayTeam = mockTeams[(i + 1) % mockTeams.length];
    return {
      event_key: String(startId + i),
      event_date_start: new Date().toISOString(),
      event_home_team: homeTeam.team_name,
      home_team_key: homeTeam.team_key,
      event_away_team: awayTeam.team_name,
      away_team_key: awayTeam.team_key,
      event_status: status,
      event_type: 'T20',
      league_name: 'International',
      league_key: '1',
      event_live: status === 'Live' ? '1' : '0',
    } as any as CricketEvent;
  });
};

const mockLiveMatches = generateMockMatches(3, 'Live', 100);
const mockUpcomingMatches = generateMockMatches(5, 'Upcoming', 200);
const mockRecentMatches = generateMockMatches(5, 'Finished', 300);

class CricketApi implements CricbuzzAPIClient {
  private async simulateDelay() {
    return new Promise(resolve => setTimeout(() => resolve(undefined), 500));
  }

  // Fixtures
  async getFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> {
    await this.simulateDelay();
    return { success: 1, result: [...mockLiveMatches, ...mockUpcomingMatches] };
  }
  async getInternationalFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> { return this.getFixtures(params); }
  async getDomesticFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> { return this.getFixtures(params); }
  async getLeagueFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> { return this.getFixtures(params); }
  async getWomenFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> { return this.getFixtures(params); }

  // Series
  async getSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> {
    await this.simulateDelay();
    return { success: 1, result: mockSeries };
  }
  async getInternationalSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> { return this.getSeries(params); }
  async getDomesticSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> { return this.getSeries(params); }
  async getLeagueSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> { return this.getSeries(params); }
  async getWomenSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> { return this.getSeries(params); }

  async getSeriesMatches(params: { seriesId: number }): Promise<CricketLiveMatchResponse> {
      await this.simulateDelay();
      const matches = [...mockLiveMatches, ...mockUpcomingMatches, ...mockRecentMatches];
      return { success: 1, result: matches };
  }

  // Matches
  async getLiveMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse> {
    await this.simulateDelay();
    return { success: 1, result: mockLiveMatches };
  }
  async getRecentMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse> {
    await this.simulateDelay();
    return { success: 1, result: mockRecentMatches };
  }
  async getUpcomingMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse> {
    await this.simulateDelay();
    return { success: 1, result: mockUpcomingMatches };
  }

  async getFeaturedMatches(limit?: number): Promise<CricketLiveMatchResponse> {
      await this.simulateDelay();
      return { success: 1, result: mockLiveMatches.slice(0, limit || 5) };
  }

  async getImportantMatches(limit?: number): Promise<CricketLiveMatchResponse> {
      await this.simulateDelay();
      return { success: 1, result: mockLiveMatches.slice(0, limit || 5) };
  }
  
  async getMatchInfo(params: GetCricketMatchInfoParams): Promise<CricketMatchDetailResponse> {
    await this.simulateDelay();
    const match = mockLiveMatches[0];
    return {
      success: 1,
      result: match as any // Simplify for now as types likely differ
    } as any;
  }

  async getMatchScoreboard(params: GetCricketScoreboardParams): Promise<CricketScoreboardResponse> {
    await this.simulateDelay();
    return { success: 1, result: {} } as any; 
  }

  // Schedules
  async getSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> {
    await this.simulateDelay();
    return {
        success: 1,
        result: []
    };
  }
  async getInternationalSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> { return this.getSchedules(params); }
  async getDomesticSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> { return this.getSchedules(params); }
  async getLeagueSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> { return this.getSchedules(params); }
  async getWomenSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> { return this.getSchedules(params); }

  // Teams
  async getTeams(): Promise<CricketTeamsResponse> {
    await this.simulateDelay();
    return { success: 1, result: mockTeams };
  }
  async getInternationalTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse> { return this.getTeams(); }
  async getDomesticTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse> { return this.getTeams(); }
  async getLeagueTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse> { return this.getTeams(); }
  async getWomenTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse> { return this.getTeams(); }

  // Players
  async getPlayersByTeamId(params: GetCricketPlayersParams): Promise<CricketPlayersResponse> {
    await this.simulateDelay();
    const players = mockPlayers.filter(p => p.team_key === String(params.teamId));
    return { success: 1, result: players };
  }

  async getBlogPosts() {
      return [];
  }

  async getVideoHighlights() {
      return [];
  }
}

export const cricketApi = new CricketApi();
