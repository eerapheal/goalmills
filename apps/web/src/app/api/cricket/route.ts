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
  if (ep.includes('fixture') || ep.includes('match') || ep.includes('schedule') || ep.includes('upcoming') || ep.includes('recent')) return 60;
  if (ep.includes('standing') || ep.includes('table') || ep.includes('rank') || ep.includes('points-table')) return 300;
  if (ep.includes('team') || ep.includes('league') || ep.includes('series') || ep.includes('player') || ep.includes('news')) return 600;
  return 60;
}

// ─── Cricbuzz Path Mapping ────────────────────────────────────────────────────
function mapCricbuzzPath(endpoint: string, searchParams: URLSearchParams): string {
  if (endpoint.includes('/')) return `/${endpoint.replace(/^\//, '')}`;

  const ep = endpoint.toLowerCase();
  if (ep === 'livescore' || ep === 'live') return '/matches/v1/live';
  if (ep === 'fixtures' || ep === 'upcoming') return '/matches/v1/upcoming';
  if (ep === 'recent') return '/matches/v1/recent';
  if (ep === 'leagues' || ep === 'series') return '/series/v1/international';
  if (ep === 'standings' || ep === 'points-table') {
    const seriesId = searchParams.get('leagueId') || searchParams.get('seriesId');
    return seriesId ? `/series/v1/${seriesId}/points-table` : '/series/v1/international';
  }
  if (ep === 'teams') return '/teams/v1/international';
  if (ep === 'news') return '/news/v1/index';
  return `/matches/v1/${ep}`;
}

// ─── Cricbuzz → App Format Transformers ───────────────────────────────────────

const CRICBUZZ_IMG = (id: number | string) =>
  `https://static.cricbuzz.com/a/img/v1/i1/c${id}/i.jpg`;

/**
 * Extract a flat array of CricketEvent objects from the nested Cricbuzz
 * `typeMatches[].seriesMatches[].seriesAdWrapper.matches[]` structure.
 */
function transformCricbuzzMatches(data: any): any[] {
  const typeMatches = data?.typeMatches;
  if (!Array.isArray(typeMatches)) return [];

  const events: any[] = [];
  for (const tm of typeMatches) {
    const matchType = tm.matchType || '';
    const seriesMatches = tm.seriesMatches;
    if (!Array.isArray(seriesMatches)) continue;

    for (const sm of seriesMatches) {
      const wrapper = sm.seriesAdWrapper;
      if (!wrapper?.matches) continue;

      for (const m of wrapper.matches) {
        const info = m.matchInfo;
        const score = m.matchScore;
        if (!info) continue;

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

        // Build score strings from innings data
        const buildScoreStr = (teamScore: any): string => {
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
        };

        const isLive = info.state === 'In Progress' || info.state === 'Live' || info.stateTitle === 'In Progress';
        const isComplete = info.state === 'Complete' || (info.stateTitle || '').includes('Won');

        events.push({
          event_key: String(info.matchId),
          event_date_start: startDate,
          event_date_stop: endDate,
          event_time: startTime,
          event_home_team: t1.teamName || 'TBA',
          home_team_key: String(t1.teamId || ''),
          event_away_team: t2.teamName || 'TBA',
          away_team_key: String(t2.teamId || ''),
          event_service_home: '',
          event_service_away: '',
          event_home_final_result: buildScoreStr(score?.team1Score),
          event_away_final_result: buildScoreStr(score?.team2Score),
          event_home_rr: null,
          event_away_rr: null,
          event_status: info.state || info.stateTitle || 'Scheduled',
          event_status_info: info.status || '',
          country_name: matchType,
          league_name: info.seriesName || wrapper.seriesName || '',
          league_key: String(info.seriesId || wrapper.seriesId || ''),
          league_round: info.matchDesc || '',
          league_season: new Date(startMs || Date.now()).getFullYear().toString(),
          event_live: isLive ? '1' : '0',
          event_type: info.matchFormat || matchType,
          event_stadium: venue.ground ? `${venue.ground}${venue.city ? ', ' + venue.city : ''}` : undefined,
          event_home_team_logo: t1.imageId ? CRICBUZZ_IMG(t1.imageId) : undefined,
          event_away_team_logo: t2.imageId ? CRICBUZZ_IMG(t2.imageId) : undefined,
        });
      }
    }
  }
  return events;
}

/**
 * Transform Cricbuzz series/international response into CricketLeague[] format.
 * Cricbuzz returns { seriesMapProto: [{ date: "MONTH YEAR", series: [...] }] }
 */
function transformCricbuzzSeries(data: any): any[] {
  // Cricbuzz uses "seriesMapProto" as the key
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
 * Transform Cricbuzz points-table response into CricketStanding[] format.
 */
function transformCricbuzzPointsTable(data: any, leagueKey: string): any[] {
  const pointsTable = data?.pointsTable;
  if (!Array.isArray(pointsTable)) return [];

  const standings: any[] = [];
  for (const group of pointsTable) {
    const table = group.pointsTableInfo;
    if (!Array.isArray(table)) continue;

    for (const entry of table) {
      standings.push({
        standing_place: String(entry.rank || entry.pos || standings.length + 1),
        standing_place_type: entry.qualifier || '',
        standing_team: entry.teamName || entry.teamFullName || '',
        standing_MP: String(entry.matchesPlayed ?? entry.played ?? ''),
        standing_W: String(entry.matchesWon ?? entry.won ?? ''),
        standing_L: String(entry.matchesLost ?? entry.lost ?? ''),
        standing_NR: String(entry.noResult ?? entry.nr ?? '0'),
        standing_R: '',
        standing_NRR: String(entry.nrr ?? '0.000'),
        standing_Pts: String(entry.points ?? entry.pts ?? ''),
        team_key: String(entry.teamId || ''),
        league_key: leagueKey,
        league_round: group.groupName || 'Group',
        standing_updated: new Date().toISOString().split('T')[0],
      });
    }
  }
  return standings;
}

/**
 * Detect the type of endpoint and apply the correct Cricbuzz → app transformation.
 */
function transformCricbuzzResponse(endpointParam: string, data: any, searchParams: URLSearchParams): any {
  const ep = endpointParam.toLowerCase();

  // Match listing endpoints (live, upcoming, recent, fixtures)
  if (ep === 'livescore' || ep === 'live' || ep === 'fixtures' || ep === 'upcoming' || ep === 'recent' || ep.includes('matches/v1')) {
    const events = transformCricbuzzMatches(data);
    return { success: 1, result: events };
  }

  // Series/Leagues listing
  if (ep === 'leagues' || ep === 'series' || ep.includes('series/v1/international')) {
    const leagues = transformCricbuzzSeries(data);
    return { success: 1, result: leagues };
  }

  // Standings / Points Table
  if (ep === 'standings' || ep === 'points-table' || ep.includes('points-table')) {
    const leagueKey = searchParams.get('leagueId') || searchParams.get('seriesId') || '';
    const standings = transformCricbuzzPointsTable(data, leagueKey);
    return { success: 1, result: { total: standings } };
  }

  // Fallthrough: return raw data wrapped in success envelope
  return {
    success: 1,
    result: Array.isArray(data) ? data : (data.result ?? data),
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
        if (!['met', 'endpoint', 'from', 'to', 'timezone', 'leagueId', 'seriesId'].includes(key) && value) {
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

    // If rate-limited backoff is active, return stale cache or empty fallback
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

    if (!response || !response.ok) {
      const status = response ? response.status : 502;
      if (status === 404) {
        console.info(`[Info] Endpoint not found for ${endpointParam} (e.g. bilateral tour with no points table).`);
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

    const data = await response.json();

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

    console.log(`Cricket API [${endpointParam}] → ${Array.isArray(standardized.result) ? standardized.result.length : 'obj'} items returned`);

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
