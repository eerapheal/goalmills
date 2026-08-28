import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/NewsletterSubscriber', () => ({
  default: {},
}));

vi.mock('@/models/CampaignRecipient', () => ({
  default: {},
}));

import { calculateEngagementScore, calculateEmailHealthScore, isSendable } from '../healthGate';
import type { NewsletterSubscriber } from '@goalmills/types';

describe('Deliverability Health Gate & Scoring', () => {
  it('should score high for active and recently engaged subscribers', () => {
    const subscriber: NewsletterSubscriber = {
      email: 'fan@goalmills.com',
      emailNormalized: 'fan@goalmills.com',
      status: 'ENGAGED',
      frequency: 'daily',
      emailHealthScore: 90,
      engagementScore: 75,
      reputationRiskScore: 5,
      lastOpenedAt: new Date().toISOString(),
      lastClickedAt: new Date().toISOString(),
      softBounceCount: 0,
      hardBounceCount: 0,
      complaintCount: 0,
      unsubscribeToken: 'token123',
    };

    const engScore = calculateEngagementScore(subscriber);
    expect(engScore).toBeGreaterThanOrEqual(80);

    const healthScore = calculateEmailHealthScore(subscriber);
    expect(healthScore).toBe(90);

    const { sendable } = isSendable(subscriber, new Set());
    expect(sendable).toBe(true);
  });

  it('should reject suppressed or low health score subscribers', () => {
    const subscriber: NewsletterSubscriber = {
      email: 'bad@goalmills.com',
      emailNormalized: 'bad@goalmills.com',
      status: 'HARD_BOUNCE',
      frequency: 'daily',
      emailHealthScore: 0,
      engagementScore: 0,
      reputationRiskScore: 100,
      softBounceCount: 0,
      hardBounceCount: 1,
      complaintCount: 0,
      unsubscribeToken: 'token123',
    };

    const { sendable, reason } = isSendable(subscriber, new Set());
    expect(sendable).toBe(false);
    expect(reason).toContain('Status is HARD_BOUNCE');
  });
});
