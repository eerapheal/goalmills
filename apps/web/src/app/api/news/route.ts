import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { cacheGet, cacheSet, getSeoCacheHeaders } from '@/lib/redisCache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filterType = searchParams.get('filter');
  const categoryParam = searchParams.get('category');
  const sportParam = searchParams.get('sport');
  const competitionParam = searchParams.get('competition');
  const team = searchParams.get('team');
  const player = searchParams.get('player');
  const articleType = searchParams.get('articleType');
  const authorParam = searchParams.get('author');
  const search = searchParams.get('search');
  const ids = searchParams.get('ids');
  const exclude = searchParams.get('exclude');
  const sortParam = searchParams.get('sort');
  const limitParam = parseInt(searchParams.get('limit') || '0', 10);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const cacheKey = `cache:news:list:${filterType || 'all'}:${categoryParam || 'all'}:${sportParam || 'all'}:${competitionParam || 'all'}:${team || ''}:${player || ''}:${articleType || ''}:${authorParam || ''}:${search || ''}:${ids || ''}:${exclude || ''}:${sortParam || 'latest'}:${limitParam}:${pageParam}`;

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
    const query: any = {
      $or: [{ status: 'published' }, { status: { $exists: false } }],
    };

    if (exclude) {
      const excludeList = exclude.split(',').filter((id) => id.match(/^[0-9a-fA-F]{24}$/));
      if (excludeList.length > 0) {
        query._id = { $nin: excludeList };
      }
    }

    if (ids) {
      const idList = ids.split(',').filter((id) => id.match(/^[0-9a-fA-F]{24}$/));
      if (idList.length > 0) {
        query._id = { ...query._id, $in: idList };
      }
    }

    if (sportParam && sportParam !== 'all') {
      const sRegex = new RegExp(sportParam, 'i');
      query.$or = [{ sportSlug: sportParam.toLowerCase() }, { sport: { $regex: sRegex } }];
    }

    if (competitionParam && competitionParam !== 'all') {
      const cRegex = new RegExp(competitionParam.replace(/-/g, ' '), 'i');
      query.$or = [
        { competitionSlug: competitionParam.toLowerCase() },
        { competition: { $regex: cRegex } },
      ];
    }

    if (categoryParam && categoryParam !== 'all') {
      const catRegex = new RegExp(categoryParam.replace(/-/g, ' '), 'i');
      query.$or = [{ categorySlug: categoryParam.toLowerCase() }, { category: { $regex: catRegex } }];
    }

    if (team) {
      const teamRegex = new RegExp(team.replace(/-/g, ' '), 'i');
      query.$or = [
        { teams: { $in: [teamRegex] } },
        { tags: { $in: [teamRegex] } },
        { relatedTeam: { $regex: teamRegex } },
      ];
    }

    if (player) {
      const playerRegex = new RegExp(player.replace(/-/g, ' '), 'i');
      query.$or = [{ players: { $in: [playerRegex] } }, { tags: { $in: [playerRegex] } }];
    }

    if (articleType && articleType !== 'all') {
      query.articleType = articleType;
    }

    if (authorParam && authorParam !== 'all') {
      const authRegex = new RegExp(authorParam.replace(/-/g, ' '), 'i');
      query.$or = [{ authorSlug: authorParam.toLowerCase() }, { author: { $regex: authRegex } }];
    }

    if (filterType === 'breaking') {
      query.isBreaking = true;
    } else if (filterType === 'featured') {
      query.isFeatured = true;
    } else if (filterType === 'transfers') {
      query.$or = [
        { articleType: 'transfers' },
        { categorySlug: 'transfers' },
        { tags: { $in: [/transfer/i, /rumour/i, /signing/i] } },
      ];
    } else if (filterType === 'analysis') {
      query.$or = [
        { articleType: 'analysis' },
        { categorySlug: 'analysis' },
        { tags: { $in: [/tactics/i, /analysis/i, /preview/i] } },
      ];
    }

    if (search) {
      const sRegex = new RegExp(search, 'i');
      query.$or = [
        { title: { $regex: sRegex } },
        { excerpt: { $regex: sRegex } },
        { tags: { $in: [sRegex] } },
      ];
    }

    let sortOptions: any = { createdAt: -1 };
    if (sortParam === 'popular' || filterType === 'trending' || filterType === 'popular') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sortParam === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    let newsQuery = News.find(query).sort(sortOptions);

    if (limitParam > 0) {
      const skip = (pageParam - 1) * limitParam;
      newsQuery = newsQuery.skip(skip).limit(limitParam);
    }

    const news = await newsQuery.lean();

    await cacheSet(cacheKey, news, 180);

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
