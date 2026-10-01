import { NextRequest, NextResponse } from 'next/server';
import { createOddsAlert, getUserOddsAlerts, isBettingFeatureEnabled } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!isBettingFeatureEnabled('oddsAlerts')) {
      return NextResponse.json({ success: false, error: 'Odds Alerts feature is disabled' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const alerts = await getUserOddsAlerts(userId);
    return NextResponse.json({ success: true, data: alerts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isBettingFeatureEnabled('oddsAlerts')) {
      return NextResponse.json({ success: false, error: 'Odds Alerts feature is disabled' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      eventId,
      sport,
      matchName,
      marketId,
      marketName,
      selection,
      bookmakerId,
      bookmakerName,
      targetOdds,
      initialOdds,
      targetDirection,
      channel,
      userId,
      userEmail,
    } = body;

    if (!eventId || !matchName || !marketId || !selection || typeof targetOdds !== 'number') {
      return NextResponse.json(
        { success: false, error: 'eventId, matchName, marketId, selection, and targetOdds are required' },
        { status: 400 }
      );
    }

    const alert = await createOddsAlert({
      eventId,
      sport,
      matchName,
      marketId,
      marketName,
      selection,
      bookmakerId,
      bookmakerName,
      targetOdds,
      initialOdds,
      targetDirection,
      channel,
      userId,
      userEmail,
    });

    return NextResponse.json({ success: true, data: alert }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
