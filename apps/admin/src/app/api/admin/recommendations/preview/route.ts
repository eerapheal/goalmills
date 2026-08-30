import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/recommendations/recommendationService';
import { requirePermission } from '@/lib/serverAuth';
import { resolveTenantContext } from '@/lib/tenantContext';
import type { RecommendationContext, RecommendationType } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requirePermission('articles:draft');
    if (error) return error;

    const tenantContext = await resolveTenantContext(req, session);
    const body = await req.json();
    const {
      tenantSlug,
      context = 'article_detail',
      type = 'article',
      currentId,
      sportSlug = 'football',
      categorySlug,
      teamSlug = 'Arsenal',
      competitionSlug,
      userFavorites = ['Arsenal', 'Real Madrid'],
      userSports = ['football', 'cricket'],
      limit = 6,
    } = body;

    const targetSlug =
      tenantContext.isSuperAdmin && tenantSlug && tenantSlug !== 'all'
        ? tenantSlug
        : tenantContext.tenantSlug || 'goalmills';

    const candidates = await recommendationService.getRecommendations({
      tenantSlug: targetSlug,
      context: context as RecommendationContext,
      type: type as RecommendationType,
      currentId,
      sportSlug,
      categorySlug,
      teamSlug,
      competitionSlug,
      userFavorites,
      userSports,
      limit,
    });

    return NextResponse.json({
      success: true,
      tenantSlug: targetSlug,
      count: candidates.length,
      candidates,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
