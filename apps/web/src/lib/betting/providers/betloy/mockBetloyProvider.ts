import {
  BetToolsProvider,
  DecodedBetSlip,
  NormalizedBetScanResult,
  NormalizedBetAnalysisResult,
  NormalizedBetConvertResult,
  NormalizedBetTrimResult,
  ProviderBookmakerSummary,
  ProviderHealthStatus,
  ProviderUsageStats,
  BetScanRequest,
  BetAnalysisRequest,
  BetConvertRequest,
  BetTrimRequest,
} from '@goalmills/types';
import { getCanonicalBookmaker } from '../../bookmakerRegistry';

export class MockBetToolsProvider implements BetToolsProvider {
  public readonly providerId = 'MOCK_BETLOY';

  public async decodeBet(request: { code: string; sourceBookmaker: string }): Promise<DecodedBetSlip> {
    const code = request.code.toUpperCase().trim();
    const sourceBookmaker = request.sourceBookmaker.toLowerCase();

    return {
      code,
      sourceBookmaker,
      totalOdds: 5.82,
      legCount: 3,
      potentialPayout: 58.20,
      currency: 'EUR',
      generatedAt: new Date().toISOString(),
      legs: [
        {
          id: 'leg_1',
          fixture: 'Arsenal vs Chelsea',
          homeTeam: 'Arsenal',
          awayTeam: 'Chelsea',
          sport: 'football',
          league: 'Premier League',
          kickoffTime: new Date(Date.now() + 86400000).toISOString(),
          status: 'PENDING',
          selection: {
            market: '1X2',
            selection: 'Home (Arsenal)',
            odds: 1.85,
            probability: 0.54,
            isBanker: true,
          },
        },
        {
          id: 'leg_2',
          fixture: 'Real Madrid vs Barcelona',
          homeTeam: 'Real Madrid',
          awayTeam: 'Barcelona',
          sport: 'football',
          league: 'La Liga',
          kickoffTime: new Date(Date.now() + 172800000).toISOString(),
          status: 'PENDING',
          selection: {
            market: 'Both Teams to Score',
            selection: 'Yes',
            odds: 1.62,
            probability: 0.61,
          },
        },
        {
          id: 'leg_3',
          fixture: 'Bayern Munich vs Borussia Dortmund',
          homeTeam: 'Bayern Munich',
          awayTeam: 'Borussia Dortmund',
          sport: 'football',
          league: 'Bundesliga',
          kickoffTime: new Date(Date.now() + 259200000).toISOString(),
          status: 'PENDING',
          selection: {
            market: 'Over/Under 2.5',
            selection: 'Over 2.5',
            odds: 1.94,
            probability: 0.51,
          },
        },
      ],
    };
  }

  public async scanOdds(request: BetScanRequest): Promise<NormalizedBetScanResult> {
    const decoded = await this.decodeBet({ code: request.code, sourceBookmaker: request.sourceBookmaker });
    const baselineOdds = decoded.totalOdds;
    const stake = request.stake || 10;

    const bookmakerPool = [
      { id: '1xbet', name: '1xBet', multiplier: 1.14 }, // Best odds (+14%)
      { id: 'bet365', name: 'bet365', multiplier: 1.08 },
      { id: 'betano', name: 'Betano', multiplier: 1.05 },
      { id: 'betfair', name: 'Betfair', multiplier: 1.02 },
      { id: 'marathon', name: 'Marathon', multiplier: 0.98 },
      { id: 'betvictor', name: 'BetVictor', multiplier: 0.95 },
    ];

    const quotes = bookmakerPool.map((bm) => {
      const odds = parseFloat((baselineOdds * bm.multiplier).toFixed(2));
      const canonical = getCanonicalBookmaker(bm.id);
      const diffPercent = parseFloat((((odds - baselineOdds) / baselineOdds) * 100).toFixed(1));

      return {
        bookmakerId: bm.id,
        bookmakerName: canonical?.displayName || bm.name,
        bookmakerLogo: canonical?.logoUrl,
        totalOdds: odds,
        differencePercent: diffPercent,
        isBestOdds: bm.multiplier === 1.14,
        supportedLegCount: decoded.legCount,
        totalLegCount: decoded.legCount,
        availableMarkets: ['1X2', 'Over/Under', 'BTTS'],
      };
    });

    const bestBookmaker = quotes.find((q) => q.isBestOdds) || quotes[0];

    return {
      code: request.code.toUpperCase().trim(),
      sourceBookmaker: request.sourceBookmaker,
      baselineOdds,
      stake,
      scannedAt: new Date().toISOString(),
      legs: decoded.legs,
      quotes,
      bestBookmaker,
    };
  }

  public async analyzeBet(request: BetAnalysisRequest): Promise<NormalizedBetAnalysisResult> {
    return {
      code: request.code.toUpperCase().trim(),
      sourceBookmaker: request.sourceBookmaker,
      overallRiskScore: 38,
      riskRating: 'MEDIUM',
      estimatedWinProbabilityPercent: 44.5,
      recommendedMaxStakePercent: 3.5,
      expectedValueIndicator: 'POSITIVE',
      riskFactors: [
        {
          title: 'High-Scoring League Volatility',
          severity: 'MEDIUM',
          description: 'Bundesliga fixture features high variance in defensive concessions.',
        },
        {
          title: 'Derby Match Disruption',
          severity: 'LOW',
          description: 'El Clásico derby matches have a 12% higher card and referee stoppage rate.',
        },
      ],
      strengths: [
        'Arsenal unbeaten in last 8 home matches against London rivals.',
        'Real Madrid & Barcelona combined scoring average exceeds 3.1 goals per game this season.',
      ],
      disclaimer: 'Analysis is informational and based on historical statistical models. It does not guarantee an outcome.',
      analyzedAt: new Date().toISOString(),
    };
  }

  public async convertBet(request: BetConvertRequest): Promise<NormalizedBetConvertResult> {
    const originalOdds = 5.82;
    const convertedOdds = 6.05;

    return {
      originalCode: request.code.toUpperCase().trim(),
      sourceBookmaker: request.sourceBookmaker,
      targetBookmaker: request.targetBookmaker,
      targetCode: `CV_${request.targetBookmaker.substring(0, 3).toUpperCase()}_${request.code.toUpperCase().trim()}`,
      originalOdds,
      convertedOdds,
      oddsDifferencePercent: 3.9,
      matchedLegs: 3,
      totalLegs: 3,
      convertedAt: new Date().toISOString(),
    };
  }

  public async trimBet(request: BetTrimRequest): Promise<NormalizedBetTrimResult> {
    const originalOdds = 5.82;
    const trimmedOdds = 3.00;

    return {
      originalCode: request.code.toUpperCase().trim(),
      trimmedCode: `TRIM_${request.code.toUpperCase().trim()}`,
      sourceBookmaker: request.sourceBookmaker,
      originalOdds,
      trimmedOdds,
      originalLegCount: 3,
      trimmedLegCount: 2,
      riskReductionPercent: 48.5,
      estimatedWinProbabilityBefore: 44.5,
      estimatedWinProbabilityAfter: 68.2,
      differences: [
        {
          legId: 'leg_1',
          fixture: 'Arsenal vs Chelsea',
          action: 'KEPT',
          reason: 'Solid statistical backing with low upset variance.',
          originalOdds: 1.85,
        },
        {
          legId: 'leg_2',
          fixture: 'Real Madrid vs Barcelona',
          action: 'KEPT',
          reason: 'Both Teams to Score has 82% historical occurrence in recent meetings.',
          originalOdds: 1.62,
        },
        {
          legId: 'leg_3',
          fixture: 'Bayern Munich vs Borussia Dortmund',
          action: 'REMOVED',
          reason: 'High volatility in recent Bundesliga head-to-heads increases parlay risk.',
          originalOdds: 1.94,
        },
      ],
      disclaimer: 'Risk trimming is informational and algorithmic. Past performance is no guarantee of future results.',
      trimmedAt: new Date().toISOString(),
    };
  }

  public async getBookmakers(): Promise<ProviderBookmakerSummary[]> {
    return [
      {
        id: '1xbet',
        slug: '1xbet',
        name: '1xBet',
        country: 'ALL',
        isActive: true,
        supportedFeatures: { scan: true, decode: true, convert: true, analyze: true, trim: true },
      },
      {
        id: 'bet365',
        slug: 'bet365',
        name: 'bet365',
        country: 'ALL',
        isActive: true,
        supportedFeatures: { scan: true, decode: true, convert: true, analyze: true, trim: true },
      },
      {
        id: 'betano',
        slug: 'betano',
        name: 'Betano',
        country: 'ALL',
        isActive: true,
        supportedFeatures: { scan: true, decode: true, convert: true, analyze: true, trim: true },
      },
      {
        id: 'betfair',
        slug: 'betfair',
        name: 'Betfair',
        country: 'ALL',
        isActive: true,
        supportedFeatures: { scan: true, decode: true, convert: true, analyze: true, trim: true },
      },
    ];
  }

  public async healthCheck(): Promise<ProviderHealthStatus> {
    return {
      providerId: this.providerId,
      status: 'HEALTHY',
      latencyMs: 12,
      lastChecked: new Date().toISOString(),
      circuitBreakerStatus: 'CLOSED',
    };
  }

  public async getUsage(): Promise<ProviderUsageStats> {
    return {
      providerId: this.providerId,
      requestsToday: 42,
      limitDaily: 5000,
      rateLimitRemaining: 4958,
      resetAt: new Date(Date.now() + 43200000).toISOString(),
    };
  }
}
