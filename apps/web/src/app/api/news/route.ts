import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cacheGet, cacheSet, cacheInvalidatePattern, getSeoCacheHeaders } from '@/lib/redisCache';
import { broadcastNewNews } from '@/lib/socketBroadcaster';
import { notifyOnNewNewsArticle } from '@/lib/pushService';
import { hasPermission, canDirectPublish } from '@/lib/rbac';
import { UserRole } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdminRequest = searchParams.get('admin') === 'true';
  const filterType = searchParams.get('filter'); // 'trending', 'breaking', 'transfers', 'analysis', 'popular', 'featured', 'team', etc.
  const categoryParam = searchParams.get('category');
  const sportParam = searchParams.get('sport');
  const competitionParam = searchParams.get('competition');
  const team = searchParams.get('team');
  const player = searchParams.get('player');
  const articleType = searchParams.get('articleType');
  const authorParam = searchParams.get('author');
  const search = searchParams.get('search');
  const ids = searchParams.get('ids'); // Comma-separated IDs
  const exclude = searchParams.get('exclude'); // Comma-separated IDs to exclude
  const sortParam = searchParams.get('sort'); // 'latest', 'popular', 'oldest'
  const limitParam = parseInt(searchParams.get('limit') || '0', 10);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Check Redis/Memory cache for public queries
  const cacheKey = `cache:news:list:${filterType || 'all'}:${categoryParam || 'all'}:${sportParam || 'all'}:${competitionParam || 'all'}:${team || ''}:${player || ''}:${articleType || ''}:${authorParam || ''}:${search || ''}:${ids || ''}:${exclude || ''}:${sortParam || 'latest'}:${limitParam}:${pageParam}`;

  if (!isAdminRequest) {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          ...getSeoCacheHeaders(60, 300),
          'X-Cache': 'HIT',
        },
      });
    }
  }

  const session = (await getServerSession(authOptions)) as any;

  await dbConnect();
  try {
    const query: any = {};

    // If it's an admin request, enforce role-based filtering
    if (isAdminRequest) {
      if (!session || !hasPermission(session.user?.role, 'articles:read')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const userRole = session.user.role as UserRole;
      if (userRole === 'contributor' || userRole === 'staff') {
        // Staff and contributors see their own drafts/pending + all published
        query.$or = [
          { authorId: session.user.id },
          { status: 'published' },
          { status: { $exists: false } },
        ];
      }
    } else {
      // Public visitors only see published articles
      query.$or = [{ status: 'published' }, { status: { $exists: false } }];
    }

    // Exclude IDs
    if (exclude) {
      const excludeList = exclude.split(',').filter((id) => id.match(/^[0-9a-fA-F]{24}$/));
      if (excludeList.length > 0) {
        query._id = { $nin: excludeList };
      }
    }

    // Include specific IDs
    if (ids) {
      const idList = ids.split(',').filter((id) => id.match(/^[0-9a-fA-F]{24}$/));
      if (idList.length > 0) {
        query._id = { ...query._id, $in: idList };
      }
    }

    // Sport filter
    if (sportParam && sportParam !== 'all') {
      const sRegex = new RegExp(sportParam, 'i');
      query.$or = [{ sportSlug: sportParam.toLowerCase() }, { sport: { $regex: sRegex } }];
    }

    // Competition filter
    if (competitionParam && competitionParam !== 'all') {
      const cRegex = new RegExp(competitionParam.replace(/-/g, ' '), 'i');
      query.$or = [
        { competitionSlug: competitionParam.toLowerCase() },
        { competition: { $regex: cRegex } },
      ];
    }

    // Category filter
    if (categoryParam && categoryParam !== 'all' && categoryParam !== 'All') {
      const catRegex = new RegExp(`^${categoryParam.replace(/-/g, ' ')}`, 'i');
      query.$or = [
        { category: { $regex: catRegex } },
        { categorySlug: categoryParam.toLowerCase() },
      ];
    }

    // Team filter
    if (team) {
      const teamRegex = new RegExp(team.trim(), 'i');
      const teamConditions = [
        { 'teams.slug': team.toLowerCase() },
        { 'teams.name': { $regex: teamRegex } },
        { relatedTeam: { $regex: teamRegex } },
        { tags: { $in: [teamRegex] } },
        { title: { $regex: teamRegex } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: teamConditions }];
        delete query.$or;
      } else {
        query.$or = teamConditions;
      }
    }

    // Player filter
    if (player) {
      const playerRegex = new RegExp(player.trim().replace(/-/g, ' '), 'i');
      const playerConditions = [
        { 'players.slug': player.toLowerCase() },
        { 'players.name': { $regex: playerRegex } },
        { tags: { $in: [playerRegex] } },
        { title: { $regex: playerRegex } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: playerConditions }];
        delete query.$or;
      } else {
        query.$or = playerConditions;
      }
    }

    // Article Type filter
    if (articleType) {
      query.articleType = articleType;
    }

    // Author filter
    if (authorParam) {
      const aRegex = new RegExp(authorParam.replace(/-/g, ' '), 'i');
      query.$or = [{ authorSlug: authorParam.toLowerCase() }, { author: { $regex: aRegex } }];
    }

    // Keyword Search
    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { title: { $regex: sRegex } },
        { excerpt: { $regex: sRegex } },
        { tags: { $in: [sRegex] } },
        { author: { $regex: sRegex } },
      ];
      if (query.$and) {
        query.$and.push({ $or: searchConditions });
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Predefined Filter Modes
    let sortOptions: any = { createdAt: -1 };

    if (filterType === 'trending' || filterType === 'breaking') {
      sortOptions = { isBreaking: -1, views: -1, createdAt: -1 };
    } else if (filterType === 'popular' || sortParam === 'popular') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (filterType === 'transfers') {
      query.$or = [
        { articleType: 'transfer' },
        { category: { $regex: /transfer/i } },
        { categorySlug: 'transfers' },
      ];
    } else if (filterType === 'analysis') {
      query.$or = [
        { articleType: { $in: ['tactical_analysis', 'player_analysis'] } },
        { category: { $regex: /analysis|tactics/i } },
      ];
    } else if (filterType === 'featured') {
      query.isFeatured = true;
    }

    if (sortParam === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    let newsQuery = News.find(query).sort(sortOptions);

    if (limitParam > 0) {
      const skip = (pageParam - 1) * limitParam;
      newsQuery = newsQuery.skip(skip).limit(limitParam);
    }

    const news = await newsQuery.lean();

    // Cache the result for public queries
    if (!isAdminRequest) {
      await cacheSet(cacheKey, news, 180);
    }

    return NextResponse.json(news, {
      headers: {
        ...getSeoCacheHeaders(60, 300),
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ message: 'Error fetching news' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !hasPermission(session.user?.role, 'articles:draft')) {
    return NextResponse.json(
      { message: 'Unauthorized: Contributor, Staff, or Super Admin role required' },
      { status: 401 }
    );
  }

  await dbConnect();
  try {
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      image,
      source,
      category,
      categorySlug,
      sport,
      sportSlug,
      competition,
      competitionSlug,
      teams,
      players,
      relatedMatch,
      articleType,
      tags,
      relatedTeam,
      isBreaking,
      isFeatured,
      status: requestedStatus,
    } = body;

    const userRole = session.user.role as UserRole;
    // Contributors and staff MUST seek approval before publishing
    let articleStatus: 'draft' | 'pending_approval' | 'published' = 'published';
    if (!canDirectPublish(userRole)) {
      articleStatus = requestedStatus === 'draft' ? 'draft' : 'pending_approval';
    } else if (requestedStatus && ['draft', 'pending_approval', 'published'].includes(requestedStatus)) {
      articleStatus = requestedStatus;
    }

    const catSlug = (categorySlug || category || 'general')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

    const authorSlug = (session.user.name || 'goalmills-editorial')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const news = await News.create({
      title,
      excerpt,
      content,
      image,
      source,
      category: category || 'General',
      categorySlug: catSlug,
      sport: sport || 'Football',
      sportSlug: (sportSlug || 'football').toLowerCase(),
      competition: competition || undefined,
      competitionSlug: competitionSlug ? competitionSlug.toLowerCase() : undefined,
      teams: Array.isArray(teams) ? teams : [],
      players: Array.isArray(players) ? players : [],
      relatedMatch: relatedMatch || undefined,
      articleType: articleType || 'news',
      tags: parsedTags,
      relatedTeam: relatedTeam || '',
      isBreaking: Boolean(isBreaking),
      isFeatured: Boolean(isFeatured),
      status: articleStatus,
      author: session.user.name || 'GoalMills Staff',
      authorId: session.user.id,
      authorSlug,
      authorRole: session.user.role || 'staff',
      readTime: Math.ceil((content || '').split(' ').length / 200) || 3,
      views: 0,
    });

    // Only notify and broadcast if article is published directly
    if (articleStatus === 'published') {
      // 1. Invalidate all News Caches
      await cacheInvalidatePattern('cache:news:*');

      // 2. Automatically dispatch Push Notification to subscribed users
      notifyOnNewNewsArticle(news);

      // 3. Broadcast Realtime Event
      broadcastNewNews(news);
    }

    return NextResponse.json(news, { status: 201 });
  } catch (error: any) {
    console.error('Error creating news:', error);
    return NextResponse.json({ message: error.message || 'Error creating news' }, { status: 400 });
  }
}
