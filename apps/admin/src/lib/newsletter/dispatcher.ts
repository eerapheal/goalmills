import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import NewsletterCampaign from '@/models/NewsletterCampaign';
import CampaignRecipient from '@/models/CampaignRecipient';
import News from '@/models/News';
import {
  generateNewsletterHTML,
  formatArticlePreview,
  getEditorPickArticles,
  generateConfirmationEmailHTML,
} from './curator';
import {
  generatePreflightReport,
  createCampaignRecipientSnapshot,
} from '@/lib/deliverability/healthGate';
import { sendEmailViaNodemailer } from './directSmtp';
import type {
  NewsletterAudience,
  NewsletterArticlePreview,
  CampaignPreflightReport,
} from '@goalmills/types';

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
  isHighPriority?: boolean;
}

export interface DispatchResult {
  success: boolean;
  campaignId: string;
  totalRecipients: number;
  eligibleCount: number;
  suppressedCount: number;
  message: string;
  preflightReport?: CampaignPreflightReport;
}

/**
 * Dispatches a newsletter campaign directly using Nodemailer,
 * with deliverability pre-flight gating and per-recipient tracking snapshot.
 */
export async function dispatchNewsletter(params: DispatchCampaignParams): Promise<DispatchResult> {
  await dbConnect();

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://goalmills-web.vercel.app').replace(/\/+$/, '');

  // 1. Resolve Articles
  let articles: NewsletterArticlePreview[] = params.articles || [];
  if (articles.length === 0 && params.articleIds && params.articleIds.length > 0) {
    const docs = await News.find({ _id: { $in: params.articleIds } });
    articles = docs.map(formatArticlePreview);
  }

  // 2. Run Pre-Flight Deliverability Gate & Filter Eligible Recipients
  const { report, eligibleSubscribers } = await generatePreflightReport(params.targetAudience);

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
      preflightReport: report,
      createdBy: params.createdBy || 'admin',
      stats: {
        totalRecipients: eligibleSubscribers.length,
        successCount: 0,
        failureCount: 0,
        openCount: 0,
      },
    });
  } else {
    campaign.status = 'processing';
    campaign.preflightReport = report;
    campaign.stats.totalRecipients = eligibleSubscribers.length;
    await campaign.save();
  }

  if (eligibleSubscribers.length === 0) {
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    await campaign.save();

    return {
      success: true,
      campaignId: campaign._id.toString(),
      totalRecipients: report.totalRecipients,
      eligibleCount: 0,
      suppressedCount: report.suppressedCount,
      message: 'No deliverable recipients found after Deliverability Gate filtering.',
      preflightReport: report,
    };
  }

  // 4. Create Immutable Campaign Recipient Snapshot in MongoDB
  await createCampaignRecipientSnapshot(campaign._id.toString(), eligibleSubscribers);

  // 5. Dispatch Directly via Enterprise Nodemailer
  let successCount = 0;
  let failureCount = 0;
  const deliveryErrors: string[] = [];

  for (const sub of eligibleSubscribers) {
    try {
      const email = (sub.emailNormalized || sub.email).toLowerCase();
      const unsubToken = sub.unsubscribeToken || '';
      const unsubURL = `${siteUrl}/newsletter/unsubscribe?token=${unsubToken}`;
      const recipientHTML = generateNewsletterHTML({
        title: params.title,
        previewText: params.previewText || '',
        editorialNote: params.editorialNote || '',
        frequency: params.frequencyTier,
        articles,
        siteUrl,
        unsubscribeUrl: unsubURL,
      });

      const sendRes = await sendEmailViaNodemailer({
        to: email,
        subject: params.title,
        htmlBody: recipientHTML,
        unsubscribeUrl: unsubURL,
      });

      if (sendRes.success) {
        successCount++;
        await CampaignRecipient.findOneAndUpdate(
          { campaignId: campaign._id, email },
          { $set: { status: 'DELIVERED', deliveredAt: new Date() } }
        );
      } else {
        failureCount++;
        deliveryErrors.push(`${email}: ${sendRes.error}`);
        await CampaignRecipient.findOneAndUpdate(
          { campaignId: campaign._id, email },
          { $set: { status: 'FAILED', lastError: sendRes.error } }
        );
      }
    } catch (err: any) {
      failureCount++;
      deliveryErrors.push(`${sub.email}: ${err.message || err}`);
      console.error(`[Nodemailer Dispatch Error] for ${sub.email}:`, err);
    }
  }

  // 6. Update last email sent timestamp on subscribers
  const subscriberIds = eligibleSubscribers.map((s) => s._id);
  await NewsletterSubscriber.updateMany(
    { _id: { $in: subscriberIds } },
    { $set: { lastSentAt: new Date() } }
  );

  // 7. Finalize Campaign Status
  campaign.status = successCount > 0 ? 'sent' : 'failed';
  campaign.sentAt = new Date();
  campaign.stats = {
    totalRecipients: eligibleSubscribers.length,
    successCount,
    failureCount,
    openCount: 0,
  };
  await campaign.save();

  return {
    success: successCount > 0,
    campaignId: campaign._id.toString(),
    totalRecipients: report.totalRecipients,
    eligibleCount: eligibleSubscribers.length,
    suppressedCount: report.suppressedCount,
    message:
      successCount > 0
        ? `Dispatched to ${successCount} deliverable subscriber${successCount === 1 ? '' : 's'} via Nodemailer (${report.suppressedCount} suppressed)`
        : `Failed to deliver via Nodemailer: ${deliveryErrors.slice(0, 3).join('; ')}`,
    preflightReport: report,
  };
}

export interface SendConfirmationParams {
  subscriber: {
    _id?: string;
    email: string;
    emailNormalized?: string;
    frequency?: string;
    categories?: string[];
    confirmationToken?: string;
    unsubscribeToken?: string;
  };
  requireDoubleOptIn?: boolean;
}

export interface SendConfirmationResult {
  success: boolean;
  message: string;
  editorPicks: NewsletterArticlePreview[];
  dispatchedViaGo?: boolean;
}

/**
 * Sends a welcome / confirmation email with two curated Editor's Pick posts
 * directly via Nodemailer.
 */
export async function sendConfirmationEmail(
  params: SendConfirmationParams
): Promise<SendConfirmationResult> {
  const { subscriber, requireDoubleOptIn = false } = params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://goalmills-web.vercel.app').replace(/\/+$/, '');

  const recipientEmail = (subscriber.emailNormalized || subscriber.email).toLowerCase().trim();
  const confirmationUrl = `${siteUrl}/newsletter/confirm?token=${subscriber.confirmationToken || ''}`;
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken || ''}`;

  // 1. Fetch 2 top Editor's Pick articles
  const editorPicks = await getEditorPickArticles(2);

  // 2. Generate responsive HTML email
  const htmlBody = generateConfirmationEmailHTML({
    subscriberEmail: recipientEmail,
    frequency: subscriber.frequency || 'daily',
    categories: subscriber.categories || [],
    confirmationUrl,
    unsubscribeUrl,
    siteUrl,
    editorPicks,
    requireDoubleOptIn,
  });

  const subject = requireDoubleOptIn
    ? `Please confirm your GoalMills Newsletter subscription (+ 2 Editor's Picks)`
    : `Welcome to GoalMills Sports Alerts! (+ 2 Curated Editor's Picks)`;

  // 3. Dispatch directly via Nodemailer
  const sendRes = await sendEmailViaNodemailer({
    to: recipientEmail,
    subject,
    htmlBody,
    unsubscribeUrl,
  });

  return {
    success: sendRes.success,
    message: sendRes.success
      ? "Confirmation email with 2 Editor's Picks sent successfully via Nodemailer"
      : `Confirmation email delivery failed: ${sendRes.error}`,
    editorPicks,
    dispatchedViaGo: false,
  };
}

export interface SendNewsletterBroadcastParams {
  campaignId?: string;
  subject: string;
  previewText?: string;
  editorialNote?: string;
  frequency?: string;
  isHighPriority?: boolean;
  articleIds?: string[];
  recipients: {
    email: string;
    unsubscribeToken?: string;
    recipientId?: string;
  }[];
}

/**
 * Sends a custom newsletter broadcast or test preview dispatch directly via Nodemailer.
 */
export async function sendNewsletterBroadcast(params: SendNewsletterBroadcastParams) {
  await dbConnect();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://goalmills-web.vercel.app').replace(/\/+$/, '');

  let articles: NewsletterArticlePreview[] = [];
  if (params.articleIds && params.articleIds.length > 0) {
    const docs = await News.find({ _id: { $in: params.articleIds } });
    articles = docs.map(formatArticlePreview);
  }

  let sentCount = 0;
  let failureCount = 0;

  for (const rec of params.recipients) {
    try {
      const unsubURL = `${siteUrl}/newsletter/unsubscribe?token=${rec.unsubscribeToken || ''}`;
      const broadcastHTML = generateNewsletterHTML({
        title: params.subject,
        previewText: params.previewText || '',
        editorialNote: params.editorialNote || '',
        frequency: (params.frequency as any) || 'daily',
        articles,
        siteUrl,
        unsubscribeUrl: unsubURL,
      });

      const res = await sendEmailViaNodemailer({
        to: rec.email,
        subject: params.subject,
        htmlBody: broadcastHTML,
        unsubscribeUrl: unsubURL,
      });

      if (res.success) {
        sentCount++;
      } else {
        failureCount++;
      }
    } catch (err) {
      failureCount++;
      console.error(`[Broadcast Nodemailer Error] for ${rec.email}:`, err);
    }
  }

  return {
    success: sentCount > 0,
    totalRecipients: params.recipients.length,
    sentCount,
    failureCount,
    message:
      sentCount > 0
        ? `Broadcast dispatched to ${sentCount}/${params.recipients.length} recipients via Nodemailer`
        : 'Failed to send broadcast emails via Nodemailer',
  };
}
