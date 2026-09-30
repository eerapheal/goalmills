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
  BookmakerScanQuote,
} from '@goalmills/types';
import { BetloyClient } from './betloyClient';
import { getCanonicalBookmaker, normalizeBookmakerSlug } from '../../bookmakerRegistry';
import { MockBetToolsProvider } from './mockBetloyProvider';

export class BetloyProvider implements BetToolsProvider {
  public readonly providerId = 'BETLOY';
  private client: BetloyClient;
  private fallbackProvider: MockBetToolsProvider;

  constructor() {
    this.client = new BetloyClient();
    this.fallbackProvider = new MockBetToolsProvider();
  }

  public async decodeBet(request: { code: string; sourceBookmaker: string }): Promise<DecodedBetSlip> {
    const res = await this.client.request<{
      code: string;
      bookmaker: string;
      odds: number;
      legs: any[];
      currency?: string;
    }>({
      path: '/decode',
      method: 'POST',
      body: {
        code: request.code,
        bookmaker: request.sourceBookmaker,
      },
    });

    if (!res.success || !res.data) {
      // Graceful fallback to mock provider if network/circuit fails
      console.warn(`[BetloyProvider] decodeBet fallback activated: ${res.error}`);
      return this.fallbackProvider.decodeBet(request);
    }

    const data = res.data;
    const legs = (data.legs || []).map((leg: any, idx: number) => ({
      id: leg.id || `leg_${idx + 1}`,
      fixture: leg.fixture || leg.match || 'Unknown Match',
      homeTeam: leg.homeTeam || leg.home || 'Home',
      awayTeam: leg.awayTeam || leg.away || 'Away',
      sport: leg.sport || 'football',
      league: leg.league,
      kickoffTime: leg.kickoffTime || leg.date,
      status: leg.status || 'PENDING',
      selection: {
        market: leg.market || 'Match Winner',
        selection: leg.selection || leg.pick,
        odds: typeof leg.odds === 'number' ? leg.odds : parseFloat(leg.odds || '1.0'),
        probability: leg.probability,
        isBanker: leg.isBanker,
      },
    }));

    return {
      code: request.code.toUpperCase().trim(),
      sourceBookmaker: normalizeBookmakerSlug(request.sourceBookmaker),
      totalOdds: data.odds || legs.reduce((acc, l) => acc * (l.selection.odds || 1), 1),
      legCount: legs.length,
      potentialPayout: data.odds ? data.odds * 10 : undefined,
      currency: data.currency || 'EUR',
      generatedAt: new Date().toISOString(),
      legs,
    };
  }

  public async scanOdds(request: BetScanRequest): Promise<NormalizedBetScanResult> {
    const res = await this.client.request<{
      code: string;
      sourceBookmaker: string;
      baselineOdds: number;
      bookmakers: any[];
      legs?: any[];
    }>({
      path: '/scan',
      method: 'POST',
      body: {
        code: request.code,
        bookmaker: request.sourceBookmaker,
        stake: request.stake,
        country: request.country,
      },
    });

    if (!res.success || !res.data) {
      console.warn(`[BetloyProvider] scanOdds fallback activated: ${res.error}`);
      return this.fallbackProvider.scanOdds(request);
    }

    const data = res.data;
    const baselineOdds = data.baselineOdds || 1.0;
    const stake = request.stake || 10;

    let highestOdds = baselineOdds;
    const quotes: BookmakerScanQuote[] = (data.bookmakers || []).map((bm: any) => {
      const canonicalId = normalizeBookmakerSlug(bm.bookmaker || bm.id || bm.slug);
      const canonical = getCanonicalBookmaker(canonicalId);
      const odds = typeof bm.odds === 'number' ? bm.odds : parseFloat(bm.odds || '1.0');
      if (odds > highestOdds) highestOdds = odds;

      const diffPercent = baselineOdds > 0 ? parseFloat((((odds - baselineOdds) / baselineOdds) * 100).toFixed(1)) : 0;

      return {
        bookmakerId: canonicalId,
        bookmakerName: canonical?.displayName || bm.name || bm.bookmaker,
        bookmakerLogo: canonical?.logoUrl,
        totalOdds: odds,
        differencePercent: diffPercent,
        isBestOdds: false,
        supportedLegCount: bm.supportedLegs || 0,
        totalLegCount: bm.totalLegs || 0,
        availableMarkets: bm.markets || [],
      };
    });

    // Mark best odds dynamically
    for (const q of quotes) {
      if (q.totalOdds === highestOdds) {
        q.isBestOdds = true;
      }
    }

    const bestBookmaker = quotes.find((q) => q.isBestOdds) || quotes[0] || {
      bookmakerId: normalizeBookmakerSlug(request.sourceBookmaker),
      bookmakerName: request.sourceBookmaker,
      totalOdds: baselineOdds,
      isBestOdds: true,
      supportedLegCount: 0,
      totalLegCount: 0,
      availableMarkets: [],
    };

    return {
      code: request.code.toUpperCase().trim(),
      sourceBookmaker: normalizeBookmakerSlug(request.sourceBookmaker),
      baselineOdds,
      stake,
      scannedAt: new Date().toISOString(),
      legs: data.legs || [],
      quotes,
      bestBookmaker,
    };
  }

  public async analyzeBet(request: BetAnalysisRequest): Promise<NormalizedBetAnalysisResult> {
    const res = await this.client.request<{
      riskScore: number;
      rating: string;
      winProbability: number;
      expectedValue?: string;
      riskFactors?: any[];
      strengths?: string[];
      recommendedStake?: number;
    }>({
      path: '/analyze',
      method: 'POST',
      body: {
        code: request.code,
        bookmaker: request.sourceBookmaker,
        stake: request.stake,
      },
    });

    if (!res.success || !res.data) {
      console.warn(`[BetloyProvider] analyzeBet fallback activated: ${res.error}`);
      return this.fallbackProvider.analyzeBet(request);
    }

    const data = res.data;
    const rating = (data.rating?.toUpperCase() || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    const ev = (data.expectedValue?.toUpperCase() || 'NEUTRAL') as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

    return {
      code: request.code.toUpperCase().trim(),
      sourceBookmaker: normalizeBookmakerSlug(request.sourceBookmaker),
      overallRiskScore: data.riskScore ?? 50,
      riskRating: rating,
      estimatedWinProbabilityPercent: data.winProbability ?? 45,
      recommendedMaxStakePercent: data.recommendedStake,
      expectedValueIndicator: ev,
      riskFactors: (data.riskFactors || []).map((rf: any) => ({
        title: rf.title || 'Risk Factor',
        severity: rf.severity || 'MEDIUM',
        description: rf.description || '',
      })),
      strengths: data.strengths || [],
      disclaimer: 'Analysis is informational and does not guarantee an outcome.',
      analyzedAt: new Date().toISOString(),
    };
  }

  public async convertBet(request: BetConvertRequest): Promise<NormalizedBetConvertResult> {
    const res = await this.client.request<{
      targetCode: string;
      originalOdds: number;
      convertedOdds: number;
      matchedLegs: number;
      totalLegs: number;
    }>({
      path: '/convert',
      method: 'POST',
      body: {
        code: request.code,
        fromBookmaker: request.sourceBookmaker,
        toBookmaker: request.targetBookmaker,
      },
    });

    if (!res.success || !res.data) {
      console.warn(`[BetloyProvider] convertBet fallback activated: ${res.error}`);
      return this.fallbackProvider.convertBet(request);
    }

    const data = res.data;
    const origOdds = data.originalOdds || 1.0;
    const convOdds = data.convertedOdds || origOdds;
    const diff = origOdds > 0 ? parseFloat((((convOdds - origOdds) / origOdds) * 100).toFixed(1)) : 0;

    return {
      originalCode: request.code.toUpperCase().trim(),
      sourceBookmaker: normalizeBookmakerSlug(request.sourceBookmaker),
      targetBookmaker: normalizeBookmakerSlug(request.targetBookmaker),
      targetCode: data.targetCode,
      convertedOdds: convOdds,
      originalOdds: origOdds,
      oddsDifferencePercent: diff,
      matchedLegs: data.matchedLegs || 0,
      totalLegs: data.totalLegs || 0,
      convertedAt: new Date().toISOString(),
    };
  }

  public async trimBet(request: BetTrimRequest): Promise<NormalizedBetTrimResult> {
    const res = await this.client.request<{
      trimmedCode: string;
      originalOdds: number;
      trimmedOdds: number;
      originalLegs: number;
      trimmedLegs: number;
      differences: any[];
    }>({
      path: '/trim',
      method: 'POST',
      body: {
        code: request.code,
        bookmaker: request.sourceBookmaker,
        tolerance: request.riskTolerance || 'MODERATE',
      },
    });

    if (!res.success || !res.data) {
      console.warn(`[BetloyProvider] trimBet fallback activated: ${res.error}`);
      return this.fallbackProvider.trimBet(request);
    }

    const data = res.data;
    return {
      originalCode: request.code.toUpperCase().trim(),
      trimmedCode: data.trimmedCode,
      sourceBookmaker: normalizeBookmakerSlug(request.sourceBookmaker),
      originalOdds: data.originalOdds || 1.0,
      trimmedOdds: data.trimmedOdds || 1.0,
      originalLegCount: data.originalLegs || 0,
      trimmedLegCount: data.trimmedLegs || 0,
      riskReductionPercent: 40,
      estimatedWinProbabilityBefore: 45,
      estimatedWinProbabilityAfter: 65,
      differences: data.differences || [],
      disclaimer: 'Risk trimming is informational and does not guarantee an outcome.',
      trimmedAt: new Date().toISOString(),
    };
  }

  public async getBookmakers(): Promise<ProviderBookmakerSummary[]> {
    const res = await this.client.request<any[]>({
      path: '/bookmakers',
      method: 'GET',
    });

    if (!res.success || !res.data) {
      return this.fallbackProvider.getBookmakers();
    }

    return res.data.map((bm: any) => ({
      id: normalizeBookmakerSlug(bm.id || bm.slug || bm.name),
      slug: normalizeBookmakerSlug(bm.slug || bm.name),
      name: bm.name,
      country: bm.country || 'ALL',
      isActive: bm.status === 'ACTIVE' || bm.active === true,
      supportedFeatures: bm.features || { scan: true, decode: true, convert: true, analyze: true, trim: true },
    }));
  }

  public async healthCheck(): Promise<ProviderHealthStatus> {
    const cbStatus = BetloyClient.getCircuitBreakerStatus();
    const res = await this.client.request<{ status?: string }>({
      path: '/health',
      method: 'GET',
      timeoutMs: 3000,
      retries: 0,
    });

    return {
      providerId: this.providerId,
      status: res.success ? 'HEALTHY' : (cbStatus.state === 'OPEN' ? 'DOWN' : 'DEGRADED'),
      latencyMs: res.latencyMs,
      lastChecked: new Date().toISOString(),
      circuitBreakerStatus: cbStatus.state,
      error: res.error,
    };
  }

  public async getUsage(): Promise<ProviderUsageStats> {
    const res = await this.client.request<{
      today?: number;
      limit?: number;
      remaining?: number;
    }>({
      path: '/usage',
      method: 'GET',
    });

    if (!res.success || !res.data) {
      return this.fallbackProvider.getUsage();
    }

    return {
      providerId: this.providerId,
      requestsToday: res.data.today || 0,
      limitDaily: res.data.limit,
      rateLimitRemaining: res.data.remaining,
      resetAt: new Date(Date.now() + 86400000).toISOString(),
    };
  }
}
