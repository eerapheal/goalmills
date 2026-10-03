import crypto from 'crypto';
import type { MailerWebhookPayload } from '@goalmills/contracts';
import type { SubscriberStatus } from '../domain/types';

export interface SubscriberStateTransition {
  email: string;
  newStatus?: SubscriberStatus;
  healthScoreDelta?: number;
  incrementBounceCount?: 'soft' | 'hard';
  incrementComplaintCount?: boolean;
  lastOpenedAt?: Date;
  lastClickedAt?: Date;
}

/**
 * Validates HMAC-SHA256 signature sent by the Go Mailer microservice.
 */
export function verifyMailerWebhookSignature(
  rawPayload: string,
  signature: string,
  secretKey: string
): boolean {
  if (!rawPayload || !signature || !secretKey) return false;

  try {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(rawPayload);
    const expectedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Computes state updates for a subscriber based on an inbound mailer event.
 */
export function evaluateMailerWebhookEvent(payload: MailerWebhookPayload): SubscriberStateTransition {
  const email = payload.recipientEmail.toLowerCase().trim();

  switch (payload.eventType) {
    case 'bounce_hard':
      return {
        email,
        newStatus: 'HARD_BOUNCE',
        healthScoreDelta: -50,
        incrementBounceCount: 'hard',
      };

    case 'bounce_soft':
      return {
        email,
        healthScoreDelta: -10,
        incrementBounceCount: 'soft',
      };

    case 'complaint':
      return {
        email,
        newStatus: 'COMPLAINT',
        healthScoreDelta: -80,
        incrementComplaintCount: true,
      };

    case 'opened':
      return {
        email,
        healthScoreDelta: 5,
        lastOpenedAt: new Date(payload.timestamp),
      };

    case 'clicked':
      return {
        email,
        healthScoreDelta: 10,
        lastClickedAt: new Date(payload.timestamp),
      };

    case 'delivered':
      return {
        email,
        healthScoreDelta: 1,
      };

    default:
      return { email };
  }
}
