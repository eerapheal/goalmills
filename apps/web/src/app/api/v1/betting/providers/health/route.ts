import { NextResponse } from 'next/server';
import { getBetToolsProvider } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provider = getBetToolsProvider();
    const health = await provider.healthCheck();

    return NextResponse.json({
      success: true,
      provider: provider.providerId,
      data: health,
    });
  } catch (err: any) {
    console.error('[API /betting/providers/health] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error checking provider health' },
      { status: 500 }
    );
  }
}
