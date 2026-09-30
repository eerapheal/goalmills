import { NextRequest, NextResponse } from 'next/server';
import { trimBetRisk, isBettingFeatureEnabled } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!isBettingFeatureEnabled('betTrimmer')) {
      return NextResponse.json(
        { success: false, error: 'Risk Trimmer is currently disabled.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { code, sourceBookmaker, riskTolerance } = body;

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

    const result = await trimBetRisk({
      code: cleanCode,
      sourceBookmaker: sourceBookmaker.trim(),
      riskTolerance: riskTolerance || 'MODERATE',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[API /betting/trim] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error while trimming bet risk.' },
      { status: 500 }
    );
  }
}
