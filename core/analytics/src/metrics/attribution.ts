/**
 * GoalMills Analytics Attribution & Advertiser Performance Engine
 */

export interface MetricCalculationInput {
  impressions: number;
  clicks: number;
  conversions?: number;
  spendOrRevenue?: number;
}

export interface MetricCalculationResult {
  ctr: number; // Click-Through Rate (percentage, e.g. 2.45 for 2.45%)
  conversionRate: number; // Conversion Rate (percentage)
  ecpm: number; // Effective Cost Per Mille (per 1,000 impressions)
  cpc: number; // Cost Per Click
}

/**
 * Calculates standard digital marketing and advertiser performance metrics.
 */
export function calculateAttributionMetrics(input: MetricCalculationInput): MetricCalculationResult {
  const { impressions, clicks, conversions = 0, spendOrRevenue = 0 } = input;

  // Safe checks
  const safeImpressions = Math.max(0, impressions);
  const safeClicks = Math.max(0, clicks);
  const safeConversions = Math.max(0, conversions);
  const safeSpend = Math.max(0, spendOrRevenue);

  // CTR = (Clicks / Impressions) * 100
  const ctr = safeImpressions > 0 ? (safeClicks / safeImpressions) * 100 : 0;

  // Conversion Rate = (Conversions / Clicks) * 100
  const conversionRate = safeClicks > 0 ? (safeConversions / safeClicks) * 100 : 0;

  // eCPM = (Spend / Impressions) * 1000
  const ecpm = safeImpressions > 0 ? (safeSpend / safeImpressions) * 1000 : 0;

  // CPC = Spend / Clicks
  const cpc = safeClicks > 0 ? safeSpend / safeClicks : 0;

  return {
    ctr: roundToDecimals(ctr, 2),
    conversionRate: roundToDecimals(conversionRate, 2),
    ecpm: roundToDecimals(ecpm, 2),
    cpc: roundToDecimals(cpc, 2),
  };
}

/**
 * Helper to round to specified decimal places
 */
function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
