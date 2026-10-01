import dbConnect from '@/lib/db';
import AffiliateClickModel from '@/models/AffiliateClick';
import AffiliateCommissionRuleModel from '@/models/AffiliateCommissionRule';
import { AffiliateCommissionRule } from '@goalmills/types';

export interface AffiliateIntelligenceReport {
  totalClicks: number;
  clicksByBookmaker: Record<string, number>;
  clicksByPlacement: Record<string, number>;
  clicksByCampaign: Record<string, number>;
  clicksByCountry: Record<string, number>;
  estimatedRevenue: {
    total: number;
    currency: string;
    breakdown: Record<string, number>;
  };
  commissionRulesCount: number;
}

/**
 * Computes live affiliate intelligence and estimated revenue metrics.
 */
export async function getAffiliateIntelligenceReport(): Promise<AffiliateIntelligenceReport> {
  await dbConnect();

  // 1. Fetch all clicks
  const clicks = await AffiliateClickModel.find().lean();
  const rules = await AffiliateCommissionRuleModel.find({ status: 'ACTIVE' }).lean();

  const totalClicks = clicks.length;
  const clicksByBookmaker: Record<string, number> = {};
  const clicksByPlacement: Record<string, number> = {};
  const clicksByCampaign: Record<string, number> = {};
  const clicksByCountry: Record<string, number> = {};

  for (const c of clicks) {
    const bm = c.bookmakerId || 'unknown';
    const pl = c.placement || 'general';
    const cp = c.campaign || 'default';
    const co = c.country || 'GLOBAL';

    clicksByBookmaker[bm] = (clicksByBookmaker[bm] || 0) + 1;
    clicksByPlacement[pl] = (clicksByPlacement[pl] || 0) + 1;
    clicksByCampaign[cp] = (clicksByCampaign[cp] || 0) + 1;
    clicksByCountry[co] = (clicksByCountry[co] || 0) + 1;
  }

  // 2. Compute estimated revenue from commission rules
  let totalRevenue = 0;
  const revenueBreakdown: Record<string, number> = {};

  for (const [bm, count] of Object.entries(clicksByBookmaker)) {
    const rule = rules.find((r) => r.bookmakerId === bm);
    if (rule) {
      let bookmakerRev = 0;
      if (rule.commissionType === 'CPA') {
        // Industry benchmark standard: 1.5% conversion rate on warm clicks
        const estimatedConversions = Math.max(1, Math.floor(count * 0.015));
        bookmakerRev = estimatedConversions * rule.commissionValue;
      } else if (rule.commissionType === 'SPONSORED') {
        bookmakerRev = rule.commissionValue;
      } else {
        bookmakerRev = count * (rule.commissionValue * 0.1);
      }
      totalRevenue += bookmakerRev;
      revenueBreakdown[bm] = parseFloat(bookmakerRev.toFixed(2));
    }
  }

  return {
    totalClicks,
    clicksByBookmaker,
    clicksByPlacement,
    clicksByCampaign,
    clicksByCountry,
    estimatedRevenue: {
      total: parseFloat(totalRevenue.toFixed(2)),
      currency: 'EUR',
      breakdown: revenueBreakdown,
    },
    commissionRulesCount: rules.length,
  };
}

/**
 * Creates or updates an affiliate commission rule.
 */
export async function saveCommissionRule(rule: Partial<AffiliateCommissionRule>): Promise<AffiliateCommissionRule> {
  await dbConnect();
  const doc = await AffiliateCommissionRuleModel.create({
    bookmakerId: rule.bookmakerId,
    provider: rule.provider || 'DIRECT',
    country: rule.country || 'ALL',
    commissionType: rule.commissionType || 'CPA',
    commissionValue: rule.commissionValue || 0,
    currency: rule.currency || 'EUR',
    status: rule.status || 'ACTIVE',
    effectiveFrom: rule.effectiveFrom || new Date(),
  });
  return doc.toObject ? doc.toObject() : doc;
}
