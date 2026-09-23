import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet, singleFlight } from '@/lib/redisCache';
import { broadcastLiveScore } from '@/lib/socketBroadcaster';

let rateLimitBackoffUntil = 0;
let consecutiveFailures = 0;
let circuitBreakerOpenUntil = 0;

// Rate-limit spacer: ensures minimum 250ms spacing between outbound upstream fetches
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
    'https://apiv2.allsportsapi.com/cricket/';

  raw = raw.trim();
  if (raw.includes('cricbuzz') || raw.includes('rapidapi')) {
    raw = 'https://apiv2.allsportsapi.com/cricket/';
  }
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  if (!raw.endsWith('/')) {
    raw = `${raw}/`;
  }
  return raw;
}

const API_KEY =
  process.env.ALLSPORTS_API_KEY ||
  (process.env.CRICKET_API_KEY &&
  !process.env.CRICKET_API_KEY.startsWith('8a82fda') &&
  !process.env.CRICKET_API_KEY.includes('rapidapi')
    ? process.env.CRICKET_API_KEY
    : null) ||
  '95c9b0311d4bfef71b062bb07cf0186dd20a77ac34160b0c2d1a0c24f3c4a008';

/**
 * Dynamically map and normalize generic/query parameters to AllSportsAPI Cricket v2.0 exact format
 */
function normalizeMethodAndParams(
  method: string,
  searchParams: URLSearchParams
): { normalizedMethod: string; params: Record<string, string> } {
  const m = (method || '').toLowerCase().trim();
  const params: Record<string, string> = {};

  // Copy existing query params
  searchParams.forEach((value, key) => {
    if (
      key !== 'met' &&
      key !== 'APIkey' &&
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      params[key] = value;
    }
  });

  let normalizedMethod = 'Livescore';

  if (m === 'livescore' || m === 'live') {
    normalizedMethod = 'Livescore';
    if (params.league) {
      params.leagueId = params.league;
      delete params.league;
    }
    if (params.match) {
      params.matchId = params.match;
      delete params.match;
    }
  } else if (m === 'fixtures' || m === 'fixture' || m === 'matches' || m === 'schedule') {
    normalizedMethod = 'Fixtures';
    if (params.date) {
      params.from = params.date;
      params.to = params.date;
      delete params.date;
    } else if (!params.from && !params.to && !params.matchId && !params.id) {
      const today = new Date().toISOString().split('T')[0];
      params.from = today;
      params.to = today;
    }
    if (params.league) {
      params.leagueId = params.league;
      delete params.league;
    }
    if (params.team) {
      params.teamId = params.team;
      delete params.team;
    }
    if (params.id || params.match) {
      params.matchId = params.id || params.match;
      delete params.id;
      delete params.match;
    }
  } else if (m === 'standings' || m === 'standing' || m === 'pointstable') {
    normalizedMethod = 'Standings';
    if (params.league) {
      params.leagueId = params.league;
      delete params.league;
    }
  } else if (m === 'leagues' || m === 'league' || m === 'series') {
    normalizedMethod = 'Leagues';
  } else if (m === 'teams' || m === 'team') {
    normalizedMethod = 'Teams';
    if (params.team) {
      params.teamId = params.team;
      delete params.team;
    }
    if (params.league) {
      params.leagueId = params.league;
      delete params.league;
    }
  } else if (m === 'h2h') {
    normalizedMethod = 'H2H';
    if (params.firstTeam && !params.firstTeamId) {
      params.firstTeamId = params.firstTeam;
      delete params.firstTeam;
    }
    if (params.secondTeam && !params.secondTeamId) {
      params.secondTeamId = params.secondTeam;
      delete params.secondTeam;
    }
  } else if (m === 'odds' || m === 'odd') {
    normalizedMethod = 'Odds';
    if (params.match && !params.matchId) {
      params.matchId = params.match;
      delete params.match;
    }
    if (params.league && !params.leagueId) {
      params.leagueId = params.league;
      delete params.league;
    }
  } else {
    normalizedMethod = method.charAt(0).toUpperCase() + method.slice(1);
  }

  return { normalizedMethod, params };
}

/**
 * Determine dynamic TTL in seconds based on requested method
 */
function getTtlForMethod(method: string): number {
  const m = method.toLowerCase();
  if (m === 'livescore') {
    return 15; // 15s for live cricket scores
  }
  if (m === 'fixtures') {
    return 60; // 1m for fixtures
  }
  if (m === 'standings' || m === 'odds') {
    return 300; // 5m for standings and odds
  }
  if (m === 'leagues' || m === 'teams' || m === 'h2h') {
    return 600; // 10m for metadata, rosters, and H2H
  }
  return 60;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawMethod = searchParams.get('met');

    if (!rawMethod) {
      return NextResponse.json({ error: 'Method parameter (met) is required' }, { status: 400 });
    }

    const { normalizedMethod, params } = normalizeMethodAndParams(rawMethod, searchParams);

    const baseUrlStr = getApiBaseUrl();
    const apiUrl = new URL(baseUrlStr);
    apiUrl.searchParams.set('met', normalizedMethod);

    if (API_KEY) {
      apiUrl.searchParams.set('APIkey', API_KEY);
    }

    // Append all normalized dynamic parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        apiUrl.searchParams.set(key, String(value));
      }
    });

    const cacheKey = `gm:sport:cricket:${apiUrl.toString()}`;
    const ttlSeconds = getTtlForMethod(normalizedMethod);
    const now = Date.now();

    // 1. Check Multi-tier Redis Cache
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
            ? 'Cricket provider circuit breaker active, serving fallback state'
            : 'Cricket API rate-limited backoff active, returning client fallback',
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
      console.log('Proxying cricket request to:', apiUrl.toString());

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
              `Cricket API retry ${attempts}/${maxAttempts} for ${normalizedMethod} due to ${response.status}`
            );
            await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
            continue;
          }

          break;
        } catch (err) {
          if (attempts >= maxAttempts) {
            console.warn('Cricket API fetch error after retries:', err);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
        }
      }

      if (!response || !response.ok) {
        const status = response ? response.status : 502;
        console.warn(
          `Cricket API status ${status} for ${normalizedMethod}, returning graceful fallback.`
        );

        consecutiveFailures++;
        if (consecutiveFailures >= 5) {
          circuitBreakerOpenUntil = Date.now() + 30_000;
          console.warn('⚡ Cricket Provider Circuit Breaker TRIPPED for 30s');
        }

        if (status === 429) {
          rateLimitBackoffUntil = Date.now() + 15_000;
        }

        return {
          success: 1,
          result: [],
          response: [],
          isStale: true,
          lastUpdatedAt: new Date().toISOString(),
          message: `Cricket live feed fallback (status ${status})`,
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

      const listResult = Array.isArray(sanitizedResult) ? sanitizedResult : sanitizedResult;

      const resultPayload = {
        success: 1,
        result: listResult,
        response: listResult,
        ...(!Array.isArray(data) ? data : {}),
        ...(hasUpstreamError ? { message: 'Upstream notice, using fallback data' } : {}),
        lastUpdatedAt: new Date().toISOString(),
        isStale: false,
      };

      // Cache valid result in Redis
      await cacheSet(cacheKey, resultPayload, ttlSeconds);

      // If live score update, broadcast to connected WebSocket clients in real-time
      if (normalizedMethod.toLowerCase().includes('live') && Array.isArray(listResult)) {
        listResult.forEach((match: any) => {
          if (match.event_key || match.id) {
            broadcastLiveScore('cricket', String(match.event_key || match.id), {
              homeScore: match.event_home_final_result || '0',
              awayScore: match.event_away_final_result || '0',
              status: match.event_status || match.event_status_info || 'LIVE',
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
    console.error('Cricket Proxy error:', error);
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
