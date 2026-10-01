import { NextRequest, NextResponse } from 'next/server';
import { saveBetSlip, getUserSavedSlips, isBettingFeatureEnabled } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!isBettingFeatureEnabled('betSlipSaver')) {
      return NextResponse.json({ success: false, error: 'Bet Slip Saver is disabled' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const slips = await getUserSavedSlips(userId);
    return NextResponse.json({ success: true, data: slips });
  } catch (err: any) {
    console.error('[API /betting/slips GET] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isBettingFeatureEnabled('betSlipSaver')) {
      return NextResponse.json({ success: false, error: 'Bet Slip Saver is disabled' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, sourceBookmaker, totalOdds, legs, isPublic, stake, tags, notes, userId, originalCode } = body;

    if (!sourceBookmaker || typeof totalOdds !== 'number' || !Array.isArray(legs) || legs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'sourceBookmaker, totalOdds, and at least one leg are required.' },
        { status: 400 }
      );
    }

    const slip = await saveBetSlip({
      userId,
      title,
      sourceBookmaker,
      originalCode,
      totalOdds,
      legs,
      isPublic: Boolean(isPublic),
      stake: typeof stake === 'number' ? stake : 10,
      tags: Array.isArray(tags) ? tags : [],
      notes,
    });

    return NextResponse.json({ success: true, data: slip }, { status: 201 });
  } catch (err: any) {
    console.error('[API /betting/slips POST] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
