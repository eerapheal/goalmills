import { NextRequest, NextResponse } from 'next/server';

// ─── In-Memory Cache ──────────────────────────────────────────────────────────
interface CacheEntry {
  timestamp: number;
  data: any;
  ttl: number;
}

const CACHE_STORE = new Map<string, CacheEntry>();
let rateLimitBackoffUntil = 0;

// Rate-limit spacer: minimum 250ms between outbound fetches to prevent 429 bursts
let lastFetchTime = 0;
const MIN_FETCH_GAP_MS = 250;

async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLast = now - lastFetchTime;
  if (timeSinceLast < MIN_FETCH_GAP_MS) {
    const delay = MIN_FETCH_GAP_MS - timeSinceLast;
    lastFetchTime = now + delay;
    await new Promise(resolve => setTimeout(resolve, delay));
  } else {
    lastFetchTime = Date.now();
  }
  return fetch(url, options);
}

// ─── Config ───────────────────────────────────────────────────────────────────
function getApiBaseUrl(): string {
  let raw =
    process.env.NEXT_PUBLIC_CRICKET_BASE_URL ||
    process.env.CRICKET_BASE_URL ||
    'https://cricbuzz-cricket.p.rapidapi.com';
  raw = raw.trim();
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw.replace(/\/$/, '');
}

const API_KEY =
  process.env.CRICKET_API_KEY ||
  process.env.NEXT_PUBLIC_CRICKET_API_KEY ||
  process.env.ALLSPORTS_API_KEY ||
  '';

// ─── TTL Logic ────────────────────────────────────────────────────────────────
function getTtlForEndpoint(endpoint: string): number {
  const ep = endpoint.toLowerCase();
  if (ep.includes('live') || ep.includes('score')) return 15;
  if (ep.includes('fixture') || ep.includes('match') || ep.includes('schedule') || ep.includes('upcoming') || ep.includes('recent') || ep.includes('results')) return 60;
  if (ep.includes('standing') || ep.includes('table') || ep.includes('rank') || ep.includes('points-table')) return 300;
  if (ep.includes('team') || ep.includes('league') || ep.includes('series') || ep.includes('player') || ep.includes('news') || ep.includes('stats')) return 600;
  return 60;
}

// ─── Cricbuzz Path Mapping ────────────────────────────────────────────────────
function mapCricbuzzPath(endpoint: string, searchParams: URLSearchParams): string {
  const ep = endpoint.toLowerCase().trim();
  const playerId = searchParams.get('playerId') || searchParams.get('id') || searchParams.get('player_id');
  const seriesId = searchParams.get('leagueId') || searchParams.get('seriesId') || searchParams.get('id');
  const teamId = searchParams.get('teamId') || searchParams.get('team_id') || searchParams.get('id');

  // Direct paths starting with '/'
  if (endpoint.startsWith('/')) return endpoint;

  // Live / Matches / Fixtures / Recent
  if (ep === 'livescore' || ep === 'live') return '/matches/v1/live';
  if (ep === 'fixtures' || ep === 'upcoming') return '/matches/v1/upcoming';
  if (ep === 'recent') return '/matches/v1/recent';

  // Series / Leagues
  if (ep === 'leagues' || ep === 'series' || ep === 'series/v1/international') return '/series/v1/international';
  if (ep === 'standings' || ep === 'points-table' || ep.includes('points-table')) {
    return seriesId ? `/series/v1/${seriesId}/points-table` : '/series/v1/international';
  }

  // Teams: Specialized sub-routes
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

  // Teams: General listing
  if (ep === 'teams' || ep === 'teams/list' || ep.startsWith('teams/')) {
    const teamType = searchParams.get('type') || 'international';
    return `/teams/v1/${teamType}`;
  }

  // Players
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

  if (ep === 'players/get-info' || ep === 'player/info' || ep === 'player') {
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
  if (ep === 'players/get-news' || ep === 'player/news') {
    return '/news/v1/index';
  }

  // News
  if (ep === 'news' || ep === 'news/v1/index' || ep.includes('news')) {
    return '/news/v1/index';
  }

  return endpoint.includes('/') ? `/${endpoint.replace(/^\//, '')}` : `/matches/v1/${endpoint}`;
}

// ─── Cricbuzz → App Format Transformers ───────────────────────────────────────

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
 * Build score strings from innings data
 */
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

/**
 * Convert match info & score into a standardized CricketEvent
 */
function mapMatchToEvent(info: any, score: any, seriesNameFallback?: string): any {
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
function transformCricbuzzMatches(data: any): any[] {
  const typeMatches = data?.typeMatches;
  if (!Array.isArray(typeMatches)) return [];

  const events: any[] = [];
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
 * Extract a flat array of CricketEvent objects from team schedule/results response
 */
function transformCricbuzzTeamMatches(data: any): any[] {
  if (!data) return [];
  const events: any[] = [];

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
 * Transform Cricbuzz series response into CricketLeague[] format
 */
function transformCricbuzzSeries(data: any): any[] {
  const seriesMap = data?.seriesMapProto || data?.seriesMapProfiles;
  if (!Array.isArray(seriesMap)) return [];

  const leagues: any[] = [];
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
 * Filters out header items like { teamName: 'Test Teams' } without teamId
 */
function transformCricbuzzTeamsList(data: any): any[] {
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
        team_logo: resolveImgUrl(img),
        country_name: t.countryName || t.country || t.teamName || 'International',
      };
    });
}

/**
 * Transform Cricbuzz teams/v1/{id}/players into CricketPlayer[] format
 */
function transformCricbuzzTeamSquad(data: any, teamId: string): any[] {
  const raw = data?.player;
  if (!Array.isArray(raw)) return [];

  let currentRole = 'Player';
  const players: any[] = [];

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
 * Transform Cricbuzz player responses (trending list or single player bio)
 */
function transformCricbuzzPlayers(data: any): any[] {
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
 * Detect the type of endpoint and apply the correct Cricbuzz → app transformation.
 */
function transformCricbuzzResponse(endpointParam: string, data: any, searchParams: URLSearchParams): any {
  const ep = endpointParam.toLowerCase();
  const teamId = searchParams.get('teamId') || searchParams.get('team_id') || searchParams.get('id') || '';

  // Team Schedule or Results: data.teamMatchesData
  if (data?.teamMatchesData || ep.includes('schedule') || ep.includes('results')) {
    const events = transformCricbuzzTeamMatches(data);
    if (events.length > 0) return { success: 1, result: events };
  }

  // Team Players Squad: /teams/v1/{id}/players
  if (ep.includes('teams/get-players') || (ep.includes('teams') && ep.includes('players')) || (data?.player && Array.isArray(data?.player) && data.player.some((x: any) => !x.id && x.name))) {
    const squad = transformCricbuzzTeamSquad(data, teamId);
    if (squad.length > 0) return { success: 1, result: squad };
  }

  // Match listing endpoints
  if (ep === 'livescore' || ep === 'live' || ep === 'fixtures' || ep === 'upcoming' || ep === 'recent' || ep.includes('matches/v1')) {
    const events = transformCricbuzzMatches(data);
    return { success: 1, result: events };
  }

  // Teams listing: /teams/v1/{type}
  if (data?.list || ep === 'teams' || ep === 'teams/list') {
    const teams = transformCricbuzzTeamsList(data);
    if (teams.length > 0) return { success: 1, result: teams };
  }

  // Series / Leagues listing
  if (ep === 'leagues' || ep === 'series' || ep.includes('series/v1/international')) {
    const leagues = transformCricbuzzSeries(data);
    return { success: 1, result: leagues };
  }

  // Players
  if (ep.includes('player') || data?.player || (data?.id && data?.name)) {
    const players = transformCricbuzzPlayers(data);
    if (players.length > 0) return { success: 1, result: players };
  }

  // Fallthrough
  return {
    success: 1,
    result: Array.isArray(data) ? data : (data.result ?? data.values ?? data.types ?? data.storyList ?? data),
    ...(!Array.isArray(data) ? data : {}),
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpointParam = searchParams.get('endpoint') || searchParams.get('met');

    if (!endpointParam) {
      return NextResponse.json(
        { error: 'Endpoint or method parameter (endpoint/met) is required' },
        { status: 400 }
      );
    }

    const baseUrlStr = getApiBaseUrl();
    const isRapidApi = baseUrlStr.includes('rapidapi.com');
    const apiUrl = new URL(baseUrlStr);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (isRapidApi) {
      if (API_KEY) headers['x-rapidapi-key'] = API_KEY;
      headers['x-rapidapi-host'] = apiUrl.host;
      apiUrl.pathname = mapCricbuzzPath(endpointParam, searchParams);

      // Only forward params that Cricbuzz accepts
      searchParams.forEach((value: any, key: any) => {
        if (!['met', 'endpoint', 'from', 'to', 'timezone', 'leagueId', 'seriesId', 'playerId', 'teamId', 'team_id'].includes(key) && value) {
          apiUrl.searchParams.append(key, value);
        }
      });
    } else {
      apiUrl.searchParams.append('met', endpointParam);
      if (API_KEY) apiUrl.searchParams.append('APIkey', API_KEY);
      searchParams.forEach((value: any, key: any) => {
        if (key !== 'met' && key !== 'endpoint' && value) {
          apiUrl.searchParams.append(key, value);
        }
      });
    }

    const cacheKey = apiUrl.toString();
    const ttlSeconds = getTtlForEndpoint(endpointParam);
    const now = Date.now();

    // Check in-memory cache
    const cached = CACHE_STORE.get(cacheKey);
    if (cached && (now - cached.timestamp < cached.ttl * 1000)) {
      return NextResponse.json(cached.data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`,
          'X-Cache': 'HIT',
        },
      });
    }

    // Rate-limited backoff check
    if (now < rateLimitBackoffUntil) {
      if (cached) {
        return NextResponse.json(cached.data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Cache': 'STALE_THROTTLED',
          },
        });
      }
      return NextResponse.json(
        { success: 1, result: [], message: 'Rate-limited backoff active' },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('Proxying cricket request to:', apiUrl.toString());

    let response: Response | null = null;
    try {
      response = await rateLimitedFetch(apiUrl.toString(), {
        method: 'GET',
        headers,
        next: { revalidate: ttlSeconds },
      });
    } catch (fetchErr) {
      console.warn('Cricket API fetch error:', fetchErr);
    }

    if (!response || !response.ok || response.status === 204) {
      const status = response ? response.status : 502;
      if (status === 404 || status === 204) {
        console.info(`[Info] Feed unavailable for ${endpointParam} (status ${status}), returning client fallback.`);
      } else {
        console.warn(`Cricket API status ${status} for ${endpointParam}, triggering client fallbacks.`);
      }
      if (status === 429) rateLimitBackoffUntil = Date.now() + 15_000;

      if (cached) {
        return NextResponse.json(cached.data, {
          headers: { 'Access-Control-Allow-Origin': '*', 'X-Cache': 'STALE_ERROR_FALLBACK' },
        });
      }

      return NextResponse.json(
        { success: 1, result: [], message: `Live feed fallback (status ${status})` },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const text = await response.text();
    let data: any = {};
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn('Cricket proxy JSON parse warning:', err);
        data = {};
      }
    }

    // ─── TRANSFORM: Convert Cricbuzz nested format → app-compatible flat format
    const standardized = isRapidApi
      ? transformCricbuzzResponse(endpointParam, data, searchParams)
      : {
          success: 1,
          result: Array.isArray(data) ? data : (data.result ?? data),
          ...(!Array.isArray(data) ? data : {}),
        };

    // Store in memory cache
    CACHE_STORE.set(cacheKey, {
      timestamp: Date.now(),
      data: standardized,
      ttl: ttlSeconds,
    });

    return NextResponse.json(standardized, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`,
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Cricket Proxy error:', error);
    return NextResponse.json(
      { success: 1, result: [], message: error instanceof Error ? error.message : 'Fallback' },
      { status: 200 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
