import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterCampaign from '@/models/NewsletterCampaign';
import News from '@/models/News';
import { requirePermission } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const { error } = await requirePermission('articles:publish');
    if (error) return error;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const campaigns = await NewsletterCampaign.find(query)
      .populate({
        path: 'articleIds',
        select:
          'title slug excerpt image category sport readTime isBreaking isFeatured views author',
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, count: campaigns.length, data: campaigns });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requirePermission('articles:publish');
    if (error) return error;

    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.articleIds || body.articleIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Campaign title and at least one article are required' },
        { status: 400 }
      );
    }

    const campaign = await NewsletterCampaign.create({
      title: body.title,
      previewText: body.previewText,
      editorialNote: body.editorialNote,
      frequencyTier: body.frequencyTier || 'custom_broadcast',
      targetAudience: body.targetAudience || 'all_subscribers',
      articleIds: body.articleIds,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      status: body.scheduledFor ? 'scheduled' : 'draft',
      createdBy: session?.user?.name || 'admin',
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
