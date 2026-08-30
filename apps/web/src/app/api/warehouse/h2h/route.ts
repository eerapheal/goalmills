import { NextRequest, NextResponse } from 'next/server';
import { sportsWarehouseService } from '@/lib/warehouse/sportsWarehouseService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport') || 'football';
    const teamA = searchParams.get('teamA') || 'arsenal';
    const teamB = searchParams.get('teamB') || 'chelsea';

    const h2h = await sportsWarehouseService.getHeadToHead(sport, teamA, teamB);

    return NextResponse.json({
      success: true,
      h2h,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch Head-to-Head historical data',
      },
      { status: 500 }
    );
  }
}
