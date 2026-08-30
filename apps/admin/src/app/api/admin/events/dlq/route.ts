import { NextRequest, NextResponse } from 'next/server';
import { DeadLetterEvent } from '@/models/DeadLetterEvent';
import { connectDB } from '@/lib/db';
import { resolveTenantContext } from '@/lib/tenantContext';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantContext = await resolveTenantContext(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (!tenantContext.isSuperAdmin) {
      query.tenantSlug = tenantContext.tenantSlug;
    }
    if (status !== 'all') {
      query.status = status;
    }

    const [events, total] = await Promise.all([
      DeadLetterEvent.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      DeadLetterEvent.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch dead-letter events',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantContext = await resolveTenantContext(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      await DeadLetterEvent.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Event removed from DLQ' });
    }

    // Purge discarded or resolved events for tenant
    const query: any = { status: { $in: ['resolved', 'discarded', 'replayed'] } };
    if (!tenantContext.isSuperAdmin) {
      query.tenantSlug = tenantContext.tenantSlug;
    }

    const result = await DeadLetterEvent.deleteMany(query);
    return NextResponse.json({
      success: true,
      message: `Purged ${result.deletedCount} processed DLQ records`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to delete dead-letter events',
      },
      { status: 500 }
    );
  }
}
