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

    const csv = await advertiserReportingService.exportCampaignsCsv(tenantSlug);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="goalmills_advertiser_report_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to export advertiser CSV' },
      { status: 500 }
    );
  }
}
