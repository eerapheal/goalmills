/**
 * API-Football (v3) Enterprise Service Client for Next.js Web
 * Uses dedicated NEXT_PUBLIC_API_FOOTBALL_KEY_WEB / API_FOOTBALL_KEY_WEB environment variables
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_FOOTBALL_BASE_URL ||
  process.env.API_FOOTBALL_BASE_URL ||
  'https://v3.football.api-sports.io';

const API_KEY =
  process.env.API_FOOTBALL_KEY_WEB ||
  process.env.NEXT_PUBLIC_API_FOOTBALL_KEY_WEB ||
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

async function requestApiFootball<T>(
  endpoint: string,
  params: Record<string, any> = {},
  revalidate: number = 60
): Promise<T[]> {
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
      next: { revalidate },
    });

    if (!response.ok) {
      throw new Error(`API-Football request failed: ${response.status} ${response.statusText}`);
    }

    const data: ApiFootballResponse<T[]> = await response.json();

    if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
      console.warn('[API-Football Web] Error response:', data.errors);
    }

    return data.response || [];
  } catch (error) {
    console.error(`[API-Football Web] Failed fetching ${endpoint}:`, error);
    throw error;
  }
}

export const webApiFootballService = {
  /**
   * Get all live matches
   */
  async getLiveFixtures(): Promise<ApiFootballFixtureItem[]> {
    return requestApiFootball<ApiFootballFixtureItem>('fixtures', { live: 'all' }, 15);
  },

  /**
   * Get matches by date
   */
  async getFixturesByDate(date: string, timezone?: string): Promise<ApiFootballFixtureItem[]> {
    return requestApiFootball<ApiFootballFixtureItem>('fixtures', { date, timezone }, 60);
  },

  /**
   * Get match details by ID
   */
  async getFixtureById(id: number): Promise<ApiFootballFixtureItem | null> {
    const fixtures = await requestApiFootball<ApiFootballFixtureItem>('fixtures', { id }, 30);
    return fixtures.length > 0 ? fixtures[0] : null;
  },

  /**
   * Get match timeline events
   */
  async getFixtureEvents(fixtureId: number): Promise<ApiFootballEvent[]> {
    return requestApiFootball<ApiFootballEvent>('fixtures/events', { fixture: fixtureId }, 30);
  },

  /**
   * Get match lineups
   */
  async getFixtureLineups(fixtureId: number): Promise<ApiFootballLineup[]> {
    return requestApiFootball<ApiFootballLineup>('fixtures/lineups', { fixture: fixtureId }, 300);
  },

  /**
   * Get match statistics
   */
  async getFixtureStatistics(fixtureId: number): Promise<ApiFootballTeamStats[]> {
    return requestApiFootball<ApiFootballTeamStats>('fixtures/statistics', { fixture: fixtureId }, 60);
  },

  /**
   * Get Head-to-Head
   */
  async getHeadToHead(team1Id: number, team2Id: number, last: number = 10): Promise<ApiFootballFixtureItem[]> {
    return requestApiFootball<ApiFootballFixtureItem>('fixtures/headtohead', {
      h2h: `${team1Id}-${team2Id}`,
      last,
    }, 600);
  },

  /**
   * Get standings table
   */
  async getStandings(leagueId: number, season: number): Promise<ApiFootballStandingItem[]> {
    const res = await requestApiFootball<any>('standings', { league: leagueId, season }, 300);
    if (res.length > 0 && res[0].league && res[0].league.standings) {
      return res[0].league.standings.flat() as ApiFootballStandingItem[];
    }
    return [];
  },
};
