import { GoalMillsEventId, EventProviderMapping, ExternalOddsProvider } from '@goalmills/types';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import dbConnect from '@/lib/db';
import EventProviderMappingModel from '@/models/EventProviderMapping';
import { buildCanonicalEventId } from './canonicalEventId';

export { buildCanonicalEventId };

/**
 * Resolves or stores an event provider mapping.
 * Never uses external provider IDs as the permanent GoalMills identity.
 */
export async function resolveOrCreateEventMapping(
  provider: ExternalOddsProvider | string,
  providerEventId: string | number,
  sport = 'football',
  metadata: Record<string, any> = {}
): Promise<EventProviderMapping> {
  const pIdStr = String(providerEventId).trim();
  const cacheKey = `mapping:event:${provider}:${pIdStr}`;

  // 1. Fast Cache Read (Redis / In-Memory LRU)
  const cached = await cacheGet<EventProviderMapping>(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Database Lookup or Insert
  const goalMillsEventId = buildCanonicalEventId(sport, pIdStr);

  try {
    await dbConnect();
    let mappingDoc = await EventProviderMappingModel.findOne({
      provider,
      providerEventId: pIdStr,
    }).lean();

    if (!mappingDoc) {
      mappingDoc = await EventProviderMappingModel.create({
        goalMillsEventId,
        provider,
        providerEventId: pIdStr,
        sport,
        status: 'ACTIVE',
        lastVerifiedAt: new Date(),
        metadata,
      });
    }

    const mapping: EventProviderMapping = {
      id: String(mappingDoc._id || goalMillsEventId),
      goalMillsEventId: mappingDoc.goalMillsEventId,
      provider: mappingDoc.provider,
      providerEventId: mappingDoc.providerEventId,
      sport: mappingDoc.sport,
      status: mappingDoc.status,
      lastVerifiedAt: mappingDoc.lastVerifiedAt,
      metadata: mappingDoc.metadata,
      createdAt: mappingDoc.createdAt,
      updatedAt: mappingDoc.updatedAt,
    };

    // Cache for 24 hours (86400s)
    await cacheSet(cacheKey, mapping, 86400);

    return mapping;
  } catch (err) {
    // Graceful offline fallback: Return deterministic mapping without crashing
    const fallbackMapping: EventProviderMapping = {
      id: `${provider}_${pIdStr}`,
      goalMillsEventId,
      provider,
      providerEventId: pIdStr,
      sport,
      status: 'ACTIVE',
      lastVerifiedAt: new Date(),
      metadata,
    };
    return fallbackMapping;
  }
}
