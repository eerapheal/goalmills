import {
  FootballCountry,
  FootballLeague,
  FootballEvent,
  FootballStanding,
  FootballTopscorer,
  FootballTeam,
  FootballPlayer,
  FootballVideo,
  FootballOdds,
  FootballProbability,
  FootballLiveOdd,
  FootballComment,
  FootballFullMatchOdds,
  FootballCountriesResponse,
  FootballLeaguesResponse,
  FootballFixturesResponse,
  FootballH2HResponse,
  FootballLivescoreResponse,
  FootballStandingsResponse,
  FootballTopscorersResponse,
  FootballTeamsResponse,
  FootballPlayersResponse,
  FootballVideosResponse,
  FootballOddsResponse,
  FootballProbabilitiesResponse,
  FootballLiveOddsResponse,
  FootballCommentsResponse,
  FootballFullOddsResponse,
  FootballGoalScorer,
  FootballCard,
  FootballStatistic,
  FootballLineups,
  FootballCoach,
  FootballOfficial,
  BlogPost,
} from '@goalmills/types';
import { goalmillsApi } from './goalmillsApi';

// API Configuration
const API_BASE_URL = 'https://apiv2.allsportsapi.com/football/';
const API_KEY = '1637c7ddbd7bed5f5ffb6973d267ab8782d23d56f4fadc9399af4c05839680af';

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
    // Be less noisy with dev logs
    // console.log(`Fetching from API: ${method}`, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status >= 500) {
        console.warn(
          `Upstream API ${method} failed with ${response.status}. This is likely a temporary issue with the provider.`
        );
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if ((error as any).message?.includes('500')) {
      // Already warned above
    } else {
      console.warn(`Error fetching ${method}:`, error);
    }
    // Return undefined instead of throwing to avoid loud console Errors
    return undefined as any;
  }
}

// Helper to get date range
const getDateRange = (daysBack: number = 7, daysForward: number = 7) => {
  const today = new Date();
  const past = new Date(today);
  past.setDate(past.getDate() - daysBack);
  const future = new Date(today);
  future.setDate(future.getDate() + daysForward);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return {
    from: formatDate(past),
    to: formatDate(future),
  };
};

// Mock Data for Blog Posts (not available in API)
const mockBlogPosts: BlogPost[] = [
  {
    _id: '1',
    title: 'Manchester City Secure Premier League Title in Thrilling Finale',
    excerpt:
      "Pep Guardiola's side came back from two goals down to beat Aston Villa and clinch the title on the final day of the season.",
    content:
      'Manchester City have been crowned 2023/24 Premier League champions after a dramatic final day victory over West Ham. Phil Foden scored twice early on to settle any nerves at the Etihad Stadium before Rodri sealed the win with a controlled finish.',
    image:
      'https://images.unsplash.com/photo-1629255655767-f26b528659d6?auto=format&fit=crop&q=80&w=1000',
    author: 'James Ducker',
    readTime: 5,
    createdAt: new Date().toISOString(),
    category: 'Premier League',
  },
  {
    _id: '2',
    title: 'Real Madrid King of Europe: The 15th UCL Title',
    excerpt:
      'Vinicius Jr and Dani Carvajal score as Real Madrid beat Borussia Dortmund to win the Champions League at Wembley.',
    content:
      'Real Madrid extended their record as the most successful club in European history by winning their 15th Champions League title with a 2-0 victory over Borussia Dortmund at Wembley. After a difficult first half where Dortmund missed several chances, Madrid showed their pedigree in the second half.',
    image:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1000',
    author: 'Sid Lowe',
    readTime: 7,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'Champions League',
  },
  {
    _id: '3',
    title: 'Transfer News: Mbappe Finally Joins Real Madrid',
    excerpt:
      'The French superstar has officially signed a five-year contract with Los Blancos after years of speculation.',
    content:
      'Kylian Mbappe has completed his long-awaited move to Real Madrid, signing a five-year deal with the Spanish champions. The 25-year-old forward leaves Paris Saint-Germain as a free agent after his contract expired.',
    image:
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=1000',
    author: 'Fabrizio Romano',
    readTime: 4,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    category: 'Transfers',
  },
];

// Mock Data for Coaches (not available in API)
const mockCoaches: FootballCoach[] = [
  {
    coache: 'Pep Guardiola',
    coache_country: 'Spain',
    team_name: 'Manchester City',
    trophies: 38,
    coache_image: 'https://ui-avatars.com/api/?name=Pep+Guardiola&background=random&size=200',
  },
  {
    coache: 'Jürgen Klopp',
    coache_country: 'Germany',
    team_name: 'Liverpool',
    trophies: 12,
    coache_image: 'https://ui-avatars.com/api/?name=Jurgen+Klopp&background=random&size=200',
  },
  {
    coache: 'Carlo Ancelotti',
    coache_country: 'Italy',
    team_name: 'Real Madrid',
    trophies: 28,
    coache_image: 'https://ui-avatars.com/api/?name=Carlo+Ancelotti&background=random&size=200',
  },
  {
    coache: 'Mikel Arteta',
    coache_country: 'Spain',
    team_name: 'Arsenal',
    trophies: 2,
    coache_image: 'https://ui-avatars.com/api/?name=Mikel+Arteta&background=random&size=200',
  },
  {
    coache: 'Erik ten Hag',
    coache_country: 'Netherlands',
    team_name: 'Manchester United',
    trophies: 6,
    coache_image: 'https://ui-avatars.com/api/?name=Erik+ten+Hag&background=random&size=200',
  },
  {
    coache: 'Thomas Tuchel',
    coache_country: 'Germany',
    team_name: 'Bayern Munich',
    trophies: 11,
    coache_image: 'https://ui-avatars.com/api/?name=Thomas+Tuchel&background=random&size=200',
  },
];

// Mock Data for Officials (not available in API)
const mockOfficials: FootballOfficial[] = [
  {
    name: 'Michael Oliver',
    country: 'England',
    matches: 245,
    image: 'https://ui-avatars.com/api/?name=Michael+Oliver&background=random&size=200',
    yellowCards: 1234,
    redCards: 89,
  },
  {
    name: 'Anthony Taylor',
    country: 'England',
    matches: 198,
    image: 'https://ui-avatars.com/api/?name=Anthony+Taylor&background=random&size=200',
    yellowCards: 987,
    redCards: 67,
  },
  {
    name: 'Björn Kuipers',
    country: 'Netherlands',
    matches: 312,
    image: 'https://ui-avatars.com/api/?name=Bjorn+Kuipers&background=random&size=200',
    yellowCards: 1567,
    redCards: 102,
  },
  {
    name: 'Daniele Orsato',
    country: 'Italy',
    matches: 267,
    image: 'https://ui-avatars.com/api/?name=Daniele+Orsato&background=random&size=200',
    yellowCards: 1345,
    redCards: 95,
  },
  {
    name: 'Clément Turpin',
    country: 'France',
    matches: 189,
    image: 'https://ui-avatars.com/api/?name=Clement+Turpin&background=random&size=200',
    yellowCards: 876,
    redCards: 54,
  },
];

// Mock Data for Fixtures (for fallback when API is down)
const mockFixtures: FootballEvent[] = [
  {
    event_key: 123456,
    event_date: new Date().toISOString().split('T')[0],
    event_time: '20:00',
    event_home_team: 'Manchester City',
    home_team_key: 1,
    event_away_team: 'Liverpool',
    away_team_key: 2,
    event_halftime_result: '1 - 0',
    event_final_result: '2 - 1',
    event_ft_result: '2 - 1',
    event_status: 'Finished',
    league_name: 'Premier League',
    league_key: 152,
    home_team_logo: 'https://apiv2.allsportsapi.com/logo/teams/1_manchester-city.png',
    away_team_logo: 'https://apiv2.allsportsapi.com/logo/teams/2_liverpool.png',
    event_live: '0',
  },
  {
    event_key: 123457,
    event_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    event_time: '19:45',
    event_home_team: 'Real Madrid',
    home_team_key: 3,
    event_away_team: 'Barcelona',
    away_team_key: 4,
    event_status: '',
    league_name: 'La Liga',
    league_key: 302,
    home_team_logo: 'https://apiv2.allsportsapi.com/logo/teams/3_real-madrid.png',
    away_team_logo: 'https://apiv2.allsportsapi.com/logo/teams/4_barcelona.png',
    event_live: '0',
  },
] as any[];

// API Implementation
export const advancedFootballApi = {
  /**
   * Get list of supported countries
   * Endpoint: ?met=Countries
   */
  getCountries: async (): Promise<FootballCountriesResponse> => {
    try {
      const response = await fetchFromAPI<FootballCountriesResponse>('Countries');
      return response;
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get list of supported leagues/competitions
   * Endpoint: ?met=Leagues&countryId={id}
   */
  getLeagues: async (
    countryId?: number | string,
    leagueId?: number | string
  ): Promise<FootballLeaguesResponse> => {
    try {
      const params: Record<string, any> = {};
      if (countryId) params.countryId = countryId;
      if (leagueId) params.leagueId = leagueId;

      const response = await fetchFromAPI<FootballLeaguesResponse>('Leagues', params);
      return response;
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get football fixtures/events
   * Endpoint: ?met=Fixtures&from={date}&to={date}&leagueId={id}&matchId={id}&teamId={id}
   */
  getFixtures: async (params?: {
    from?: string;
    to?: string;
    leagueId?: number | string;
    matchId?: number | string;
    teamId?: number | string;
    timezone?: string;
    countryId?: number | string;
    leagueGroup?: string;
    withPlayerStats?: string | number;
  }): Promise<FootballFixturesResponse> => {
    try {
      // If no date range provided, use default
      const dateRange = params?.from && params?.to ? {} : getDateRange(7, 7);

      const apiParams: Record<string, any> = {
        ...dateRange,
        ...params,
      };

      const response = await fetchFromAPI<FootballFixturesResponse>('Fixtures', apiParams);
      return response;
    } catch (error) {
      // Return mock fixtures as fallback so app isn't empty on API failure
      return { success: 1, result: mockFixtures };
    }
  },

  /**
   * Get head to head results between two teams
   * Endpoint: ?met=H2H&firstTeamId={id}&secondTeamId={id}
   */
  getH2H: async (
    firstTeamId: number | string,
    secondTeamId: number | string,
    timezone?: string
  ): Promise<FootballH2HResponse> => {
    try {
      const params: Record<string, any> = {
        firstTeamId,
        secondTeamId,
      };
      if (timezone) params.timezone = timezone;

      const response = await fetchFromAPI<FootballH2HResponse>('H2H', params);
      return response;
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
   * Get live football matches
   * Endpoint: ?met=Livescore&leagueId={id}&matchId={id}&countryId={id}
   */
  getLivescore: async (params?: {
    leagueId?: number | string;
    matchId?: number | string;
    countryId?: number | string;
    timezone?: string;
    withPlayerStats?: string | number;
  }): Promise<FootballLivescoreResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};

      const response = await fetchFromAPI<FootballLivescoreResponse>('Livescore', apiParams);
      return response;
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get league standings (total, home, away)
   * Endpoint: ?met=Standings&leagueId={id}
   */
  getStandings: async (
    paramsOrLeagueId: { leagueId?: string | number } | string | number
  ): Promise<FootballStandingsResponse> => {
    try {
      const leagueId =
        typeof paramsOrLeagueId === 'object' && paramsOrLeagueId !== null
          ? (paramsOrLeagueId as any).leagueId
          : paramsOrLeagueId;

      const response = await fetchFromAPI<FootballStandingsResponse>('Standings', { leagueId });
      return response;
    } catch (error) {
      return {
        success: 1,
        result: {
          total: [],
          home: [],
          away: [],
        },
      };
    }
  },

  /**
   * Get top scorers for a league
   * Endpoint: ?met=Topscorers&leagueId={id}
   */
  getTopscorers: async (
    paramsOrLeagueId: { leagueId?: string | number } | string | number
  ): Promise<FootballTopscorersResponse> => {
    try {
      const leagueId =
        typeof paramsOrLeagueId === 'object' && paramsOrLeagueId !== null
          ? (paramsOrLeagueId as any).leagueId
          : paramsOrLeagueId;

      const response = await fetchFromAPI<FootballTopscorersResponse>('Topscorers', { leagueId });
      return response;
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get teams information with players
   * Endpoint: ?met=Teams&leagueId={id}&teamId={id}&teamName={name}
   */
  getTeams: async (params?: {
    leagueId?: number | string;
    teamId?: number | string;
    teamName?: string;
  }): Promise<FootballTeamsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};

      const response = await fetchFromAPI<FootballTeamsResponse>('Teams', apiParams);
      return response;
    } catch (error) {
      // Teams API is notoriously flaky, return empty result silently
      return { success: 1, result: [] };
    }
  },

  /**
   * Get player information and statistics
   * Endpoint: ?met=Players&playerId={id}&playerName={name}&leagueId={id}&teamId={id}
   */
  getPlayers: async (params?: {
    playerId?: number | string;
    playerName?: string;
    leagueId?: number | string;
    teamId?: number | string;
  }): Promise<FootballPlayersResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};

      const response = await fetchFromAPI<FootballPlayersResponse>('Players', apiParams);
      return response;
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get video highlights for events
   * Endpoint: ?met=Videos&eventId={id}
   */
  getVideos: async (eventId?: number | string): Promise<FootballVideosResponse> => {
    try {
      const params: Record<string, any> = {};
      if (eventId) params.eventId = eventId;

      // 1. Fetch from External API
      const externalPromise = fetchFromAPI<FootballVideosResponse>('Videos', params).catch(
        (err) => {
          console.warn('External API video fetch failed (likely 500):', err.message);
          return { success: 1, result: [] as FootballVideo[] };
        }
      );

      // 2. Fetch from Internal Database (matching web app behavior)
      const internalPromise = goalmillsApi.getVideos().catch((err) => {
        console.warn('Internal DB video fetch failed:', err.message);
        return [] as any[];
      });

      const [externalRes, internalRes] = await Promise.all([externalPromise, internalPromise]);

      // Map internal videos to FootballVideo structure
      const mappedInternal = internalRes.map(
        (v) =>
          ({
            event_key: v.event_key || v._id,
            video_title: v.video_title,
            video_title_full: v.video_title, // Reuse title if full title not available
            video_url: v.video_url,
          }) as unknown as FootballVideo
      );

      return {
        success: 1,
        result: [...mappedInternal, ...(externalRes.result || [])],
      };
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get pre-match odds for events
   * Endpoint: ?met=Odds&from={date}&to={date}&leagueId={id}&matchId={id}&countryId={id}
   */
  getOdds: async (params?: {
    from?: string;
    to?: string;
    leagueId?: number | string;
    matchId?: number | string;
    countryId?: number | string;
  }): Promise<FootballOddsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};

      const response = await fetchFromAPI<FootballOddsResponse>('Odds', apiParams);
      return response;
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  /**
   * Get match probabilities
   * Endpoint: ?met=Probabilities&from={date}&to={date}&leagueId={id}&matchId={id}&countryId={id}
   */
  getProbabilities: async (params?: {
    from?: string;
    to?: string;
    leagueId?: number | string;
    matchId?: number | string;
    countryId?: number | string;
  }): Promise<FootballProbabilitiesResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};

      const response = await fetchFromAPI<FootballProbabilitiesResponse>(
        'Probabilities',
        apiParams
      );
      return response;
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  /**
   * Get live odds for ongoing events
   * Endpoint: ?met=OddsLive&leagueId={id}&matchId={id}&countryId={id}
   */
  getLiveOdds: async (params?: {
    leagueId?: number | string;
    matchId?: number | string;
    countryId?: number | string;
    timezone?: string;
  }): Promise<FootballLiveOddsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};

      const response = await fetchFromAPI<FootballLiveOddsResponse>('OddsLive', apiParams);
      return response;
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  /**
   * Get live match comments/commentary
   * Endpoint: ?met=Comments&from={date}&to={date}&leagueId={id}&matchId={id}&countryId={id}&live={0|1}
   */
  getComments: async (params?: {
    from?: string;
    to?: string;
    leagueId?: number | string;
    matchId?: number | string;
    countryId?: number | string;
    live?: string | number;
    timezone?: string;
  }): Promise<FootballCommentsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};

      const response = await fetchFromAPI<FootballCommentsResponse>('Comments', apiParams);
      return response;
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  /**
   * Get full odds list with all bookmakers and markets
   * Endpoint: ?met=FullOdds&from={date}&to={date}&leagueId={id}&matchId={id}&countryId={id}
   */
  getFullOdds: async (params?: {
    from?: string;
    to?: string;
    leagueId?: number | string;
    matchId?: number | string;
    countryId?: number | string;
  }): Promise<FootballFullOddsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};

      const response = await fetchFromAPI<FootballFullOddsResponse>('FullOdds', apiParams);
      return response;
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  /**
   * Get coaches list (using mock data as not available in API)
   */
  getCoaches: async (): Promise<{ success: number; result: FootballCoach[] }> => {
    return {
      success: 1,
      result: mockCoaches,
    };
  },

  /**
   * Get officials list (using mock data as not available in API)
   */
  getOfficials: async (): Promise<{ success: number; result: FootballOfficial[] }> => {
    return {
      success: 1,
      result: mockOfficials,
    };
  },

  /**
   * Get all blog posts (using mock data as not available in API)
   */
  getBlogPosts: async (): Promise<BlogPost[]> => {
    return mockBlogPosts;
  },

  /**
   * Get a blog post by ID (using mock data as not available in API)
   */
  getBlogPostById: async (id: string): Promise<BlogPost | null> => {
    return mockBlogPosts.find((p) => p._id === id) || null;
  },
};
