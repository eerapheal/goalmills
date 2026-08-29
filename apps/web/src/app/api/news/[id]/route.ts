import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { cacheGet, cacheSet, getSeoCacheHeaders } from '@/lib/redisCache';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ message: 'Invalid News ID' }, { status: 400 });
  }

  const cacheKey = `cache:news:item:${id}`;
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
    const news = await News.findById(id).lean();
    if (!news) return NextResponse.json({ message: 'News not found' }, { status: 404 });

    await cacheSet(cacheKey, news, 300);

    return NextResponse.json(news, {
      headers: {
        ...getSeoCacheHeaders(60, 300),
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching news' }, { status: 500 });
  }
}
