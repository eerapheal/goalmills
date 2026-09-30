import { BetConvertRequest, NormalizedBetConvertResult } from '@goalmills/types';
import { getBetToolsProvider } from './providers/providerFactory';
import { cacheGet, cacheSet } from '@/lib/redisCache';

/**
 * Service to convert booking code from one bookmaker to another.
 */
export async function convertBetCode(request: BetConvertRequest): Promise<NormalizedBetConvertResult> {
  const code = request.code.toUpperCase().trim();
  const sourceBookmaker = request.sourceBookmaker.toLowerCase().trim();
  const targetBookmaker = request.targetBookmaker.toLowerCase().trim();
  const cacheKey = `betting:convert:${sourceBookmaker}:${targetBookmaker}:${code}`;

  const cached = await cacheGet<NormalizedBetConvertResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const provider = getBetToolsProvider();
  const result = await provider.convertBet({
    code,
    sourceBookmaker,
    targetBookmaker,
  });

  await cacheSet(cacheKey, result, 900);

  return result;
}
