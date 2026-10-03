/**
 * Mailer Service Contract (Go 1.22 Mailer Microservice)
 * Corresponds to Blueprint Section 5.1
 */

export interface MailerRecipient {
  email: string;
  subscriberId?: string;
  unsubscribeToken?: string;
  templateVars?: Record<string, string | number>;
}

export interface MailerDispatchRequest {
  jobId: string;
  campaignId?: string;
  subject: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  htmlBody: string;
  textBody?: string;
  priority: 'high' | 'normal' | 'bulk';
  recipients: MailerRecipient[];
  metadata?: Record<string, string>;
}

export interface MailerDispatchResponse {
  jobId: string;
  status: 'queued' | 'accepted' | 'rejected';
  totalQueued: number;
  estimatedDeliveryDurationSeconds?: number;
  acceptedAt: string;
  error?: string;
}

export type MailerWebhookEventType =
  | 'delivered'
  | 'bounce_hard'
  | 'bounce_soft'
  | 'complaint'
  | 'dropped'
  | 'opened'
  | 'clicked';

export interface MailerWebhookPayload {
  eventId: string;
  eventType: MailerWebhookEventType;
  jobId: string;
  campaignId?: string;
  subscriberId?: string;
  recipientEmail: string;
  timestamp: string;
  bounceReason?: string;
  ipAddress?: string;
  userAgent?: string;
  signature: string; // HMAC-SHA256 signature for verification
}
