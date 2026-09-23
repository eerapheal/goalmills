/**
 * Complete AllSportsAPI Cricket v2.0 Enterprise Service Client for GoalMills Web
 * Implements ALL official AllSportsAPI cricket endpoints and dynamic query parameters.
 * Requests are securely proxied through the internal `/api/cricket` route to safeguard provider credentials.
 *
 * Mirrors the basketballApi.ts architecture exactly for consistency.
 */

import {
  CricketLeague,
  CricketEvent,
  CricketStanding,
  CricketTeam,
  CricketMatchOdds,
  CricketLeaguesResponse,
  CricketFixturesResponse,
  CricketLivescoreResponse,
  CricketH2HResponse,
  CricketStandingsResponse,
  CricketTeamsResponse,
  CricketOddsResponse,
  CricketFixturesParams,
  CricketLivescoreParams,
  CricketH2HParams,
  CricketStandingsParams,
  CricketTeamsParams,
  CricketOddsParams,
} from '@goalmills/types';

// API Configuration - Using Next.js API route as proxy to avoid CORS and protect API credentials
const API_PROXY_URL = '/api/cricket';

/**
 * Helper function to build proxy URL with dynamic parameters
 */
const buildUrl = (method: string, params: Record<string, any> = {}): string => {
  const url = new URL(
    API_PROXY_URL,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
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
      console.error(`[Cricket API] Error ${response.status} for ${method}:`, errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Cricket API] Error fetching ${method}:`, error);
    throw error;
  }
}

/**
 * AllSportsAPI Cricket Enterprise Service
 */
export const cricketApi = {
  /**
   * 1. Leagues Endpoint
   * Returns list of supported cricket competitions / series
   */
  async getLeagues(): Promise<CricketLeaguesResponse> {
    return fetchFromAPI<CricketLeaguesResponse>('Leagues');
  },

  /**
   * 2. Fixtures Endpoint
   * Returns scheduled or completed fixtures based on date range, league, or match ID
   */
  async getFixtures(
    params: Partial<Omit<CricketFixturesParams, 'met'>> = {}
  ): Promise<CricketFixturesResponse> {
    const p: Record<string, any> = { ...params };
    // If no dates provided and no matchId provided, default to today
    if (!p.from && !p.to && !p.matchId) {
      const today = new Date().toISOString().split('T')[0];
      p.from = today;
      p.to = today;
    }
    return fetchFromAPI<CricketFixturesResponse>('Fixtures', p);
  },

  /**
   * 3. Livescore Endpoint
   * Returns currently live cricket events
   */
  async getLivescore(
    params: Partial<Omit<CricketLivescoreParams, 'met'>> = {}
  ): Promise<CricketLivescoreResponse> {
    return fetchFromAPI<CricketLivescoreResponse>('Livescore', params);
  },

  /**
   * 4. H2H (Head to Head) Endpoint
   * Returns historical matches between two teams and their recent results
   */
  async getH2H(params: Omit<CricketH2HParams, 'met'>): Promise<CricketH2HResponse> {
    return fetchFromAPI<CricketH2HResponse>('H2H', params);
  },

  /**
   * 5. Standings Endpoint
   * Returns league standings/points table for a specific league ID
   */
  async getStandings(
    params: Partial<Omit<CricketStandingsParams, 'met'>> = {}
  ): Promise<CricketStandingsResponse> {
    return fetchFromAPI<CricketStandingsResponse>('Standings', {
      leagueId: params.leagueId,
    });
  },

  /**
   * 6. Teams Endpoint
   * Returns teams for a league or a specific team by team ID
   */
  async getTeams(
    params: Partial<Omit<CricketTeamsParams, 'met'>> = {}
  ): Promise<CricketTeamsResponse> {
    return fetchFromAPI<CricketTeamsResponse>('Teams', params);
  },

  /**
   * 7. Odds Endpoint
   * Returns betting odds for events (matchId, leagueId, or date range)
   */
  async getOdds(
    params: Partial<Omit<CricketOddsParams, 'met'>> = {}
  ): Promise<CricketOddsResponse> {
    return fetchFromAPI<CricketOddsResponse>('Odds', params);
  },

  // ─── High-Level Convenience Helpers ──────────────────────────────────────────

  /**
   * Fetch currently live cricket matches
   */
  async getLiveMatches(): Promise<CricketEvent[]> {
    try {
      const res = await this.getLivescore();
      return Array.isArray(res?.result) ? res.result : [];
    } catch (err) {
      console.warn('[Cricket API] getLiveMatches error:', err);
      return [];
    }
  },

  /**
   * Fetch matches for a specific calendar date (YYYY-MM-DD)
   */
  async getMatchesByDate(date: string, timezone?: string): Promise<CricketEvent[]> {
    try {
      const res = await this.getFixtures({
        from: date,
        to: date,
        timezone,
      });
      return Array.isArray(res?.result) ? res.result : [];
    } catch (err) {
      console.warn('[Cricket API] getMatchesByDate error:', err);
      return [];
    }
  },

  /**
   * Fetch single match details by numeric event ID or match ID
   */
  async getMatchById(matchId: number | string): Promise<CricketEvent | null> {
    try {
      const id = Number(matchId);
      if (isNaN(id) || !id) return null;

      // In AllSportsAPI, passing matchId retrieves the specific event with full scorecard
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
      console.warn(`[Cricket API] getMatchById error for ${matchId}:`, err);
      return null;
    }
  },

  /**
   * Fetch upcoming fixtures within a day window (default 7 days for cricket due to multi-day Tests)
   */
  async getUpcomingMatches(leagueId?: number, days: number = 7): Promise<CricketEvent[]> {
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
      return list.filter(
        (m) =>
          m.event_status !== 'Finished' &&
          m.event_live !== '1' &&
          !m.event_status?.toLowerCase().includes('won') &&
          !m.event_status?.toLowerCase().includes('drawn')
      );
    } catch (err) {
      console.warn('[Cricket API] getUpcomingMatches error:', err);
      return [];
    }
  },

  /**
   * Fetch recent results within a day window (default 7 days)
   */
  async getRecentResults(leagueId?: number, days: number = 7): Promise<CricketEvent[]> {
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
      return list.filter(
        (m) =>
          m.event_status === 'Finished' ||
          m.event_status?.toLowerCase().includes('won') ||
          m.event_status?.toLowerCase().includes('drawn') ||
          m.event_status?.toLowerCase().includes('tied')
      );
    } catch (err) {
      console.warn('[Cricket API] getRecentResults error:', err);
      return [];
    }
  },
};

// Aliases for compatibility
export const webCricketApiService = cricketApi;
export default cricketApi;

// Re-export core types
export type { CricketLeague, CricketEvent, CricketStanding, CricketTeam, CricketMatchOdds };
