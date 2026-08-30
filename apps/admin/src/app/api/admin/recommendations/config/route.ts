import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RecommendationConfig from '@/models/RecommendationConfig';
import { requirePermission } from '@/lib/serverAuth';
import { resolveTenantContext } from '@/lib/tenantContext';
import type { RecommendationAlgorithmWeights } from '@goalmills/types';

export const dynamic = 'force-dynamic';

const DEFAULT_WEIGHTS: RecommendationAlgorithmWeights = {
  sportMatchWeight: 30,
  competitionMatchWeight: 25,
  teamOverlapWeight: 35,
  categoryMatchWeight: 15,
  recencyDecayHours: 48,
  trendingPopularityWeight: 20,
  personalizationAffinityWeight: 25,
  diversityPenalty: 10,
};

export async function GET(req: NextRequest) {
  try {
    const { error, session } = await requirePermission('articles:draft');
    if (error) return error;

    await dbConnect();
    const tenantContext = await resolveTenantContext(req, session);
    const { searchParams } = new URL(req.url);
    const requestedSlug = searchParams.get('tenantSlug');

    const targetSlug =
      tenantContext.isSuperAdmin && requestedSlug && requestedSlug !== 'all'
        ? requestedSlug
        : tenantContext.tenantSlug || 'goalmills';

    const config = await RecommendationConfig.findOne({ tenantSlug: targetSlug }).lean();

    return NextResponse.json({
      success: true,
      tenantSlug: targetSlug,
      config: config || {
        tenantSlug: targetSlug,
        weights: DEFAULT_WEIGHTS,
        enabledContexts: ['homepage', 'article_detail', 'match_detail', 'sports_hub', 'mobile_feed', 'newsletter'],
        excludedCategorySlugs: [],
        maxCandidatesPerSport: 4,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error, session } = await requirePermission('articles:draft');
    if (error) return error;

    await dbConnect();
    const tenantContext = await resolveTenantContext(req, session);
    const body = await req.json();
    const { tenantSlug, weights, enabledContexts, excludedCategorySlugs, maxCandidatesPerSport } = body;

    const targetSlug =
      tenantContext.isSuperAdmin && tenantSlug && tenantSlug !== 'all'
        ? tenantSlug
        : tenantContext.tenantSlug || 'goalmills';

    const updated = await RecommendationConfig.findOneAndUpdate(
      { tenantSlug: targetSlug },
      {
        $set: {
          tenantSlug: targetSlug,
          weights: weights || DEFAULT_WEIGHTS,
          enabledContexts: enabledContexts || ['homepage', 'article_detail', 'match_detail', 'sports_hub', 'mobile_feed', 'newsletter'],
          excludedCategorySlugs: excludedCategorySlugs || [],
          maxCandidatesPerSport: maxCandidatesPerSport || 4,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Recommendation algorithm weights updated successfully',
      config: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
