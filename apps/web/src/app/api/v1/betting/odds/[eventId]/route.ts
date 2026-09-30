import { NextRequest, NextResponse } from 'next/server';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import {
  buildCompleteOddsMatrix,
  OddsFormat,
  getOpeningOddsMapForEvent,
  recordOddsQuotesSnapshot,
  normalizeLegacyFootballOdds,
  getAllCanonicalBookmakers,
  DEFAULT_COMMERCIAL_DISCLOSURE,
  buildCanonicalEventId,
} from '@/lib/betting';
import { FootballOdds } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Missing required eventId parameter' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'decimal').toLowerCase() as OddsFormat;
    const homeTeam = searchParams.get('homeTeam') || undefined;
    const awayTeam = searchParams.get('awayTeam') || undefined;
    const sport = searchParams.get('sport') || 'football';

    // 1. Check Redis Cache
    const cacheKey = `betting:odds:${eventId}:${format}:${homeTeam || ''}:${awayTeam || ''}`;
    const cachedData = await cacheGet<any>(cacheKey);
    if (cachedData) {
      return NextResponse.json(
        {
          ...cachedData,
          cached: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }

    // 2. Extract numeric match ID if prefixed (e.g. gm_event_football_1042391 -> 1042391)
    const rawMatchId = eventId.replace(/^gm_event_[a-z]+_/, '');

    // 3. Parallel fetch: Pre-match odds from provider + opening odds history from database
    const [oddsRes, openingOddsMap] = await Promise.all([
      advancedFootballApi.getOdds({ matchId: rawMatchId }).catch((err) => {
        console.error('[Odds API] Error fetching odds for event:', eventId, err);
        return { success: 1, result: {} };
      }),
      getOpeningOddsMapForEvent(eventId).catch((err) => {
        console.warn('[Odds API] Could not load opening odds for event:', eventId, err);
        return {};
      }),
    ]);

    const oddsResult = (oddsRes?.result && (oddsRes.result as any)[rawMatchId]) || [];
    const rawOddsList: FootballOdds[] = Array.isArray(oddsResult) ? oddsResult : [];

    // 4. Transform and snapshot into history store (asynchronous, non-blocking)
    if (rawOddsList.length > 0) {
      const canonicalId = buildCanonicalEventId(sport, rawMatchId);
      const normalizedQuotes = normalizeLegacyFootballOdds(rawOddsList, canonicalId);
      recordOddsQuotesSnapshot(canonicalId, normalizedQuotes).catch((err) =>
        console.warn('[Odds API] Snapshot persistence notice:', err)
      );
    }

    // 5. Build full odds comparison matrix
    const matrix = buildCompleteOddsMatrix({
      eventId: rawMatchId,
      sport,
      rawOddsList,
      homeTeam,
      awayTeam,
      format,
      openingOddsMap,
    });

    // 6. Enrich with verified canonical bookmakers metadata
    const activeBookmakerIds = new Set<string>();
    Object.values(matrix.markets).forEach((m) => {
      m.bookmakers.forEach((b) => activeBookmakerIds.add(b.bookmakerId));
    });

    const canonicalBookmakers = getAllCanonicalBookmakers().filter((b) =>
      activeBookmakerIds.has(b.id)
    );

    const responsePayload = {
      success: true,
      eventId: matrix.canonicalEventId,
      rawEventId: rawMatchId,
      sport: matrix.sport,
      format: matrix.format,
      updatedAt: matrix.updatedAt,
      markets: matrix.markets,
      bookmakers: canonicalBookmakers,
      disclaimer: `${DEFAULT_COMMERCIAL_DISCLOSURE.responsibleGamblingText} ${DEFAULT_COMMERCIAL_DISCLOSURE.body}`,
      helplineUrl: DEFAULT_COMMERCIAL_DISCLOSURE.helplineUrl,
    };

    // 7. Store in Cache with 90s TTL
    await cacheSet(cacheKey, responsePayload, 90);

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    console.error('[Betting Odds Route Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve betting odds comparison',
        message: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
