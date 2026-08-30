import { NextRequest, NextResponse } from 'next/server';
import { sportsWarehouseService } from '@/lib/warehouse/sportsWarehouseService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await sportsWarehouseService.getWarehouseStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch warehouse statistics',
      },
      { status: 500 }
    );
  }
}
