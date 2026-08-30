import { NextRequest, NextResponse } from 'next/server';
import { sportsWarehouseService } from '@/lib/warehouse/sportsWarehouseService';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport') || 'football';

    const trends = await sportsWarehouseService.getTeamTrends(sport, slug);

    return NextResponse.json({
      success: true,
      trends,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch team trends',
      },
      { status: 500 }
    );
  }
}
