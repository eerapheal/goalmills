import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import { cacheGet, cacheSet, getSeoCacheHeaders } from '@/lib/redisCache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

  const cacheKey = `cache:videos:list:${category || 'all'}:${search || ''}:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        ...getSeoCacheHeaders(60, 300),
        'X-Cache': 'HIT',
      },
    });
  }

  await dbConnect();
  try {
    const query: any = {};

    if (category && category !== 'All' && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { video_title: { $regex: q, $options: 'i' } },
        { video_description: { $regex: q, $options: 'i' } },
        { league: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const videos = await Video.find(query).sort({ createdAt: -1 }).limit(limit).lean();

    await cacheSet(cacheKey, videos, 180);

    return NextResponse.json(videos, {
      headers: {
        ...getSeoCacheHeaders(60, 300),
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching videos' }, { status: 500 });
  }
}
