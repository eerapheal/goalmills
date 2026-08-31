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
  process.env.ALLSPORTS_API_KEY ||
  process.env.FOOTBALL_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  '95c9b0311d4bfef71b062bb07cf0186dd20a77ac34160b0c2d1a0c24f3c4a008';

/**
 * Map generic/API-Football parameter and method names to AllSportsAPI's exact format
 */
function normalizeMethodAndParams(method: string, searchParams: URLSearchParams): { normalizedMethod: string; params: Record<string, string> } {
  const m = (method || '').toLowerCase().trim();
  const params: Record<string, string> = {};

  // Copy existing params
  searchParams.forEach((value, key) => {
    if (key !== 'met' && key !== 'APIkey' && value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });

  let normalizedMethod = 'Livescore';

  if (m === 'livescore' || m === 'live' || (m === 'fixtures' && searchParams.get('live'))) {
    normalizedMethod = 'Livescore';
    delete params.live;
    if (params.league) {
      params.leagueId = params.league;
      delete params.league;
    }
    if (params.country) {
      params.countryId = params.country;
      delete params.country;
    }
    if (params.match) {
      params.matchId = params.match;
      delete params.match;
    }
  } else if (m === 'fixtures' || m === 'fixture') {
    normalizedMethod = 'Fixtures';
    // If date is passed (YYYY-MM-DD), set from and to
    if (params.date) {
      params.from = params.date;
      params.to = params.date;
      delete params.date;
    } else if (!params.from && !params.to) {
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
    if (params.country) {
      params.countryId = params.country;
      delete params.country;
    }
  } else if (m === 'standings' || m === 'standing') {
    normalizedMethod = 'Standings';
    if (params.league) {
      params.leagueId = params.league;
      delete params.league;
    }
    if (!params.leagueId) {
      params.leagueId = '152'; // Default to Premier League (152) if unspecified
    }
  } else if (m === 'leagues' || m === 'league') {
    normalizedMethod = 'Leagues';
    if (params.country) {
      params.countryId = params.country;
      delete params.country;
    }
  } else if (m === 'topscorers' || m === 'topscorer') {
    normalizedMethod = 'Topscorers';
    if (params.league) {
      params.leagueId = params.league;
      delete params.league;
    }
    if (!params.leagueId) {
      params.leagueId = '152';
    }
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
  } else if (m === 'players' || m === 'player') {
    normalizedMethod = 'Players';
    if (params.player) {
      params.playerId = params.player;
      delete params.player;
    }
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
  } else if (m === 'probabilities' || m === 'probability') {
    normalizedMethod = 'Probabilities';
    if (params.match && !params.matchId) {
      params.matchId = params.match;
      delete params.match;
    }
    if (params.league && !params.leagueId) {
      params.leagueId = params.league;
      delete params.league;
    }
  } else if (m === 'oddslive' || m === 'liveodds') {
    normalizedMethod = 'OddsLive';
    if (params.match && !params.matchId) {
      params.matchId = params.match;
      delete params.match;
    }
    if (params.league && !params.leagueId) {
      params.leagueId = params.league;
      delete params.league;
    }
  } else if (m === 'fullodds' || m === 'full_odds') {
    normalizedMethod = 'FullOdds';
    if (params.match && !params.matchId) {
      params.matchId = params.match;
      delete params.match;
    }
    if (params.league && !params.leagueId) {
      params.leagueId = params.league;
      delete params.league;
    }
  } else if (m === 'videos' || m === 'video') {
    normalizedMethod = 'Videos';
    if (params.matchId || params.id) {
      params.eventId = params.matchId || params.id;
      delete params.matchId;
      delete params.id;
    }
  } else if (m === 'countries' || m === 'country') {
    normalizedMethod = 'Countries';
  } else {
    // Preserve casing if already formatted
    normalizedMethod = method.charAt(0).toUpperCase() + method.slice(1);
  }

  return { normalizedMethod, params };
}

/**
 * Determine dynamic TTL in seconds based on the requested method
 */
function getTtlForMethod(method: string): number {
  const m = method.toLowerCase();
  if (m === 'livescore') {
    return 15; // 15 seconds for live scores
  }
  if (m === 'oddslive') {
    return 30; // 30 seconds for live in-play odds
  }
  if (m === 'fixtures') {
    return 60; // 1 minute for fixtures
  }
  if (m === 'standings' || m === 'topscorers' || m === 'odds' || m === 'probabilities' || m === 'fullodds') {
    return 300; // 5 minutes for standings, odds, predictions
  }
  if (
    m === 'leagues' ||
    m === 'teams' ||
    m === 'countries' ||
    m === 'players' ||
    m === 'h2h' ||
    m === 'videos'
  ) {
    return 600; // 10 minutes for static metadata, head to head, and media
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

    // Append normalized parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        apiUrl.searchParams.set(key, value);
      }
    });

    const cacheKey = `gm:sport:football:${apiUrl.toString()}`;
    const ttlSeconds = getTtlForMethod(normalizedMethod);
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
              `Football API retry ${attempts}/${maxAttempts} for ${normalizedMethod} due to ${response.status}`
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
        console.warn(`Football API status ${status} for ${normalizedMethod}, returning graceful fallback.`);

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
          response: [],
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

      const listResult = Array.isArray(sanitizedResult) ? sanitizedResult : [];

      const resultPayload = {
        success: 1,
        result: listResult,
        response: listResult,
        ...(!Array.isArray(data) ? data : {}),
        ...(hasUpstreamError ? { message: 'Upstream notice, using fallback data' } : {}),
        lastUpdatedAt: new Date().toISOString(),
        isStale: false,
      };

      // Cache valid result in Redis/Memory
      await cacheSet(cacheKey, resultPayload, ttlSeconds);

      // If live score update, broadcast to connected clients
      if (normalizedMethod.toLowerCase().includes('live') && Array.isArray(listResult)) {
        listResult.forEach((match: any) => {
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
