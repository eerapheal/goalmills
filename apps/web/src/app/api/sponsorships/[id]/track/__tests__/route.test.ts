import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import Sponsorship from '@/models/Sponsorship';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Sponsorship', () => ({
  default: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('@/lib/redisCache', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(true),
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

  it('should successfully track click on active campaign and compute CTR', async () => {
    const validId = '507f1f77bcf86cd799439011';
    (Sponsorship.findOne as any).mockResolvedValue({
      _id: validId,
      title: 'Partner Offer',
      status: 'active',
      impressions: 100,
      clicks: 5,
      budgetControls: { cpcRate: 0.5 },
      spent: 2.5,
    });
    (Sponsorship.findByIdAndUpdate as any).mockResolvedValue({
      _id: validId,
      impressions: 100,
      clicks: 6,
      ctr: 6.0,
      status: 'active',
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
    expect(json.campaignStatus).toBe('active');
  });

  it('should auto-pause campaign when budget is reached', async () => {
    const validId = '507f1f77bcf86cd799439011';
    (Sponsorship.findOne as any).mockResolvedValue({
      _id: validId,
      title: 'Capped Campaign',
      status: 'active',
      impressions: 999,
      clicks: 10,
      budget: 50,
      budgetControls: { maxImpressions: 1000 },
      spent: 10,
    });
    (Sponsorship.findByIdAndUpdate as any).mockResolvedValue({
      _id: validId,
      impressions: 1000,
      clicks: 10,
      status: 'paused',
    });

    const req = new NextRequest(`http://localhost:3000/api/sponsorships/${validId}/track?type=impression`, {
      method: 'POST',
    });
    const params = Promise.resolve({ id: validId });

    const res = await POST(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.campaignStatus).toBe('paused');
  });
});
