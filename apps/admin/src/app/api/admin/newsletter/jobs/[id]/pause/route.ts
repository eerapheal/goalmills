import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterSendJob from '@/models/NewsletterSendJob';
import NewsletterCampaign from '@/models/NewsletterCampaign';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const job = await NewsletterSendJob.findByIdAndUpdate(
      id,
      { status: 'paused', pausedAt: new Date() },
      { new: true }
    );

    if (!job) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    if (job.campaignId) {
      await NewsletterCampaign.findByIdAndUpdate(job.campaignId, { status: 'paused' });
    }

    return NextResponse.json({ success: true, message: 'Job paused', job });
  } catch (error: any) {
    console.error('[Admin Newsletter Job Pause] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
