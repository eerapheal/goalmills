import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import Sponsorship from '@/models/Sponsorship';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Sponsorship', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
  },
}));

describe('Sponsorship Telemetry API (/api/sponsorships/[id]/track)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject invalid MongoDB ObjectIds with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/sponsorships/invalid-id/track?type=click', {
      method: 'POST',
    });
    const params = Promise.resolve({ id: 'invalid-id' });

    const res = await POST(req, { params });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Invalid ID');
  });

  it('should reject invalid event types with 400', async () => {
    const validId = '507f1f77bcf86cd799439011';
    const req = new NextRequest(`http://localhost:3000/api/sponsorships/${validId}/track?type=malicious_event`, {
      method: 'POST',
    });
    const params = Promise.resolve({ id: validId });

    const res = await POST(req, { params });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Invalid event type');
  });

  it('should successfully track click on active campaign', async () => {
    const validId = '507f1f77bcf86cd799439011';
    (Sponsorship.findOneAndUpdate as any).mockResolvedValue({
      _id: validId,
      title: 'Partner Offer',
      clicks: 1,
    });

    const req = new NextRequest(`http://localhost:3000/api/sponsorships/${validId}/track?type=click`, {
      method: 'POST',
    });
    const params = Promise.resolve({ id: validId });

    const res = await POST(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.tracked).toBe('click');
  });
});
