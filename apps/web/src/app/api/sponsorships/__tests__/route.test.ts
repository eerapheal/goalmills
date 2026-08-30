import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import Sponsorship from '@/models/Sponsorship';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Sponsorship', () => {
  const mockLean = vi.fn();
  const mockLimit = vi.fn(() => ({ lean: mockLean }));
  const mockSort = vi.fn(() => ({ limit: mockLimit }));
  const mockFind = vi.fn(() => ({ sort: mockSort }));

  return {
    default: {
      find: mockFind,
    },
    mockLean,
    mockLimit,
    mockSort,
    mockFind,
  };
});

vi.mock('@/lib/redisCache', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/tenantContext', () => ({
  resolveTenantContext: vi.fn().mockResolvedValue({
    tenantId: 'tenant-123',
    tenantSlug: 'club-pulse',
    isSuperAdmin: false,
    isDefaultTenant: false,
  }),
  buildTenantFilter: vi.fn().mockReturnValue({ tenantId: 'tenant-123' }),
}));

describe('Web Sponsorships API (/api/sponsorships)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return tenant-scoped and targeted active campaigns', async () => {
    const mockData = [
      {
        _id: 'spon-1',
        title: 'Club Jersey Sponsor',
        sponsorName: 'Puma',
        status: 'active',
        priority: 10,
        tenantId: 'tenant-123',
        tenantSlug: 'club-pulse',
        impressions: 50,
        clicks: 5,
        targeting: { sports: ['football'], devices: ['all'] },
      },
    ];

    const { mockLean } = await import('@/models/Sponsorship') as any;
    mockLean.mockResolvedValue(mockData);

    const req = new NextRequest('http://localhost:3000/api/sponsorships?placement=homepage_hero&sport=football', {
      headers: { 'x-tenant-slug': 'club-pulse' },
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.tenantSlug).toBe('club-pulse');
    expect(json.sponsorships).toHaveLength(1);
    expect(json.sponsorships[0].title).toBe('Club Jersey Sponsor');
  });

  it('should filter out campaigns exceeding maxImpressions cap', async () => {
    const mockData = [
      {
        _id: 'spon-capped',
        title: 'Exhausted Campaign',
        impressions: 1000,
        budgetControls: { maxImpressions: 1000 },
      },
      {
        _id: 'spon-valid',
        title: 'Active Campaign',
        impressions: 200,
        budgetControls: { maxImpressions: 1000 },
      },
    ];

    const { mockLean } = await import('@/models/Sponsorship') as any;
    mockLean.mockResolvedValue(mockData);

    const req = new NextRequest('http://localhost:3000/api/sponsorships');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.sponsorships).toHaveLength(1);
    expect(json.sponsorships[0]._id).toBe('spon-valid');
  });
});
