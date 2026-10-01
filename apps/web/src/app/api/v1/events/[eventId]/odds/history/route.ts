import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OddsQuoteModel from '@/models/OddsQuote';
import { getOpeningOddsMapForEvent } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Missing required eventId parameter' },
        { status: 400 }
      );
    }

    await dbConnect();

    const [openingMap, recentQuotes] = await Promise.all([
      getOpeningOddsMapForEvent(eventId),
      OddsQuoteModel.find({ eventId })
        .sort({ capturedAt: -1 })
        .limit(100)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      eventId,
      openingOdds: openingMap,
      historyCount: recentQuotes.length,
      history: recentQuotes,
    });
  } catch (error: any) {
    console.error('[Events Odds History API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve odds history' },
      { status: 500 }
    );
  }
}
