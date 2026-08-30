import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ContentMetricSummary from '@/models/ContentMetricSummary';
import { requirePermission } from '@/lib/serverAuth';
import { resolveTenantContext } from '@/lib/tenantContext';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { error, session } = await requirePermission('articles:read');
    if (error) return error;

    await dbConnect();
    const tenantContext = await resolveTenantContext(req, session);
    const { searchParams } = new URL(req.url);

    const range = searchParams.get('range') || '30d';
    const sport = searchParams.get('sport');
    const sortBy = searchParams.get('sortBy') || 'views'; // views, readers, duration, shares
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const tenantFilterParam = searchParams.get('tenantSlug');

    const targetSlug =
      tenantContext.isSuperAdmin && tenantFilterParam && tenantFilterParam !== 'all'
        ? tenantFilterParam
        : tenantContext.tenantSlug || 'goalmills';

    const querySlug =
      tenantContext.isSuperAdmin && (!tenantFilterParam || tenantFilterParam === 'all')
        ? null
        : targetSlug;

    // Date computation
    let days = 30;
    if (range === 'today') days = 1;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === 'all') days = 365;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const match: Record<string, any> = {
      date: { $gte: startDate },
    };
    if (querySlug) match.tenantSlug = querySlug;
    if (sport && sport !== 'all') match.sportSlug = sport;

    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: '$articleId',
          articleSlug: { $first: '$articleSlug' },
          title: { $first: '$articleTitle' },
          sport: { $first: '$sportSlug' },
          category: { $first: '$categorySlug' },
          author: { $first: '$authorSlug' },
          totalViews: { $sum: '$pageViews' },
          totalReaders: { $sum: '$uniqueReaders' },
          totalDurationMs: { $sum: '$totalReadDurationMs' },
          p75Sum: { $sum: '$scrollMilestones.p75' },
          totalShares: { $sum: '$shares' },
          totalVideoPlays: { $sum: '$videoPlays' },
        },
      },
      {
        $project: {
          articleId: '$_id',
          slug: { $ifNull: ['$articleSlug', '$_id'] },
          title: { $ifNull: ['$title', 'Match Coverage & Tactical Intel'] },
          sport: { $ifNull: ['$sport', 'football'] },
          category: { $ifNull: ['$category', 'top_stories'] },
          author: { $ifNull: ['$author', 'editorial'] },
          views: '$totalViews',
          uniqueReaders: '$totalReaders',
          avgReadDurationSec: {
            $cond: [
              { $gt: ['$totalViews', 0] },
              { $round: [{ $divide: [{ $divide: ['$totalDurationMs', '$totalViews'] }, 1000] }, 0] },
              0,
            ],
          },
          scrollCompletionRate: {
            $cond: [
              { $gt: ['$totalViews', 0] },
              { $round: [{ $multiply: [{ $divide: ['$p75Sum', '$totalViews'] }, 100] }, 0] },
              0,
            ],
          },
          shares: '$totalShares',
          videoPlays: '$totalVideoPlays',
        },
      },
    ];

    if (sortBy === 'duration') {
      pipeline.push({ $sort: { avgReadDurationSec: -1 } });
    } else if (sortBy === 'shares') {
      pipeline.push({ $sort: { shares: -1 } });
    } else if (sortBy === 'readers') {
      pipeline.push({ $sort: { uniqueReaders: -1 } });
    } else {
      pipeline.push({ $sort: { views: -1 } });
    }

    pipeline.push({ $limit: limit });

    const articles = await ContentMetricSummary.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error: any) {
    console.error('[Admin Analytics Articles] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
