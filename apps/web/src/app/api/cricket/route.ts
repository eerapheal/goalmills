import { NextRequest, NextResponse } from 'next/server';

// In-memory cache store: key -> { timestamp: number, data: any, ttl: number }
interface CacheEntry {
  timestamp: number;
  data: any;
  ttl: number;
}

const CACHE_STORE = new Map<string, CacheEntry>();

// Throttle tracking for rate-limited upstream responses (429)
let rateLimitBackoffUntil = 0;

// Rate-limit spacer: ensures minimum 250ms spacing between outbound upstream fetches to prevent 429 burst rejects
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

/**
 * Determine dynamic TTL in seconds based on the requested endpoint
 */
function getTtlForEndpoint(endpoint: string): number {
  const ep = endpoint.toLowerCase();
  if (ep.includes('live') || ep.includes('score')) {
    return 15; // 15 seconds for live matches
  }
  if (ep.includes('fixture') || ep.includes('match') || ep.includes('schedule') || ep.includes('upcoming') || ep.includes('recent')) {
    return 60; // 1 minute for fixtures / schedules
  }
  if (ep.includes('standing') || ep.includes('table') || ep.includes('rank') || ep.includes('points-table')) {
    return 300; // 5 minutes for standings & rankings
  }
  if (ep.includes('team') || ep.includes('league') || ep.includes('series') || ep.includes('player') || ep.includes('news')) {
    return 600; // 10 minutes for relatively static info
  }
  return 60;
}

/**
 * Map legacy or generic endpoint names to Cricbuzz RapidAPI routes
 */
function mapCricbuzzPath(endpoint: string, searchParams: URLSearchParams): string {
  if (endpoint.includes('/')) {
    return `/${endpoint.replace(/^\//, '')}`;
  }

  const ep = endpoint.toLowerCase();
  if (ep === 'livescore' || ep === 'live') {
    return '/matches/v1/live';
  }
  if (ep === 'fixtures' || ep === 'upcoming') {
    return '/matches/v1/upcoming';
  }
  if (ep === 'recent') {
    return '/matches/v1/recent';
  }
  if (ep === 'leagues' || ep === 'series') {
    return '/series/v1/international';
  }
  if (ep === 'standings' || ep === 'points-table') {
    const seriesId = searchParams.get('leagueId') || searchParams.get('seriesId');
    return seriesId ? `/series/v1/${seriesId}/points-table` : '/series/v1/international';
  }
  if (ep === 'teams') {
    return '/teams/v1/international';
  }
  if (ep === 'news') {
    return '/news/v1/index';
  }

  return `/matches/v1/${ep}`;
}

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

    // Build headers matching RapidAPI specs
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (isRapidApi) {
      if (API_KEY) {
        headers['x-rapidapi-key'] = API_KEY;
      }
      headers['x-rapidapi-host'] = apiUrl.host;
      apiUrl.pathname = mapCricbuzzPath(endpointParam, searchParams);

      // Only forward valid search params for RapidAPI (strip incompatible date filters)
      searchParams.forEach((value: any, key: any) => {
        if (
          key !== 'met' &&
          key !== 'endpoint' &&
          key !== 'from' &&
          key !== 'to' &&
          key !== 'timezone' &&
          value
        ) {
          apiUrl.searchParams.append(key, value);
        }
      });
    } else {
      apiUrl.searchParams.append('met', endpointParam);
      if (API_KEY) {
        apiUrl.searchParams.append('APIkey', API_KEY);
      }
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

    // If rate-limited backoff is active (429), return stale cached data or graceful fallback
    if (now < rateLimitBackoffUntil) {
      if (cached) {
        return NextResponse.json(cached.data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': `public, s-maxage=30, stale-while-revalidate=60`,
            'X-Cache': 'STALE_THROTTLED',
          },
        });
      }
      return NextResponse.json(
        { success: 1, result: [], message: 'Rate-limited backoff active, returning client fallback' },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
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
      console.warn('Cricket API direct fetch error, falling back to local dataset:', fetchErr);
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 502;
      if (status === 404) {
        console.info(`[Info] No live standings/points-table for series ${searchParams.get('leagueId') || searchParams.get('seriesId') || ''} (bilateral tour/non-league format), using graceful client fallback.`);
      } else {
        console.warn(`Cricket API status ${status} for ${endpointParam}, returning empty success to trigger client fallbacks.`);
      }

      if (status === 429) {
        rateLimitBackoffUntil = Date.now() + 15_000;
      }

      if (cached) {
        return NextResponse.json(cached.data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Cache': 'STALE_ERROR_FALLBACK',
          },
        });
      }

      return NextResponse.json(
        { success: 1, result: [], message: `Live feed fallback (status ${status})` },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    const data = await response.json();

    // Standardize Cricbuzz response wrapper
    const standardized = {
      success: 1,
      result: Array.isArray(data)
        ? data
        : (data.typeMatches ?? data.matches ?? data.values ?? data.storyList ?? data.pointsTable ?? data.result ?? data),
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
