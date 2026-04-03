
import {
  CricketLeague,
  CricketTeam,
  CricketEvent,
  CricketStanding,
  CricketLeaguesResponse,
  CricketFixturesResponse,
  CricketLivescoreResponse,
  CricketH2HResponse,
  CricketStandingsResponse,
  CricketTeamsResponse,
  CricketOddsResponse,
  CricketProbabilitiesResponse,
  CricketLiveOddsResponse,
  CricketCommentsResponse,
  CricketVideosResponse,
  CricketLeaguesParams,
  CricketFixturesParams,
  CricketLivescoreParams,
  CricketH2HParams,
  CricketStandingsParams,
  CricketTeamsParams,
  CricketOddsParams,
  CricketProbabilitiesParams,
  CricketLiveOddsParams,
  CricketCommentsParams,
  CricketVideosParams,
  CricketScorecardPlayer,
  CricketComment,
  CricketLineups,
  CricketWicket,
  CricketExtra,
} from '@goalmills/types';


// API Configuration
const API_BASE_URL = 'https://apiv2.allsportsapi.com/cricket';
const API_KEY = 'e51b922070b6a96ce765b6dd06b992a71ab36fd777acd0d744ad281cba968770';

// Helper function to build URL with parameters
const buildUrl = (method: string, params: Record<string, any> = {}): string => {
  const url = new URL(API_BASE_URL);
  url.searchParams.append('met', method);
  url.searchParams.append('APIkey', API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
};

// Helper function to make API requests
async function fetchFromAPI<T>(method: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const url = buildUrl(method, params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status >= 500) {
        console.warn(`Upstream API ${method} failed with ${response.status}. This is likely a temporary issue with the provider.`);
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if ((error as any).message?.includes('500')) {
        // Already warned above
    } else {
        console.warn(`Error fetching ${method}:`, error);
    }
    return { success: 1, result: [] } as unknown as T;
  }
}

// API Implementation
export const advancedCricketApi = {
  /**
   * Get list of supported cricket leagues/competitions
   */
  getLeagues: async (params?: Omit<CricketLeaguesParams, 'met'>): Promise<CricketLeaguesResponse> => {
    return await fetchFromAPI<CricketLeaguesResponse>('Leagues', params || {});
  },

  /**
   * Get cricket fixtures/matches
   */
  getFixtures: async (params: Omit<CricketFixturesParams, 'met'>): Promise<CricketFixturesResponse> => {
    return await fetchFromAPI<CricketFixturesResponse>('Fixtures', params);
  },

  /**
   * Get live cricket matches
   */
  getLivescore: async (params?: Omit<CricketLivescoreParams, 'met'>): Promise<CricketLivescoreResponse> => {
    return await fetchFromAPI<CricketLivescoreResponse>('Livescore', params || {});
  },

  /**
   * Get head to head results between two teams
   */
  getH2H: async (params: Omit<CricketH2HParams, 'met'>): Promise<CricketH2HResponse> => {
    try {
      return await fetchFromAPI<CricketH2HResponse>('H2H', params);
    } catch (error) {
      return {
        success: 1,
        result: {
          H2H: [],
          firstTeamResults: [],
          secondTeamResults: [],
        },
      };
    }
  },

  /**
   * Get league standings
   */
  getStandings: async (params: Omit<CricketStandingsParams, 'met'>): Promise<CricketStandingsResponse> => {
    try {
      const response = await fetchFromAPI<CricketStandingsResponse>('Standings', params);
      return {
        ...response,
        result: {
          total: response.result?.total || response.result || []
        }
      };
    } catch (error) {
      return {
        success: 1,
        result: {
          total: [],
        },
      };
    }
  },

  /**
   * Get teams information
   */
  getTeams: async (params?: Omit<CricketTeamsParams, 'met'>): Promise<CricketTeamsResponse> => {
    return await fetchFromAPI<CricketTeamsResponse>('Teams', params || {});
  },

  /**
   * Get pre-match odds for cricket events
   */
  getOdds: async (params?: Omit<CricketOddsParams, 'met'>): Promise<CricketOddsResponse> => {
    return await fetchFromAPI<CricketOddsResponse>('Odds', params || {});
  },

  /**
   * Get match outcome probabilities
   */
  getProbabilities: async (params: Omit<CricketProbabilitiesParams, 'met'>): Promise<CricketProbabilitiesResponse> => {
    try {
      return await fetchFromAPI<CricketProbabilitiesResponse>('Probabilities', params);
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  /**
   * Get live odds for ongoing events
   */
  getLiveOdds: async (params?: Omit<CricketLiveOddsParams, 'met'>): Promise<CricketLiveOddsResponse> => {
    try {
      return await fetchFromAPI<CricketLiveOddsResponse>('LiveOdds', params || {});
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  /**
   * Get match comments
   */
  getComments: async (params: Omit<CricketCommentsParams, 'met'>): Promise<CricketCommentsResponse> => {
    try {
      return await fetchFromAPI<CricketCommentsResponse>('Comments', params);
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  /**
   * Get match videos/highlights
   */
  getVideos: async (params: Omit<CricketVideosParams, 'met'>): Promise<CricketVideosResponse> => {
    try {
      return await fetchFromAPI<CricketVideosResponse>('Videos', params);
    } catch (error) {
      return { success: 1, result: [] };
    }
  },
};

