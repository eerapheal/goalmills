import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/serverAuth';
import { generatePreflightReport } from '@/lib/deliverability/healthGate';
import type { NewsletterAudience } from '@goalmills/types';

export async function POST(req: NextRequest) {
  try {
    const { error } = await requirePermission('articles:publish');
    if (error) return error;

    const body = await req.json();
    const audienceTier = (body.targetAudience as NewsletterAudience) || 'all_subscribers';

    const { report } = await generatePreflightReport(audienceTier);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Pre-flight deliverability check failed' },
      { status: 500 }
    );
  }
}
