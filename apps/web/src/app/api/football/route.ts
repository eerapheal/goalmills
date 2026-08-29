import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet, singleFlight } from '@/lib/redisCache';
import { broadcastLiveScore } from '@/lib/socketBroadcaster';

let rateLimitBackoffUntil = 0;
let consecutiveFailures = 0;
let circuitBreakerOpenUntil = 0;

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
    process.env.NEXT_PUBLIC_FOOTBALL_BASE_URL ||
    process.env.FOOTBALL_BASE_URL ||
    'https://apiv2.allsportsapi.com/football';

  raw = raw.trim();
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw.replace(/\/$/, '');
}

const API_KEY =
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
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
  if (m.includes('fixture') || m.includes('oddslive') || m.includes('comments')) {
    return 60; // 1 minute for fixtures / live commentary
  }
  if (m.includes('standing') || m.includes('topscorer') || m.includes('odds')) {
    return 300; // 5 minutes for standings & odds
  }
  if (
    m.includes('league') ||
    m.includes('team') ||
    m.includes('country') ||
    m.includes('player') ||
    m.includes('h2h') ||
    m.includes('video')
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

    const baseUrlStr = getApiBaseUrl();
    const apiUrl = new URL(baseUrlStr);
    apiUrl.searchParams.append('met', method);

    if (API_KEY) {
      apiUrl.searchParams.append('APIkey', API_KEY);
    }

    // Forward all other search params
    searchParams.forEach((value, key) => {
      if (key !== 'met' && value) {
        apiUrl.searchParams.append(key, value);
      }
    });

    const cacheKey = `gm:sport:football:${apiUrl.toString()}`;
    const ttlSeconds = getTtlForMethod(method);
    const now = Date.now();

    // 1. Check Redis / Multi-tier Cache
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

    // 2. Check Circuit Breaker & Rate Limit Throttling
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
              'X-Data-Freshness': 'STALE',
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
            ? 'Provider circuit breaker active, serving fallback state'
            : 'Football API rate-limited backoff active, returning client fallback',
          lastUpdatedAt: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Data-Freshness': 'DEGRADED',
          },
        }
      );
    }

    // 3. Single-Flight Coalesced Upstream Fetch
    const standardized = await singleFlight(cacheKey, async () => {
      console.log('Proxying football request to:', apiUrl.toString());

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

          if (response.ok) {
            consecutiveFailures = 0;
            break;
          }

          if (response.status >= 500 && attempts < maxAttempts) {
            console.warn(
              `Football API retry ${attempts}/${maxAttempts} for ${method} due to ${response.status}`
            );
            await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
            continue;
          }

          break;
        } catch (err) {
          if (attempts >= maxAttempts) {
            console.warn('Football API fetch error after retries:', err);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
        }
      }

      if (!response || !response.ok) {
        const status = response ? response.status : 502;
        console.warn(`Football API status ${status} for ${method}, returning graceful fallback.`);

        consecutiveFailures++;
        if (consecutiveFailures >= 5) {
          circuitBreakerOpenUntil = Date.now() + 30_000;
          console.warn('⚡ Football Provider Circuit Breaker TRIPPED for 30s');
        }

        if (status === 429) {
          rateLimitBackoffUntil = Date.now() + 15_000;
        }

        return {
          success: 1,
          result: [],
          isStale: true,
          lastUpdatedAt: new Date().toISOString(),
          message: `Football live feed fallback (status ${status})`,
        };
      }

      const data = await response.json();

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

      const resultPayload = {
        success: 1,
        result: Array.isArray(sanitizedResult) ? sanitizedResult : [],
        ...(!Array.isArray(data) ? data : {}),
        ...(hasUpstreamError ? { message: 'Upstream notice, using fallback data' } : {}),
        lastUpdatedAt: new Date().toISOString(),
        isStale: false,
      };

      // Cache valid result in Redis/Memory
      await cacheSet(cacheKey, resultPayload, ttlSeconds);

      // If live score update, broadcast to connected clients
      if (method.toLowerCase().includes('live') && Array.isArray(resultPayload.result)) {
        resultPayload.result.forEach((match: any) => {
          if (match.event_key || match.id) {
            broadcastLiveScore('football', String(match.event_key || match.id), {
              homeScore: match.event_final_result?.split('-')?.[0]?.trim() || match.event_home_team_score,
              awayScore: match.event_final_result?.split('-')?.[1]?.trim() || match.event_away_team_score,
              status: match.event_status,
              time: match.event_time,
            });
          }
        });
      }

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
    console.error('Football Proxy error:', error);
    return NextResponse.json(
      {
        success: 1,
        result: [],
        isStale: true,
        lastUpdatedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Fallback',
      },
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
