import {
  CricketLeague,
  CricketTeam,
  CricketEvent,
  CricketStanding,
  CricketLeaguesResponse,
  CricketFixturesResponse,
  CricketLivescoreResponse,
  CricketH2HResponse,
  CricketStandingsResponse,
  CricketTeamsResponse,
  CricketOddsResponse,
  CricketProbabilitiesResponse,
  CricketLiveOddsResponse,
  CricketCommentsResponse,
  CricketVideosResponse,
  CricketPlayersResponse,
  CricketPlayer,
  CricketIccRankingsResponse,
  CricketNewsItem,
  CricketLeaguesParams,
  CricketFixturesParams,
  CricketLivescoreParams,
  CricketH2HParams,
  CricketStandingsParams,
  CricketTeamsParams,
  CricketOddsParams,
  CricketProbabilitiesParams,
  CricketLiveOddsParams,
  CricketCommentsParams,
  CricketVideosParams,
  GetCricketPlayersParams,
} from '@goalmills/types';

// ─── In-Memory Cache Store ───────────────────────────────────────────────────
interface CacheEntry {
  timestamp: number;
  data: any;
  ttl: number;
}

const CACHE_STORE = new Map<string, CacheEntry>();
let rateLimitBackoffUntil = 0;

// Rate-limit spacer: ensures minimum 250ms spacing between outbound fetches
let lastFetchTime = 0;
const MIN_FETCH_GAP_MS = 250;

async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLast = now - lastFetchTime;
  if (timeSinceLast < MIN_FETCH_GAP_MS) {
    const delay = MIN_FETCH_GAP_MS - timeSinceLast;
    lastFetchTime = now + delay;
    await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
  } else {
    lastFetchTime = Date.now();
  }
  return fetch(url, options);
}

function getApiBaseUrl(): string {
  let raw =
    process.env.EXPO_PUBLIC_CRICKET_BASE_URL ||
    'https://cricbuzz-cricket.p.rapidapi.com';

  raw = raw.trim();
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw.replace(/\/$/, '');
}

const API_KEY =
  process.env.EXPO_PUBLIC_CRICKET_API_KEY ||
  process.env.CRICKET_API_KEY ||
  '8a82fda1a0mshe8fdc601996d498p1f5debjsne46758736e72';

const CRICBUZZ_IMG = (id: number | string) =>
  `https://static.cricbuzz.com/a/img/v1/i1/c${id}/i.jpg`;

const resolveImgUrl = (img: any): string | undefined => {
  if (!img) return undefined;
  const str = String(img).trim();
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  if (/^\d+$/.test(str)) return `https://static.cricbuzz.com/a/img/v1/i1/c${str}/i.jpg`;
  return undefined;
};

/**
 * Map generic method names to Cricbuzz RapidAPI routes
 */
function mapCricbuzzPath(method: string, params: Record<string, any> = {}): string {
  const ep = method.toLowerCase().trim();
  const playerId = params.playerId || params.id || params.player_id;
  const seriesId = params.leagueId || params.seriesId || params.id;
  const teamId = params.teamId || params.team_id || params.id;

  if (method.startsWith('/')) return method;

  if (ep === 'livescore' || ep === 'live') return '/matches/v1/live';
  if (ep === 'fixtures' || ep === 'upcoming') return '/matches/v1/upcoming';
  if (ep === 'recent') return '/matches/v1/recent';

  if (ep === 'leagues' || ep === 'series' || ep === 'series/v1/international') return '/series/v1/international';
  if (ep === 'standings' || ep === 'points-table') {
    return seriesId ? `/series/v1/${seriesId}/points-table` : '/series/v1/international';
  }

  // Team sub-routes
  if (ep === 'teams/get-schedules' || ep === 'teams/schedules' || ep === 'teams/schedule') {
    return teamId ? `/teams/v1/${teamId}/schedule` : '/matches/v1/upcoming';
  }
  if (ep === 'teams/get-results' || ep === 'teams/results') {
    return teamId ? `/teams/v1/${teamId}/results` : '/matches/v1/recent';
  }
  if (ep === 'teams/get-players' || ep === 'teams/players') {
    return teamId ? `/teams/v1/${teamId}/players` : '/stats/v1/player/trending';
  }
  if (ep === 'teams/get-news' || ep === 'teams/news') {
    return teamId ? `/news/v1/team/${teamId}` : '/news/v1/index';
  }
  if (ep === 'teams/get-stats' || ep === 'teams/get-stats-filters' || ep === 'teams/stats') {
    return teamId ? `/stats/v1/team/${teamId}` : '/teams/v1/international';
  }

  if (ep === 'teams' || ep === 'teams/list' || ep.startsWith('teams/')) {
    const teamType = params.type || 'international';
    return `/teams/v1/${teamType}`;
  }

  if (
    ep === 'players' ||
    ep === 'players/list-trending' ||
    ep === 'players/trending' ||
    ep === 'stats/v1/player/trending' ||
    ep.includes('trending')
  ) {
    if (playerId) return `/stats/v1/player/${playerId}`;
    return '/stats/v1/player/trending';
  }

  if (ep === 'players/get-info' || ep === 'player/info') {
    return playerId ? `/stats/v1/player/${playerId}` : '/stats/v1/player/trending';
  }
  if (ep === 'players/get-career' || ep === 'player/career') {
    return playerId ? `/stats/v1/player/${playerId}/career` : '/stats/v1/player/trending';
  }
  if (ep === 'players/get-batting' || ep === 'player/batting') {
    return playerId ? `/stats/v1/player/${playerId}/batting` : '/stats/v1/player/trending';
  }
  if (ep === 'players/get-bowling' || ep === 'player/bowling') {
    return playerId ? `/stats/v1/player/${playerId}/bowling` : '/stats/v1/player/trending';
  }
  if (ep === 'players/get-news' || ep === 'player/news' || ep === 'news') {
    return '/news/v1/index';
  }

  return method.includes('/') ? `/${method.replace(/^\//, '')}` : `/matches/v1/${method}`;
}

function buildScoreStr(teamScore: any): string {
  if (!teamScore) return '';
  const parts: string[] = [];
  for (const key of ['inngs1', 'inngs2', 'inngs3', 'inngs4']) {
    const inn = teamScore[key];
    if (!inn) continue;
    let s = `${inn.runs}`;
    if (inn.wickets !== undefined && inn.wickets < 10) s += `/${inn.wickets}`;
    if (inn.overs !== undefined) s += ` (${inn.overs} ov)`;
    if (inn.isDeclared) s += 'd';
    parts.push(s);
  }
  return parts.join(' & ');
}

function mapMatchToEvent(info: any, score: any, seriesNameFallback?: string): CricketEvent | null {
  if (!info) return null;
  const t1 = info.team1 || {};
  const t2 = info.team2 || {};
  const venue = info.venueInfo || {};
  const startMs = Number(info.startDate || 0);
  const endMs = Number(info.endDate || 0);
  const startDate = startMs ? new Date(startMs).toISOString().split('T')[0] : null;
  const endDate = endMs ? new Date(endMs).toISOString().split('T')[0] : null;
  const startTime = startMs
    ? new Date(startMs).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    : null;

  const isLive = info.state === 'In Progress' || info.state === 'Live' || info.stateTitle === 'In Progress';
  const t1Img = t1.imageId || t1.faceImageId || t1.image || t1.team_logo || t1.logo;
  const t2Img = t2.imageId || t2.faceImageId || t2.image || t2.team_logo || t2.logo;

  return {
    event_key: String(info.matchId || info.id || ''),
    event_date_start: startDate,
    event_date_stop: endDate,
    event_time: startTime,
    event_home_team: t1.teamName || t1.name || 'TBA',
    home_team_key: String(t1.teamId || t1.id || ''),
    event_away_team: t2.teamName || t2.name || 'TBA',
    away_team_key: String(t2.teamId || t2.id || ''),
    event_service_home: '',
    event_service_away: '',
    event_home_final_result: buildScoreStr(score?.team1Score),
    event_away_final_result: buildScoreStr(score?.team2Score),
    event_home_rr: null,
    event_away_rr: null,
    event_status: info.state || info.stateTitle || 'Scheduled',
    event_status_info: info.status || '',
    country_name: info.matchFormat || 'International',
    league_name: info.seriesName || seriesNameFallback || '',
    league_key: String(info.seriesId || ''),
    league_round: info.matchDesc || '',
    league_season: new Date(startMs || Date.now()).getFullYear().toString(),
    event_live: isLive ? '1' : '0',
    event_type: info.matchFormat || 'Cricket',
    event_stadium: venue.ground ? `${venue.ground}${venue.city ? ', ' + venue.city : ''}` : undefined,
    event_home_team_logo: resolveImgUrl(t1Img),
    event_away_team_logo: resolveImgUrl(t2Img),
  };
}

/**
 * Extract a flat array of CricketEvent objects from Cricbuzz typeMatches structure
 */
function transformCricbuzzMatches(data: any): CricketEvent[] {
  const typeMatches = data?.typeMatches;
  if (!Array.isArray(typeMatches)) return [];

  const events: CricketEvent[] = [];
  for (const tm of typeMatches) {
    const seriesMatches = tm.seriesMatches;
    if (!Array.isArray(seriesMatches)) continue;

    for (const sm of seriesMatches) {
      const wrapper = sm.seriesAdWrapper;
      if (!wrapper?.matches) continue;

      for (const m of wrapper.matches) {
        const ev = mapMatchToEvent(m.matchInfo, m.matchScore, wrapper.seriesName);
        if (ev) events.push(ev);
      }
    }
  }
  return events;
}

/**
 * Extract team matches from teamMatchesData
 */
function transformCricbuzzTeamMatches(data: any): CricketEvent[] {
  if (!data) return [];
  const events: CricketEvent[] = [];

  const teamMatchesData = data?.teamMatchesData || data?.matchScheduleMap || data?.scheduleData;
  if (Array.isArray(teamMatchesData)) {
    for (const block of teamMatchesData) {
      const matches = block?.matchDetailsMap?.match || block?.match || block?.matches || block?.scheduleAdWrapper?.matches;
      if (Array.isArray(matches)) {
        for (const m of matches) {
          const ev = mapMatchToEvent(m.matchInfo || m, m.matchScore);
          if (ev) events.push(ev);
        }
      }
    }
  }

  if (events.length === 0 && Array.isArray(data?.matches)) {
    for (const m of data.matches) {
      const ev = mapMatchToEvent(m.matchInfo || m, m.matchScore);
      if (ev) events.push(ev);
    }
  }

  if (events.length === 0 && Array.isArray(data?.typeMatches)) {
    return transformCricbuzzMatches(data);
  }

  return events;
}

/**
 * Transform Cricbuzz series/international response into CricketLeague[] format
 */
function transformCricbuzzSeries(data: any): CricketLeague[] {
  const seriesMap = data?.seriesMapProto || data?.seriesMapProfiles;
  if (!Array.isArray(seriesMap)) return [];

  const leagues: CricketLeague[] = [];
  for (const group of seriesMap) {
    const series = group.series;
    if (!Array.isArray(series)) continue;

    for (const s of series) {
      leagues.push({
        league_key: String(s.id || s.seriesId || ''),
        league_name: s.name || s.seriesName || '',
        league_year: s.startDt
          ? new Date(Number(s.startDt)).getFullYear().toString()
          : new Date().getFullYear().toString(),
        league_season: s.startDt
          ? new Date(Number(s.startDt)).getFullYear().toString()
          : undefined,
        country_name: group.date || 'International',
      });
    }
  }
  return leagues;
}

/**
 * Transform Cricbuzz teams/v1 list into CricketTeam[] format
 */
function transformCricbuzzTeamsList(data: any): CricketTeam[] {
  const list = data?.list || data?.teams || (Array.isArray(data) ? data : []);
  if (!Array.isArray(list)) return [];

  return list
    .filter((t: any) => t && (t.teamId || t.team_key || t.id))
    .map((t: any) => {
      const tid = String(t.teamId || t.team_key || t.id);
      const img = t.imageId || t.faceImageId || t.image || t.team_logo || t.logo;
      return {
        team_key: tid,
        team_name: t.teamName || t.name || '',
        team_short_name: t.teamSName || t.shortName || (t.teamName || t.name || '').slice(0, 3).toUpperCase(),
        team_logo: (resolveImgUrl(img) || null) as any,
        country_name: t.countryName || t.country || t.teamName || 'International',
      };
    });
}

/**
 * Transform Cricbuzz teams/v1/{id}/players into CricketPlayer[] format
 */
function transformCricbuzzTeamSquad(data: any, teamId: string): CricketPlayer[] {
  const raw = data?.player;
  if (!Array.isArray(raw)) return [];

  let currentRole = 'Player';
  const players: CricketPlayer[] = [];

  for (const p of raw) {
    if (!p.id && p.name) {
      currentRole = p.name;
      continue;
    }
    if (p.id) {
      players.push({
        player_key: String(p.id),
        player_name: p.name || '',
        player_image: p.imageId || p.faceImageId ? CRICBUZZ_IMG(p.imageId || p.faceImageId) : undefined,
        player_type: currentRole,
        player_role: currentRole,
        batting_style: p.battingStyle || undefined,
        bowling_style: p.bowlingStyle || undefined,
        team_key: teamId,
      });
    }
  }

  return players;
}

/**
 * Transform Cricbuzz player responses
 */
function transformCricbuzzPlayers(data: any): CricketPlayer[] {
  if (Array.isArray(data?.player)) {
    return data.player.map((p: any) => ({
      player_key: String(p.id || ''),
      player_name: p.name || 'Cricket Player',
      player_country: p.teamName || 'International',
      player_image: p.faceImageId ? CRICBUZZ_IMG(p.faceImageId) : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400',
      player_type: 'International Player',
      player_role: 'Athlete',
      team_name: p.teamName || 'International',
    }));
  }

  if (data && (data.id || data.name)) {
    return [{
      player_key: String(data.id || ''),
      player_name: data.name || '',
      player_country: data.intlTeam || data.teamName || 'International',
      player_image: data.faceImageId || data.imageId ? CRICBUZZ_IMG(data.faceImageId || data.imageId) : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400',
      player_type: data.role || 'Player',
      player_role: data.role || 'Player',
      batting_style: data.bat || data.battingStyle || 'Right-hand bat',
      bowling_style: data.bowl || data.bowlingStyle || 'Right-arm medium',
      player_born: data.birthPlace || undefined,
      bio: data.bio || undefined,
      team_name: data.intlTeam || data.teamName || undefined,
    }];
  }

  return [];
}

/**
 * Helper function to make API requests with caching & Cricbuzz transformations
 */
async function fetchFromAPI<T>(method: string, params: Record<string, any> = {}): Promise<T> {
  const base = getApiBaseUrl();
  const isRapidApi = base.includes('rapidapi.com');
  const targetPath = isRapidApi ? mapCricbuzzPath(method, params) : '';
  const url = new URL(targetPath, base);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (isRapidApi) {
    if (API_KEY) headers['x-rapidapi-key'] = API_KEY;
    headers['x-rapidapi-host'] = url.host;

    // Append supported params
    Object.entries(params).forEach(([key, value]) => {
      if (!['met', 'endpoint', 'from', 'to', 'timezone', 'leagueId', 'seriesId', 'playerId', 'teamId', 'team_id'].includes(key) && value) {
        url.searchParams.append(key, String(value));
      }
    });
  } else {
    url.searchParams.append('met', method);
    if (API_KEY) url.searchParams.append('APIkey', API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'met' && value) url.searchParams.append(key, String(value));
    });
  }

  const cacheKey = url.toString();
  const now = Date.now();

  // Check cache (30s for live, 60s for fixtures, 10min for series)
  const cached = CACHE_STORE.get(cacheKey);
  const ttlMs = (method.toLowerCase().includes('live') ? 15 : 60) * 1000;
  if (cached && now - cached.timestamp < cached.ttl * 1000) {
    return cached.data as T;
  }

  // Rate-limit backoff check
  if (now < rateLimitBackoffUntil) {
    if (cached) return cached.data as T;
    return { success: 1, result: [] } as unknown as T;
  }

  try {
    const response = await rateLimitedFetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok || response.status === 204) {
      if (response.status === 429) {
        rateLimitBackoffUntil = Date.now() + 15_000;
      }
      if (cached) return cached.data as T;
      return { success: 1, result: [] } as unknown as T;
    }

    const text = await response.text();
    let data: any = {};
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = {};
      }
    }

    let standardized: any;
    const ep = method.toLowerCase();
    const teamId = String(params.teamId || params.team_id || params.id || '');

    if (isRapidApi) {
      if (data?.teamMatchesData || ep.includes('schedule') || ep.includes('results')) {
        const events = transformCricbuzzTeamMatches(data);
        standardized = { success: 1, result: events };
      } else if (ep.includes('teams/get-players') || (ep.includes('teams') && ep.includes('players')) || (data?.player && Array.isArray(data?.player) && data.player.some((x: any) => !x.id && x.name))) {
        const squad = transformCricbuzzTeamSquad(data, teamId);
        standardized = { success: 1, result: squad };
      } else if (data?.list || ep === 'teams' || ep === 'teams/list') {
        const teams = transformCricbuzzTeamsList(data);
        standardized = { success: 1, result: teams };
      } else if (ep === 'livescore' || ep === 'live' || ep === 'fixtures' || ep === 'upcoming' || ep === 'recent' || ep.includes('matches/v1')) {
        const events = transformCricbuzzMatches(data);
        standardized = { success: 1, result: events };
      } else if (ep === 'leagues' || ep === 'series' || ep.includes('series/v1/international')) {
        const leagues = transformCricbuzzSeries(data);
        standardized = { success: 1, result: leagues };
      } else if (ep.includes('player') || data?.player || (data?.id && data?.name)) {
        const players = transformCricbuzzPlayers(data);
        standardized = { success: 1, result: players };
      } else {
        standardized = {
          success: 1,
          result: Array.isArray(data) ? data : (data.result ?? data.values ?? data.types ?? data.storyList ?? data),
          ...(!Array.isArray(data) ? data : {}),
        };
      }
    } else {
      standardized = {
        success: 1,
        result: Array.isArray(data) ? data : (data.result ?? data),
        ...(!Array.isArray(data) ? data : {}),
      };
    }

    CACHE_STORE.set(cacheKey, {
      timestamp: Date.now(),
      data: standardized,
      ttl: ttlMs / 1000,
    });

    return standardized as T;
  } catch (error) {
    console.warn(`Error in mobile fetchFromAPI (${method}):`, error);
    if (cached) return cached.data as T;
    return { success: 1, result: [] } as unknown as T;
  }
}

// Built-in Player Profiles Database for fallback
const CRICKET_PLAYERS_DATABASE: CricketPlayer[] = [
  {
    player_key: '1001',
    player_name: 'Virat Kohli',
    team_key: '2',
    team_name: 'India',
    player_type: 'Batsman',
    player_role: 'Top-order Batter',
    player_image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400',
    player_country: 'India',
    player_age: '37',
    player_born: 'Delhi, India',
    player_birth_date: '1988-11-05',
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm medium',
    jersey_number: '18',
    is_captain: false,
    bio: 'One of the greatest all-format batsmen of the modern era.',
  },
];

const ICC_RANKINGS_DATA: Record<string, any[]> = {
  'men-test-teams': [
    { rank: 1, team_name: 'Australia', country: 'AUS', rating: 124, points: 3720, trend: 'same' },
    { rank: 2, team_name: 'India', country: 'IND', rating: 120, points: 3840, trend: 'same' },
    { rank: 3, team_name: 'England', country: 'ENG', rating: 108, points: 4104, trend: 'up' },
  ],
};

export const advancedCricketApi = {
  getFormattedDate: (offsetDays: number = 0): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  },

  getLeagues: async (params?: Omit<CricketLeaguesParams, 'met'>): Promise<CricketLeaguesResponse> => {
    try {
      const res = await fetchFromAPI<CricketLeaguesResponse>('Leagues', params || {});
      if (res && res.result && Array.isArray(res.result) && res.result.length > 0) return res;
      throw new Error('Fallback leagues');
    } catch (error) {
      return {
        success: 1,
        result: [
          { league_key: '12687', league_name: 'India tour of Sri Lanka 2026', league_year: '2026', league_season: '2026', country_name: 'International' },
          { league_key: '9785', league_name: 'Indian Premier League (IPL)', league_year: '2026', league_season: '2026', country_name: 'India' },
          { league_key: '9843', league_name: 'ICC Men’s T20 World Cup', league_year: '2026', league_season: '2026', country_name: 'International' },
        ],
      };
    }
  },

  getFixtures: async (params: Omit<CricketFixturesParams, 'met'> = {}): Promise<CricketFixturesResponse> => {
    try {
      const res = await fetchFromAPI<CricketFixturesResponse>('Fixtures', params);
      if (res && res.result && Array.isArray(res.result) && res.result.length > 0) {
        if (params.leagueId) {
          const filtered = res.result.filter(m => String(m.league_key) === String(params.leagueId));
          if (filtered.length > 0) return { success: 1, result: filtered };
        }
        return res;
      }
      throw new Error('Fallback fixtures');
    } catch (error) {
      const today = new Date().toISOString().split('T')[0];
      const mock: CricketEvent[] = [
        {
          event_key: '163017',
          event_date_start: today,
          event_date_stop: today,
          event_time: '14:00',
          event_home_team: 'India',
          home_team_key: '2',
          event_away_team: 'Sri Lanka',
          away_team_key: '5',
          event_service_home: '',
          event_service_away: '',
          event_home_final_result: '503/9 (138.0 ov)',
          event_away_final_result: '290/9 (88.4 ov)',
          event_home_rr: null,
          event_away_rr: null,
          event_status: 'In Progress',
          event_status_info: 'Day 4: 1st Session - Sri Lanka trail by 213 runs',
          league_name: 'India tour of Sri Lanka 2026',
          league_key: '12687',
          league_round: '2nd Test',
          league_season: '2026',
          event_live: '1',
          event_type: 'TEST',
          country_name: 'International',
          event_stadium: 'Sinhalese Sports Club, Colombo',
        },
      ];
      return { success: 1, result: mock };
    }
  },

  getLivescore: async (params?: Omit<CricketLivescoreParams, 'met'>): Promise<CricketLivescoreResponse> => {
    try {
      const res = await fetchFromAPI<CricketLivescoreResponse>('Livescore', params || {});
      if (res && res.result && Array.isArray(res.result) && res.result.length > 0) return res;
      throw new Error('Fallback livescore');
    } catch (error) {
      const fixtures = await advancedCricketApi.getFixtures({});
      const live = (fixtures.result || []).filter(m => m.event_live === '1');
      return { success: 1, result: live.length > 0 ? live : (fixtures.result || []) };
    }
  },

  getH2H: async (params: Omit<CricketH2HParams, 'met'>): Promise<CricketH2HResponse> => {
    try {
      return await fetchFromAPI<CricketH2HResponse>('H2H', params);
    } catch (error) {
      return { success: 1, result: { H2H: [], firstTeamResults: [], secondTeamResults: [] } };
    }
  },

  getStandings: async (params?: Omit<CricketStandingsParams, 'met'>): Promise<CricketStandingsResponse> => {
    try {
      const response = await fetchFromAPI<CricketStandingsResponse>('Standings', params || {});
      if (response && response.result && (response.result.total?.length || (Array.isArray(response.result) && response.result.length))) {
        return {
          success: 1,
          result: {
            total: response.result.total || (Array.isArray(response.result) ? response.result : []),
          },
        };
      }
      throw new Error('Empty standings');
    } catch (error) {
      const mockIPLStandings: CricketStanding[] = [
        { standing_place: '1', standing_place_type: 'Playoffs Qualifier', standing_team: 'Kolkata Knight Riders', standing_MP: '14', standing_W: '10', standing_L: '3', standing_NR: '1', standing_R: '2640', standing_NRR: '+1.428', standing_Pts: '21', team_key: '13', league_key: '9785', league_round: 'Group', standing_updated: '2026-03-01' },
        { standing_place: '2', standing_place_type: 'Playoffs Qualifier', standing_team: 'Sunrisers Hyderabad', standing_MP: '14', standing_W: '9', standing_L: '4', standing_NR: '1', standing_R: '2820', standing_NRR: '+1.115', standing_Pts: '19', team_key: '14', league_key: '9785', league_round: 'Group', standing_updated: '2026-03-01' },
        { standing_place: '3', standing_place_type: 'Eliminator', standing_team: 'Rajasthan Royals', standing_MP: '14', standing_W: '8', standing_L: '5', standing_NR: '1', standing_R: '2410', standing_NRR: '+0.273', standing_Pts: '17', team_key: '15', league_key: '9785', league_round: 'Group', standing_updated: '2026-03-01' },
        { standing_place: '4', standing_place_type: 'Eliminator', standing_team: 'Royal Challengers Bengaluru', standing_MP: '14', standing_W: '7', standing_L: '7', standing_NR: '0', standing_R: '2725', standing_NRR: '+0.459', standing_Pts: '14', team_key: '11', league_key: '9785', league_round: 'Group', standing_updated: '2026-03-01' },
        { standing_place: '5', standing_place_type: 'Eliminated', standing_team: 'Chennai Super Kings', standing_MP: '14', standing_W: '7', standing_L: '7', standing_NR: '0', standing_R: '2510', standing_NRR: '+0.392', standing_Pts: '14', team_key: '12', league_key: '9785', league_round: 'Group', standing_updated: '2026-03-01' },
        { standing_place: '6', standing_place_type: 'Eliminated', standing_team: 'Mumbai Indians', standing_MP: '14', standing_W: '6', standing_L: '8', standing_NR: '0', standing_R: '2540', standing_NRR: '-0.210', standing_Pts: '12', team_key: '16', league_key: '9785', league_round: 'Group', standing_updated: '2026-03-01' },
      ];
      return { success: 1, result: { total: mockIPLStandings } };
    }
  },

  getNews: async (): Promise<CricketNewsItem[]> => {
    try {
      const res = await fetchFromAPI<any>('news');
      const list = res.storyList || res.result || res.news || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any, idx: number) => ({
          id: String(item.story?.id || item.id || idx),
          title: item.story?.hline || item.title || 'Cricket Headline',
          summary: item.story?.intro || item.summary || 'Global tournament insights, squad analysis, and tactical highlights.',
          image: item.story?.imageId ? CRICBUZZ_IMG(item.story.imageId) : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200',
          published_at: item.story?.pubTime ? new Date(Number(item.story.pubTime)).toLocaleDateString() : 'Today',
          author: item.story?.source || 'Cricbuzz Bureau',
          read_time: '3 min read',
          category: 'World Cricket',
        }));
      }
    } catch (e) {
      console.warn('Error in getNews (mobile):', e);
    }
    return [
      {
        id: 'n1',
        title: 'ICC World Test Championship: Tactics, Wickets, and Final Projections',
        summary: 'A statistical breakdown of how the top four test nations stand in the race to Lord’s.',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200',
        published_at: 'Today',
        author: 'Goalmills Cricket Bureau',
        read_time: '4 min read',
        category: 'Test Cricket',
      },
      {
        id: 'n2',
        title: 'Franchise Squad Matrix: Auction Trends and Key Signings for 2026',
        summary: 'Deep dive into franchise auction spends and all-rounder tactical valuation models.',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200',
        published_at: 'Yesterday',
        author: 'Analytics Desk',
        read_time: '5 min read',
        category: 'IPL / T20',
      },
    ];
  },

  getTeams: async (params?: Omit<CricketTeamsParams, 'met'>): Promise<CricketTeamsResponse> => {
    try {
      const res = await fetchFromAPI<CricketTeamsResponse>('Teams', params || {});
      if (res && res.result && Array.isArray(res.result) && res.result.length > 0) return res;
      throw new Error('Fallback teams');
    } catch (error) {
      return {
        success: 1,
        result: [
          { team_key: '2', team_name: 'India', team_logo: 'https://static.cricbuzz.com/a/img/v1/i1/c776162/i.jpg' },
          { team_key: '4', team_name: 'Australia', team_logo: 'https://static.cricbuzz.com/a/img/v1/i1/c776202/i.jpg' },
          { team_key: '9', team_name: 'England', team_logo: 'https://static.cricbuzz.com/a/img/v1/i1/c776237/i.jpg' },
          { team_key: '5', team_name: 'Sri Lanka', team_logo: 'https://static.cricbuzz.com/a/img/v1/i1/c776254/i.jpg' },
        ],
      };
    }
  },

  getPlayers: async (params?: GetCricketPlayersParams): Promise<CricketPlayersResponse> => {
    try {
      const res = await fetchFromAPI<CricketPlayersResponse>('Players', params || {});
      if (res && res.result && Array.isArray(res.result) && res.result.length > 0) return res;
      throw new Error('Fallback players');
    } catch (error) {
      return { success: 1, result: CRICKET_PLAYERS_DATABASE };
    }
  },

  getPlayerById: async (playerId: string | number): Promise<CricketPlayer | null> => {
    try {
      const players = await advancedCricketApi.getPlayers({ playerId });
      const found = players.result.find(p => String(p.player_key) === String(playerId));
      return found || CRICKET_PLAYERS_DATABASE[0];
    } catch (error) {
      return CRICKET_PLAYERS_DATABASE[0];
    }
  },

  getRankings: async (
    format: 'test' | 'odi' | 't20' = 'test',
    category: 'teams' | 'batting' | 'bowling' | 'allrounders' = 'teams',
    gender: 'men' | 'women' = 'men'
  ): Promise<CricketIccRankingsResponse> => {
    const key = `${gender}-${format}-${category}`;
    const rankingList = ICC_RANKINGS_DATA[key] || ICC_RANKINGS_DATA['men-test-teams'];
    return { format, category, gender, rankings: rankingList };
  },

  getOdds: async (params?: Omit<CricketOddsParams, 'met'>): Promise<CricketOddsResponse> => {
    try {
      return await fetchFromAPI<CricketOddsResponse>('Odds', params || {});
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  getProbabilities: async (params: Omit<CricketProbabilitiesParams, 'met'>): Promise<CricketProbabilitiesResponse> => {
    try {
      return await fetchFromAPI<CricketProbabilitiesResponse>('Probabilities', params);
    } catch (error) {
      return {
        success: 1,
        result: {
          [String(params.matchId)]: { event_HW: '58%', event_D: '4%', event_AW: '38%' },
        },
      };
    }
  },

  getLiveOdds: async (params?: Omit<CricketLiveOddsParams, 'met'>): Promise<CricketLiveOddsResponse> => {
    try {
      return await fetchFromAPI<CricketLiveOddsResponse>('LiveOdds', params || {});
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  getComments: async (params: Omit<CricketCommentsParams, 'met'>): Promise<CricketCommentsResponse> => {
    try {
      return await fetchFromAPI<CricketCommentsResponse>('Comments', params);
    } catch (error) {
      return { success: 1, result: {} };
    }
  },

  getVideos: async (params: Omit<CricketVideosParams, 'met'>): Promise<CricketVideosResponse> => {
    try {
      return await fetchFromAPI<CricketVideosResponse>('Videos', params);
    } catch (error) {
      return { success: 1, result: [] };
    }
  },

  getTrendingPlayers: async (): Promise<CricketPlayer[]> => {
    try {
      const res = await fetchFromAPI<any>('players/trending');
      const list = res.player || res.result || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((p: any) => ({
          player_key: String(p.id || p.player_key || p.playerId),
          player_name: p.name || p.player_name || 'Cricket Star',
          team_name: p.teamName || p.team_name || 'National Team',
          player_country: p.country || p.player_country || 'International',
          player_type: p.role || p.player_type || 'Batsman',
          player_image: p.faceImageId ? CRICBUZZ_IMG(p.faceImageId) : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400',
        }));
      }
    } catch (e) {
      console.warn('Error in getTrendingPlayers (mobile):', e);
    }
    return CRICKET_PLAYERS_DATABASE;
  },

  getPlayerCareer: async (playerId: string | number): Promise<any> => {
    try {
      const res = await fetchFromAPI<any>('players/get-career', { playerId: String(playerId) });
      if (res && (res.values || res.result)) return res.values || res.result;
    } catch (e) {
      console.warn('Error in getPlayerCareer (mobile):', e);
    }
    return null;
  },

  getPlayerNews: async (playerId: string | number): Promise<CricketNewsItem[]> => {
    try {
      const res = await fetchFromAPI<any>('players/get-news', { playerId: String(playerId) });
      const newsList = res.storyList || res.result || res.news || (Array.isArray(res) ? res : []);
      if (Array.isArray(newsList) && newsList.length > 0) {
        return newsList.map((item: any, idx: number) => ({
          id: String(item.story?.id || item.id || idx),
          title: item.story?.hline || item.title || 'Player Performance Analysis',
          summary: item.story?.intro || item.summary || 'Tactical breakdown and tournament form.',
          image: item.story?.imageId ? CRICBUZZ_IMG(item.story.imageId) : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200',
          published_at: item.story?.pubTime ? new Date(Number(item.story.pubTime)).toLocaleDateString() : 'Today',
          author: item.story?.source || 'Cricbuzz Editorial',
          read_time: '3 min read',
          category: 'Player Spotlight',
        }));
      }
    } catch (e) {
      console.warn('Error in getPlayerNews (mobile):', e);
    }
    return [];
  },

  getPlayerBowling: async (playerId: string | number): Promise<any> => {
    try {
      const res = await fetchFromAPI<any>('players/get-bowling', { playerId: String(playerId) });
      if (res && (res.values || res.result)) return res.values || res.result;
    } catch (e) {
      console.warn('Error in getPlayerBowling (mobile):', e);
    }
    return null;
  },

  getPlayerBatting: async (playerId: string | number): Promise<any> => {
    try {
      const res = await fetchFromAPI<any>('players/get-batting', { playerId: String(playerId) });
      if (res && (res.values || res.result)) return res.values || res.result;
    } catch (e) {
      console.warn('Error in getPlayerBatting (mobile):', e);
    }
    return null;
  },

  getPlayerInfo: async (playerId: string | number): Promise<CricketPlayer | null> => {
    return await advancedCricketApi.getPlayerById(playerId);
  },

  getTeamsList: async (type: 'international' | 'league' | 'women' | 'domestic' = 'international'): Promise<CricketTeam[]> => {
    try {
      const res = await fetchFromAPI<any>('teams/list', { type });
      const rawList = res.list || res.result || res.teams || (Array.isArray(res) ? res : []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((t: any) => ({
          team_key: String(t.teamId || t.team_key || t.id),
          team_name: t.teamName || t.team_name || t.name,
          team_short_name: t.teamSName || t.team_short_name || (t.teamName || '').slice(0, 3).toUpperCase(),
          team_logo: t.imageId ? CRICBUZZ_IMG(t.imageId) : t.team_logo,
          country_name: t.countryName || t.teamName || 'International',
        }));
      }
    } catch (e) {
      console.warn('Error in getTeamsList (mobile):', e);
    }
    const all = await advancedCricketApi.getTeams();
    return all.result || [];
  },

  getTeamSchedules: async (teamId: string | number): Promise<CricketEvent[]> => {
    try {
      const res = await fetchFromAPI<any>('teams/get-schedules', { teamId: String(teamId) });
      const matches = res.result || res.teamMatchesData || res.matches || (Array.isArray(res) ? res : []);
      if (Array.isArray(matches) && matches.length > 0) return matches;
    } catch (e) {
      console.warn('Error in getTeamSchedules (mobile):', e);
    }
    return [];
  },

  getTeamResults: async (teamId: string | number): Promise<CricketEvent[]> => {
    try {
      const res = await fetchFromAPI<any>('teams/get-results', { teamId: String(teamId) });
      const matches = res.result || res.teamMatchesData || res.matches || (Array.isArray(res) ? res : []);
      if (Array.isArray(matches) && matches.length > 0) return matches;
    } catch (e) {
      console.warn('Error in getTeamResults (mobile):', e);
    }
    return [];
  },

  getTeamNews: async (teamId: string | number): Promise<CricketNewsItem[]> => {
    try {
      const res = await fetchFromAPI<any>('teams/get-news', { teamId: String(teamId) });
      const list = res.storyList || res.result || res.news || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any, i: number) => ({
          id: String(item.story?.id || item.id || i),
          title: item.story?.hline || item.title || 'Franchise Squad News',
          summary: item.story?.intro || item.summary || 'Team tactical updates and player selections.',
          image: item.story?.imageId ? CRICBUZZ_IMG(item.story.imageId) : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200',
          published_at: item.story?.pubTime ? new Date(Number(item.story.pubTime)).toLocaleDateString() : 'Today',
          author: item.story?.source || 'Cricbuzz Bureau',
          read_time: '3 min read',
          category: 'Team Intel',
        }));
      }
    } catch (e) {
      console.warn('Error in getTeamNews (mobile):', e);
    }
    return [];
  },

  getTeamPlayers: async (teamId: string | number): Promise<CricketPlayer[]> => {
    try {
      const res = await fetchFromAPI<any>('teams/get-players', { teamId: String(teamId) });
      const rawPlayers = res.result || res.player || res.players || (Array.isArray(res) ? res : []);
      if (Array.isArray(rawPlayers) && rawPlayers.length > 0) return rawPlayers;
    } catch (e) {
      console.warn('Error in getTeamPlayers (mobile):', e);
    }
    const playersRes = await advancedCricketApi.getPlayers({ teamId: String(teamId) });
    return playersRes.result || [];
  },

  getTeamStatsFilters: async (teamId: string | number): Promise<any> => {
    try {
      const res = await fetchFromAPI<any>('teams/get-stats-filters', { teamId: String(teamId) });
      return res.types || res.result || ['Most Runs', 'Most Wickets', 'Highest Individual Score', 'Best Bowling Figures'];
    } catch (e) {
      return ['Most Runs', 'Most Wickets', 'Highest Individual Score', 'Best Bowling Figures'];
    }
  },

  getTeamStats: async (teamId: string | number, params: any = {}): Promise<any> => {
    try {
      const res = await fetchFromAPI<any>('teams/get-stats', { teamId: String(teamId), ...params });
      return res.values || res.result || res;
    } catch (e) {
      return {
        headers: ['Player', 'Matches', 'Innings', 'Runs', 'Avg', 'SR'],
        values: [
          ['Lead Batter', '12', '12', '584', '53.09', '142.4'],
          ['All-Rounder', '12', '10', '320', '40.00', '165.2'],
        ],
      };
    }
  },
};
