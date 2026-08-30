import { NextRequest, NextResponse } from 'next/server';
import { contentDistributionService } from '@/lib/distribution/contentDistributionService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const approved = await contentDistributionService.approveJob(
      jobId,
      (session.user as any)?.email || 'admin'
    );

    return NextResponse.json({
      success: approved,
      message: approved ? 'Job approved and dispatched successfully' : 'Failed to approve job',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to approve job',
      },
      { status: 500 }
    );
  }
}
