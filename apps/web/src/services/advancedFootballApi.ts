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
  FootballCountriesParams,
  FootballLeaguesParams,
  FootballFixturesParams,
  FootballH2HParams,
  FootballLivescoreParams,
  FootballStandingsParams,
  FootballTopscorersParams,
  FootballTeamsParams,
  FootballPlayersParams,
  FootballVideosParams,
  FootballOddsParams,
  FootballProbabilitiesParams,
  FootballLiveOddsParams,
  FootballFullOddsParams,
  FootballGoalScorer,
  FootballCard,
  FootballStatistic,
  FootballLineups,
  FootballCoach,
  FootballOfficial,
  BlogPost,
} from '@goalmills/types';

// API Configuration - Using Next.js API route as proxy to avoid CORS issues
const API_PROXY_URL = '/api/football';

// Helper function to build URL with parameters
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

// Helper function to make API requests
async function fetchFromAPI<T>(method: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const url = buildUrl(method, params);
    console.log(`Fetching from API: ${method}`, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Response for ${method}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${method}:`, error);
    throw error;
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
      console.error('Error fetching countries:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get list of supported leagues/competitions
   * Endpoint: ?met=Leagues&countryId={id}
   */
  getLeagues: async (
    paramsOrCountryId?: FootballLeaguesParams | { countryId?: string | number; leagueId?: string | number } | string | number,
    leagueId?: string | number
  ): Promise<FootballLeaguesResponse> => {
    try {
      let params: Record<string, any> = {};
      if (typeof paramsOrCountryId === 'object' && paramsOrCountryId !== null) {
        params = { ...paramsOrCountryId };
      } else {
        if (paramsOrCountryId) params.countryId = paramsOrCountryId;
        if (leagueId) params.leagueId = leagueId;
      }

      const response = await fetchFromAPI<FootballLeaguesResponse>('Leagues', params);
      return response;
    } catch (error) {
      console.error('Error fetching leagues:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get football fixtures/events
   * Endpoint: ?met=Fixtures&from={date}&to={date}&leagueId={id}&matchId={id}&teamId={id}&withPlayerStats={1}
   */
  getFixtures: async (params?: FootballFixturesParams): Promise<FootballFixturesResponse> => {
    try {
      // If no date range provided, use default 7 days back and forward
      const dateRange = params?.from && params?.to ? {} : getDateRange(7, 7);

      const apiParams: Record<string, any> = {
        ...dateRange,
        ...params,
      };

      const response = await fetchFromAPI<FootballFixturesResponse>('Fixtures', apiParams);
      return response;
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get head to head results between two teams
   * Endpoint: ?met=H2H&firstTeamId={id}&secondTeamId={id}
   */
  getH2H: async (
    firstTeamIdOrParams: FootballH2HParams | { firstTeamId: string | number; secondTeamId: string | number; timezone?: string } | string | number,
    secondTeamId?: string | number,
    timezone?: string
  ): Promise<FootballH2HResponse> => {
    try {
      let params: Record<string, any> = {};
      if (typeof firstTeamIdOrParams === 'object' && firstTeamIdOrParams !== null) {
        params = { ...firstTeamIdOrParams };
      } else {
        params = {
          firstTeamId: firstTeamIdOrParams,
          secondTeamId,
        };
        if (timezone) params.timezone = timezone;
      }

      const response = await fetchFromAPI<FootballH2HResponse>('H2H', params);
      return response;
    } catch (error) {
      console.error('Error fetching H2H:', error);
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
   * Endpoint: ?met=Livescore&leagueId={id}&matchId={id}&countryId={id}&withPlayerStats={1}
   */
  getLivescore: async (params?: FootballLivescoreParams): Promise<FootballLivescoreResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};
      const response = await fetchFromAPI<FootballLivescoreResponse>('Livescore', apiParams);
      return response;
    } catch (error) {
      console.error('Error fetching livescore:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get league standings (total, home, away)
   * Endpoint: ?met=Standings&leagueId={id}
   */
  getStandings: async (
    paramsOrLeagueId: FootballStandingsParams | { leagueId: string | number } | string | number
  ): Promise<FootballStandingsResponse> => {
    try {
      const leagueId =
        typeof paramsOrLeagueId === 'object' && paramsOrLeagueId !== null
          ? (paramsOrLeagueId as any).leagueId
          : paramsOrLeagueId;

      const response = await fetchFromAPI<FootballStandingsResponse>('Standings', { leagueId });
      return response;
    } catch (error) {
      console.error('Error fetching standings:', error);
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
    paramsOrLeagueId: FootballTopscorersParams | { leagueId: string | number } | string | number
  ): Promise<FootballTopscorersResponse> => {
    try {
      const leagueId =
        typeof paramsOrLeagueId === 'object' && paramsOrLeagueId !== null
          ? (paramsOrLeagueId as any).leagueId
          : paramsOrLeagueId;

      const response = await fetchFromAPI<FootballTopscorersResponse>('Topscorers', { leagueId });
      return response;
    } catch (error) {
      console.error('Error fetching topscorers:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get teams information with players
   * Endpoint: ?met=Teams&leagueId={id}&teamId={id}&teamName={name}
   */
  getTeams: async (params?: FootballTeamsParams): Promise<FootballTeamsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};
      const response = await fetchFromAPI<FootballTeamsResponse>('Teams', apiParams);
      return response;
    } catch (error) {
      console.error('Error fetching teams:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get player information and statistics
   * Endpoint: ?met=Players&playerId={id}&playerName={name}&leagueId={id}&teamId={id}
   */
  getPlayers: async (params?: FootballPlayersParams): Promise<FootballPlayersResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};
      const response = await fetchFromAPI<FootballPlayersResponse>('Players', apiParams);
      return response;
    } catch (error) {
      console.error('Error fetching players:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get pre-match odds for events
   * Endpoint: ?met=Odds&from={date}&to={date}&leagueId={id}&matchId={id}&countryId={id}
   */
  getOdds: async (params?: FootballOddsParams): Promise<FootballOddsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};
      const response = await fetchFromAPI<FootballOddsResponse>('Odds', apiParams);
      return response;
    } catch (error) {
      console.error('Error fetching odds:', error);
      return { success: 1, result: {} };
    }
  },

  /**
   * Get match probabilities
   * Endpoint: ?met=Probabilities&from={date}&to={date}&leagueId={id}&matchId={id}&countryId={id}
   */
  getProbabilities: async (params?: FootballProbabilitiesParams): Promise<FootballProbabilitiesResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};
      const response = await fetchFromAPI<FootballProbabilitiesResponse>(
        'Probabilities',
        apiParams
      );
      return response;
    } catch (error) {
      console.error('Error fetching probabilities:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get live odds for ongoing events
   * Endpoint: ?met=OddsLive&leagueId={id}&matchId={id}&countryId={id}&timezone={tz}
   */
  getLiveOdds: async (params?: FootballLiveOddsParams): Promise<FootballLiveOddsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};
      const response = await fetchFromAPI<FootballLiveOddsResponse>('OddsLive', apiParams);
      return response;
    } catch (error) {
      console.error('Error fetching live odds:', error);
      return { success: 1, result: {} };
    }
  },

  /**
   * Get full odds list with all bookmakers and markets (Correct Score, 1X2, Over/Under, etc.)
   * Endpoint: ?met=FullOdds&from={date}&to={date}&leagueId={id}&matchId={id}&countryId={id}
   */
  getFullOdds: async (params?: FootballFullOddsParams): Promise<FootballFullOddsResponse> => {
    try {
      const apiParams: Record<string, any> = params || {};
      const response = await fetchFromAPI<FootballFullOddsResponse>('FullOdds', apiParams);
      return response;
    } catch (error) {
      console.error('Error fetching full odds:', error);
      return { success: 1, result: {} };
    }
  },

  /**
   * Get video highlights (Merged API + MongoDB)
   * Endpoint: ?met=Videos&eventId={id}
   */
  getVideos: async (
    paramsOrEventId?: FootballVideosParams | { eventId: string | number } | string | number
  ): Promise<FootballVideosResponse> => {
    try {
      const eventId =
        typeof paramsOrEventId === 'object' && paramsOrEventId !== null
          ? (paramsOrEventId as any).eventId
          : paramsOrEventId;

      const externalPromise = fetchFromAPI<FootballVideosResponse>(
        'Videos',
        eventId ? { eventId } : {}
      ).catch(() => ({ success: 1, result: [] }));

      const internalPromise = fetch('/api/videos', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []);

      const [externalRes, internalRes] = await Promise.all([externalPromise, internalPromise]);

      const combined = [...(internalRes || []), ...(externalRes?.result || [])];

      return {
        success: 1,
        result: combined,
      };
    } catch (error) {
      console.error('Error fetching videos:', error);
      return { success: 1, result: [] };
    }
  },

  getCoaches: async (): Promise<{ success: number; result: FootballCoach[] }> => {
    try {
      const res = await fetch('/api/coaches');
      if (!res.ok) return { success: 1, result: [] };
      return await res.json();
    } catch (error) {
      console.error('Error fetching coaches:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get officials list
   */
  getOfficials: async (): Promise<{ success: number; result: FootballOfficial[] }> => {
    try {
      const res = await fetch('/api/officials');
      if (!res.ok) return { success: 1, result: [] };
      return await res.json();
    } catch (error) {
      console.error('Error fetching officials:', error);
      return { success: 1, result: [] };
    }
  },

  /**
   * Get all blog posts from MongoDB
   */
  getBlogPosts: async (): Promise<BlogPost[]> => {
    try {
      const res = await fetch('/api/news', { cache: 'no-store' }); // Internal API
      if (!res.ok) return [];
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  },

  /**
   * Get a blog post by ID from MongoDB
   */
  getBlogPostById: async (id: string): Promise<BlogPost | null> => {
    try {
      const res = await fetch(`/api/news/${id}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get comprehensive African Football Hub data (2026/2027 Season)
   * Real market valuations, CAF competitions, domestic powerhouses, and diaspora stars abroad.
   */
  getAfricanFootballHubData: async (section: string = 'all', season: string = '2026/2027') => {
    try {
      const res = await fetch(`/api/football/africa?section=${encodeURIComponent(section)}&season=${encodeURIComponent(season)}`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('Error fetching African football data:', error);
      return { success: false, error: 'Failed to fetch African football data' };
    }
  },
};
