/**
 * GoalMills Subscription Plans & Entitlements
 */

export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface PlanFeature {
  id: string;
  name: string;
  includedInTiers: SubscriptionTier[];
}

export const PLATFORM_FEATURES: PlanFeature[] = [
  { id: 'live_scores', name: 'Real-time Live Scores', includedInTiers: ['FREE', 'PRO', 'ENTERPRISE'] },
  { id: 'odds_comparison', name: 'Multi-Bookmaker Odds Comparison', includedInTiers: ['FREE', 'PRO', 'ENTERPRISE'] },
  { id: 'arbitrage_alerts', name: 'Surebet & Arbitrage Odds Scanner', includedInTiers: ['PRO', 'ENTERPRISE'] },
  { id: 'ad_free', name: 'Ad-Free Reading Experience', includedInTiers: ['PRO', 'ENTERPRISE'] },
  { id: 'historical_warehouse_api', name: 'Full Historical Sports Warehouse API', includedInTiers: ['ENTERPRISE'] },
];

export function hasFeatureEntitlement(featureId: string, tier: SubscriptionTier): boolean {
  const feature = PLATFORM_FEATURES.find((f) => f.id === featureId);
  if (!feature) return false;
  return feature.includedInTiers.includes(tier);
}
