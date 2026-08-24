/**
 * API-Football (v3) Enterprise Service Client for Expo Mobile
 * Uses dedicated EXPO_PUBLIC_API_FOOTBALL_KEY_MOBILE environment variable
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';

const API_KEY =
  process.env.EXPO_PUBLIC_API_FOOTBALL_KEY_MOBILE ||
  process.env.EXPO_PUBLIC_API_FOOTBALL_KEY ||
  '';

export interface ApiFootballResponse<T> {
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

export interface ApiFootballFixtureItem {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
      extra?: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
  events?: ApiFootballEvent[];
  lineups?: ApiFootballLineup[];
  statistics?: ApiFootballTeamStats[];
}

export interface ApiFootballEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: 'Goal' | 'Card' | 'subst' | 'Var';
  detail: string;
  comments: string | null;
}

export interface ApiFootballLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors: any;
  };
  coach: {
    id: number;
    name: string;
    photo: string;
  };
  formation: string;
  startXI: {
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string | null;
    };
  }[];
  substitutes: {
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string | null;
    };
  }[];
}

export interface ApiFootballTeamStats {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: {
    type: string;
    value: string | number | null;
  }[];
}

export interface ApiFootballStandingItem {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

async function requestApiFootball<T>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> {
  const url = new URL(`${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const headers: Record<string, string> = {
    'x-apisports-key': API_KEY,
    'Accept': 'application/json',
  };

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API-Football request failed: ${response.status} ${response.statusText}`);
    }

    const data: ApiFootballResponse<T[]> = await response.json();

    if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
      console.warn('[API-Football] Error response:', data.errors);
    }

    return data.response || [];
  } catch (error) {
    console.error(`[API-Football] Failed fetching ${endpoint}:`, error);
    throw error;
  }
}

export const apiFootballService = {
  /**
   * Get all live matches in real-time
   */
  async getLiveFixtures(): Promise<ApiFootballFixtureItem[]> {
    return requestApiFootball<ApiFootballFixtureItem>('fixtures', { live: 'all' });
  },

  /**
   * Get matches by specific date (YYYY-MM-DD)
   */
  async getFixturesByDate(date: string, timezone?: string): Promise<ApiFootballFixtureItem[]> {
    return requestApiFootball<ApiFootballFixtureItem>('fixtures', { date, timezone });
  },

  /**
   * Get detailed match by ID (includes status, venue, score)
   */
  async getFixtureById(id: number): Promise<ApiFootballFixtureItem | null> {
    const fixtures = await requestApiFootball<ApiFootballFixtureItem>('fixtures', { id });
    return fixtures.length > 0 ? fixtures[0] : null;
  },

  /**
   * Get match timeline events (goals, cards, substitutions, VAR)
   */
  async getFixtureEvents(fixtureId: number): Promise<ApiFootballEvent[]> {
    return requestApiFootball<ApiFootballEvent>('fixtures/events', { fixture: fixtureId });
  },

  /**
   * Get match lineups & formations (4-3-3, starting XI, bench, coach)
   */
  async getFixtureLineups(fixtureId: number): Promise<ApiFootballLineup[]> {
    return requestApiFootball<ApiFootballLineup>('fixtures/lineups', { fixture: fixtureId });
  },

  /**
   * Get match statistics (shots on target, possession %, passes, corners, xG)
   */
  async getFixtureStatistics(fixtureId: number): Promise<ApiFootballTeamStats[]> {
    return requestApiFootball<ApiFootballTeamStats>('fixtures/statistics', { fixture: fixtureId });
  },

  /**
   * Get Head-to-Head matches between two teams
   */
  async getHeadToHead(team1Id: number, team2Id: number, last: number = 10): Promise<ApiFootballFixtureItem[]> {
    return requestApiFootball<ApiFootballFixtureItem>('fixtures/headtohead', {
      h2h: `${team1Id}-${team2Id}`,
      last,
    });
  },

  /**
   * Get league standings table
   */
  async getStandings(leagueId: number, season: number): Promise<ApiFootballStandingItem[]> {
    const res = await requestApiFootball<any>('standings', { league: leagueId, season });
    if (res.length > 0 && res[0].league && res[0].league.standings) {
      return res[0].league.standings.flat() as ApiFootballStandingItem[];
    }
    return [];
  },

  /**
   * Get available leagues for a season
   */
  async getLeagues(season?: number, current: boolean = true): Promise<any[]> {
    return requestApiFootball<any>('leagues', {
      season: season || new Date().getFullYear(),
      current: current ? 'true' : undefined,
    });
  },
};
