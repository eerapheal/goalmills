import { BetTrimRequest, NormalizedBetTrimResult } from '@goalmills/types';
import { getBetToolsProvider } from './providers/providerFactory';
import { cacheGet, cacheSet } from '@/lib/redisCache';

/**
 * Service to calculate risk trimming on multi-leg bets.
 */
export async function trimBetRisk(request: BetTrimRequest): Promise<NormalizedBetTrimResult> {
  const code = request.code.toUpperCase().trim();
  const sourceBookmaker = request.sourceBookmaker.toLowerCase().trim();
  const tolerance = request.riskTolerance || 'MODERATE';
  const cacheKey = `betting:trim:${sourceBookmaker}:${code}:${tolerance}`;

  const cached = await cacheGet<NormalizedBetTrimResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const provider = getBetToolsProvider();
  const result = await provider.trimBet({
    code,
    sourceBookmaker,
    riskTolerance: tolerance,
  });

  if (!result.disclaimer) {
    result.disclaimer = 'Risk trimming is informational and does not guarantee an outcome.';
  }

  await cacheSet(cacheKey, result, 900);

  return result;
}
