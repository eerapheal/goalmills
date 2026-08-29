import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import { cacheGet, cacheSet, getSeoCacheHeaders } from '@/lib/redisCache';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ message: 'Invalid Video ID' }, { status: 400 });
  }

  const cacheKey = `cache:videos:item:${id}`;
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
    const video = await Video.findById(id).lean();
    if (!video) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

    await cacheSet(cacheKey, video, 300);

    return NextResponse.json(video, {
      headers: {
        ...getSeoCacheHeaders(60, 300),
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching video' }, { status: 500 });
  }
}
