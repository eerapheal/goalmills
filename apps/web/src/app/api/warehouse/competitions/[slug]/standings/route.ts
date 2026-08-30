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
    const season = searchParams.get('season') || '2025/2026';

    const standings = await sportsWarehouseService.getHistoricalStandings(sport, slug, season);

    return NextResponse.json({
      success: true,
      standings,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch historical standings',
      },
      { status: 500 }
    );
  }
}
