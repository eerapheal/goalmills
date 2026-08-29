/**
 * Complete API-Football (v3.9.3) Enterprise Service Client for Next.js Web
 * Implements ALL official endpoints and query parameters strictly according to API-Football documentation.
 * Requests are securely proxied through the internal `/api/football` route to safeguard provider secrets.
 */

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

// -------------------------------------------------------------
// Type Definitions for Endpoints & Parameter Options
// -------------------------------------------------------------

export interface TimezoneParams {}

export interface CountriesParams {
  name?: string;
  code?: string;
  search?: string;
}

export interface LeaguesParams {
  id?: number;
  name?: string;
  country?: string;
  code?: string;
  season?: number;
  team?: number;
  type?: 'league' | 'cup';
  current?: 'true' | 'false';
  search?: string;
  last?: number;
}

export interface TeamsParams {
  id?: number;
  name?: string;
  league?: number;
  season?: number;
  country?: string;
  code?: string;
  venue?: number;
  search?: string;
}

export interface TeamStatisticsParams {
  league: number;
  season: number;
  team: number;
  date?: string;
}

export interface TeamSeasonsParams {
  team: number;
}

export interface VenuesParams {
  id?: number;
  name?: string;
  city?: string;
  country?: string;
  search?: string;
}

export interface StandingsParams {
  season: number;
  league?: number;
  team?: number;
}

export interface FixtureRoundsParams {
  league: number;
  season: number;
  current?: boolean;
  dates?: boolean;
  timezone?: string;
}

export interface FixturesParams {
  id?: number;
  ids?: string;
  live?: 'all' | string;
  date?: string;
  league?: number;
  season?: number;
  team?: number;
  last?: number;
  next?: number;
  from?: string;
  to?: string;
  round?: string;
  status?: string;
  venue?: number;
  timezone?: string;
}

export interface HeadToHeadParams {
  h2h: string;
  date?: string;
  league?: number;
  season?: number;
  last?: number;
  next?: number;
  from?: string;
  to?: string;
  status?: string;
  venue?: number;
  timezone?: string;
}

export interface FixtureStatisticsParams {
  fixture: number;
  team?: number;
  type?: string;
  half?: boolean;
}

export interface FixtureEventsParams {
  fixture: number;
  team?: number;
  player?: number;
  type?: 'Goal' | 'Card' | 'subst' | 'Var';
}

export interface FixtureLineupsParams {
  fixture: number;
  team?: number;
  player?: number;
  type?: 'startXI' | 'substitutes';
}

export interface FixturePlayersParams {
  fixture: number;
  team?: number;
}

export interface InjuriesParams {
  league?: number;
  season?: number;
  fixture?: number;
  team?: number;
  player?: number;
  date?: string;
  ids?: string;
  timezone?: string;
}

export interface PredictionsParams {
  fixture: number;
}

export interface CoachesParams {
  id?: number;
  team?: number;
  search?: string;
}

export interface PlayerSeasonsParams {
  player?: number;
}

export interface PlayerProfilesParams {
  player?: number;
  search?: string;
  page?: number;
}

export interface PlayersParams {
  id?: number;
  team?: number;
  league?: number;
  season?: number;
  search?: string;
  page?: number;
}

export interface PlayerSquadsParams {
  team?: number;
  player?: number;
}

export interface PlayerTeamsParams {
  player: number;
}

export interface LeagueSeasonParams {
  league: number;
  season: number;
}

export interface TransfersParams {
  player?: number;
  team?: number;
}

export interface TrophiesParams {
  player?: number;
  players?: string;
  coach?: number;
  coachs?: string;
}

export interface SidelinedParams {
  player?: number;
  players?: string;
  coach?: number;
  coachs?: string;
}

export interface OddsLiveParams {
  fixture?: number;
  league?: number;
  bet?: number;
}

export interface OddsLiveBetsParams {
  id?: string;
  search?: string;
}

export interface OddsPreMatchParams {
  fixture?: number;
  league?: number;
  season?: number;
  date?: string;
  timezone?: string;
  page?: number;
  bookmaker?: number;
  bet?: number;
}

export interface OddsMappingParams {
  page?: number;
}

export interface OddsBookmakersParams {
  id?: number;
  search?: string;
}

export interface OddsBetsParams {
  id?: string;
  search?: string;
}

// -------------------------------------------------------------
// Core Request Handler for Web — routes through /api/football proxy
// -------------------------------------------------------------

async function requestApiFootball<T>(
  endpoint: string,
  params: Record<string, any> = {},
  _revalidate: number = 60 // kept for signature compat; TTL is managed by the proxy
): Promise<T[]> {
  // Build URL to our own Next.js proxy route
  const url = new URL(
    '/api/football',
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  );
  url.searchParams.append('met', endpoint);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `[API-Football Web] Proxy request to ${endpoint} failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // The proxy wraps AllSportsAPI responses as { success, result, ... }
    // and API-Football responses as { response, ... }
    if (data.response && Array.isArray(data.response)) {
      return data.response;
    }
    if (data.result && Array.isArray(data.result)) {
      return data.result;
    }
    if (Array.isArray(data)) {
      return data;
    }

    return data.response || data.result || [];
  } catch (error) {
    console.error(`[API-Football Web] Error on GET ${endpoint}:`, error);
    throw error;
  }
}

// -------------------------------------------------------------
// Full Implementation of All API-Football (v3.9.3) Endpoints for Web
// -------------------------------------------------------------

export const webApiFootballService = {
  // 1. Status & Account Check
  async getStatus(): Promise<any> {
    return requestApiFootball<any>('status', {}, 0);
  },

  // 2. Timezones
  async getTimezones(): Promise<string[]> {
    return requestApiFootball<string>('timezone', {}, 86400);
  },

  // 3. Countries
  async getCountries(params?: CountriesParams): Promise<any[]> {
    return requestApiFootball<any>('countries', params, 86400);
  },

  // 4. Leagues & Cups
  async getLeagues(params?: LeaguesParams): Promise<any[]> {
    return requestApiFootball<any>('leagues', params, 3600);
  },

  // 5. Seasons
  async getSeasons(): Promise<number[]> {
    return requestApiFootball<number>('leagues/seasons', {}, 86400);
  },

  // 6. Teams
  async getTeams(params: TeamsParams): Promise<any[]> {
    return requestApiFootball<any>('teams', params, 86400);
  },

  async getTeamStatistics(params: TeamStatisticsParams): Promise<any> {
    const res = await requestApiFootball<any>('teams/statistics', params, 43200);
    return res.length > 0 ? res[0] : res;
  },

  async getTeamSeasons(params: TeamSeasonsParams): Promise<number[]> {
    return requestApiFootball<number>('teams/seasons', params, 86400);
  },

  async getTeamCountries(): Promise<any[]> {
    return requestApiFootball<any>('teams/countries', {}, 86400);
  },

  // 7. Venues
  async getVenues(params: VenuesParams): Promise<any[]> {
    return requestApiFootball<any>('venues', params, 86400);
  },

  // 8. Standings
  async getStandings(params: StandingsParams): Promise<any[]> {
    return requestApiFootball<any>('standings', params, 300);
  },

  // 9. Fixtures
  async getFixtureRounds(params: FixtureRoundsParams): Promise<string[]> {
    return requestApiFootball<string>('fixtures/rounds', params, 86400);
  },

  async getFixtures(params: FixturesParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures', params, 60);
  },

  async getLiveFixtures(leaguesFilter?: string): Promise<any[]> {
    return requestApiFootball<any>('fixtures', { live: leaguesFilter || 'all' }, 15);
  },

  async getFixturesByDate(date: string, timezone?: string): Promise<any[]> {
    return requestApiFootball<any>('fixtures', { date, timezone }, 60);
  },

  async getFixtureById(id: number): Promise<any | null> {
    const res = await requestApiFootball<any>('fixtures', { id }, 30);
    return res.length > 0 ? res[0] : null;
  },

  async getHeadToHead(params: HeadToHeadParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/headtohead', params, 600);
  },

  async getFixtureStatistics(params: FixtureStatisticsParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/statistics', params, 60);
  },

  async getFixtureEvents(params: FixtureEventsParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/events', params, 30);
  },

  async getFixtureLineups(params: FixtureLineupsParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/lineups', params, 300);
  },

  async getFixturePlayerStatistics(params: FixturePlayersParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/players', params, 60);
  },

  // 10. Injuries
  async getInjuries(params: InjuriesParams): Promise<any[]> {
    return requestApiFootball<any>('injuries', params, 14400);
  },

  // 11. Predictions
  async getPredictions(params: PredictionsParams): Promise<any> {
    const res = await requestApiFootball<any>('predictions', params, 3600);
    return res.length > 0 ? res[0] : null;
  },

  // 12. Coaches
  async getCoaches(params: CoachesParams): Promise<any[]> {
    return requestApiFootball<any>('coachs', params, 86400);
  },

  // 13. Players
  async getPlayerSeasons(params?: PlayerSeasonsParams): Promise<number[]> {
    return requestApiFootball<number>('players/seasons', params, 86400);
  },

  async getPlayerProfiles(params: PlayerProfilesParams): Promise<any[]> {
    return requestApiFootball<any>('players/profiles', params, 86400);
  },

  async getPlayers(params: PlayersParams): Promise<any[]> {
    return requestApiFootball<any>('players', params, 86400);
  },

  async getPlayerSquads(params: PlayerSquadsParams): Promise<any[]> {
    return requestApiFootball<any>('players/squads', params, 86400);
  },

  async getPlayerTeams(params: PlayerTeamsParams): Promise<any[]> {
    return requestApiFootball<any>('players/teams', params, 86400);
  },

  async getTopScorers(params: LeagueSeasonParams): Promise<any[]> {
    return requestApiFootball<any>('players/topscorers', params, 86400);
  },

  async getTopAssists(params: LeagueSeasonParams): Promise<any[]> {
    return requestApiFootball<any>('players/topassists', params, 86400);
  },

  async getTopYellowCards(params: LeagueSeasonParams): Promise<any[]> {
    return requestApiFootball<any>('players/topyellowcards', params, 86400);
  },

  async getTopRedCards(params: LeagueSeasonParams): Promise<any[]> {
    return requestApiFootball<any>('players/topredcards', params, 86400);
  },

  // 14. Transfers, Trophies, Sidelined
  async getTransfers(params: TransfersParams): Promise<any[]> {
    return requestApiFootball<any>('transfers', params, 86400);
  },

  async getTrophies(params: TrophiesParams): Promise<any[]> {
    return requestApiFootball<any>('trophies', params, 86400);
  },

  async getSidelined(params: SidelinedParams): Promise<any[]> {
    return requestApiFootball<any>('sidelined', params, 86400);
  },

  // 15. Odds (In-Play & Pre-Match)
  async getOddsLive(params?: OddsLiveParams): Promise<any[]> {
    return requestApiFootball<any>('odds/live', params, 15);
  },

  async getOddsLiveBets(params?: OddsLiveBetsParams): Promise<any[]> {
    return requestApiFootball<any>('odds/live/bets', params, 60);
  },

  async getOddsPreMatch(params: OddsPreMatchParams): Promise<any[]> {
    return requestApiFootball<any>('odds', params, 10800);
  },

  async getOddsMapping(params?: OddsMappingParams): Promise<any[]> {
    return requestApiFootball<any>('odds/mapping', params, 86400);
  },

  async getOddsBookmakers(params?: OddsBookmakersParams): Promise<any[]> {
    return requestApiFootball<any>('odds/bookmakers', params, 86400);
  },

  async getOddsBets(params?: OddsBetsParams): Promise<any[]> {
    return requestApiFootball<any>('odds/bets', params, 86400);
  },
};

export type ApiFootballFixtureItem = any;
export type ApiFootballEvent = any;
export type ApiFootballLineup = any;
export type ApiFootballTeamStats = any;
export type ApiFootballStandingItem = any;
export const apiFootball = webApiFootballService;
export default webApiFootballService;
