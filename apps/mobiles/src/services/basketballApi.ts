/**
 * Complete API-Basketball (v1.5.2) Enterprise Service Client for Expo Mobile
 * Implements ALL official endpoints and query parameters strictly according to API-Basketball documentation.
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASKETBALL_BASE_URL ||
  'https://v1.basketball.api-sports.io';

const API_KEY =
  process.env.EXPO_PUBLIC_API_BASKETBALL_KEY_MOBILE ||
  process.env.EXPO_PUBLIC_API_FOOTBALL_KEY_MOBILE ||
  process.env.EXPO_PUBLIC_API_KEY ||
  '';

export interface ApiBasketballResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: Record<string, string> | any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}

// -------------------------------------------------------------
// Type Definitions for Basketball Endpoints & Parameter Options
// -------------------------------------------------------------

export interface BasketballCountriesParams {
  id?: number;
  name?: string;
  code?: string;
  search?: string;
}

export interface BasketballLeaguesParams {
  id?: number;
  name?: string;
  type?: 'league' | 'cup';
  season?: string; // YYYY or YYYY-YYYY e.g. "2023-2024"
  country_id?: number;
  country?: string;
  code?: string;
  search?: string;
}

export interface BasketballTeamsParams {
  id?: number;
  name?: string;
  league?: number;
  season?: string;
  country_id?: number;
  country?: string;
  search?: string;
}

export interface BasketballTeamStatisticsParams {
  league: number;
  season: string;
  team: number;
  date?: string;
}

export interface BasketballPlayersParams {
  id?: number;
  name?: string;
  team?: number;
  season?: string;
  search?: string;
}

export interface BasketballStandingsParams {
  league: number;
  season: string;
  team?: number;
  stage?: string;
  group?: string;
}

export interface BasketballGamesParams {
  id?: number;
  date?: string; // YYYY-MM-DD
  league?: number;
  season?: string;
  team?: number;
  timezone?: string;
  live?: 'all' | string;
  status?: string;
  stage?: string;
}

export interface BasketballGameTeamStatsParams {
  id: number; // game id
}

export interface BasketballGamePlayerStatsParams {
  id: number; // game id
  team?: number;
}

export interface BasketballHeadToHeadParams {
  h2h: string; // "team1_id-team2_id"
  date?: string;
  league?: number;
  season?: string;
  timezone?: string;
}

export interface BasketballOddsParams {
  league?: number;
  season?: string;
  game?: number;
  bookmaker?: number;
  bet?: number;
  date?: string;
  page?: number;
}

export interface BasketballOddsBetsParams {
  id?: number;
  search?: string;
}

export interface BasketballOddsBookmakersParams {
  id?: number;
  search?: string;
}

export interface ApiBasketballGameItem {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;
  stage: string | null;
  week: string | null;
  status: {
    long: string;
    short: string;
    timer: string | null;
  };
  league: {
    id: number;
    name: string;
    type: string;
    season: string;
    logo: string;
  };
  country: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  scores: {
    home: {
      quarter_1: number | null;
      quarter_2: number | null;
      quarter_3: number | null;
      quarter_4: number | null;
      over_time: number | null;
      total: number | null;
    };
    away: {
      quarter_1: number | null;
      quarter_2: number | null;
      quarter_3: number | null;
      quarter_4: number | null;
      over_time: number | null;
      total: number | null;
    };
  };
}

// -------------------------------------------------------------
// Core Request Handler (GET only with x-apisports-key header)
// -------------------------------------------------------------

async function requestApiBasketball<T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  const cleanBase = API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = new URL(`${cleanBase}/${cleanEndpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const headers: Record<string, string> = {
    'x-apisports-key': API_KEY,
    Accept: 'application/json',
  };

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `[API-Basketball] Request to ${endpoint} failed: ${response.status} ${response.statusText}`
      );
    }

    const data: ApiBasketballResponse<T[]> = await response.json();

    if (
      data.errors &&
      (Array.isArray(data.errors)
        ? data.errors.length > 0
        : Object.keys(data.errors).length > 0)
    ) {
      console.warn(`[API-Basketball] Warnings/Errors on ${endpoint}:`, data.errors);
    }

    return data.response || [];
  } catch (error) {
    console.error(`[API-Basketball] Error on GET ${endpoint}:`, error);
    throw error;
  }
}

// -------------------------------------------------------------
// Full Implementation of All API-Basketball (v1.5.2) Endpoints
// -------------------------------------------------------------

export const basketballApiService = {
  // 1. Status
  async getStatus(): Promise<any> {
    return requestApiBasketball<any>('status');
  },

  // 2. Timezone
  async getTimezones(): Promise<string[]> {
    return requestApiBasketball<string>('timezone');
  },

  // 3. Seasons
  async getSeasons(): Promise<string[]> {
    return requestApiBasketball<string>('seasons');
  },

  // 4. Countries
  async getCountries(params?: BasketballCountriesParams): Promise<any[]> {
    return requestApiBasketball<any>('countries', params);
  },

  // 5. Leagues & Cups
  async getLeagues(params?: BasketballLeaguesParams): Promise<any[]> {
    return requestApiBasketball<any>('leagues', params);
  },

  // 6. Teams
  async getTeams(params?: BasketballTeamsParams): Promise<any[]> {
    return requestApiBasketball<any>('teams', params);
  },

  async getTeamStatistics(params: BasketballTeamStatisticsParams): Promise<any> {
    const res = await requestApiBasketball<any>('teams/statistics', params);
    return res.length > 0 ? res[0] : res;
  },

  // 7. Players
  async getPlayers(params?: BasketballPlayersParams): Promise<any[]> {
    return requestApiBasketball<any>('players', params);
  },

  // 8. Standings
  async getStandings(params: BasketballStandingsParams): Promise<any[]> {
    return requestApiBasketball<any>('standings', params);
  },

  // 9. Games
  async getGames(params: BasketballGamesParams): Promise<ApiBasketballGameItem[]> {
    return requestApiBasketball<ApiBasketballGameItem>('games', params);
  },

  async getLiveGames(leaguesFilter?: string): Promise<ApiBasketballGameItem[]> {
    return requestApiBasketball<ApiBasketballGameItem>('games', {
      live: leaguesFilter || 'all',
    });
  },

  async getGamesByDate(date: string, timezone?: string): Promise<ApiBasketballGameItem[]> {
    return requestApiBasketball<ApiBasketballGameItem>('games', { date, timezone });
  },

  async getGameById(id: number): Promise<ApiBasketballGameItem | null> {
    const res = await requestApiBasketball<ApiBasketballGameItem>('games', { id });
    return res.length > 0 ? res[0] : null;
  },

  async getHeadToHead(params: BasketballHeadToHeadParams): Promise<ApiBasketballGameItem[]> {
    return requestApiBasketball<ApiBasketballGameItem>('games/headtohead', params);
  },

  // 10. Game Statistics
  async getGameTeamStatistics(params: BasketballGameTeamStatsParams): Promise<any[]> {
    return requestApiBasketball<any>('games/statistics/teams', params);
  },

  async getGamePlayerStatistics(params: BasketballGamePlayerStatsParams): Promise<any[]> {
    return requestApiBasketball<any>('games/statistics/players', params);
  },

  // 11. Odds
  async getOdds(params: BasketballOddsParams): Promise<any[]> {
    return requestApiBasketball<any>('odds', params);
  },

  async getOddsBets(params?: BasketballOddsBetsParams): Promise<any[]> {
    return requestApiBasketball<any>('odds/bets', params);
  },

  async getOddsBookmakers(params?: BasketballOddsBookmakersParams): Promise<any[]> {
    return requestApiBasketball<any>('odds/bookmakers', params);
  },
};
