import { NextRequest, NextResponse } from 'next/server';
import { SyndicationJobModel } from '@/models/SyndicationJob';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get('tenantSlug') || 'goalmills';
    const status = searchParams.get('status') || undefined;

    const filter: any = { tenantSlug };
    if (status && status !== 'all') filter.status = status;

    const jobs = await SyndicationJobModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch syndication jobs',
      },
      { status: 500 }
    );
  }
}
