import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidatePattern,
  getSeoCacheHeaders,
} from '@/lib/redisCache';
import { canEditArticle, canDirectPublish, hasPermission } from '@/lib/rbac';
import { UserRole } from '@goalmills/types';

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const news = await News.findById(id);
    if (!news) return NextResponse.json({ message: 'News not found' }, { status: 404 });

    const userRole = session.user.role as UserRole;
    // RBAC: Check if user can edit this article
    if (!canEditArticle(session.user, news.authorId?.toString())) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to edit this article' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Enforce approval workflow: contributors & staff cannot directly publish
    if (body.status === 'published' && !canDirectPublish(userRole)) {
      body.status = 'pending_approval';
    }
    if (body.category && !body.categorySlug) {
      body.categorySlug = body.category
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
    const updatedNews = await News.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    // Invalidate caches
    await cacheDel(`cache:news:item:${id}`);
    await cacheInvalidatePattern('cache:news:*');

    return NextResponse.json(updatedNews);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating news' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const news = await News.findById(id);
    if (!news) return NextResponse.json({ message: 'News not found' }, { status: 404 });

    const userRole = session.user.role as UserRole;
    const canDeleteAny = hasPermission(userRole, 'articles:delete');
    const isAuthor = news.authorId?.toString() === session.user.id;
    const isDraftOrPending = news.status === 'draft' || news.status === 'pending_approval';

    if (!canDeleteAny && !(isAuthor && isDraftOrPending)) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to delete this article' },
        { status: 403 }
      );
    }

    await News.findByIdAndDelete(id);

    // Invalidate caches
    await cacheDel(`cache:news:item:${id}`);
    await cacheInvalidatePattern('cache:news:*');

    return NextResponse.json({ message: 'News deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting news' }, { status: 500 });
  }
}
