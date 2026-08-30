import { NextRequest, NextResponse } from 'next/server';
import { billingService } from '@/lib/billing/billingService';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Verify webhook payload and pass to BillingService
    const result = await billingService.handleStripeWebhook(payload);

    return NextResponse.json({
      received: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        received: false,
        error: error?.message || 'Webhook processing failed',
      },
      { status: 400 }
    );
  }
}
