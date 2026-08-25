/**
 * Complete API-Basketball (v1.5.2) Enterprise Service Client for Next.js Web
 * Implements ALL official endpoints and query parameters strictly according to API-Basketball documentation.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASKETBALL_BASE_URL ||
  process.env.API_BASKETBALL_BASE_URL ||
  'https://v1.basketball.api-sports.io';

const API_KEY =
  process.env.API_BASKETBALL_KEY_WEB ||
  process.env.NEXT_PUBLIC_API_BASKETBALL_KEY_WEB ||
  process.env.NEXT_PUBLIC_API_FOOTBALL_KEY_WEB ||
  process.env.API_FOOTBALL_KEY_WEB ||
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
  season?: string;
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
  date?: string;
  league?: number;
  season?: string;
  team?: number;
  timezone?: string;
  live?: 'all' | string;
  status?: string;
  stage?: string;
}

export interface BasketballGameTeamStatsParams {
  id: number;
}

export interface BasketballGamePlayerStatsParams {
  id: number;
  team?: number;
}

export interface BasketballHeadToHeadParams {
  h2h: string;
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

async function requestWebBasketball<T>(
  endpoint: string,
  params: Record<string, any> = {},
  revalidate: number = 60
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
      next: { revalidate },
    });

    if (!response.ok) {
      throw new Error(
        `[API-Basketball Web] Request to ${endpoint} failed: ${response.status} ${response.statusText}`
      );
    }

    const data: ApiBasketballResponse<T[]> = await response.json();

    if (
      data.errors &&
      (Array.isArray(data.errors)
        ? data.errors.length > 0
        : Object.keys(data.errors).length > 0)
    ) {
      console.warn(`[API-Basketball Web] Warnings/Errors on ${endpoint}:`, data.errors);
    }

    return data.response || [];
  } catch (error) {
    console.error(`[API-Basketball Web] Error on GET ${endpoint}:`, error);
    throw error;
  }
}

function wrapResult<T extends any[]>(arr: T): T & { result: any; success: number } {
  const cloned: any = arr;
  cloned.result = arr;
  cloned.success = 1;
  return cloned;
}

export const webBasketballApiService = {
  async getStatus(): Promise<any> {
    return requestWebBasketball<any>('status', {}, 0);
  },

  async getTimezones(): Promise<string[]> {
    return requestWebBasketball<string>('timezone', {}, 86400);
  },

  async getSeasons(): Promise<string[]> {
    return requestWebBasketball<string>('seasons', {}, 86400);
  },

  async getCountries(params?: BasketballCountriesParams): Promise<any[]> {
    return requestWebBasketball<any>('countries', params, 86400);
  },

  async getLeagues(params?: BasketballLeaguesParams | any): Promise<any> {
    const res = await requestWebBasketball<any>('leagues', params, 3600);
    return wrapResult(res);
  },

  async getTeams(params?: BasketballTeamsParams | any): Promise<any> {
    const p: any = { ...params };
    if (p.teamId) { p.id = p.teamId; delete p.teamId; }
    const res = await requestWebBasketball<any>('teams', p, 86400);
    return wrapResult(res);
  },

  async getTeamStatistics(params: BasketballTeamStatisticsParams): Promise<any> {
    const res = await requestWebBasketball<any>('teams/statistics', params, 43200);
    return res.length > 0 ? res[0] : res;
  },

  async getPlayers(params?: BasketballPlayersParams | any): Promise<any> {
    const p: any = { ...params };
    if (p.playerId) { p.id = p.playerId; delete p.playerId; }
    if (p.teamId) { p.team = p.teamId; delete p.teamId; }
    const res = await requestWebBasketball<any>('players', p, 86400);
    return wrapResult(res);
  },

  async getStandings(params: BasketballStandingsParams | any): Promise<any> {
    const p: any = { ...params };
    if (p.leagueId) { p.league = p.leagueId; delete p.leagueId; }
    if (!p.season) p.season = '2023-2024';
    const res = await requestWebBasketball<any>('standings', p, 300);
    const wrapped = wrapResult(res);
    wrapped.result = { total: res };
    return wrapped;
  },

  async getFixtures(params?: any): Promise<any> {
    const p: any = { ...params };
    if (p.leagueId) { p.league = p.leagueId; delete p.leagueId; }
    if (p.teamId) { p.team = p.teamId; delete p.teamId; }
    if (!p.season && (p.league || p.team)) p.season = '2023-2024';
    const res = await requestWebBasketball<ApiBasketballGameItem>('games', p, 60);
    return wrapResult(res);
  },

  async getGames(params: BasketballGamesParams): Promise<ApiBasketballGameItem[]> {
    return requestWebBasketball<ApiBasketballGameItem>('games', params, 60);
  },


  async getLiveGames(leaguesFilter?: string): Promise<ApiBasketballGameItem[]> {
    return requestWebBasketball<ApiBasketballGameItem>('games', { live: leaguesFilter || 'all' }, 15);
  },

  async getGamesByDate(date: string, timezone?: string): Promise<ApiBasketballGameItem[]> {
    return requestWebBasketball<ApiBasketballGameItem>('games', { date, timezone }, 60);
  },

  async getGameById(id: number): Promise<ApiBasketballGameItem | null> {
    const res = await requestWebBasketball<ApiBasketballGameItem>('games', { id }, 30);
    return res.length > 0 ? res[0] : null;
  },

  async getHeadToHead(params: BasketballHeadToHeadParams): Promise<ApiBasketballGameItem[]> {
    return requestWebBasketball<ApiBasketballGameItem>('games/headtohead', params, 600);
  },

  async getGameTeamStatistics(params: BasketballGameTeamStatsParams): Promise<any[]> {
    return requestWebBasketball<any>('games/statistics/teams', params, 60);
  },

  async getGamePlayerStatistics(params: BasketballGamePlayerStatsParams): Promise<any[]> {
    return requestWebBasketball<any>('games/statistics/players', params, 60);
  },

  async getOdds(params: BasketballOddsParams): Promise<any[]> {
    return requestWebBasketball<any>('odds', params, 10800);
  },

  async getOddsBets(params?: BasketballOddsBetsParams): Promise<any[]> {
    return requestWebBasketball<any>('odds/bets', params, 86400);
  },

  async getOddsBookmakers(params?: BasketballOddsBookmakersParams): Promise<any[]> {
    return requestWebBasketball<any>('odds/bookmakers', params, 86400);
  },
};

export const basketballApi = webBasketballApiService;
export default webBasketballApiService;

