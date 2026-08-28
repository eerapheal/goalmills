import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/serverAuth';
import { dispatchNewsletter } from '@/lib/newsletter/dispatcher';
import { curateNewsletterArticles } from '@/lib/newsletter/curator';
import type { NewsletterAudience, NewsletterFrequency } from '@goalmills/types';

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requirePermission('articles:publish');
    if (error) return error;

    const body = await req.json();
    const mode = body.mode || 'manual'; // 'manual' or 'auto_curate'

    if (mode === 'auto_curate') {
      const frequency = (body.frequency as NewsletterFrequency) || 'daily';
      const curated = await curateNewsletterArticles(frequency, 5);

      let audience: NewsletterAudience = 'daily_subscribers';
      if (frequency === 'weekly') audience = 'weekly_subscribers';
      if (frequency === 'monthly') audience = 'monthly_subscribers';
      if (frequency === 'all') audience = 'all_subscribers';

      const result = await dispatchNewsletter({
        title: body.title || curated.title,
        previewText: body.previewText || curated.previewText,
        editorialNote: body.editorialNote || curated.editorialNote,
        frequencyTier: frequency === 'all' ? 'daily' : frequency,
        targetAudience: body.targetAudience || audience,
        articles: curated.articles,
        createdBy: session?.user?.name || 'admin_auto',
      });

      return NextResponse.json(result);
    }

    // Manual custom broadcast with selected posts
    if (!body.title || !body.articleIds || body.articleIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a title and at least one selected article' },
        { status: 400 }
      );
    }

    const result = await dispatchNewsletter({
      campaignId: body.campaignId,
      title: body.title,
      previewText: body.previewText,
      editorialNote: body.editorialNote,
      frequencyTier: body.frequencyTier || 'custom_broadcast',
      targetAudience: body.targetAudience || 'all_subscribers',
      articleIds: body.articleIds,
      createdBy: session?.user?.name || 'admin',
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Newsletter send error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to dispatch newsletter' },
      { status: 500 }
    );
  }
}
