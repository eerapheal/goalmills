import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { cacheGet, cacheSet, getSeoCacheHeaders } from '@/lib/redisCache';
import { resolveTenantContext, buildTenantFilter } from '@/lib/tenantContext';
import { slugify } from '@/lib/slugUtils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport');
  const category = searchParams.get('category');
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '8', 10)));

  const tenantContext = await resolveTenantContext(request);
  const tenantSlug = tenantContext.tenantSlug;
  const cacheKey = `cache:news:flash:${tenantSlug}:${sport || 'all'}:${category || 'all'}:${limit}`;

  const cached = await cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        ...getSeoCacheHeaders(30, 120),
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    await dbConnect();
    const tenantFilter = buildTenantFilter(tenantContext);

    const match: any = {
      ...tenantFilter,
      $and: [{ $or: [{ status: 'published' }, { status: { $exists: false } }] }],
    };

    if (sport && sport !== 'all') {
      match.$or = [
        { sportSlug: sport.toLowerCase() },
        { sport: { $regex: new RegExp(sport, 'i') } },
      ];
    }

    if (category && category !== 'all') {
      const catRegex = new RegExp(category.replace(/-/g, ' '), 'i');
      match.$or = [
        { categorySlug: category.toLowerCase() },
        { category: { $regex: catRegex } },
      ];
    }

    // Try fast random sampling with aggregate $sample
    let posts: any[] = [];
    try {
      posts = await News.aggregate([
        { $match: match },
        { $sample: { size: limit } },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            category: 1,
            sport: 1,
            sportSlug: 1,
            isBreaking: 1,
            createdAt: 1,
          },
        },
      ]);
    } catch {
      posts = [];
    }

    // Fallback if aggregate $sample is unsupported or returns fewer than desired
    if (!posts || posts.length < limit) {
      const existingIds = posts.map((p) => p._id);
      const additional = await News.find({
        ...match,
        _id: { $nin: existingIds },
      })
        .select('_id title slug category sport sportSlug isBreaking createdAt')
        .sort({ isBreaking: -1, views: -1, createdAt: -1 })
        .limit(limit - posts.length)
        .lean();

      posts = [...posts, ...additional];
    }

    // If still empty (e.g. strict sport filter has no docs yet), fallback to general news
    if (posts.length === 0) {
      posts = await News.find({
        $or: [{ status: 'published' }, { status: { $exists: false } }],
      })
        .select('_id title slug category sport sportSlug isBreaking createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    // Format and guarantee clean slug on each post
    const formatted = posts.map((p: any) => ({
      _id: p._id.toString(),
      title: p.title,
      slug: p.slug || slugify(p.title) || p._id.toString(),
      category: p.category || 'General',
      sportSlug: p.sportSlug || 'football',
      isBreaking: !!p.isBreaking,
      createdAt: p.createdAt,
    }));

    const responsePayload = {
      success: true,
      count: formatted.length,
      posts: formatted,
    };

    await cacheSet(cacheKey, responsePayload, 45); // Cache for 45s

    return NextResponse.json(responsePayload, {
      headers: {
        ...getSeoCacheHeaders(30, 120),
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching dynamic flash ticker news:', error);
    return NextResponse.json(
      {
        success: false,
        posts: [],
      },
      { status: 500 }
    );
  }
}
