import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockBetToolsProvider } from '../providers/betloy/mockBetloyProvider';
import { BetloyClient } from '../providers/betloy/betloyClient';
import { BetloyProvider } from '../providers/betloy/betloyAdapter';
import { getBetToolsProvider, setBetToolsProvider } from '../providers/providerFactory';
import { scanBetCode } from '../betScannerService';
import { decodeBetSlip } from '../betViewerService';
import { analyzeBetCode } from '../betAnalyzerService';
import { trimBetRisk } from '../betTrimmerService';
import { convertBetCode } from '../betConverterService';

// Mock Redis cache to keep tests fast and isolated
vi.mock('@/lib/redisCache', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(true),
}));

describe('Phase 3: Betloy Integration & Betting Intelligence Platform', () => {
  beforeEach(() => {
    BetloyClient.resetCircuitBreaker();
    setBetToolsProvider(new MockBetToolsProvider());
    vi.clearAllMocks();
  });

  describe('BetToolsProvider Interface & Mock Implementation', () => {
    it('implements complete BetToolsProvider interface contract', async () => {
      const provider = new MockBetToolsProvider();
      expect(provider.providerId).toBe('MOCK_BETLOY');

      const health = await provider.healthCheck();
      expect(health.status).toBe('HEALTHY');
      expect(health.circuitBreakerStatus).toBe('CLOSED');

      const bms = await provider.getBookmakers();
      expect(bms.length).toBeGreaterThan(0);
      expect(bms[0]).toHaveProperty('supportedFeatures');

      const usage = await provider.getUsage();
      expect(usage.requestsToday).toBeGreaterThan(0);
    });

    it('decodes multi-leg bet codes deterministically', async () => {
      const provider = new MockBetToolsProvider();
      const decoded = await provider.decodeBet({ code: 'B39AX', sourceBookmaker: '1xbet' });

      expect(decoded.code).toBe('B39AX');
      expect(decoded.sourceBookmaker).toBe('1xbet');
      expect(decoded.legCount).toBe(3);
      expect(decoded.totalOdds).toBeCloseTo(5.82, 1);
      expect(decoded.legs[0].homeTeam).toBe('Arsenal');
      expect(decoded.legs[0].selection.market).toBe('1X2');
    });

    it('scans odds across bookmakers and calculates objective best odds', async () => {
      const provider = new MockBetToolsProvider();
      const scan = await provider.scanOdds({ code: 'B39AX', sourceBookmaker: '1xbet', stake: 20 });

      expect(scan.quotes.length).toBeGreaterThanOrEqual(4);
      expect(scan.stake).toBe(20);

      // Best odds calculation must be objective
      const best = scan.bestBookmaker;
      expect(best.isBestOdds).toBe(true);
      expect(best.totalOdds).toBeGreaterThanOrEqual(scan.baselineOdds);

      for (const q of scan.quotes) {
        expect(q.totalOdds).toBeLessThanOrEqual(best.totalOdds);
      }
    });

    it('analyzes bet risks with mandatory disclaimer', async () => {
      const provider = new MockBetToolsProvider();
      const analysis = await provider.analyzeBet({ code: 'B39AX', sourceBookmaker: '1xbet' });

      expect(analysis.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallRiskScore).toBeLessThanOrEqual(100);
      expect(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']).toContain(analysis.riskRating);
      expect(analysis.disclaimer).toMatch(/informational/i);
      expect(analysis.disclaimer).toMatch(/does not guarantee/i);
    });

    it('trims risk from accumulator slips', async () => {
      const provider = new MockBetToolsProvider();
      const trim = await provider.trimBet({ code: 'B39AX', sourceBookmaker: '1xbet' });

      expect(trim.trimmedLegCount).toBeLessThan(trim.originalLegCount);
      expect(trim.riskReductionPercent).toBeGreaterThan(0);
      expect(trim.differences.some((d) => d.action === 'REMOVED')).toBe(true);
      expect(trim.disclaimer).toBeDefined();
    });

    it('converts bet codes between bookmakers', async () => {
      const provider = new MockBetToolsProvider();
      const converted = await provider.convertBet({
        code: 'B39AX',
        sourceBookmaker: '1xbet',
        targetBookmaker: 'bet365',
      });

      expect(converted.targetCode).toContain('BET');
      expect(converted.targetBookmaker).toBe('bet365');
      expect(converted.matchedLegs).toBe(3);
    });
  });

  describe('Resilient BetloyClient & Circuit Breaker', () => {
    it('initializes circuit breaker in CLOSED state', () => {
      const status = BetloyClient.getCircuitBreakerStatus();
      expect(status.state).toBe('CLOSED');
      expect(status.failureCount).toBe(0);
    });

    it('allows circuit breaker reset', () => {
      BetloyClient.resetCircuitBreaker();
      const status = BetloyClient.getCircuitBreakerStatus();
      expect(status.state).toBe('CLOSED');
    });
  });

  describe('BetloyProvider Normalization & Fallback Adapter', () => {
    it('falls back to mock provider safely on upstream failure without crashing', async () => {
      const adapter = new BetloyProvider();
      vi.spyOn((adapter as any).client, 'request').mockResolvedValueOnce({
        success: false,
        error: 'Upstream gateway timeout',
        statusCode: 504,
        latencyMs: 15,
      });

      const decoded = await adapter.decodeBet({ code: 'SAFE_TEST', sourceBookmaker: '1xbet' });
      expect(decoded).toBeDefined();
      expect(decoded.legs.length).toBeGreaterThan(0);
      expect(decoded.totalOdds).toBeGreaterThan(1);
    });

    it('normalizes valid Betloy API payload successfully', async () => {
      const adapter = new BetloyProvider();
      vi.spyOn((adapter as any).client, 'request').mockResolvedValueOnce({
        success: true,
        data: {
          code: 'REAL_123',
          bookmaker: '1xbet',
          odds: 4.25,
          currency: 'EUR',
          legs: [
            {
              id: 'leg_1',
              match: 'PSG vs Marseille',
              home: 'PSG',
              away: 'Marseille',
              sport: 'football',
              market: '1X2',
              pick: 'PSG',
              odds: 1.45,
            },
            {
              id: 'leg_2',
              match: 'Inter vs Milan',
              home: 'Inter',
              away: 'Milan',
              sport: 'football',
              market: 'BTTS',
              pick: 'Yes',
              odds: 1.80,
            },
          ],
        },
        statusCode: 200,
        latencyMs: 85,
      });

      const decoded = await adapter.decodeBet({ code: 'REAL_123', sourceBookmaker: '1xbet' });
      expect(decoded.code).toBe('REAL_123');
      expect(decoded.legCount).toBe(2);
      expect(decoded.legs[0].fixture).toBe('PSG vs Marseille');
    });
  });

  describe('Betting Intelligence Service Layer', () => {
    it('scanBetCode enriches bookmaker quotes with internal affiliate redirect URLs', async () => {
      const scan = await scanBetCode({
        code: '5K9L2',
        sourceBookmaker: '1xbet',
        stake: 15,
      });

      expect(scan.code).toBe('5K9L2');
      expect(scan.stake).toBe(15);
      expect(scan.quotes.length).toBeGreaterThan(0);

      // Verify every quote contains a secure GoalMills affiliate redirect URL
      for (const quote of scan.quotes) {
        expect(quote.affiliateUrl).toMatch(/\/api\/affiliate\/redirect\//);
        expect(quote.affiliateUrl).toContain(quote.bookmakerId);
      }
    });

    it('decodeBetSlip returns validated slip structure', async () => {
      const decoded = await decodeBetSlip({ code: 'CODE123', sourceBookmaker: 'bet365' });
      expect(decoded.code).toBe('CODE123');
      expect(decoded.sourceBookmaker).toBe('bet365');
      expect(decoded.legs.length).toBe(3);
    });

    it('analyzeBetCode guarantees legal disclaimer presence', async () => {
      const analysis = await analyzeBetCode({ code: 'CODE123', sourceBookmaker: 'bet365' });
      expect(analysis.disclaimer).toBeDefined();
      expect(analysis.disclaimer.length).toBeGreaterThan(10);
      expect(analysis.riskRating).toBeDefined();
    });

    it('trimBetRisk calculates leg delta and risk reduction', async () => {
      const trimmed = await trimBetRisk({ code: 'TRIMME', sourceBookmaker: '1xbet' });
      expect(trimmed.trimmedOdds).toBeLessThan(trimmed.originalOdds);
      expect(trimmed.riskReductionPercent).toBeGreaterThan(0);
    });

    it('convertBetCode converts across bookmaker slugs cleanly', async () => {
      const converted = await convertBetCode({
        code: 'SLUG_TEST',
        sourceBookmaker: '1xBet',
        targetBookmaker: 'Betfair',
      });
      expect(converted.sourceBookmaker).toBe('1xbet');
      expect(converted.targetBookmaker).toBe('betfair');
    });
  });

  describe('Provider Factory', () => {
    it('resolves active provider without throwing', () => {
      const provider = getBetToolsProvider();
      expect(provider).toBeDefined();
      expect(provider.providerId).toBeDefined();
    });
  });
});
