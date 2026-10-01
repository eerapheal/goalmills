/**
 * GoalMills Commercial Sponsorship & Ad Placement Engine
 */

export type PlacementSlot = 
  | 'HEADER_BANNER' 
  | 'MATCH_CENTER_TOP' 
  | 'MATCH_CENTER_SIDEBAR' 
  | 'FOOTBALL_FEED_INLINE' 
  | 'NEWSLETTER_PRIMARY_SPONSOR' 
  | 'FOOTER_SPONSOR';

export interface SponsorshipPlacementConfig {
  slot: PlacementSlot;
  maxImpressionsPerUserSession?: number;
  priorityWeight: number;
  targetingSports?: string[];
  targetingCountries?: string[];
}

export function isPlacementEligible(
  config: SponsorshipPlacementConfig,
  context: { sport?: string; country?: string; userImpressionCount?: number }
): boolean {
  if (config.maxImpressionsPerUserSession && (context.userImpressionCount || 0) >= config.maxImpressionsPerUserSession) {
    return false;
  }
  if (config.targetingSports && context.sport && !config.targetingSports.includes(context.sport)) {
    return false;
  }
  if (config.targetingCountries && context.country && !config.targetingCountries.includes(context.country)) {
    return false;
  }
  return true;
}
