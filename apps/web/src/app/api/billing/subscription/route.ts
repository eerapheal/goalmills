import { NextRequest, NextResponse } from 'next/server';
import { billingService } from '@/lib/billing/billingService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const tenantSlug = req.headers.get('x-tenant-slug') || 'goalmills';

    const subscription = await billingService.getUserSubscription(userId, tenantSlug);
    const plans = billingService.getAvailablePlans();

    return NextResponse.json({
      success: true,
      subscription,
      plans,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch subscription status',
      },
      { status: 500 }
    );
  }
}
