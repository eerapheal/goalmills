import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { cacheIncr } from '@/lib/redisCache';
import type { RecommendationFeedbackPayload } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: RecommendationFeedbackPayload = await req.json();
    const {
      candidateId,
      candidateType = 'article',
      context = 'article_detail',
      action = 'click',
      tenantSlug = 'goalmills',
    } = body;

    if (!candidateId) {
      return NextResponse.json({ success: false, message: 'candidateId is required' }, { status: 400 });
    }

    // 1. Increment Real-time Feedback Counters in Redis
    const today = new Date().toISOString().slice(0, 10);
    const counterKey = `rec:stats:${tenantSlug}:${today}:${context}:${action}`;
    await cacheIncr(counterKey).catch(() => {});

    // 2. Persist to AnalyticsEvent collection for Phase 4 reporting integration
    await dbConnect();
    await AnalyticsEvent.create({
      tenantSlug,
      eventType: action === 'click' ? 'click' : 'page_view',
      entityType: candidateType === 'video' ? 'video' : 'article',
      entityId: candidateId,
      metadata: {
        recommendationContext: context,
        recommendationAction: action,
        isRecommendationDriven: true,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      tracked: true,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
