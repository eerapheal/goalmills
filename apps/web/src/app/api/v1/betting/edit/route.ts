import { NextRequest, NextResponse } from 'next/server';
import { recalculateBetSlip } from '@/lib/betting/betEditorService';
import { BetSlipEditRequest } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BetSlipEditRequest;

    if (!body || !Array.isArray(body.legs)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: legs array is required' },
        { status: 400 }
      );
    }

    const result = recalculateBetSlip(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Betting Edit API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to recalculate bet slip' },
      { status: 500 }
    );
  }
}
