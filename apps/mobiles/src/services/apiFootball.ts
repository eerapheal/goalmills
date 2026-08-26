/**
 * Complete API-Football (v3.9.3) Enterprise Service Client for Expo Mobile
 * Implements ALL official endpoints and query parameters strictly according to API-Football documentation.
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

export type ApiFootballFixtureItem = any;
export type ApiFootballEvent = any;
export type ApiFootballLineup = any;
export type ApiFootballTeamStats = any;
export type ApiFootballStandingItem = any;

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
  date?: string; // YYYY-MM-DD
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
  ids?: string; // "id-id-id" max 20
  live?: 'all' | string; // "all" or "id-id"
  date?: string; // YYYY-MM-DD
  league?: number;
  season?: number;
  team?: number;
  last?: number;
  next?: number;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  round?: string;
  status?: string; // e.g. "NS", "NS-PST-FT", "FT"
  venue?: number;
  timezone?: string;
}

export interface HeadToHeadParams {
  h2h: string; // "team1_id-team2_id"
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
  players?: string; // "id-id" max 20
  coach?: number;
  coachs?: string; // "id-id" max 20
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
// Core Request Handler (GET only with x-apisports-key header)
// -------------------------------------------------------------

async function requestApiFootball<T>(
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
        `[API-Football] Request to ${endpoint} failed: ${response.status} ${response.statusText}`
      );
    }

    const data: ApiFootballResponse<T[]> = await response.json();

    if (
      data.errors &&
      (Array.isArray(data.errors)
        ? data.errors.length > 0
        : Object.keys(data.errors).length > 0)
    ) {
      console.warn(`[API-Football] Warnings/Errors on ${endpoint}:`, data.errors);
    }

    return data.response || [];
  } catch (error) {
    console.error(`[API-Football] Error on GET ${endpoint}:`, error);
    throw error;
  }
}

// -------------------------------------------------------------
// Full Implementation of All API-Football (v3.9.3) Endpoints
// -------------------------------------------------------------

export const apiFootballService = {
  // 1. Status & Account Check
  async getStatus(): Promise<any> {
    return requestApiFootball<any>('status');
  },

  // 2. Timezones
  async getTimezones(): Promise<string[]> {
    return requestApiFootball<string>('timezone');
  },

  // 3. Countries
  async getCountries(params?: CountriesParams): Promise<any[]> {
    return requestApiFootball<any>('countries', params);
  },

  // 4. Leagues & Cups
  async getLeagues(params?: LeaguesParams): Promise<any[]> {
    return requestApiFootball<any>('leagues', params);
  },

  // 5. Seasons
  async getSeasons(): Promise<number[]> {
    return requestApiFootball<number>('leagues/seasons');
  },

  // 6. Teams
  async getTeams(params: TeamsParams): Promise<any[]> {
    return requestApiFootball<any>('teams', params);
  },

  async getTeamStatistics(params: TeamStatisticsParams): Promise<any> {
    const res = await requestApiFootball<any>('teams/statistics', params);
    return res.length > 0 ? res[0] : res;
  },

  async getTeamSeasons(params: TeamSeasonsParams): Promise<number[]> {
    return requestApiFootball<number>('teams/seasons', params);
  },

  async getTeamCountries(): Promise<any[]> {
    return requestApiFootball<any>('teams/countries');
  },

  // 7. Venues
  async getVenues(params: VenuesParams): Promise<any[]> {
    return requestApiFootball<any>('venues', params);
  },

  // 8. Standings
  async getStandings(params: StandingsParams): Promise<any[]> {
    return requestApiFootball<any>('standings', params);
  },

  // 9. Fixtures
  async getFixtureRounds(params: FixtureRoundsParams): Promise<string[]> {
    return requestApiFootball<string>('fixtures/rounds', params);
  },

  async getFixtures(params: FixturesParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures', params);
  },

  async getLiveFixtures(leaguesFilter?: string): Promise<any[]> {
    return requestApiFootball<any>('fixtures', {
      live: leaguesFilter || 'all',
    });
  },

  async getFixturesByDate(date: string, timezone?: string): Promise<any[]> {
    return requestApiFootball<any>('fixtures', { date, timezone });
  },

  async getFixtureById(id: number): Promise<any | null> {
    const res = await requestApiFootball<any>('fixtures', { id });
    return res.length > 0 ? res[0] : null;
  },

  async getHeadToHead(params: HeadToHeadParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/headtohead', params);
  },

  async getFixtureStatistics(params: FixtureStatisticsParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/statistics', params);
  },

  async getFixtureEvents(params: FixtureEventsParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/events', params);
  },

  async getFixtureLineups(params: FixtureLineupsParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/lineups', params);
  },

  async getFixturePlayerStatistics(params: FixturePlayersParams): Promise<any[]> {
    return requestApiFootball<any>('fixtures/players', params);
  },

  // 10. Injuries
  async getInjuries(params: InjuriesParams): Promise<any[]> {
    return requestApiFootball<any>('injuries', params);
  },

  // 11. Predictions
  async getPredictions(params: PredictionsParams): Promise<any> {
    const res = await requestApiFootball<any>('predictions', params);
    return res.length > 0 ? res[0] : null;
  },

  // 12. Coaches
  async getCoaches(params: CoachesParams): Promise<any[]> {
    return requestApiFootball<any>('coachs', params);
  },

  // 13. Players
  async getPlayerSeasons(params?: PlayerSeasonsParams): Promise<number[]> {
    return requestApiFootball<number>('players/seasons', params);
  },

  async getPlayerProfiles(params: PlayerProfilesParams): Promise<any[]> {
    return requestApiFootball<any>('players/profiles', params);
  },

  async getPlayers(params: PlayersParams): Promise<any[]> {
    return requestApiFootball<any>('players', params);
  },

  async getPlayerSquads(params: PlayerSquadsParams): Promise<any[]> {
    return requestApiFootball<any>('players/squads', params);
  },

  async getPlayerTeams(params: PlayerTeamsParams): Promise<any[]> {
    return requestApiFootball<any>('players/teams', params);
  },

  async getTopScorers(params: LeagueSeasonParams): Promise<any[]> {
    return requestApiFootball<any>('players/topscorers', params);
  },

  async getTopAssists(params: LeagueSeasonParams): Promise<any[]> {
    return requestApiFootball<any>('players/topassists', params);
  },

  async getTopYellowCards(params: LeagueSeasonParams): Promise<any[]> {
    return requestApiFootball<any>('players/topyellowcards', params);
  },

  async getTopRedCards(params: LeagueSeasonParams): Promise<any[]> {
    return requestApiFootball<any>('players/topredcards', params);
  },

  // 14. Transfers, Trophies, Sidelined
  async getTransfers(params: TransfersParams): Promise<any[]> {
    return requestApiFootball<any>('transfers', params);
  },

  async getTrophies(params: TrophiesParams): Promise<any[]> {
    return requestApiFootball<any>('trophies', params);
  },

  async getSidelined(params: SidelinedParams): Promise<any[]> {
    return requestApiFootball<any>('sidelined', params);
  },

  // 15. Odds (In-Play & Pre-Match)
  async getOddsLive(params?: OddsLiveParams): Promise<any[]> {
    return requestApiFootball<any>('odds/live', params);
  },

  async getOddsLiveBets(params?: OddsLiveBetsParams): Promise<any[]> {
    return requestApiFootball<any>('odds/live/bets', params);
  },

  async getOddsPreMatch(params: OddsPreMatchParams): Promise<any[]> {
    return requestApiFootball<any>('odds', params);
  },

  async getOddsMapping(params?: OddsMappingParams): Promise<any[]> {
    return requestApiFootball<any>('odds/mapping', params);
  },

  async getOddsBookmakers(params?: OddsBookmakersParams): Promise<any[]> {
    return requestApiFootball<any>('odds/bookmakers', params);
  },

  async getOddsBets(params?: OddsBetsParams): Promise<any[]> {
    return requestApiFootball<any>('odds/bets', params);
  },
};
