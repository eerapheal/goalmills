import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet, singleFlight } from '@/lib/redisCache';

let rateLimitBackoffUntil = 0;
let consecutiveFailures = 0;
let circuitBreakerOpenUntil = 0;

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

function getTtlForEndpoint(endpoint: string): number {
  const ep = endpoint.toLowerCase();
  if (ep.includes('live') || ep.includes('score')) return 15;
  if (
    ep.includes('fixture') ||
    ep.includes('match') ||
    ep.includes('schedule') ||
    ep.includes('upcoming') ||
    ep.includes('recent') ||
    ep.includes('results')
  )
    return 60;
  if (
    ep.includes('standing') ||
    ep.includes('table') ||
    ep.includes('rank') ||
    ep.includes('points-table')
  )
    return 300;
  if (
    ep.includes('team') ||
    ep.includes('league') ||
    ep.includes('series') ||
    ep.includes('player') ||
    ep.includes('news') ||
    ep.includes('stats')
  )
    return 600;
  return 60;
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

    if (isRapidApi) {
      apiUrl.pathname = endpointParam.startsWith('/') ? endpointParam : `/${endpointParam}`;
    } else {
      apiUrl.searchParams.append('met', endpointParam);
      if (API_KEY) apiUrl.searchParams.append('APIkey', API_KEY);
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (isRapidApi && API_KEY) {
      headers['x-rapidapi-key'] = API_KEY;
      headers['x-rapidapi-host'] = new URL(baseUrlStr).host;
    }

    const cacheKey = `gm:sport:cricket:${apiUrl.toString()}`;
    const ttlSeconds = getTtlForEndpoint(endpointParam);
    const now = Date.now();

    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`,
          'X-Cache': 'HIT',
          'X-Data-Freshness': 'FRESH',
        },
      });
    }

    const isCircuitOpen = now < circuitBreakerOpenUntil;
    const isRateLimited = now < rateLimitBackoffUntil;

    if (isCircuitOpen || isRateLimited) {
      if (cached) {
        return NextResponse.json(
          { ...cached, isStale: true },
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Cache-Control': `public, s-maxage=15, stale-while-revalidate=30`,
              'X-Cache': 'STALE_CIRCUIT_DEGRADED',
            },
          }
        );
      }
      return NextResponse.json(
        {
          success: 1,
          result: [],
          isStale: true,
          message: isCircuitOpen
            ? 'Cricket provider circuit breaker active, serving fallback'
            : 'Rate-limited backoff active, serving fallback',
          lastUpdatedAt: new Date().toISOString(),
        },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const standardized = await singleFlight(cacheKey, async () => {
      console.log('Proxying cricket request to:', apiUrl.toString());

      let response: Response | null = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          response = await rateLimitedFetch(apiUrl.toString(), {
            method: 'GET',
            headers,
            next: { revalidate: ttlSeconds },
          });

          if (response && response.ok && response.status !== 204) {
            consecutiveFailures = 0;
            break;
          }

          if (response && response.status >= 500 && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
            continue;
          }

          break;
        } catch (fetchErr) {
          if (attempts >= maxAttempts) {
            console.warn('Cricket API fetch error after retries:', fetchErr);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
        }
      }

      if (!response || !response.ok || response.status === 204) {
        const status = response ? response.status : 502;
        consecutiveFailures++;
        if (consecutiveFailures >= 5) {
          circuitBreakerOpenUntil = Date.now() + 30_000;
        }
        if (status === 429) rateLimitBackoffUntil = Date.now() + 15_000;

        return {
          success: 1,
          result: [],
          isStale: true,
          lastUpdatedAt: new Date().toISOString(),
          message: `Live feed fallback (status ${status})`,
        };
      }

      let text = '';
      if (typeof response.text === 'function') {
        text = await response.text();
      } else if (typeof response.json === 'function') {
        const j = await response.json();
        text = typeof j === 'string' ? j : JSON.stringify(j);
      }

      let data: any = {};
      if (text && text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }

      const resultPayload = {
        success: 1,
        result: Array.isArray(data) ? data : (data.result ?? data),
        ...(!Array.isArray(data) ? data : {}),
        lastUpdatedAt: new Date().toISOString(),
        isStale: false,
      };

      await cacheSet(cacheKey, resultPayload, ttlSeconds);
      return resultPayload;
    });

    return NextResponse.json(standardized, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`,
        'X-Cache': 'MISS',
        'X-Data-Freshness': 'LIVE',
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
