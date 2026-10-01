import { NextResponse } from 'next/server';
import { getAffiliateIntelligenceReport } from '@/lib/betting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await getAffiliateIntelligenceReport();
    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
