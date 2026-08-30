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
    const { headline, content, sport, targetChannels, tenantSlug, linkUrl } = body;

    if (!headline || !content || !targetChannels || targetChannels.length === 0) {
      return NextResponse.json(
        { error: 'Headline, content, and at least one target channel are required' },
        { status: 400 }
      );
    }

    const jobs = await contentDistributionService.manualBroadcast(
      tenantSlug || 'goalmills',
      {
        headline,
        body: content,
        sport: sport || 'football',
        targetChannels,
        linkUrl,
      }
    );

    return NextResponse.json({
      success: true,
      message: `Broadcast successfully queued across ${jobs.length} channel(s)`,
      jobs,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to dispatch manual broadcast',
      },
      { status: 500 }
    );
  }
}
