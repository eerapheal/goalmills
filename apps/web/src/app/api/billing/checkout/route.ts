import { NextRequest, NextResponse } from 'next/server';
import { billingService } from '@/lib/billing/billingService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, interval, userId, userEmail } = body;
    const tenantSlug = req.headers.get('x-tenant-slug') || 'goalmills';

    if (!tier || tier === 'free') {
      return NextResponse.json({ error: 'Valid subscription tier is required' }, { status: 400 });
    }

    const effectiveUserId = userId || `user_anon_${Date.now()}`;
    const effectiveEmail = userEmail || 'fan@goalmills.com';

    const sessionData = await billingService.createCheckoutSession(
      effectiveUserId,
      effectiveEmail,
      tier,
      interval || 'monthly',
      tenantSlug
    );

    return NextResponse.json({
      success: true,
      url: sessionData.url,
      sessionId: sessionData.sessionId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to initialize checkout session',
      },
      { status: 500 }
    );
  }
}
