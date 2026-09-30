import { GoalMillsEventId } from '@goalmills/types';

/**
 * Builds deterministic GoalMills canonical event ID.
 * Standard format: gm_event_{sport}_{cleanId}
 * Pure utility function safe for both client and server bundles.
 */
export function buildCanonicalEventId(
  sport: string,
  providerEventId: string | number
): GoalMillsEventId {
  const cleanSport = sport.toLowerCase().trim();
  const cleanId = String(providerEventId).trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return `gm_event_${cleanSport}_${cleanId}` as GoalMillsEventId;
}
