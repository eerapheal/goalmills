import dbConnect from '@/lib/db';
import EmailSuppression from '@/models/EmailSuppression';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import type { SuppressionReason } from '@goalmills/types';

/**
 * Checks if a single normalized email address is on the global suppression list
 */
export async function isEmailSuppressed(email: string): Promise<boolean> {
  if (!email) return true;
  await dbConnect();

  const normalized = email.trim().toLowerCase();
  const suppressed = await EmailSuppression.findOne({
    emailNormalized: normalized,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });

  return !!suppressed;
}

/**
 * Batch checks an array of emails and returns a Set of suppressed normalized emails
 */
export async function getSuppressedEmailSet(emails: string[]): Promise<Set<string>> {
  if (!emails || emails.length === 0) return new Set();
  await dbConnect();

  const normalizedList = emails.map((e) => e.trim().toLowerCase());
  const records = await EmailSuppression.find({
    emailNormalized: { $in: normalizedList },
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  }).select('emailNormalized');

  return new Set(records.map((r) => r.emailNormalized));
}

/**
 * Permanently or temporarily suppresses an email and updates subscriber health state
 */
export async function suppressEmail(params: {
  email: string;
  reason: SuppressionReason;
  source?: string;
  campaignId?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}): Promise<void> {
  const { email, reason, source = 'system', campaignId, metadata = {}, expiresAt } = params;
  if (!email) return;

  await dbConnect();
  const normalized = email.trim().toLowerCase();

  // 1. Upsert into EmailSuppression collection
  await EmailSuppression.findOneAndUpdate(
    { emailNormalized: normalized },
    {
      $set: {
        reason,
        source,
        campaignId,
        metadata,
        expiresAt,
      },
    },
    { upsert: true, new: true }
  );

  // 2. Cascade state to NewsletterSubscriber model if registered
  let subscriberStatus = 'SUPPRESSED';
  if (reason === 'HARD_BOUNCE') subscriberStatus = 'HARD_BOUNCE';
  else if (reason === 'COMPLAINT') subscriberStatus = 'COMPLAINT';
  else if (reason === 'UNSUBSCRIBE') subscriberStatus = 'UNSUBSCRIBED';

  await NewsletterSubscriber.updateOne(
    { emailNormalized: normalized },
    {
      $set: {
        status: subscriberStatus,
        emailHealthScore: 0,
        reputationRiskScore: 100,
      },
      $inc: {
        hardBounceCount: reason === 'HARD_BOUNCE' ? 1 : 0,
        complaintCount: reason === 'COMPLAINT' ? 1 : 0,
      },
    }
  );
}

/**
 * Removes an email address from the suppression list (admin override)
 */
export async function unsuppressEmail(email: string): Promise<boolean> {
  if (!email) return false;
  await dbConnect();

  const normalized = email.trim().toLowerCase();
  const res = await EmailSuppression.deleteOne({ emailNormalized: normalized });

  if (res.deletedCount > 0) {
    await NewsletterSubscriber.updateOne(
      { emailNormalized: normalized },
      {
        $set: {
          status: 'ACTIVE',
          emailHealthScore: 80,
          reputationRiskScore: 10,
        },
      }
    );
    return true;
  }

  return false;
}
