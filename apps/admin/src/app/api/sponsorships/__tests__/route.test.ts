import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import Sponsorship from '@/models/Sponsorship';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/serverAuth', () => ({
  requirePermission: vi.fn().mockResolvedValue({
    session: {
      user: {
        id: 'admin-1',
        email: 'admin@goalmills.com',
        role: 'super-admin',
      },
    },
    error: null,
  }),
}));

vi.mock('@/lib/auditLog', () => ({
  logAdminAction: vi.fn(),
}));

vi.mock('@/models/Sponsorship', () => {
  const mockLean = vi.fn();
  const mockSort = vi.fn(() => ({ lean: mockLean }));
  const mockFind = vi.fn(() => ({ sort: mockSort }));
  const mockCreate = vi.fn();

  return {
    default: {
      find: mockFind,
      create: mockCreate,
    },
    mockLean,
    mockSort,
    mockFind,
    mockCreate,
  };
});

describe('Admin Sponsorships API (/api/sponsorships)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch sponsorships for admin overview', async () => {
    const mockSponsorships = [
      {
        _id: 'sp-1',
        title: 'Master Hero Deal',
        sponsorName: 'Bet365',
        status: 'active',
        priority: 5,
        tenantSlug: 'goalmills',
      },
    ];

    const { mockLean } = await import('@/models/Sponsorship') as any;
    mockLean.mockResolvedValue(mockSponsorships);

    const req = new NextRequest('http://localhost:3000/api/sponsorships');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.sponsorships).toHaveLength(1);
    expect(json.sponsorships[0].title).toBe('Master Hero Deal');
  });

  it('should create new sponsorship with multi-tenant targeting and budget controls', async () => {
    const newCamp = {
      _id: 'new-sp-1',
      title: 'Puma Club Kit Deal',
      sponsorName: 'Puma',
      targetUrl: 'https://puma.com',
      tenantId: 'tenant-abc',
      tenantSlug: 'manchester',
      budget: 1000,
      priority: 10,
    };

    const { mockCreate } = await import('@/models/Sponsorship') as any;
    mockCreate.mockResolvedValue(newCamp);

    const req = new NextRequest('http://localhost:3000/api/sponsorships', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Puma Club Kit Deal',
        sponsorName: 'Puma',
        targetUrl: 'https://puma.com',
        tenantId: 'tenant-abc',
        tenantSlug: 'manchester',
        budget: 1000,
        priority: 10,
        budgetControls: {
          maxImpressions: 50000,
          cpmRate: 3.5,
        },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.sponsorship.title).toBe('Puma Club Kit Deal');
  });

  it('should reject sponsorship creation when required fields are missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/sponsorships', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Incomplete Campaign',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('required');
  });
});
