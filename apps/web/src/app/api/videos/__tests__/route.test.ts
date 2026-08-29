import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/Video', () => {
  const mockVideos = [
    {
      _id: 'vid-1',
      video_title: 'World Cup Thriller Highlights',
      video_url: 'https://youtube.com/watch?v=123',
      category: 'football',
      views: 50000,
    },
  ];

  return {
    default: {
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockVideos),
      }),
    },
  };
});

vi.mock('@/lib/redisCache', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(true),
  getSeoCacheHeaders: vi.fn().mockReturnValue({}),
}));

import { GET } from '../route';

describe('Videos API Route (/api/videos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of video highlights on GET', async () => {
    const req = new NextRequest('http://localhost:3000/api/videos?category=football');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveLength(1);
    expect(json[0].video_title).toBe('World Cup Thriller Highlights');
  });
});
