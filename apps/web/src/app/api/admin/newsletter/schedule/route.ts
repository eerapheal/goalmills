import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterCampaign from '@/models/NewsletterCampaign';
import { requirePermission } from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requirePermission('articles:publish');
    if (error) return error;

    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.scheduledFor) {
      return NextResponse.json(
        { success: false, message: 'Campaign title and scheduled date/time are required' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(body.scheduledFor);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    const campaign = await NewsletterCampaign.create({
      title: body.title,
      previewText: body.previewText,
      editorialNote: body.editorialNote,
      frequencyTier: body.frequencyTier || 'custom_broadcast',
      targetAudience: body.targetAudience || 'all_subscribers',
      articleIds: body.articleIds || [],
      scheduledFor: scheduledDate,
      status: 'scheduled',
      createdBy: session?.user?.name || 'admin',
    });

    return NextResponse.json({
      success: true,
      message: `Campaign scheduled successfully for ${scheduledDate.toLocaleString()}`,
      data: campaign,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to schedule campaign' },
      { status: 500 }
    );
  }
}
