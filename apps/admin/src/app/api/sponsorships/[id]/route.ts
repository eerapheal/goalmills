import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sponsorship from '@/models/Sponsorship';
import { requirePermission } from '@/lib/serverAuth';
import { isValidObjectId, sanitizeObject } from '@/lib/security';
import { logAdminAction } from '@/lib/auditLog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requirePermission('articles:read');
    if (error) return error;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await dbConnect();
    const sponsorship = await Sponsorship.findById(id).lean();
    if (!sponsorship) {
      return NextResponse.json({ error: 'Sponsorship not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, sponsorship });
  } catch (error: any) {
    console.error('[Admin Sponsorship GET by ID] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve sponsorship' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requirePermission('articles:publish');
    if (error) return error;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await dbConnect();
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    const updated = await Sponsorship.findByIdAndUpdate(
      id,
      {
        $set: {
          ...body,
          ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
          ...(body.endDate ? { endDate: new Date(body.endDate) } : {}),
          ...(body.priority !== undefined ? { priority: Number(body.priority) } : {}),
          ...(body.budget !== undefined ? { budget: Number(body.budget) } : {}),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Sponsorship not found' }, { status: 404 });
    }

    logAdminAction({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'SPONSORSHIP_UPDATED',
      resource: 'Sponsorship',
      resourceId: id,
      status: 'SUCCESS',
      metadata: { title: updated.title, status: updated.status },
    });

    return NextResponse.json({ success: true, sponsorship: updated });
  } catch (error: any) {
    console.error('[Admin Sponsorship PUT] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update sponsorship' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requirePermission('articles:delete');
    if (error) return error;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      const deleted = await Sponsorship.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Sponsorship not found' }, { status: 404 });
      }

      logAdminAction({
        actorId: session.user.id,
        actorEmail: session.user.email,
        action: 'SPONSORSHIP_HARD_DELETED',
        resource: 'Sponsorship',
        resourceId: id,
        status: 'SUCCESS',
      });

      return NextResponse.json({ success: true, message: 'Permanently deleted' });
    } else {
      // Soft-delete (move to trash)
      const softDeleted = await Sponsorship.findByIdAndUpdate(
        id,
        {
          $set: {
            status: 'trash',
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: session.user.email,
          },
        },
        { new: true }
      );

      if (!softDeleted) {
        return NextResponse.json({ error: 'Sponsorship not found' }, { status: 404 });
      }

      logAdminAction({
        actorId: session.user.id,
        actorEmail: session.user.email,
        action: 'SPONSORSHIP_SOFT_DELETED',
        resource: 'Sponsorship',
        resourceId: id,
        status: 'SUCCESS',
      });

      return NextResponse.json({ success: true, message: 'Moved to trash' });
    }
  } catch (error: any) {
    console.error('[Admin Sponsorship DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete sponsorship' }, { status: 500 });
  }
}
