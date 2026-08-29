import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/deliverability/suppression', () => ({
  isEmailSuppressed: vi.fn().mockResolvedValue(false),
}));

vi.mock('@/lib/deliverability/validator', () => ({
  validateEmail: vi.fn().mockImplementation((email: string) => {
    if (!email || !email.includes('@')) {
      return Promise.resolve({ isValid: false, isSendable: false, emailNormalized: '', domain: '', isDisposable: false, isRoleAccount: false, hasMxRecord: false, hasTypo: false, reason: 'Invalid syntax' });
    }
    return Promise.resolve({
      isValid: true,
      isSendable: true,
      emailNormalized: email.toLowerCase().trim(),
      domain: email.split('@')[1],
      isDisposable: false,
      isRoleAccount: false,
      hasMxRecord: true,
      hasTypo: false,
    });
  }),
}));

vi.mock('@/lib/newsletter/dispatcher', () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue({
    success: true,
    message: 'Confirmation email queued',
    editorPicks: [{ _id: '1', title: 'Editor Pick 1' }, { _id: '2', title: 'Editor Pick 2' }],
  }),
}));

const { mockSubscriber } = vi.hoisted(() => ({
  mockSubscriber: {
    _id: 'sub-1',
    email: 'fan@goalmills.com',
    emailNormalized: 'fan@goalmills.com',
    frequency: 'daily',
    status: 'CONFIRMED',
    unsubscribeToken: 'mock-unsub-token-123',
    save: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/models/NewsletterSubscriber', () => ({
  default: {
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ _id: 'sub-new', ...data })),
  },
}));

import { POST } from '../route';
import { sendConfirmationEmail } from '@/lib/newsletter/dispatcher';

describe('Newsletter Subscribe API (/api/newsletter/subscribe)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject invalid or missing email', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should create new subscriber with selected frequency and dispatch confirmation email with 2 editor picks', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'fan@goalmills.com',
        frequency: 'weekly',
        categories: ['Premier League'],
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.frequency).toBe('weekly');
    expect(json.data.unsubscribeToken).toBeDefined();
    expect(json.confirmationEmailSent).toBe(true);
    expect(sendConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriber: expect.objectContaining({
          email: 'fan@goalmills.com',
          frequency: 'weekly',
        }),
      })
    );
  });
});

