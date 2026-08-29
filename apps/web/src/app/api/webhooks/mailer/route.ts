import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailEvent from '@/models/EmailEvent';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import CampaignRecipient from '@/models/CampaignRecipient';
import NewsletterCampaign from '@/models/NewsletterCampaign';
import { suppressEmail } from '@/lib/deliverability/suppression';
import {
  calculateEngagementScore,
  calculateEmailHealthScore,
} from '@/lib/deliverability/healthGate';
import type { EmailEventType } from '@goalmills/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      eventId,
      email,
      eventType,
      provider = 'go_mailer',
      campaignId,
      recipientId,
      metadata = {},
      timestamp,
    } = body;

    if (!email || !eventType) {
      return NextResponse.json(
        { success: false, message: 'email and eventType are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const normalized = email.trim().toLowerCase();
    const eventKey = eventId || `evt_${Date.now()}_${eventType}_${normalized}`;

    // 1. Idempotency Guard: prevent duplicate webhook processing
    const existing = await EmailEvent.findOne({ eventId: eventKey });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Event already processed (idempotent)' });
    }

    // 2. Record Event
    await EmailEvent.create({
      eventId: eventKey,
      email: normalized,
      eventType: eventType as EmailEventType,
      provider,
      campaignId,
      recipientId,
      metadata,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    // 3. Process Specific Event Actions
    const subscriber = await NewsletterSubscriber.findOne({ emailNormalized: normalized });

    if (eventType === 'hard_bounce') {
      // Immediately and permanently suppress
      await suppressEmail({
        email: normalized,
        reason: 'HARD_BOUNCE',
        source: provider,
        campaignId,
        metadata,
      });

      if (recipientId) {
        await CampaignRecipient.findByIdAndUpdate(recipientId, {
          status: 'HARD_BOUNCED',
          lastError: metadata.reason || 'Hard bounce',
        });
      }

      if (campaignId) {
        await NewsletterCampaign.findByIdAndUpdate(campaignId, {
          $inc: { 'stats.hardBounceCount': 1 },
        });
      }
    } else if (eventType === 'complaint') {
      // Immediately suppress on spam complaints
      await suppressEmail({
        email: normalized,
        reason: 'COMPLAINT',
        source: provider,
        campaignId,
        metadata,
      });

      if (recipientId) {
        await CampaignRecipient.findByIdAndUpdate(recipientId, {
          status: 'COMPLAINED',
          lastError: 'Recipient marked email as spam',
        });
      }

      if (campaignId) {
        await NewsletterCampaign.findByIdAndUpdate(campaignId, {
          $inc: { 'stats.complaintCount': 1 },
        });
      }
    } else if (eventType === 'soft_bounce') {
      if (subscriber) {
        subscriber.softBounceCount = (subscriber.softBounceCount || 0) + 1;
        if (subscriber.softBounceCount >= 5) {
          subscriber.status = 'SUPPRESSED';
        } else if (subscriber.softBounceCount >= 2) {
          subscriber.status = 'SOFT_BOUNCE';
        }
        subscriber.emailHealthScore = calculateEmailHealthScore(subscriber);
        subscriber.engagementScore = calculateEngagementScore(subscriber);
        await subscriber.save();
      }

      if (recipientId) {
        await CampaignRecipient.findByIdAndUpdate(recipientId, {
          status: 'SOFT_BOUNCED',
          lastError: metadata.reason || 'Temporary soft bounce',
        });
      }

      if (campaignId) {
        await NewsletterCampaign.findByIdAndUpdate(campaignId, {
          $inc: { 'stats.softBounceCount': 1 },
        });
      }
    } else if (eventType === 'delivered') {
      if (subscriber) {
        if (subscriber.status === 'PENDING') subscriber.status = 'ACTIVE';
        subscriber.lastSentAt = new Date();
        await subscriber.save();
      }

      if (recipientId) {
        await CampaignRecipient.findByIdAndUpdate(recipientId, {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        });
      }
    } else if (eventType === 'opened') {
      if (subscriber) {
        subscriber.lastOpenedAt = new Date();
        subscriber.status = 'ENGAGED';
        subscriber.engagementScore = calculateEngagementScore(subscriber);
        subscriber.emailHealthScore = calculateEmailHealthScore(subscriber);
        await subscriber.save();
      }

      if (recipientId) {
        await CampaignRecipient.findByIdAndUpdate(recipientId, {
          openedAt: new Date(),
        });
      }

      if (campaignId) {
        await NewsletterCampaign.findByIdAndUpdate(campaignId, {
          $inc: { 'stats.openCount': 1 },
        });
      }
    } else if (eventType === 'clicked') {
      if (subscriber) {
        subscriber.lastClickedAt = new Date();
        subscriber.status = 'ENGAGED';
        subscriber.engagementScore = calculateEngagementScore(subscriber);
        await subscriber.save();
      }

      if (recipientId) {
        await CampaignRecipient.findByIdAndUpdate(recipientId, {
          clickedAt: new Date(),
        });
      }

      if (campaignId) {
        await NewsletterCampaign.findByIdAndUpdate(campaignId, {
          $inc: { 'stats.clickCount': 1 },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Event ${eventType} processed successfully`,
    });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
