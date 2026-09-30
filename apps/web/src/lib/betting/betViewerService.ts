import { DecodedBetSlip } from '@goalmills/types';
import { getBetToolsProvider } from './providers/providerFactory';
import { cacheGet, cacheSet } from '@/lib/redisCache';

/**
 * Service to decode a bet booking code into individual legs and selections.
 */
export async function decodeBetSlip(params: { code: string; sourceBookmaker: string }): Promise<DecodedBetSlip> {
  const code = params.code.toUpperCase().trim();
  const sourceBookmaker = params.sourceBookmaker.toLowerCase().trim();
  const cacheKey = `betting:decode:${sourceBookmaker}:${code}`;

  const cached = await cacheGet<DecodedBetSlip>(cacheKey);
  if (cached) {
    return cached;
  }

  const provider = getBetToolsProvider();
  const decoded = await provider.decodeBet({ code, sourceBookmaker });

  // Cache decoded slip for 15 minutes (900 seconds)
  await cacheSet(cacheKey, decoded, 900);

  return decoded;
}
