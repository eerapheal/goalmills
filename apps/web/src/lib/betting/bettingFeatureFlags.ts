/**
 * GoalMills Betting Domain Feature Flags
 * Controls independent activation of betting intelligence, odds comparison,
 * affiliate redirection, and Betloy provider integration.
 */

export interface BettingFeatureFlagsConfig {
  oddsComparison: boolean;
  affiliateLinks: boolean;
  affiliateTracking: boolean;
  betloyIntegration: boolean;
  sponsoredBookmakers: boolean;
  oddsMovement: boolean;
  betScanner: boolean;
  betAnalyzer: boolean;
  betEditor: boolean;
  betTrimmer: boolean;
}

const DEFAULT_FLAGS: BettingFeatureFlagsConfig = {
  oddsComparison: true,
  affiliateLinks: true,
  affiliateTracking: true,
  betloyIntegration: true,
  sponsoredBookmakers: false,
  oddsMovement: true,
  betScanner: true,
  betAnalyzer: true,
  betEditor: true,
  betTrimmer: true,
};

/**
 * Evaluates feature flag with environment variable override support.
 */
export function isBettingFeatureEnabled(flag: keyof BettingFeatureFlagsConfig): boolean {
  const envKey = `NEXT_PUBLIC_FEATURE_${flag.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
  const envVal = process.env[envKey] ?? process.env[`FEATURE_${flag.replace(/([A-Z])/g, '_$1').toUpperCase()}`];

  if (envVal !== undefined) {
    return envVal === 'true' || envVal === '1';
  }

  return DEFAULT_FLAGS[flag] ?? false;
}

export function getAllBettingFeatureFlags(): BettingFeatureFlagsConfig {
  const keys = Object.keys(DEFAULT_FLAGS) as (keyof BettingFeatureFlagsConfig)[];
  const result = { ...DEFAULT_FLAGS };
  for (const k of keys) {
    result[k] = isBettingFeatureEnabled(k);
  }
  return result;
}
