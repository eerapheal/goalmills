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

function getApiBaseUrl(): string {
  let raw =
    process.env.NEXT_PUBLIC_CRICKET_BASE_URL ||
    process.env.CRICKET_BASE_URL ||
    'https://apiv2.allsportsapi.com/cricket';

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
  if (ep.includes('fixture') || ep.includes('match') || ep.includes('schedule')) {
    return 60; // 1 minute for fixtures / schedules
  }
  if (ep.includes('standing') || ep.includes('table') || ep.includes('rank')) {
    return 300; // 5 minutes for standings & rankings
  }
  if (ep.includes('team') || ep.includes('league') || ep.includes('player') || ep.includes('news')) {
    return 600; // 10 minutes for relatively static info
  }
  return 60; // default 60 seconds
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

    // Build headers
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (isRapidApi) {
      if (API_KEY) {
        headers['x-rapidapi-key'] = API_KEY;
      }
      headers['x-rapidapi-host'] = apiUrl.host;

      if (endpointParam.includes('/')) {
        apiUrl.pathname = `/${endpointParam.replace(/^\//, '')}`;
      } else {
        apiUrl.pathname = `/cricket/v1/${endpointParam.toLowerCase()}`;
      }
    } else {
      apiUrl.searchParams.append('met', endpointParam);
      if (API_KEY) {
        apiUrl.searchParams.append('APIkey', API_KEY);
      }
    }

    // Forward all other search params
    searchParams.forEach((value: any, key: any) => {
      if (key !== 'met' && key !== 'endpoint' && value) {
        apiUrl.searchParams.append(key, value);
      }
    });

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

    // If we are within a rate limit backoff period (429), return cached stale data or fallback immediately
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

    let response: Response | null = null;
    try {
      response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers,
        next: { revalidate: ttlSeconds },
      });
    } catch (fetchErr) {
      console.warn('Cricket API direct fetch error, falling back to local dataset:', fetchErr);
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 502;
      console.warn(`Cricket API status ${status} for ${endpointParam}, returning empty success to trigger client fallbacks.`);

      // If rate limited (429), trigger a 30-second backoff window to stop hammering upstream
      if (status === 429) {
        rateLimitBackoffUntil = Date.now() + 30_000;
      }

      // If we have any stale cached data, serve it rather than an empty array
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

    // Standardize result property if API returns list or wrapped object
    const standardized = {
      success: 1,
      result: Array.isArray(data) ? data : (data.result ?? data.typeMatches ?? data.matches ?? data),
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
    // Graceful response so UI never crashes
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
