import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterCampaign from '@/models/NewsletterCampaign';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 50);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const skip = (page - 1) * limit;

    await dbConnect();

    // Query sent public campaigns
    const query: Record<string, any> = {
      status: 'sent',
    };

    const [campaigns, total] = await Promise.all([
      NewsletterCampaign.find(query)
        .sort({ sentAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('articleIds', 'title slug excerpt image category sport readTime author createdAt')
        .lean(),
      NewsletterCampaign.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[Newsletter Archive GET] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
