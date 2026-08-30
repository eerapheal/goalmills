import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockArticles } = vi.hoisted(() => ({
  mockArticles: [
    {
      _id: '507f1f77bcf86cd799439011',
      title: 'Champions League Epic Match',
      content: 'Full match report and tactical breakdown.',
      category: 'Football',
      tags: ['UCL', 'Football'],
      views: 1250,
      createdAt: new Date(),
    },
  ],
}));

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/News', () => {
  const queryChain: any = {
    select: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(mockArticles),
  };
  return {
    default: {
      find: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockArticles),
      })),
      countDocuments: vi.fn().mockResolvedValue(1),
    },
  };
});

vi.mock('@/lib/redisCache', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(true),
  getSeoCacheHeaders: vi.fn().mockReturnValue({}),
}));

import { GET } from '../route';

describe('News API Route (/api/news)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of news articles on GET', async () => {
    const req = new NextRequest('http://localhost:3000/api/news?category=Football');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toBeDefined();
    expect(json).toHaveLength(1);
    expect(json[0].title).toBe('Champions League Epic Match');
  });
});
