import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

describe('Football API Route (/api/football)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when no method or action is specified', async () => {
    const req = new NextRequest('http://localhost:3000/api/football');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it('should handle getLiveMatches request (met=Livescore) and return normalized response', async () => {
    const mockApiResponse = {
      success: 1,
      result: [
        {
          event_key: '12345',
          event_home_team: 'Arsenal',
          event_away_team: 'Chelsea',
          event_final_result: '1 - 0',
          event_status: '45',
          event_live: '1',
          league_name: 'Premier League',
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
      headers: new Headers(),
    });

    const req = new NextRequest('http://localhost:3000/api/football?met=Livescore');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toBeDefined();
    expect(json.success).toBe(1);
    expect(json.result).toHaveLength(1);
    expect(json.result[0].event_home_team).toBe('Arsenal');
  });

  it('should handle upstream API 429 / failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
      headers: new Headers(),
    });

    const req = new NextRequest('http://localhost:3000/api/football?met=Standings&leagueId=39');
    const response = await GET(req);
    const json = await response.json();

    expect([200, 500, 502]).toContain(response.status);
    expect(json).toBeDefined();
  });
});
