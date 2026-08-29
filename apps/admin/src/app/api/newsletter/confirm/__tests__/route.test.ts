import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const { mockPendingSubscriber } = vi.hoisted(() => ({
  mockPendingSubscriber: {
    _id: 'sub-pending-1',
    email: 'fan@goalmills.com',
    status: 'PENDING',
    confirmationToken: 'valid-confirm-token-123',
    frequency: 'daily',
    save: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/models/NewsletterSubscriber', () => ({
  default: {
    findOne: vi.fn().mockImplementation((query) => {
      if (query.confirmationToken === 'valid-confirm-token-123')
        return Promise.resolve(mockPendingSubscriber);
      return Promise.resolve(null);
    }),
  },
}));

import { GET } from '../route';

describe('Double Opt-In Confirmation API (/api/newsletter/confirm)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject missing token', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter/confirm');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should confirm valid token and transition to CONFIRMED state', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/newsletter/confirm?token=valid-confirm-token-123'
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockPendingSubscriber.status).toBe('CONFIRMED');
    expect(mockPendingSubscriber.save).toHaveBeenCalled();
  });
});
