import { NextRequest, NextResponse } from 'next/server';
import { analyzeBetCode, isBettingFeatureEnabled } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!isBettingFeatureEnabled('betAnalyzer')) {
      return NextResponse.json(
        { success: false, error: 'Bet Analyzer is currently disabled.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { code, sourceBookmaker, stake } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid booking code is required.' },
        { status: 400 }
      );
    }

    if (!sourceBookmaker || typeof sourceBookmaker !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Source bookmaker is required.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim();
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(cleanCode)) {
      return NextResponse.json(
        { success: false, error: 'Booking code must be between 3 and 32 alphanumeric characters.' },
        { status: 400 }
      );
    }

    const result = await analyzeBetCode({
      code: cleanCode,
      sourceBookmaker: sourceBookmaker.trim(),
      stake: typeof stake === 'number' && stake > 0 ? stake : 10,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[API /betting/analyze] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error while analyzing bet code.' },
      { status: 500 }
    );
  }
}
