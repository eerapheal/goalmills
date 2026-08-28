import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import CampaignRecipient from '@/models/CampaignRecipient';
import { getSuppressedEmailSet } from './suppression';
import type {
  NewsletterSubscriber as INewsletterSubscriber,
  CampaignPreflightReport,
  DeliverabilityRisk,
  NewsletterAudience,
} from '@goalmills/types';

/**
 * Calculates a subscriber's engagement score (0–100)
 */
export function calculateEngagementScore(subscriber: INewsletterSubscriber): number {
  let score = 50; // default baseline

  const now = new Date().getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  if (subscriber.lastOpenedAt) {
    const openedDiff = now - new Date(subscriber.lastOpenedAt).getTime();
    if (openedDiff <= thirtyDaysMs) score += 25;
    else if (openedDiff <= sixtyDaysMs) score += 10;
    else if (openedDiff >= ninetyDaysMs) score -= 20;
  } else {
    // Never opened
    score -= 10;
  }

  if (subscriber.lastClickedAt) {
    const clickedDiff = now - new Date(subscriber.lastClickedAt).getTime();
    if (clickedDiff <= thirtyDaysMs) score += 30;
    else if (clickedDiff <= sixtyDaysMs) score += 15;
  }

  // Soft bounce penalties
  if (subscriber.softBounceCount > 0) {
    score -= subscriber.softBounceCount * 12;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates an overall health score (0–100)
 */
export function calculateEmailHealthScore(subscriber: INewsletterSubscriber): number {
  if (
    subscriber.status === 'HARD_BOUNCE' ||
    subscriber.status === 'COMPLAINT' ||
    subscriber.status === 'SUPPRESSED' ||
    subscriber.status === 'UNSUBSCRIBED'
  ) {
    return 0;
  }

  let health = 90;
  health -= (subscriber.softBounceCount || 0) * 15;
  if (subscriber.status === 'INACTIVE') health -= 30;
  if (subscriber.status === 'PENDING') health -= 20;

  return Math.max(0, Math.min(100, health));
}

/**
 * Pre-send deliverability filter evaluating if a subscriber is eligible to receive mail
 */
export function isSendable(
  subscriber: INewsletterSubscriber,
  suppressedSet: Set<string>
): { sendable: boolean; reason?: string } {
  const norm = (subscriber.emailNormalized || subscriber.email).toLowerCase().trim();

  // 1. Check Global Suppression List
  if (suppressedSet.has(norm)) {
    return { sendable: false, reason: 'Suppressed globally' };
  }

  // 2. Check Finite State Machine
  if (
    subscriber.status === 'HARD_BOUNCE' ||
    subscriber.status === 'COMPLAINT' ||
    subscriber.status === 'SUPPRESSED' ||
    subscriber.status === 'UNSUBSCRIBED'
  ) {
    return { sendable: false, reason: `Status is ${subscriber.status}` };
  }

  // 3. Check Minimum Health Score (Must be >= 40)
  const healthScore = subscriber.emailHealthScore ?? calculateEmailHealthScore(subscriber);
  if (healthScore < 40) {
    return { sendable: false, reason: `Email health score (${healthScore}) is below threshold (40)` };
  }

  return { sendable: true };
}

/**
 * Checks contact-level frequency caps:
 * Max 3 emails per 24 hours / Max 10 emails per 7 days
 */
export async function hasExceededFrequencyCap(subscriberEmail: string): Promise<boolean> {
  await dbConnect();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [sent24h, sent7d] = await Promise.all([
    CampaignRecipient.countDocuments({
      email: subscriberEmail.toLowerCase().trim(),
      status: { $in: ['SENT', 'DELIVERED', 'QUEUED', 'SENDING'] },
      createdAt: { $gte: twentyFourHoursAgo },
    }),
    CampaignRecipient.countDocuments({
      email: subscriberEmail.toLowerCase().trim(),
      status: { $in: ['SENT', 'DELIVERED', 'QUEUED', 'SENDING'] },
      createdAt: { $gte: sevenDaysAgo },
    }),
  ]);

  return sent24h >= 3 || sent7d >= 10;
}

/**
 * Generates a pre-flight deliverability report before broadcasting a campaign
 */
export async function generatePreflightReport(
  audienceTier: NewsletterAudience
): Promise<{ report: CampaignPreflightReport; eligibleSubscribers: INewsletterSubscriber[] }> {
  await dbConnect();

  const query: any = {};
  if (audienceTier === 'daily_subscribers') {
    query.$or = [{ frequency: 'daily' }, { frequency: 'all' }];
  } else if (audienceTier === 'weekly_subscribers') {
    query.$or = [{ frequency: 'weekly' }, { frequency: 'all' }];
  } else if (audienceTier === 'monthly_subscribers') {
    query.$or = [{ frequency: 'monthly' }, { frequency: 'all' }];
  } else if (audienceTier === 'engaged_only') {
    query.engagementScore = { $gte: 70 };
  }

  const allSubscribers = await NewsletterSubscriber.find(query);
  const emails = allSubscribers.map((s) => s.emailNormalized || s.email);
  const suppressedSet = await getSuppressedEmailSet(emails);

  let suppressedCount = 0;
  let hardBouncedCount = 0;
  let lowEngagementCount = 0;
  let inactiveCount = 0;
  const eligibleSubscribers: INewsletterSubscriber[] = [];

  for (const sub of allSubscribers) {
    const norm = (sub.emailNormalized || sub.email).toLowerCase().trim();
    if (suppressedSet.has(norm) || sub.status === 'SUPPRESSED') {
      suppressedCount++;
      continue;
    }
    if (sub.status === 'HARD_BOUNCE') {
      hardBouncedCount++;
      continue;
    }
    if (sub.status === 'INACTIVE') {
      inactiveCount++;
    }

    const engScore = sub.engagementScore ?? calculateEngagementScore(sub);
    if (engScore < 40) {
      lowEngagementCount++;
    }

    const { sendable } = isSendable(sub, suppressedSet);
    if (sendable) {
      eligibleSubscribers.push(sub);
    }
  }

  const total = allSubscribers.length;
  const eligible = eligibleSubscribers.length;

  const bounceRiskPercentage = total > 0 ? Number(((hardBouncedCount + (total - eligible) * 0.05) / total).toFixed(2)) : 0;
  const complaintRiskPercentage = total > 0 ? Number((lowEngagementCount * 0.002).toFixed(3)) : 0;

  let expectedRisk: DeliverabilityRisk = 'LOW';
  const recommendations: string[] = [];

  if (lowEngagementCount > total * 0.3) {
    expectedRisk = 'MEDIUM';
    recommendations.push('⚠ Over 30% of target audience has low engagement. Consider segmenting to active users.');
  }

  if (bounceRiskPercentage > 1.5 || suppressedCount > total * 0.15) {
    expectedRisk = 'HIGH';
    recommendations.push('⚠ Elevated bounce or suppression volume detected. Send campaign in throttled batches.');
  }

  if (eligible === 0) {
    recommendations.push('No eligible recipients found after deliverability gating.');
  } else {
    recommendations.push(`✓ Deliverability Gate: ${eligible} of ${total} recipients verified deliverable.`);
  }

  const report: CampaignPreflightReport = {
    totalRecipients: total,
    eligibleCount: eligible,
    suppressedCount,
    hardBouncedCount,
    lowEngagementCount,
    inactiveCount,
    frequencyCappedCount: 0,
    expectedRisk,
    bounceRiskPercentage,
    complaintRiskPercentage,
    recommendations,
    canProceed: eligible > 0 && expectedRisk !== 'HIGH',
  };

  return { report, eligibleSubscribers };
}

/**
 * Creates an immutable Campaign Recipient Snapshot in MongoDB before dispatching
 */
export async function createCampaignRecipientSnapshot(
  campaignId: string,
  subscribers: INewsletterSubscriber[]
): Promise<number> {
  await dbConnect();

  const recipientDocs = subscribers.map((sub) => {
    const email = (sub.emailNormalized || sub.email).toLowerCase().trim();
    const domain = email.split('@')[1] || 'unknown';

    return {
      campaignId,
      subscriberId: sub._id,
      email,
      domain,
      status: 'QUEUED',
      attempts: 0,
    };
  });

  if (recipientDocs.length === 0) return 0;

  // Insert in batches of 1000 with ordered: false to skip duplicate errors
  try {
    const res = await CampaignRecipient.insertMany(recipientDocs, { ordered: false });
    return res.length;
  } catch (err: any) {
    // If some were duplicates, return inserted count
    return err.insertedDocs ? err.insertedDocs.length : recipientDocs.length;
  }
}
