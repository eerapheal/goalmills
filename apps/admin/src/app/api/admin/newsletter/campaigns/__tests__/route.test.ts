import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/serverAuth', () => ({
  requirePermission: vi.fn().mockResolvedValue({
    error: null,
    session: {
      user: { id: 'admin-1', name: 'Managing Editor', role: 'manager' },
    },
  }),
}));

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const { mockCampaigns } = vi.hoisted(() => ({
  mockCampaigns: [
    {
      _id: 'camp-1',
      title: 'GoalMills Matchday Brief',
      frequencyTier: 'daily',
      targetAudience: 'daily_subscribers',
      status: 'sent',
      stats: { totalRecipients: 50, successCount: 50, failureCount: 0, openCount: 0 },
      createdAt: new Date(),
    },
  ],
}));

vi.mock('@/models/NewsletterCampaign', () => ({
  default: {
    find: vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(mockCampaigns),
        }),
      }),
    }),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ _id: 'camp-new', ...data })),
  },
}));

vi.mock('@/models/News', () => ({
  default: {},
}));

import { GET, POST } from '../route';

describe('Admin Newsletter Campaigns API (/api/admin/newsletter/campaigns)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list newsletter campaigns', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/newsletter/campaigns');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(1);
    expect(json.data[0].title).toBe('GoalMills Matchday Brief');
  });

  it('should create new campaign with selected articles', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/newsletter/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Champions League Special',
        articleIds: ['art-1', 'art-2'],
        targetAudience: 'all_subscribers',
        frequencyTier: 'custom_broadcast',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe('Champions League Special');
  });
});
