import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cacheGet, cacheSet, cacheInvalidatePattern, getSeoCacheHeaders } from '@/lib/redisCache';
import { broadcastNewVideo } from '@/lib/socketBroadcaster';
import { notifyOnNewVideoHighlight } from '@/lib/pushService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

  // Check Redis / Memory cache
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

    // Cache results for 3 minutes
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

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || (session.user.role !== 'staff' && session.user.role !== 'super-admin')) {
    return NextResponse.json(
      { message: 'Unauthorized: staff or Super Admin role required' },
      { status: 401 }
    );
  }

  await dbConnect();
  try {
    const { video_title, video_url, video_thumbnail, event_key, source, category, league } =
      await request.json();
    const video = await Video.create({
      video_title,
      video_url,
      video_thumbnail,
      event_key,
      source,
      league,
      category: category || 'Highlights',
    });

    // 1. Invalidate Video Caches
    await cacheInvalidatePattern('cache:videos:*');

    // 2. Automatically dispatch Push Notification to subscribed users (FCM / Web / Mobile)
    notifyOnNewVideoHighlight(video);

    // 3. Broadcast Realtime Event to connected clients
    broadcastNewVideo(video);

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating video' }, { status: 400 });
  }
}
