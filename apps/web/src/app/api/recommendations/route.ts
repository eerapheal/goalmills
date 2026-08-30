import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/recommendations/recommendationService';
import type { RecommendationContext, RecommendationType } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = req.headers.get('x-tenant-slug') || searchParams.get('tenantSlug') || 'goalmills';
    const context = (searchParams.get('context') || 'article_detail') as RecommendationContext;
    const type = (searchParams.get('type') || 'article') as RecommendationType;
    const currentId = searchParams.get('currentId') || undefined;
    const sportSlug = searchParams.get('sport') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const teamSlug = searchParams.get('team') || undefined;
    const limit = Math.min(15, Math.max(1, parseInt(searchParams.get('limit') || '6', 10)));

    const rawFavorites = searchParams.get('favorites');
    const userFavorites = rawFavorites ? rawFavorites.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const rawSports = searchParams.get('sports');
    const userSports = rawSports ? rawSports.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const recommendations = await recommendationService.getRecommendations({
      tenantSlug,
      context,
      type,
      currentId,
      sportSlug,
      categorySlug,
      teamSlug,
      userFavorites,
      userSports,
      limit,
    });

    return NextResponse.json(
      {
        success: true,
        tenantSlug,
        context,
        count: recommendations.length,
        recommendations,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('[Recommendations API] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
