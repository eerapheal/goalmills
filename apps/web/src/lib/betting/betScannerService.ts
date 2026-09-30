import { BetScanRequest, NormalizedBetScanResult } from '@goalmills/types';
import { getBetToolsProvider } from './providers/providerFactory';
import { buildSecureAffiliateRedirectUrl } from './affiliateEngine';
import { isBettingFeatureEnabled } from './bettingFeatureFlags';
import { cacheGet, cacheSet } from '@/lib/redisCache';

/**
 * Service to execute odds scanning across bookmakers for a bet booking code.
 * Integrates GoalMills affiliate engine and dynamic best-odds calculation.
 */
export async function scanBetCode(request: BetScanRequest): Promise<NormalizedBetScanResult> {
  const code = request.code.toUpperCase().trim();
  const sourceBookmaker = request.sourceBookmaker.toLowerCase().trim();
  const stake = request.stake || 10;
  const cacheKey = `betting:scan:${sourceBookmaker}:${code}:${stake}`;

  // 1. Fast Cache Read
  const cached = await cacheGet<NormalizedBetScanResult>(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Query Provider Abstraction
  const provider = getBetToolsProvider();
  const result = await provider.scanOdds({
    code,
    sourceBookmaker,
    stake,
    country: request.country,
  });

  // 3. Enrich with GoalMills Affiliate Engine
  const enrichedQuotes = result.quotes.map((quote) => {
    let affiliateUrl = '#';
    if (isBettingFeatureEnabled('affiliateLinks')) {
      affiliateUrl = buildSecureAffiliateRedirectUrl({
        bookmakerId: quote.bookmakerId,
        placement: 'betting_scanner',
        campaign: 'scanner_comparison',
        country: request.country,
      });
    }

    return {
      ...quote,
      affiliateUrl,
    };
  });

  const bestBookmaker = enrichedQuotes.find((q) => q.isBestOdds) || enrichedQuotes[0];

  const finalResult: NormalizedBetScanResult = {
    ...result,
    quotes: enrichedQuotes,
    bestBookmaker,
  };

  // Cache for 5 minutes (300 seconds)
  await cacheSet(cacheKey, finalResult, 300);

  return finalResult;
}
