import { NextRequest, NextResponse } from 'next/server';
import { billingService } from '@/lib/billing/billingService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId } = body;
    const tenantSlug = req.headers.get('x-tenant-slug') || 'goalmills';

    const sub = await billingService.getUserSubscription(userId || 'anonymous', tenantSlug);

    const portalUrl = sub.stripeCustomerId
      ? `https://billing.stripe.com/p/session/test_${sub.stripeCustomerId}`
      : 'https://billing.stripe.com/p/session/test_default';

    return NextResponse.json({
      success: true,
      url: portalUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate billing portal session',
      },
      { status: 500 }
    );
  }
}
