import { NextRequest, NextResponse } from 'next/server';
import { sportsWarehouseService } from '@/lib/warehouse/sportsWarehouseService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger warehouse seed/backfill
    const result = await sportsWarehouseService.seedHistoricalWarehouse();

    return NextResponse.json({
      success: true,
      message: `Historical Sports Warehouse backfill completed successfully (${result.count} derby records synchronized).`,
      count: result.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to sync historical sports warehouse',
      },
      { status: 500 }
    );
  }
}
