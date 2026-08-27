import { NextRequest, NextResponse } from 'next/server';

interface CacheEntry {
  timestamp: number;
  data: any;
  ttl: number;
}

const CACHE_STORE = new Map<string, CacheEntry>();
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
    await new Promise((resolve) => setTimeout(resolve, delay));
  } else {
    lastFetchTime = Date.now();
  }
  return fetch(url, options);
}

function getApiBaseUrl(): string {
  let raw =
    process.env.NEXT_PUBLIC_BASKETBALL_BASE_URL ||
    process.env.BASKETBALL_BASE_URL ||
    'https://apiv2.allsportsapi.com/basketball';

  raw = raw.trim();
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw.replace(/\/$/, '');
}

const API_KEY =
  process.env.BASKETBALL_API_KEY ||
  process.env.NEXT_PUBLIC_BASKETBALL_API_KEY ||
  process.env.ALLSPORTS_API_KEY ||
  '';

/**
 * Determine dynamic TTL in seconds based on the requested method
 */
function getTtlForMethod(method: string): number {
  const m = method.toLowerCase();
  if (m.includes('live')) {
    return 15; // 15 seconds for live matches
  }
  if (m.includes('fixture') || m.includes('oddslive')) {
    return 60; // 1 minute for fixtures
  }
  if (m.includes('standing') || m.includes('odds')) {
    return 300; // 5 minutes for standings & odds
  }
  if (
    m.includes('league') ||
    m.includes('team') ||
    m.includes('country') ||
    m.includes('player') ||
    m.includes('h2h')
  ) {
    return 600; // 10 minutes for static metadata
  }
  return 60;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const method = searchParams.get('met');

    if (!method) {
      return NextResponse.json({ error: 'Method parameter (met) is required' }, { status: 400 });
    }

    // Mandatory parameter check for Odds endpoint
    if (
      method === 'Odds' &&
      !searchParams.get('matchId') &&
      !searchParams.get('leagueId') &&
      !searchParams.get('from')
    ) {
      console.warn(`Basketball API: Skipping ${method} due to missing mandatory parameters`);
      return NextResponse.json(
        { success: 1, result: {}, message: 'Mandatory parameters missing, skipping external call' },
        { status: 200 }
      );
    }

    const baseUrlStr = getApiBaseUrl();
    const apiUrl = new URL(baseUrlStr);
    apiUrl.searchParams.append('met', method);

    if (API_KEY) {
      apiUrl.searchParams.append('APIkey', API_KEY);
    }

    // Forward all other query parameters
    searchParams.forEach((value, key) => {
      if (key !== 'met' && value) {
        apiUrl.searchParams.append(key, value);
      }
    });

    const cacheKey = apiUrl.toString();
    const ttlSeconds = getTtlForMethod(method);
    const now = Date.now();

    // Check in-memory cache
    const cached = CACHE_STORE.get(cacheKey);
    if (cached && now - cached.timestamp < cached.ttl * 1000) {
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
        {
          success: 1,
          result: [],
          message: 'Basketball API rate-limited backoff active, returning client fallback',
        },
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

    console.log('Proxying basketball request to:', apiUrl.toString());

    // Make the request to the external API with retries
    let response: Response | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await rateLimitedFetch(apiUrl.toString(), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          next: { revalidate: ttlSeconds },
        });

        if (response.ok) break;

        // If 500 or 503, wait and retry
        if (response.status >= 500 && attempts < maxAttempts) {
          console.warn(
            `Basketball API retry ${attempts}/${maxAttempts} for ${method} due to ${response.status}`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          continue;
        }

        break; // Don't retry 4xx errors
      } catch (err) {
        if (attempts >= maxAttempts) {
          console.warn('Basketball API fetch error after retries:', err);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 502;
      console.warn(`Basketball API status ${status} for ${method}, returning graceful fallback.`);

      if (status === 429) {
        rateLimitBackoffUntil = Date.now() + 15_000;
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
        { success: 1, result: [], message: `Basketball live feed fallback (status ${status})` },
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

    // Check if data is an upstream API error response
    const hasUpstreamError =
      data.error === '1' ||
      data.error === 1 ||
      (Array.isArray(data.result) &&
        data.result.some((r: any) => r && (r.cod || (r.msg && !r.event_key))));

    const sanitizedResult = hasUpstreamError
      ? []
      : Array.isArray(data)
        ? data
        : (data.result ?? data.response ?? data);

    // Standardize result property
    const standardized = {
      success: 1,
      result: Array.isArray(sanitizedResult) ? sanitizedResult : [],
      ...(!Array.isArray(data) ? data : {}),
      ...(hasUpstreamError ? { message: 'Upstream account notice, using fallback data' } : {}),
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
    console.error('Basketball Proxy error:', error);
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
