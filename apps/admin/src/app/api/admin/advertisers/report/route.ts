import { NextRequest, NextResponse } from 'next/server';
import { advertiserReportingService } from '@/lib/advertiser/advertiserReportingService';
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
    const sponsorId = searchParams.get('sponsorId') || undefined;

    if (sponsorId) {
      const report = await advertiserReportingService.generateCampaignReport(sponsorId, '2026-02', tenantSlug);
      return NextResponse.json({ success: true, report });
    }

    const stats = await advertiserReportingService.getAdvertiserHubStats(tenantSlug);
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch advertiser reports' },
      { status: 500 }
    );
  }
}
