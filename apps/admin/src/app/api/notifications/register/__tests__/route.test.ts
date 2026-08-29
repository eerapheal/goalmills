import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/PushToken', () => ({
  default: {
    findOneAndUpdate: vi.fn().mockResolvedValue({
      _id: 'token_123',
      platform: 'android',
      topics: ['breaking_news'],
      enabled: true,
    }),
  },
}));

import { POST, DELETE } from '../route';

describe('Notifications Register API (/api/notifications/register)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when push token is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ platform: 'web' }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('push token is required');
  });

  it('should successfully register a valid push token', async () => {
    const req = new NextRequest('http://localhost:3000/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({
        token: 'ExponentPushToken[abc12345]',
        platform: 'android',
        topics: ['breaking_news'],
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('successfully');
  });

  it('should successfully unregister a token via DELETE', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/notifications/register?token=ExponentPushToken[abc12345]',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
