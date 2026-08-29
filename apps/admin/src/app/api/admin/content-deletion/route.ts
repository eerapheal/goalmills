import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Video from '@/models/Video';
import Category from '@/models/Category';
import Sponsorship from '@/models/Sponsorship';
import { requirePermission } from '@/lib/serverAuth';
import { logAdminAction } from '@/lib/auditLog';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requirePermission('articles:draft');
    if (error) return error;

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const items: any[] = [];

    if (type === 'all' || type === 'news') {
      const deletedNews = await News.find({
        $or: [{ status: 'trash' }, { isDeleted: true }],
      })
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();

      deletedNews.forEach((n: any) => {
        items.push({
          id: String(n._id),
          title: n.title,
          type: 'news',
          author: n.author || 'Staff',
          deletedAt: n.deletedAt || n.updatedAt,
          deletedBy: n.deletedBy || 'Admin',
        });
      });
    }

    if (type === 'all' || type === 'video') {
      const deletedVideos = await Video.find({
        $or: [{ status: 'trash' }, { isDeleted: true }],
      })
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();

      deletedVideos.forEach((v: any) => {
        items.push({
          id: String(v._id),
          title: v.title,
          type: 'video',
          author: v.author || 'Staff',
          deletedAt: v.deletedAt || v.updatedAt,
          deletedBy: v.deletedBy || 'Admin',
        });
      });
    }

    if (type === 'all' || type === 'sponsorship') {
      const deletedSponsors = await Sponsorship.find({
        $or: [{ status: 'trash' }, { isDeleted: true }],
      })
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();

      deletedSponsors.forEach((s: any) => {
        items.push({
          id: String(s._id),
          title: s.title,
          type: 'sponsorship',
          author: s.sponsorName || 'Sponsor',
          deletedAt: s.deletedAt || s.updatedAt,
          deletedBy: s.deletedBy || 'Admin',
        });
      });
    }

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('[Admin Content Deletion GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch deleted items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requirePermission('articles:delete');
    if (error) return error;

    await dbConnect();
    const body = await request.json();
    const { action, id, type } = body;

    if (!id || !type || !action) {
      return NextResponse.json(
        { error: 'Action, ID and content type are required' },
        { status: 400 }
      );
    }

    let Model: any = null;
    if (type === 'news') Model = News;
    else if (type === 'video') Model = Video;
    else if (type === 'category') Model = Category;
    else if (type === 'sponsorship') Model = Sponsorship;

    if (!Model) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    if (action === 'restore') {
      const restored = await Model.findByIdAndUpdate(
        id,
        {
          $set: {
            status: 'draft',
            isDeleted: false,
          },
          $unset: { deletedAt: '', deletedBy: '' },
        },
        { new: true }
      );

      if (!restored) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      logAdminAction({
        actorId: session.user.id,
        actorEmail: session.user.email,
        action: 'CONTENT_RESTORED',
        resource: type,
        resourceId: id,
        status: 'SUCCESS',
      });

      return NextResponse.json({ success: true, message: 'Item restored to drafts' });
    } else if (action === 'purge') {
      // Permanent hard delete
      const purged = await Model.findByIdAndDelete(id);
      if (!purged) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      logAdminAction({
        actorId: session.user.id,
        actorEmail: session.user.email,
        action: 'CONTENT_PERMANENTLY_PURGED',
        resource: type,
        resourceId: id,
        status: 'SUCCESS',
      });

      return NextResponse.json({ success: true, message: 'Item permanently deleted' });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Content Deletion POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
