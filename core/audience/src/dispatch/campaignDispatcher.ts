import type { MailerDispatchRequest, MailerDispatchResponse } from '@goalmills/contracts';
import { MailerServiceClient, mailerClient } from '@goalmills/contracts';
import type { SubscriberProfile } from '../domain/types';

export interface CampaignDispatchInput {
  campaignId: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  fromName?: string;
  fromEmail?: string;
  priority?: 'high' | 'normal' | 'bulk';
  subscribers: SubscriberProfile[];
  metadata?: Record<string, string>;
}

export interface CampaignDispatchResult {
  campaignId: string;
  totalEligible: number;
  totalSuppressed: number;
  mailerResponse: MailerDispatchResponse;
}

/**
 * Orchestrates campaign dispatching by enforcing deliverability gating
 * before passing batches to the Go Mailer microservice.
 */
export class CampaignDispatcher {
  private client: MailerServiceClient;

  constructor(client: MailerServiceClient = mailerClient) {
    this.client = client;
  }

  async dispatchCampaign(input: CampaignDispatchInput): Promise<CampaignDispatchResult> {
    const eligibleRecipients: MailerDispatchRequest['recipients'] = [];
    let suppressedCount = 0;

    for (const sub of input.subscribers) {
      // Deliverability Gate: skip suppressed, bounced, unsubscribed, or complaints
      if (
        sub.status === 'SUPPRESSED' ||
        sub.status === 'HARD_BOUNCE' ||
        sub.status === 'COMPLAINT' ||
        sub.status === 'UNSUBSCRIBED' ||
        sub.emailHealthScore < 40
      ) {
        suppressedCount++;
        continue;
      }

      eligibleRecipients.push({
        email: sub.emailNormalized || sub.email,
        subscriberId: sub.id,
        unsubscribeToken: sub.id ? `unsub_${sub.id}` : undefined,
      });
    }

    const request: MailerDispatchRequest = {
      jobId: `job_${input.campaignId}_${Date.now()}`,
      campaignId: input.campaignId,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody,
      fromName: input.fromName,
      fromEmail: input.fromEmail,
      priority: input.priority || 'normal',
      recipients: eligibleRecipients,
      metadata: input.metadata,
    };

    const mailerResponse = await this.client.dispatch(request);

    return {
      campaignId: input.campaignId,
      totalEligible: eligibleRecipients.length,
      totalSuppressed: suppressedCount,
      mailerResponse,
    };
  }
}

export const campaignDispatcher = new CampaignDispatcher();
