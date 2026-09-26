import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import SocialPost from '@/models/SocialPost';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const postType = searchParams.get('postType');
    const search = searchParams.get('search');

    const filter: any = {};
    if (platform && platform !== 'all') filter.platform = platform;
    if (status && status !== 'all') filter.status = status;
    if (postType && postType !== 'all') filter.postType = postType;

    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: 'i' } },
        { homeTeam: { $regex: search, $options: 'i' } },
        { awayTeam: { $regex: search, $options: 'i' } },
        { leagueName: { $regex: search, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      SocialPost.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SocialPost.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'postId is required' },
        { status: 400 }
      );
    }

    const post = await SocialPost.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Try proxying retry request to social-engine service
    const engineUrl = process.env.SOCIAL_ENGINE_URL || 'http://localhost:4000';
    try {
      const retryRes = await fetch(`${engineUrl}/api/posts/${postId}/retry`, {
        method: 'POST',
      });
      const retryData = await retryRes.json();
      return NextResponse.json(retryData);
    } catch {
      // Fallback: reset status to queued in DB
      post.status = 'queued';
      post.retryCount = (post.retryCount || 0) + 1;
      await post.save();

      return NextResponse.json({
        success: true,
        message: 'Post queued for retry in background',
        post,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retry post' },
      { status: 500 }
    );
  }
}
