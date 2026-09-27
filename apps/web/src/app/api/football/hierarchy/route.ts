import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import {
  getCompleteFootballHierarchy,
  filterCompetitionsHierarchy,
} from '@/lib/football/hierarchyService';
import { ConfederationCode, CompetitionGender } from '@goalmills/types';

export const dynamic = 'force-dynamic';

const HIERARCHY_CACHE_KEY = 'gm:football:hierarchy:full';
const HIERARCHY_CACHE_TTL = 3600; // 1 hour

/**
 * GET /api/football/hierarchy
 * Serves the multi-dimensional GoalMills football hierarchy:
 * - FIFA & Confederations (UEFA, CAF, AFC, CONMEBOL, CONCACAF, OFC)
 * - Top 5 European 6-priority competition configurations
 * - Africa domestic league hierarchies (16 nations)
 * - Gender & Age group breakdowns
 *
 * Query params (optional):
 * - ?confederation=CAF
 * - ?country=NG
 * - ?gender=MALE
 * - ?age=youth|senior
 * - ?tier=1
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const confedParam = searchParams.get('confederation');
    const countryParam = searchParams.get('country');
    const genderParam = searchParams.get('gender');
    const ageParam = searchParams.get('age');
    const tierParam = searchParams.get('tier');

    // If query filters are applied, return filtered competitions list
    const hasFilter = Boolean(confedParam || countryParam || genderParam || ageParam || tierParam);

    if (hasFilter) {
      const filtered = filterCompetitionsHierarchy({
        confederationCode: (confedParam as ConfederationCode) || 'all',
        countryCode: countryParam || 'all',
        gender: (genderParam?.toUpperCase() as CompetitionGender) || 'all',
        ageCategory: (ageParam?.toLowerCase() as 'youth' | 'senior') || 'all',
        tier: tierParam ? parseInt(tierParam, 10) : undefined,
      });

      return NextResponse.json(
        {
          success: 1,
          count: filtered.length,
          competitions: filtered,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    // Full hierarchy response (with Redis multi-tier caching)
    const cached = await cacheGet<any>(HIERARCHY_CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Cache': 'HIT',
        },
      });
    }

    const payload = {
      success: 1,
      data: getCompleteFootballHierarchy(),
      timestamp: new Date().toISOString(),
    };

    await cacheSet(HIERARCHY_CACHE_KEY, payload, HIERARCHY_CACHE_TTL);

    return NextResponse.json(payload, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error serving football hierarchy:', error);
    return NextResponse.json(
      { success: 0, error: 'Failed to retrieve football hierarchy' },
      { status: 500 }
    );
  }
}
