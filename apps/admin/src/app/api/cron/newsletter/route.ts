import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterCampaign from '@/models/NewsletterCampaign';
import { curateNewsletterArticles } from '@/lib/newsletter/curator';
import { dispatchNewsletter } from '@/lib/newsletter/dispatcher';
import type { NewsletterAudience, NewsletterFrequency } from '@goalmills/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const vercelCronHeader = req.headers.get('x-vercel-cron');
    const cronSecret = process.env.CRON_SECRET;
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get('secret') || searchParams.get('key');

    // Authorize request:
    // 1. If CRON_SECRET is configured: accept if Authorization header matches, OR query secret matches, OR x-vercel-cron is present
    // 2. If CRON_SECRET is not configured: allow if x-vercel-cron is present or no secret required
    if (cronSecret) {
      const isAuthorized =
        authHeader === `Bearer ${cronSecret}` ||
        querySecret === cronSecret ||
        Boolean(vercelCronHeader);

      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized cron request. Provide Bearer token, secret query parameter, or Vercel cron header.' },
          { status: 401 }
        );
      }
    }

    await dbConnect();
    const requestedFrequency = (searchParams.get('frequency') as NewsletterFrequency) || 'daily';

    // 1. Process any pending scheduled campaigns whose time has arrived
    const now = new Date();
    const dueScheduled = await NewsletterCampaign.find({
      status: 'scheduled',
      scheduledFor: { $lte: now },
    });

    const scheduledResults = [];
    for (const camp of dueScheduled) {
      const res = await dispatchNewsletter({
        campaignId: camp._id.toString(),
        title: camp.title,
        previewText: camp.previewText,
        editorialNote: camp.editorialNote,
        frequencyTier: camp.frequencyTier,
        targetAudience: camp.targetAudience,
        articleIds: camp.articleIds.map((id: any) => id.toString()),
        createdBy: 'scheduled_cron',
      });
      scheduledResults.push(res);
    }

    // 2. Dispatch automated curated digest for the frequency
    const curated = await curateNewsletterArticles(requestedFrequency, 5);

    let audience: NewsletterAudience = 'daily_subscribers';
    if (requestedFrequency === 'weekly') audience = 'weekly_subscribers';
    if (requestedFrequency === 'monthly') audience = 'monthly_subscribers';

    const dispatchResult = await dispatchNewsletter({
      title: curated.title,
      previewText: curated.previewText,
      editorialNote: curated.editorialNote,
      frequencyTier: requestedFrequency === 'all' ? 'daily' : requestedFrequency,
      targetAudience: audience,
      articles: curated.articles,
      createdBy: '10am_system_cron',
    });

    return NextResponse.json({
      success: true,
      scheduledProcessed: scheduledResults.length,
      curatedDigest: dispatchResult,
    });
  } catch (err: any) {
    console.error('Newsletter cron error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error processing newsletter cron' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Support GET for standard web cron runners
  return POST(req);
}
