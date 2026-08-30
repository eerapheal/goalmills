import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SportsWarehouseService } from '../sportsWarehouseService';
import type { HistoricalMatchRecord } from '@goalmills/types';

const { mockMatches } = vi.hoisted(() => {
  const matches: HistoricalMatchRecord[] = [
    {
      matchId: 'ft_pl_arsenal_chelsea_01',
      sport: 'football',
      competition: {
        id: 'comp_pl',
        name: 'Premier League',
        slug: 'premier-league',
        season: '2025/2026',
      },
      date: '2026-02-10T19:45:00Z',
      status: 'finished',
      homeTeam: {
        id: 'tm_arsenal',
        name: 'Arsenal',
        slug: 'arsenal',
      },
      awayTeam: {
        id: 'tm_chelsea',
        name: 'Chelsea',
        slug: 'chelsea',
      },
      finalScore: {
        home: 3,
        away: 1,
        formatted: '3 - 1',
      },
      events: [
        { minute: 22, type: 'goal', teamSlug: 'arsenal', player: 'Bukayo Saka' },
        { minute: 54, type: 'goal', teamSlug: 'arsenal', player: 'Kai Havertz' },
      ],
      provenance: {
        provider: 'allsportsapi',
        providerId: 'prov_8891',
        ingestedAt: new Date().toISOString(),
        normalizationVersion: '2.4',
        confidenceScore: 0.99,
      },
    },
    {
      matchId: 'ft_pl_chelsea_arsenal_02',
      sport: 'football',
      competition: {
        id: 'comp_pl',
        name: 'Premier League',
        slug: 'premier-league',
        season: '2025/2026',
      },
      date: '2025-10-18T16:30:00Z',
      status: 'finished',
      homeTeam: {
        id: 'tm_chelsea',
        name: 'Chelsea',
        slug: 'chelsea',
      },
      awayTeam: {
        id: 'tm_arsenal',
        name: 'Arsenal',
        slug: 'arsenal',
      },
      finalScore: {
        home: 2,
        away: 2,
        formatted: '2 - 2',
      },
      events: [
        { minute: 15, type: 'goal', teamSlug: 'chelsea', player: 'Cole Palmer' },
        { minute: 77, type: 'goal', teamSlug: 'arsenal', player: 'Declan Rice' },
      ],
      provenance: {
        provider: 'allsportsapi',
        providerId: 'prov_7734',
        ingestedAt: new Date().toISOString(),
        normalizationVersion: '2.4',
        confidenceScore: 0.99,
      },
    },
  ];
  return { mockMatches: matches };
});

vi.mock('../../../lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../models/HistoricalMatch', () => {
  const mockLean = vi.fn().mockResolvedValue(mockMatches);
  const mockLimit = vi.fn(() => ({ lean: mockLean }));
  const mockSort = vi.fn(() => ({ limit: mockLimit }));
  const mockFind = vi.fn(() => ({ sort: mockSort }));
  const mockFindOneAndUpdate = vi.fn((query: any, update: any) => ({
    lean: vi.fn().mockResolvedValue(update.$set || mockMatches[0]),
  }));
  const mockCount = vi.fn().mockResolvedValue(42);

  return {
    HistoricalMatch: {
      find: mockFind,
      findOneAndUpdate: mockFindOneAndUpdate,
      countDocuments: mockCount,
    },
  };
});

vi.mock('../../../models/HistoricalStandings', () => ({
  HistoricalStandings: {
    findOne: vi.fn(() => ({
      lean: vi.fn().mockResolvedValue({
        competitionSlug: 'premier-league',
        season: '2025/2026',
        table: [],
      }),
    })),
    countDocuments: vi.fn().mockResolvedValue(8),
  },
}));

vi.mock('../../../models/HistoricalTeam', () => ({
  HistoricalTeam: {
    countDocuments: vi.fn().mockResolvedValue(48),
  },
}));

vi.mock('../../../lib/redisCache', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(true),
  singleFlight: vi.fn((key: string, fn: any) => fn()),
}));

describe('Phase 8: Sports Data Warehouse & Historical Intelligence Engine', () => {
  let warehouse: SportsWarehouseService;

  beforeEach(() => {
    vi.clearAllMocks();
    warehouse = SportsWarehouseService.getInstance();
  });

  it('should upsert historical matches with strict data provenance', async () => {
    const matchRecord: HistoricalMatchRecord = {
      matchId: 'ft_pl_arsenal_chelsea_test_001',
      sport: 'football',
      competition: {
        id: 'comp_pl',
        name: 'Premier League',
        slug: 'premier-league',
        season: '2025/2026',
      },
      date: '2026-03-01T15:00:00Z',
      status: 'finished',
      homeTeam: {
        id: 'tm_ars',
        name: 'Arsenal',
        slug: 'arsenal',
      },
      awayTeam: {
        id: 'tm_che',
        name: 'Chelsea',
        slug: 'chelsea',
      },
      finalScore: {
        home: 2,
        away: 0,
        formatted: '2 - 0',
      },
      provenance: {
        provider: 'allsportsapi',
        providerId: 'prov_test_101',
        ingestedAt: new Date().toISOString(),
        normalizationVersion: '2.4',
        confidenceScore: 0.99,
      },
    };

    const saved = await warehouse.upsertMatch(matchRecord);
    expect(saved).toBeDefined();
    expect(saved.matchId).toBe('ft_pl_arsenal_chelsea_test_001');
    expect(saved.provenance.provider).toBe('allsportsapi');
  });

  it('should compute Head-to-Head analytics matrix accurately', async () => {
    const h2h = await warehouse.getHeadToHead('football', 'arsenal', 'chelsea');

    expect(h2h).toBeDefined();
    expect(h2h.sport).toBe('football');
    expect(h2h.teamA.slug).toBe('arsenal');
    expect(h2h.teamB.slug).toBe('chelsea');
    expect(h2h.totalMatches).toBe(2);
    expect(h2h.teamAWins + h2h.teamBWins + h2h.draws).toBe(h2h.totalMatches);
    expect(h2h.avgGoalsPerMatch).toBeGreaterThan(0);
    expect(typeof h2h.mostCommonScoreline).toBe('string');
  });

  it('should generate team trend analytics and goal timing intervals', async () => {
    const trends = await warehouse.getTeamTrends('football', 'arsenal');

    expect(trends).toBeDefined();
    expect(trends.teamSlug).toBe('arsenal');
    expect(Array.isArray(trends.recentForm)).toBe(true);
    expect(trends.averageGoalsScored).toBeGreaterThanOrEqual(0);
    expect(trends.goalTimingBreakdown).toBeDefined();
    expect(typeof trends.goalTimingBreakdown.early0to30m).toBe('number');
    expect(typeof trends.goalTimingBreakdown.mid31to60m).toBe('number');
    expect(typeof trends.goalTimingBreakdown.late61to90m).toBe('number');
  });

  it('should return warehouse diagnostics and provenance sync health', async () => {
    const stats = await warehouse.getWarehouseStats();

    expect(stats).toBeDefined();
    expect(stats.status).toBe('healthy');
    expect(stats.totalHistoricalMatches.football).toBe(42);
    expect(Array.isArray(stats.providerSyncHealth)).toBe(true);
    expect(stats.providerSyncHealth[0].provider).toBe('allsportsapi');
  });
});
