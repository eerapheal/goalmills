import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailSuppression from '@/models/EmailSuppression';
import { requirePermission } from '@/lib/serverAuth';
import { suppressEmail, unsuppressEmail } from '@/lib/deliverability/suppression';
import { escapeRegex } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const { error } = await requirePermission('articles:publish');
    if (error) return error;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const reason = searchParams.get('reason');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: any = {};
    if (reason && reason !== 'all') {
      query.reason = reason;
    }
    if (search) {
      const safe = escapeRegex(search.trim());
      query.emailNormalized = { $regex: safe, $options: 'i' };
    }

    const [suppressions, totalCount] = await Promise.all([
      EmailSuppression.find(query).sort({ createdAt: -1 }).limit(limit),
      EmailSuppression.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      total: totalCount,
      data: suppressions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch suppressions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requirePermission('articles:publish');
    if (error) return error;

    const { email, reason = 'MANUAL' } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 });
    }

    await suppressEmail({
      email,
      reason,
      source: `admin_manual_${session?.user?.name || 'user'}`,
    });

    return NextResponse.json({
      success: true,
      message: `Email ${email} has been added to the global suppression list.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to suppress email' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { error } = await requirePermission('articles:publish');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email query parameter required' }, { status: 400 });
    }

    const unsuppressed = await unsuppressEmail(email);

    return NextResponse.json({
      success: unsuppressed,
      message: unsuppressed
        ? `Email ${email} removed from suppression list.`
        : `Email ${email} was not found on suppression list.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to unsuppress email' },
      { status: 500 }
    );
  }
}
