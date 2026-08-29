import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const mockProcessedEvents = new Set<string>();

vi.mock('@/models/EmailEvent', () => ({
  default: {
    findOne: vi.fn().mockImplementation((query) => {
      if (mockProcessedEvents.has(query.eventId))
        return Promise.resolve({ eventId: query.eventId });
      return Promise.resolve(null);
    }),
    create: vi.fn().mockImplementation((data) => {
      mockProcessedEvents.add(data.eventId);
      return Promise.resolve(data);
    }),
  },
}));

vi.mock('@/lib/deliverability/suppression', () => ({
  suppressEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/NewsletterSubscriber', () => ({
  default: {
    findOne: vi.fn().mockResolvedValue({
      emailNormalized: 'fan@goalmills.com',
      status: 'ACTIVE',
      softBounceCount: 0,
      save: vi.fn().mockResolvedValue(true),
    }),
  },
}));

vi.mock('@/models/CampaignRecipient', () => ({
  default: {
    findByIdAndUpdate: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/models/NewsletterCampaign', () => ({
  default: {
    findByIdAndUpdate: vi.fn().mockResolvedValue(true),
  },
}));

import { POST } from '../route';
import { suppressEmail } from '@/lib/deliverability/suppression';

describe('Mailer Event Webhook Pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessedEvents.clear();
  });

  it('should process hard bounce and trigger permanent suppression', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/mailer', {
      method: 'POST',
      body: JSON.stringify({
        eventId: 'evt_101',
        email: 'invalid@goalmills.com',
        eventType: 'hard_bounce',
        metadata: { reason: '550 User unknown' },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(suppressEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'invalid@goalmills.com',
        reason: 'HARD_BOUNCE',
      })
    );
  });

  it('should be idempotent and skip duplicate eventIds', async () => {
    mockProcessedEvents.add('evt_duplicate');

    const req = new NextRequest('http://localhost:3000/api/webhooks/mailer', {
      method: 'POST',
      body: JSON.stringify({
        eventId: 'evt_duplicate',
        email: 'user@goalmills.com',
        eventType: 'delivered',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toContain('idempotent');
  });
});
