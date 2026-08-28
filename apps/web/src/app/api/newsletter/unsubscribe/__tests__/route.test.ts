import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const { mockSubscriber } = vi.hoisted(() => ({
  mockSubscriber: {
    _id: 'sub-unsub-1',
    email: 'fan@goalmills.com',
    frequency: 'daily',
    status: 'active',
    unsubscribeToken: 'valid-unsub-token',
    save: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/models/NewsletterSubscriber', () => ({
  default: {
    findOne: vi.fn().mockImplementation((query) => {
      if (query.unsubscribeToken === 'valid-unsub-token') return Promise.resolve(mockSubscriber);
      return Promise.resolve(null);
    }),
  },
}));

import { GET, POST } from '../route';

describe('Newsletter Unsubscribe API (/api/newsletter/unsubscribe)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch subscriber details with valid token on GET', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter/unsubscribe?token=valid-unsub-token');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.email).toBe('fan@goalmills.com');
  });

  it('should unsubscribe subscriber on POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ token: 'valid-unsub-token', action: 'unsubscribe' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSubscriber.status).toBe('unsubscribed');
  });

  it('should update frequency preference on POST with update_frequency action', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-unsub-token',
        action: 'update_frequency',
        frequency: 'monthly',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSubscriber.frequency).toBe('monthly');
  });
});
