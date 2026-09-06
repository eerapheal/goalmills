import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { cacheGet, cacheSet, getSeoCacheHeaders } from '@/lib/redisCache';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: 'Invalid identifier' }, { status: 400 });
  }

  const decodedId = decodeURIComponent(id).trim();
  const cacheKey = `cache:news:item:${decodedId}`;
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
    const isObjectId = decodedId.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId
      ? { $or: [{ _id: decodedId }, { slug: decodedId }] }
      : { slug: decodedId };

    let news: any = await News.findOne(query).lean();
    if (!news && !isObjectId) {
      const slugClean = decodedId.replace(/-/g, ' ');
      news = await News.findOne({
        $or: [
          { slug: decodedId },
          { title: { $regex: new RegExp(`^${decodedId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') } },
          { title: { $regex: new RegExp(slugClean, 'i') } },
        ],
      }).lean();
    }
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
