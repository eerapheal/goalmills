/**
 * Complete AllSportsAPI Basketball v2.0 Enterprise Service Client for GoalMills Web
 * Implements ALL official AllSportsAPI basketball endpoints and dynamic query parameters.
 * Requests are securely proxied through the internal `/api/basketball` route to safeguard provider credentials.
 */

import {
  BasketballCountry,
  BasketballLeague,
  BasketballEvent,
  BasketballStanding,
  BasketballTeam,
  BasketballPlayer,
  BasketballVideo,
  BasketballMatchOdds,
  BasketballCountriesResponse,
  BasketballLeaguesResponse,
  BasketballFixturesResponse,
  BasketballH2HResponse,
  BasketballLivescoreResponse,
  BasketballStandingsResponse,
  BasketballTeamsResponse,
  BasketballPlayersResponse,
  BasketballVideosResponse,
  BasketballOddsResponse,
  BasketballCountriesParams,
  BasketballLeaguesParams,
  BasketballFixturesParams,
  BasketballH2HParams,
  BasketballLivescoreParams,
  BasketballStandingsParams,
  BasketballTeamsParams,
  BasketballPlayersParams,
  BasketballVideosParams,
  BasketballOddsParams,
} from '@goalmills/types';

// API Configuration - Using Next.js API route as proxy to avoid CORS and protect API credentials
const API_PROXY_URL = '/api/basketball';

/**
 * Helper function to build proxy URL with dynamic parameters
 */
const buildUrl = (method: string, params: Record<string, any> = {}): string => {
  const url = new URL(
    API_PROXY_URL,
    typeof window !== 'undefined' ? window.location.origin : 'https://goalmills-web.vercel.app'
  );
  url.searchParams.append('met', method);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  return url.toString();
};

/**
 * Helper function to execute API requests with error resilience
 */
async function fetchFromAPI<T>(method: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const url = buildUrl(method, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Basketball API] Error ${response.status} for ${method}:`, errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Basketball API] Error fetching ${method}:`, error);
    throw error;
  }
}

/**
 * AllSportsAPI Basketball Enterprise Service
 */
export const basketballApi = {
  /**
   * 1. Countries Endpoint
   * Returns list of supported countries
   */
  async getCountries(
    params: Partial<Omit<BasketballCountriesParams, 'met'>> = {}
  ): Promise<BasketballCountriesResponse> {
    return fetchFromAPI<BasketballCountriesResponse>('Countries', params);
  },

  /**
   * 2. Leagues Endpoint
   * Returns list of supported competitions / leagues
   */
  async getLeagues(
    params: Partial<Omit<BasketballLeaguesParams, 'met'>> = {}
  ): Promise<BasketballLeaguesResponse> {
    return fetchFromAPI<BasketballLeaguesResponse>('Leagues', params);
  },

  /**
   * 3. Fixtures Endpoint
   * Returns scheduled or completed fixtures based on date range, league, team, or match ID
   */
  async getFixtures(
    params: Partial<Omit<BasketballFixturesParams, 'met'>> = {}
  ): Promise<BasketballFixturesResponse> {
    const p: Record<string, any> = { ...params };
    // If no dates provided and no matchId/teamId provided, default to today
    if (!p.from && !p.to && !p.matchId) {
      const today = new Date().toISOString().split('T')[0];
      p.from = today;
      p.to = today;
    }
    return fetchFromAPI<BasketballFixturesResponse>('Fixtures', p);
  },

  /**
   * 4. Livescore Endpoint
   * Returns playing now basketball events
   */
  async getLivescore(
    params: Partial<Omit<BasketballLivescoreParams, 'met'>> = {}
  ): Promise<BasketballLivescoreResponse> {
    return fetchFromAPI<BasketballLivescoreResponse>('Livescore', params);
  },

  /**
   * 5. H2H (Head to Head) Endpoint
   * Returns historical matches between two teams and their recent results
   */
  async getH2H(params: Omit<BasketballH2HParams, 'met'>): Promise<BasketballH2HResponse> {
    return fetchFromAPI<BasketballH2HResponse>('H2H', params);
  },

  /**
   * 6. Standings Endpoint
   * Returns league standings for a specific league ID (default: 766 for NBA)
   */
  async getStandings(
    params: Partial<Omit<BasketballStandingsParams, 'met'>> = {}
  ): Promise<BasketballStandingsResponse> {
    const leagueId = params.leagueId || 766;
    return fetchFromAPI<BasketballStandingsResponse>('Standings', { leagueId });
  },

  /**
   * 7. Teams Endpoint
   * Returns teams for a league or a specific team by team ID
   */
  async getTeams(
    params: Partial<Omit<BasketballTeamsParams, 'met'>> = {}
  ): Promise<BasketballTeamsResponse> {
    return fetchFromAPI<BasketballTeamsResponse>('Teams', params);
  },

  /**
   * 8. Players Endpoint
   * Returns squad players by team ID or player details by player ID
   */
  async getPlayers(
    params: Partial<Omit<BasketballPlayersParams, 'met'>> = {}
  ): Promise<BasketballPlayersResponse> {
    return fetchFromAPI<BasketballPlayersResponse>('Players', params);
  },

  /**
   * 9. Odds Endpoint
   * Returns betting odds for events (matchId, leagueId, or date range)
   */
  async getOdds(
    params: Partial<Omit<BasketballOddsParams, 'met'>> = {}
  ): Promise<BasketballOddsResponse> {
    return fetchFromAPI<BasketballOddsResponse>('Odds', params);
  },

  /**
   * 10. Videos Endpoint
   * Returns highlight video clips for an event
   */
  async getVideos(
    params: Partial<Omit<BasketballVideosParams, 'met'>> = {}
  ): Promise<BasketballVideosResponse> {
    return fetchFromAPI<BasketballVideosResponse>('Videos', params);
  },

  // ─── High-Level Convenience Helpers ──────────────────────────────────────────

  /**
   * Fetch currently live basketball games
   */
  async getLiveGames(): Promise<BasketballEvent[]> {
    try {
      const res = await this.getLivescore();
      return Array.isArray(res?.result) ? res.result : [];
    } catch (err) {
      console.warn('[Basketball API] getLiveGames error:', err);
      return [];
    }
  },

  /**
   * Fetch games for a specific calendar date (YYYY-MM-DD)
   */
  async getGamesByDate(date: string, timezone?: string): Promise<BasketballEvent[]> {
    try {
      const res = await this.getFixtures({
        from: date,
        to: date,
        timezone,
      });
      return Array.isArray(res?.result) ? res.result : [];
    } catch (err) {
      console.warn('[Basketball API] getGamesByDate error:', err);
      return [];
    }
  },

  /**
   * Fetch single match details by numeric event ID or match ID
   */
  async getGameById(matchId: number | string): Promise<BasketballEvent | null> {
    try {
      const id = Number(matchId);
      if (isNaN(id) || !id) return null;

      // In AllSportsAPI, passing matchId retrieves the specific event
      const res = await this.getFixtures({ matchId: id });
      if (Array.isArray(res?.result) && res.result.length > 0) {
        return res.result[0];
      }

      // Fallback: check livescore if match is in-play
      const liveRes = await this.getLivescore({ matchId: id });
      if (Array.isArray(liveRes?.result) && liveRes.result.length > 0) {
        return liveRes.result[0];
      }

      return null;
    } catch (err) {
      console.warn(`[Basketball API] getGameById error for ${matchId}:`, err);
      return null;
    }
  },

  /**
   * Fetch upcoming fixtures within a day window (default 3 days)
   */
  async getUpcomingGames(leagueId?: number, days: number = 3): Promise<BasketballEvent[]> {
    try {
      const today = new Date();
      const future = new Date(today);
      future.setDate(today.getDate() + days);

      const from = today.toISOString().split('T')[0];
      const to = future.toISOString().split('T')[0];

      const res = await this.getFixtures({
        from,
        to,
        leagueId,
      });

      const list = Array.isArray(res?.result) ? res.result : [];
      return list.filter((m) => m.event_status !== 'Finished' && m.event_live !== '1');
    } catch (err) {
      console.warn('[Basketball API] getUpcomingGames error:', err);
      return [];
    }
  },

  /**
   * Fetch recent results within a day window (default 3 days)
   */
  async getRecentResults(leagueId?: number, days: number = 3): Promise<BasketballEvent[]> {
    try {
      const today = new Date();
      const past = new Date(today);
      past.setDate(today.getDate() - days);

      const from = past.toISOString().split('T')[0];
      const to = today.toISOString().split('T')[0];

      const res = await this.getFixtures({
        from,
        to,
        leagueId,
      });

      const list = Array.isArray(res?.result) ? res.result : [];
      return list.filter((m) => m.event_status === 'Finished');
    } catch (err) {
      console.warn('[Basketball API] getRecentResults error:', err);
      return [];
    }
  },
};

// Aliases for compatibility
export const webBasketballApiService = basketballApi;
export default basketballApi;

// Re-export core types
export type {
  BasketballCountry,
  BasketballLeague,
  BasketballEvent,
  BasketballStanding,
  BasketballTeam,
  BasketballPlayer,
  BasketballVideo,
  BasketballMatchOdds,
};
