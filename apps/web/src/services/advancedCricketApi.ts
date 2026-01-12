
import {
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
} from '@goalmills/types';

// API Configuration
const API_PROXY_URL = '/api/cricket';

/**
 * Professional Cricket API Client
 * Implements all endpoints from the All Sports API Cricket documentation
 */

// Helper function to build URL with parameters
const buildUrl = (method: string, params: Record<string, any> = {}): string => {
  const url = new URL(API_PROXY_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  url.searchParams.append('met', method);
  
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
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${method}:`, error);
    throw error;
  }
}

export const advancedCricketApi = {
  /**
   * Get list of supported cricket leagues/competitions
   */
  getLeagues: async (params?: Omit<CricketLeaguesParams, 'met'>): Promise<CricketLeaguesResponse> => {
    try {
      return await fetchFromAPI<CricketLeaguesResponse>('Leagues', params || {});
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get cricket fixtures/matches with full details (scorecard, commentary, etc.)
   */
  getFixtures: async (params: Omit<CricketFixturesParams, 'met'>): Promise<CricketFixturesResponse> => {
    try {
      return await fetchFromAPI<CricketFixturesResponse>('Fixtures', params);
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get live cricket matches currently playing
   */
  getLivescore: async (params?: Omit<CricketLivescoreParams, 'met'>): Promise<CricketLivescoreResponse> => {
    try {
      return await fetchFromAPI<CricketLivescoreResponse>('Livescore', params || {});
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get head to head results between two specific teams
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
   * Get competitive standings for a specific league or season
   */
  getStandings: async (params: Omit<CricketStandingsParams, 'met'>): Promise<CricketStandingsResponse> => {
    try {
      const response = await fetchFromAPI<CricketStandingsResponse>('Standings', params);
      return {
        ...response,
        result: {
          total: response.result?.total || []
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
   * Get detailed team information and metadata
   */
  getTeams: async (params?: Omit<CricketTeamsParams, 'met'>): Promise<CricketTeamsResponse> => {
    try {
      return await fetchFromAPI<CricketTeamsResponse>('Teams', params || {});
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get market odds for cricket match outcomes
   */
  getOdds: async (params?: Omit<CricketOddsParams, 'met'>): Promise<CricketOddsResponse> => {
    try {
      return await fetchFromAPI<CricketOddsResponse>('Odds', params || {});
    } catch (error) {
      return { success: 1, result: {} };
    }
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

  /**
   * Global utility to get formatted date strings
   */
  getFormattedDate: (offset: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  }
};
