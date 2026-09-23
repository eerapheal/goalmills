import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cacheInvalidatePattern } from '@/lib/redisCache';
import { broadcastNewNews } from '@/lib/socketBroadcaster';
import { notifyOnNewNewsArticle } from '@/lib/pushService';
import { hasPermission, canDirectPublish, canEditArticle } from '@/lib/rbac';
import { UserRole } from '@goalmills/types';
import { resolveTenantContext, buildTenantFilter } from '@/lib/tenantContext';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !hasPermission(session.user?.role, 'articles:read')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const tenantContext = await resolveTenantContext(request, session);
  const userRole = session.user.role as UserRole;
  const isElevated = hasPermission(userRole, 'articles:approve');

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') || 'all';
  const sportFilter = searchParams.get('sport');
  const categoryFilter = searchParams.get('category');
  const search = searchParams.get('search');
  const sortParam = searchParams.get('sort') || 'latest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '15', 10)));

  await dbConnect();

  try {
    const tenantFilter = buildTenantFilter(tenantContext);

    // Base scoping condition: Contributor/Staff only see their own drafts + published
    const authorScope = !isElevated
      ? {
          $or: [
            { authorId: session.user.id },
            { status: 'published' },
            { status: { $exists: false } },
          ],
        }
      : {};

    // 1. Calculate pipeline metrics dynamically
    const metricsBase = { ...tenantFilter, ...authorScope };
    const [
      totalCount,
      publishedCount,
      pendingCount,
      draftCount,
      rejectedCount,
      breakingCount,
      featuredCount,
    ] = await Promise.all([
      News.countDocuments(metricsBase).setOptions({ includeAllStatuses: true }),
      News.countDocuments({
        ...metricsBase,
        $or: [{ status: 'published' }, { status: { $exists: false } }],
      }).setOptions({ includeAllStatuses: true }),
      News.countDocuments({ ...metricsBase, status: 'pending_approval' }).setOptions({
        includeAllStatuses: true,
      }),
      News.countDocuments({ ...metricsBase, status: 'draft' }).setOptions({
        includeAllStatuses: true,
      }),
      News.countDocuments({ ...metricsBase, status: 'rejected' }).setOptions({
        includeAllStatuses: true,
      }),
      News.countDocuments({ ...metricsBase, isBreaking: true }).setOptions({
        includeAllStatuses: true,
      }),
      News.countDocuments({ ...metricsBase, isFeatured: true }).setOptions({
        includeAllStatuses: true,
      }),
    ]);

    // 2. Build Query for filtered articles
    const conditions: any[] = [];

    // Role-based visibility
    if (!isElevated) {
      if (statusFilter === 'all') {
        conditions.push(authorScope);
      } else if (statusFilter === 'published') {
        conditions.push({ $or: [{ status: 'published' }, { status: { $exists: false } }] });
      } else {
        conditions.push({ authorId: session.user.id, status: statusFilter });
      }
    } else {
      if (statusFilter !== 'all') {
        if (statusFilter === 'published') {
          conditions.push({ $or: [{ status: 'published' }, { status: { $exists: false } }] });
        } else {
          conditions.push({ status: statusFilter });
        }
      }
    }

    // Sport filter
    if (sportFilter && sportFilter !== 'all') {
      const sRegex = new RegExp(sportFilter, 'i');
      conditions.push({
        $or: [{ sportSlug: sportFilter.toLowerCase() }, { sport: { $regex: sRegex } }],
      });
    }

    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      const cRegex = new RegExp(`^${categoryFilter.replace(/-/g, ' ')}`, 'i');
      conditions.push({
        $or: [{ category: { $regex: cRegex } }, { categorySlug: categoryFilter.toLowerCase() }],
      });
    }

    // Search filter
    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      conditions.push({
        $or: [
          { title: { $regex: sRegex } },
          { excerpt: { $regex: sRegex } },
          { tags: { $in: [sRegex] } },
          { author: { $regex: sRegex } },
        ],
      });
    }

    const query: any = { ...tenantFilter };
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sortParam === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortParam === 'popular') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sortParam === 'updated') {
      sortOptions = { updatedAt: -1 };
    }

    const totalFiltered = await News.countDocuments(query).setOptions({
      includeAllStatuses: true,
    });
    const skip = (page - 1) * limit;

    const items = await News.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()
      .setOptions({ includeAllStatuses: true });

    return NextResponse.json({
      success: true,
      metrics: {
        total: totalCount,
        published: publishedCount,
        pending: pendingCount,
        draft: draftCount,
        rejected: rejectedCount,
        breaking: breakingCount,
        featured: featuredCount,
      },
      items,
      pagination: {
        total: totalFiltered,
        page,
        limit,
        pages: Math.ceil(totalFiltered / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching pipeline data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch pipeline data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const userRole = session.user.role as UserRole;
  const canApprove = hasPermission(userRole, 'articles:approve');
  const canDeleteAny = hasPermission(userRole, 'articles:delete');

  await dbConnect();

  try {
    const body = await request.json();
    const { action, id, ids, reason } = body;

    const reviewerInfo = {
      reviewedBy: session.user.name || session.user.email || 'Admin',
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    };

    // ─────────────────────────────────────────────────────────────────────────
    // SINGLE ACTION: Approve & Publish
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'approve') {
      if (!canApprove) {
        return NextResponse.json(
          {
            success: false,
            message: 'Forbidden: Editor, Manager, or Super Admin role required to approve.',
          },
          { status: 403 }
        );
      }

      const updated = await News.findByIdAndUpdate(
        id,
        {
          status: 'published',
          publishedAt: new Date(),
          rejectionReason: null,
          ...reviewerInfo,
        },
        { new: true }
      ).setOptions({ includeAllStatuses: true });

      if (!updated) {
        return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
      }

      await cacheInvalidatePattern('cache:news:*');

      // Dispatch realtime and push broadcasts for newly published items
      try {
        broadcastNewNews(updated);
        notifyOnNewNewsArticle(updated);
      } catch (broadcastErr) {
        console.warn('Pipeline broadcast warning:', broadcastErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Article approved and published live!',
        article: updated,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SINGLE ACTION: Request Revision / Reject
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'reject') {
      if (!canApprove) {
        return NextResponse.json(
          {
            success: false,
            message: 'Forbidden: Editor or Super Admin role required to reject articles.',
          },
          { status: 403 }
        );
      }

      const updated = await News.findByIdAndUpdate(
        id,
        {
          status: 'rejected',
          rejectionReason: reason || 'Revision requested by editorial board.',
          ...reviewerInfo,
        },
        { new: true }
      ).setOptions({ includeAllStatuses: true });

      if (!updated) {
        return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
      }

      await cacheInvalidatePattern('cache:news:*');

      return NextResponse.json({
        success: true,
        message: 'Article sent back with revision notes.',
        article: updated,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SINGLE ACTION: Submit Draft for Review
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'submit_for_review') {
      const article = await News.findById(id).setOptions({ includeAllStatuses: true });
      if (!article) {
        return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
      }

      if (!canEditArticle(session.user, article.authorId?.toString())) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Cannot submit this article' },
          { status: 403 }
        );
      }

      article.status = 'pending_approval';
      article.rejectionReason = null;
      await article.save();

      return NextResponse.json({
        success: true,
        message: 'Article submitted to Editorial Queue for review!',
        article,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SINGLE ACTION: Unpublish / Move to Draft
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'unpublish') {
      if (!canApprove) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Cannot unpublish articles' },
          { status: 403 }
        );
      }

      const updated = await News.findByIdAndUpdate(
        id,
        { status: 'draft' },
        { new: true }
      ).setOptions({ includeAllStatuses: true });

      if (!updated) {
        return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
      }

      await cacheInvalidatePattern('cache:news:*');

      return NextResponse.json({
        success: true,
        message: 'Article unpublished and moved to drafts.',
        article: updated,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SINGLE ACTION: Quick Toggle Breaking / Featured
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'toggle_breaking') {
      if (!canApprove) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
      const article = await News.findById(id).setOptions({ includeAllStatuses: true });
      if (!article)
        return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
      article.isBreaking = !article.isBreaking;
      await article.save();
      await cacheInvalidatePattern('cache:news:*');
      return NextResponse.json({
        success: true,
        message: `Breaking flag set to ${article.isBreaking ? 'ACTIVE' : 'OFF'}`,
        isBreaking: article.isBreaking,
      });
    }

    if (action === 'toggle_featured') {
      if (!canApprove) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
      const article = await News.findById(id).setOptions({ includeAllStatuses: true });
      if (!article)
        return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
      article.isFeatured = !article.isFeatured;
      await article.save();
      await cacheInvalidatePattern('cache:news:*');
      return NextResponse.json({
        success: true,
        message: `Featured flag set to ${article.isFeatured ? 'ACTIVE' : 'OFF'}`,
        isFeatured: article.isFeatured,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BATCH ACTION: Batch Approve
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'batch_approve') {
      if (!canApprove) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No article IDs provided' },
          { status: 400 }
        );
      }

      const result = await News.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            status: 'published',
            publishedAt: new Date(),
            rejectionReason: null,
            ...reviewerInfo,
          },
        }
      ).setOptions({ includeAllStatuses: true });

      await cacheInvalidatePattern('cache:news:*');

      return NextResponse.json({
        success: true,
        message: `Successfully approved ${result.modifiedCount} article(s)!`,
        modifiedCount: result.modifiedCount,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BATCH ACTION: Batch Reject
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'batch_reject') {
      if (!canApprove) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No article IDs provided' },
          { status: 400 }
        );
      }

      const result = await News.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            status: 'rejected',
            rejectionReason: reason || 'Revision requested in batch review.',
            ...reviewerInfo,
          },
        }
      ).setOptions({ includeAllStatuses: true });

      await cacheInvalidatePattern('cache:news:*');

      return NextResponse.json({
        success: true,
        message: `Requested revision for ${result.modifiedCount} article(s).`,
        modifiedCount: result.modifiedCount,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BATCH ACTION: Batch Delete
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'batch_delete') {
      if (!canDeleteAny) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Cannot delete articles' },
          { status: 403 }
        );
      }
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No article IDs provided' },
          { status: 400 }
        );
      }

      const result = await News.deleteMany({ _id: { $in: ids } }).setOptions({
        includeAllStatuses: true,
      });
      await cacheInvalidatePattern('cache:news:*');

      return NextResponse.json({
        success: true,
        message: `Permanently deleted ${result.deletedCount} article(s).`,
        deletedCount: result.deletedCount,
      });
    }

    return NextResponse.json(
      { success: false, message: `Unknown action '${action}'` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error handling pipeline action:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error processing pipeline action' },
      { status: 500 }
    );
  }
}
