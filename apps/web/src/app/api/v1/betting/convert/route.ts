import { NextRequest, NextResponse } from 'next/server';
import { convertBetCode, isBettingFeatureEnabled } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!isBettingFeatureEnabled('betEditor')) {
      return NextResponse.json(
        { success: false, error: 'Bet conversion/editor is currently disabled.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { code, sourceBookmaker, targetBookmaker } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid booking code is required.' },
        { status: 400 }
      );
    }

    if (!sourceBookmaker || !targetBookmaker) {
      return NextResponse.json(
        { success: false, error: 'Source and target bookmakers are required.' },
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

    const result = await convertBetCode({
      code: cleanCode,
      sourceBookmaker: sourceBookmaker.trim(),
      targetBookmaker: targetBookmaker.trim(),
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[API /betting/convert] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error while converting bet code.' },
      { status: 500 }
    );
  }
}
