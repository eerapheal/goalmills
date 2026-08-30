import { NextRequest, NextResponse } from 'next/server';
import { contentDistributionService } from '@/lib/distribution/contentDistributionService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get('tenantSlug') || 'goalmills';

    const stats = await contentDistributionService.getDistributionStats(tenantSlug);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch distribution stats',
      },
      { status: 500 }
    );
  }
}
