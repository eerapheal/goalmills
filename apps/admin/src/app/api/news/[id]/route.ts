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
import Category from '@/models/Category';
import EcosystemEntity from '@/models/EcosystemEntity';
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

    // Auto-upsert custom Category into DB if not present
    if (body.category && body.categorySlug) {
      await Category.findOneAndUpdate(
        { slug: body.categorySlug },
        {
          $setOnInsert: {
            name: body.category.trim(),
            slug: body.categorySlug,
            isFeatured: false,
            order: 0,
          },
        },
        { upsert: true, new: true }
      ).catch((err: any) => console.warn('Auto category upsert note:', err.message));
    }

    // Auto-upsert custom Sport into EcosystemEntity DB if not present
    if (body.sport && body.sportSlug) {
      await EcosystemEntity.findOneAndUpdate(
        { type: 'sport', slug: body.sportSlug.toLowerCase().trim() },
        {
          $setOnInsert: {
            type: 'sport',
            name: body.sport.trim(),
            slug: body.sportSlug.toLowerCase().trim(),
            isCustom: true,
          },
        },
        { upsert: true, new: true }
      ).catch((err: any) => console.warn('Auto sport upsert note:', err.message));
    }

    // Auto-upsert custom Competition into EcosystemEntity DB if not present
    if (body.competition && body.competitionSlug) {
      await EcosystemEntity.findOneAndUpdate(
        { type: 'competition', slug: body.competitionSlug.toLowerCase().trim() },
        {
          $setOnInsert: {
            type: 'competition',
            name: body.competition.trim(),
            slug: body.competitionSlug.toLowerCase().trim(),
            sportSlug: (body.sportSlug || 'football').toLowerCase().trim(),
            isCustom: true,
          },
        },
        { upsert: true, new: true }
      ).catch((err: any) => console.warn('Auto competition upsert note:', err.message));
    }

    // Auto-upsert custom Clubs into EcosystemEntity DB if not present
    if (Array.isArray(body.teams) && body.teams.length > 0) {
      for (const t of body.teams) {
        if (t.name && t.slug) {
          await EcosystemEntity.findOneAndUpdate(
            { type: 'club', slug: t.slug.toLowerCase().trim() },
            {
              $setOnInsert: {
                type: 'club',
                name: t.name.trim(),
                slug: t.slug.toLowerCase().trim(),
                logo: t.logo,
                sportSlug: (body.sportSlug || 'football').toLowerCase().trim(),
                competitionSlug: body.competitionSlug ? body.competitionSlug.toLowerCase().trim() : undefined,
                isCustom: true,
              },
            },
            { upsert: true, new: true }
          ).catch((err: any) => console.warn('Auto club upsert note:', err.message));
        }
      }
    }

    // Auto-upsert custom Players into EcosystemEntity DB if not present
    if (Array.isArray(body.players) && body.players.length > 0) {
      for (const p of body.players) {
        if (p.name && p.slug) {
          await EcosystemEntity.findOneAndUpdate(
            { type: 'player', slug: p.slug.toLowerCase().trim() },
            {
              $setOnInsert: {
                type: 'player',
                name: p.name.trim(),
                slug: p.slug.toLowerCase().trim(),
                photo: p.photo,
                sportSlug: (body.sportSlug || 'football').toLowerCase().trim(),
                competitionSlug: body.competitionSlug ? body.competitionSlug.toLowerCase().trim() : undefined,
                clubSlug: body.teams && body.teams[0]?.slug ? body.teams[0].slug.toLowerCase().trim() : undefined,
                isCustom: true,
              },
            },
            { upsert: true, new: true }
          ).catch((err: any) => console.warn('Auto player upsert note:', err.message));
        }
      }
    }

    // Invalidate caches
    await cacheDel(`cache:news:item:${id}`);
    await cacheInvalidatePattern('cache:news:*');
    await cacheInvalidatePattern('cache:ecosystem:*');
    await cacheInvalidatePattern('cache:categories:*');

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
