import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import News from "@/models/News";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdminRequest = searchParams.get('admin') === 'true';
  const filterType = searchParams.get('filter'); // 'trending', 'breaking', 'transfers', 'analysis', 'popular', 'featured', 'team', etc.
  const categoryParam = searchParams.get('category');
  const search = searchParams.get('search');
  const team = searchParams.get('team');
  const ids = searchParams.get('ids'); // Comma-separated IDs (e.g. recently viewed)
  const exclude = searchParams.get('exclude'); // Comma-separated IDs to exclude
  const sortParam = searchParams.get('sort'); // 'latest', 'popular', 'oldest'
  const limitParam = parseInt(searchParams.get('limit') || '0', 10);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const session = (await getServerSession(authOptions)) as any;

  await dbConnect();
  try {
    const query: any = {};

    // If it's an admin request, enforce role-based filtering
    if (isAdminRequest) {
      if (!session || (session.user.role !== 'staff' && session.user.role !== 'super-admin')) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      if (session.user.role === 'staff') {
        query.authorId = session.user.id;
      }
    }

    // Exclude IDs
    if (exclude) {
      const excludeList = exclude.split(',').filter((id) => id.match(/^[0-9a-fA-F]{24}$/));
      if (excludeList.length > 0) {
        query._id = { $nin: excludeList };
      }
    }

    // Include specific IDs (e.g., Recently Viewed or Favorites)
    if (ids) {
      const idList = ids.split(',').filter((id) => id.match(/^[0-9a-fA-F]{24}$/));
      if (idList.length > 0) {
        query._id = { ...query._id, $in: idList };
      }
    }

    // Category filter
    if (categoryParam && categoryParam !== 'all' && categoryParam !== 'All') {
      const catRegex = new RegExp(`^${categoryParam.replace(/-/g, ' ')}`, 'i');
      query.$or = [
        { category: { $regex: catRegex } },
        { categorySlug: categoryParam.toLowerCase() },
      ];
    }

    // Team filter (specific favorite team or parameter)
    if (team) {
      const teamRegex = new RegExp(team.trim(), 'i');
      const teamConditions = [
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

    // Professional Predefined Filter Modes
    let sortOptions: any = { createdAt: -1 };

    if (filterType === 'trending' || filterType === 'breaking') {
      // Prioritize breaking news and highest views
      sortOptions = { isBreaking: -1, views: -1, createdAt: -1 };
    } else if (filterType === 'popular' || sortParam === 'popular') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (filterType === 'transfers') {
      const transferRegex = /transfer|rumour|rumor|signing|deal|agrees|bid|target/i;
      const transferCondition = [
        { category: { $regex: /transfer/i } },
        { categorySlug: 'transfers' },
        { title: { $regex: transferRegex } },
        { tags: { $in: [transferRegex] } },
      ];
      if (query.$and) {
        query.$and.push({ $or: transferCondition });
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: transferCondition }];
        delete query.$or;
      } else {
        query.$or = transferCondition;
      }
    } else if (filterType === 'analysis') {
      const analysisRegex = /analysis|tactics|tactical|preview|breakdown|verdict|column/i;
      const analysisCondition = [
        { category: { $regex: /tactical|analysis/i } },
        { categorySlug: 'tactical-analysis' },
        { title: { $regex: analysisRegex } },
        { tags: { $in: [analysisRegex] } },
      ];
      if (query.$and) {
        query.$and.push({ $or: analysisCondition });
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: analysisCondition }];
        delete query.$or;
      } else {
        query.$or = analysisCondition;
      }
    } else if (filterType === 'featured' || filterType === 'editors_picks') {
      const featuredCondition = [
        { isFeatured: true },
        { category: { $regex: /editor/i } },
        { categorySlug: 'editors-picks' },
      ];
      if (query.$and) {
        query.$and.push({ $or: featuredCondition });
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: featuredCondition }];
        delete query.$or;
      } else {
        query.$or = featuredCondition;
      }
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
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ message: "Error fetching news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || (session.user.role !== 'staff' && session.user.role !== 'super-admin')) {
    return NextResponse.json({ message: "Unauthorized: staff or Super Admin role required" }, { status: 401 });
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
      tags,
      relatedTeam,
      isBreaking,
      isFeatured,
    } = body;

    const catSlug = (categorySlug || category || 'general')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const news = await News.create({
      title,
      excerpt,
      content,
      image,
      source,
      category: category || 'General',
      categorySlug: catSlug,
      tags: parsedTags,
      relatedTeam: relatedTeam || '',
      isBreaking: Boolean(isBreaking),
      isFeatured: Boolean(isFeatured),
      author: session.user.name || 'Admin',
      authorId: session.user.id,
      readTime: Math.ceil((content || '').split(' ').length / 200) || 3,
      views: 0,
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error: any) {
    console.error('Error creating news:', error);
    return NextResponse.json({ message: error.message || "Error creating news" }, { status: 400 });
  }
}
