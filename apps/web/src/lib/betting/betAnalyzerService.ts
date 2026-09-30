import { BetAnalysisRequest, NormalizedBetAnalysisResult } from '@goalmills/types';
import { getBetToolsProvider } from './providers/providerFactory';
import { cacheGet, cacheSet } from '@/lib/redisCache';

/**
 * Service to execute AI analysis on a bet booking code.
 * Computes risk metrics, probability gauge, and enforces non-guarantee legal disclaimers.
 */
export async function analyzeBetCode(request: BetAnalysisRequest): Promise<NormalizedBetAnalysisResult> {
  const code = request.code.toUpperCase().trim();
  const sourceBookmaker = request.sourceBookmaker.toLowerCase().trim();
  const stake = request.stake || 10;
  const cacheKey = `betting:analyze:${sourceBookmaker}:${code}:${stake}`;

  const cached = await cacheGet<NormalizedBetAnalysisResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const provider = getBetToolsProvider();
  const analysis = await provider.analyzeBet({
    code,
    sourceBookmaker,
    stake,
  });

  // Guarantee legal disclaimer
  if (!analysis.disclaimer) {
    analysis.disclaimer = 'Analysis is informational and does not guarantee an outcome.';
  }

  // Cache analysis for 15 minutes
  await cacheSet(cacheKey, analysis, 900);

  return analysis;
}
