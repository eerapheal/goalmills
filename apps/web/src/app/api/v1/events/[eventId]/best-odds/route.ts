import { NextRequest, NextResponse } from 'next/server';
import { GET as getBettingOdds } from '@/app/api/v1/betting/odds/[eventId]/route';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const oddsResponse = await getBettingOdds(request, context);
    const data = await oddsResponse.json();

    if (!data || !data.success || !data.markets) {
      return oddsResponse;
    }

    const bestOddsPerMarket: Record<string, any> = {};

    for (const [marketKey, marketData] of Object.entries(data.markets as Record<string, any>)) {
      bestOddsPerMarket[marketKey] = {
        marketType: marketData.marketType,
        displayName: marketData.displayName,
        bestOdds: marketData.bestOdds,
      };
    }

    return NextResponse.json({
      success: true,
      eventId: data.eventId,
      sport: data.sport,
      format: data.format,
      updatedAt: data.updatedAt,
      bestOdds: bestOddsPerMarket,
      disclaimer: data.disclaimer,
    });
  } catch (error: any) {
    console.error('[Events Best-Odds API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve best odds' },
      { status: 500 }
    );
  }
}
