import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

describe('Cricket API Route (/api/cricket)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when no endpoint or action is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/cricket');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it('should fetch and return live matches when endpoint=live is requested', async () => {
    const mockLiveRes = {
      typeMatches: [
        {
          matchType: 'International',
          seriesMatches: [
            {
              seriesAdWrapper: {
                seriesName: 'ICC Champions Trophy',
                matches: [
                  {
                    matchInfo: {
                      matchId: 90210,
                      seriesName: 'ICC Champions Trophy',
                      matchDesc: 'Final',
                      team1: { teamName: 'India', teamSName: 'IND' },
                      team2: { teamName: 'Pakistan', teamSName: 'PAK' },
                      status: 'Live',
                      state: 'In Progress',
                    },
                    matchScore: {
                      team1Score: { inngs1: { runs: 280, wickets: 4, overs: 45.2 } },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockLiveRes,
      headers: new Headers(),
    });

    const req = new NextRequest('http://localhost:3000/api/cricket?endpoint=live');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toBeDefined();
  });
});
