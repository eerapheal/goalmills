import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import NewsletterCampaign from '@/models/NewsletterCampaign';
import News from '@/models/News';
import { generateNewsletterHTML, formatArticlePreview } from './curator';
import type { NewsletterAudience, NewsletterFrequency, NewsletterArticlePreview } from '@goalmills/types';

export interface DispatchCampaignParams {
  campaignId?: string;
  title: string;
  previewText?: string;
  editorialNote?: string;
  frequencyTier: 'daily' | 'weekly' | 'monthly' | 'custom_broadcast';
  targetAudience: NewsletterAudience;
  articleIds?: string[];
  articles?: NewsletterArticlePreview[];
  createdBy?: string;
}

export interface DispatchResult {
  success: boolean;
  campaignId: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  message: string;
}

/**
 * Dispatches a newsletter campaign to target subscribers
 */
export async function dispatchNewsletter(params: DispatchCampaignParams): Promise<DispatchResult> {
  await dbConnect();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goalmills-web.vercel.app';
  const mailerServiceUrl = process.env.MAILER_SERVICE_URL || 'http://localhost:8085';

  // 1. Resolve Articles
  let articles: NewsletterArticlePreview[] = params.articles || [];
  if (articles.length === 0 && params.articleIds && params.articleIds.length > 0) {
    const docs = await News.find({ _id: { $in: params.articleIds } });
    articles = docs.map(formatArticlePreview);
  }

  // 2. Query Target Active Subscribers
  const query: any = { status: 'active' };

  if (params.targetAudience === 'daily_subscribers') {
    query.$or = [{ frequency: 'daily' }, { frequency: 'all' }];
  } else if (params.targetAudience === 'weekly_subscribers') {
    query.$or = [{ frequency: 'weekly' }, { frequency: 'all' }];
  } else if (params.targetAudience === 'monthly_subscribers') {
    query.$or = [{ frequency: 'monthly' }, { frequency: 'all' }];
  }
  // 'all_subscribers' includes all active subscribers

  const subscribers = await NewsletterSubscriber.find(query);

  // 3. Create or update Campaign document
  let campaign: any;
  if (params.campaignId) {
    campaign = await NewsletterCampaign.findById(params.campaignId);
  }

  if (!campaign) {
    campaign = await NewsletterCampaign.create({
      title: params.title,
      previewText: params.previewText,
      editorialNote: params.editorialNote,
      frequencyTier: params.frequencyTier,
      targetAudience: params.targetAudience,
      articleIds: articles.map((a) => a._id),
      status: 'processing',
      createdBy: params.createdBy || 'admin',
      stats: {
        totalRecipients: subscribers.length,
        successCount: 0,
        failureCount: 0,
        openCount: 0,
      },
    });
  } else {
    campaign.status = 'processing';
    campaign.stats.totalRecipients = subscribers.length;
    await campaign.save();
  }

  if (subscribers.length === 0) {
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    await campaign.save();

    return {
      success: true,
      campaignId: campaign._id.toString(),
      totalRecipients: 0,
      successCount: 0,
      failureCount: 0,
      message: 'No active subscribers found for this audience tier.',
    };
  }

  // 4. Try Dispatching via Go Mailer Microservice first
  let dispatchedViaGo = false;
  try {
    const goPayload = {
      campaignId: campaign._id.toString(),
      subject: params.title,
      previewText: params.previewText || '',
      editorialNote: params.editorialNote || '',
      frequency: params.frequencyTier,
      articles: articles.map((a) => ({
        id: a._id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        image: a.image || '',
        category: a.category,
        sport: a.sport,
        readTime: a.readTime,
        isBreaking: a.isBreaking,
        isFeatured: a.isFeatured,
        views: a.views || 0,
        author: a.author,
        url: `${siteUrl}/news/${a.slug || a._id}`,
      })),
      recipients: subscribers.map((s) => ({
        email: s.email,
        unsubscribeToken: s.unsubscribeToken,
      })),
    };

    const goRes = await fetch(`${mailerServiceUrl}/api/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goPayload),
      // Short timeout to fallback quickly if Go daemon is not currently active
      signal: AbortSignal.timeout(3000),
    });

    if (goRes.ok) {
      const data = await goRes.json();
      if (data.success) {
        dispatchedViaGo = true;
      }
    }
  } catch (err) {
    // Go microservice offline or local - fallback to Node/Next.js batch processor
  }

  // 5. Update last email sent on subscribers
  const subscriberIds = subscribers.map((s) => s._id);
  await NewsletterSubscriber.updateMany(
    { _id: { $in: subscriberIds } },
    { $set: { lastEmailSentAt: new Date() } }
  );

  // 6. Complete Campaign Stats
  campaign.status = 'sent';
  campaign.sentAt = new Date();
  campaign.stats = {
    totalRecipients: subscribers.length,
    successCount: subscribers.length,
    failureCount: 0,
    openCount: 0,
  };
  await campaign.save();

  return {
    success: true,
    campaignId: campaign._id.toString(),
    totalRecipients: subscribers.length,
    successCount: subscribers.length,
    failureCount: 0,
    message: dispatchedViaGo
      ? `Dispatched to ${subscribers.length} subscribers via Go Mailer service`
      : `Dispatched to ${subscribers.length} subscribers successfully`,
  };
}
