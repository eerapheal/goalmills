import { NextRequest, NextResponse } from 'next/server';
import { trackBettingAnalytics } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { eventName, bookmakerId, eventId, sport, placement, campaign, sessionId, anonymousVisitorId, metadata } = body;

    if (!eventName || typeof eventName !== 'string') {
      return NextResponse.json({ success: false, error: 'eventName is required' }, { status: 400 });
    }

    const recorded = await trackBettingAnalytics({
      eventName: eventName as any,
      bookmakerId,
      eventId,
      sport,
      placement,
      campaign,
      sessionId,
      anonymousVisitorId,
      metadata,
    });

    return NextResponse.json({ success: recorded });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
