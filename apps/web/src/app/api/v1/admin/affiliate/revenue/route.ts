import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AffiliateClickModel from '@/models/AffiliateClick';
import AffiliateConversionModel from '@/models/AffiliateConversion';
import { getAffiliateIntelligenceReport } from '@/lib/betting/affiliateIntelligenceService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const bookmakerId = searchParams.get('bookmakerId') || undefined;
    const sinceParam = searchParams.get('since');
    const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Get intelligence baseline report
    const intelligence = await getAffiliateIntelligenceReport();

    // 2. Aggregate confirmed conversions
    const conversionFilter: Record<string, any> = {
      convertedAt: { $gte: since },
      status: 'APPROVED',
    };
    if (bookmakerId) {
      conversionFilter.bookmakerId = bookmakerId;
    }

    const conversionAgg = await AffiliateConversionModel.aggregate([
      { $match: conversionFilter },
      {
        $group: {
          _id: '$conversionType',
          count: { $sum: 1 },
          totalValue: { $sum: '$conversionValue' },
        },
      },
    ]);

    const conversionBreakdown: Record<string, { count: number; value: number }> = {};
    let totalCpaValue = 0;
    let totalRevShareValue = 0;

    conversionAgg.forEach((item: any) => {
      conversionBreakdown[item._id] = {
        count: item.count,
        value: item.totalValue,
      };
      if (item._id === 'REGISTRATION' || item._id === 'FIRST_DEPOSIT') {
        totalCpaValue += item.totalValue;
      } else if (item._id === 'REVENUE_SHARE' || item._id === 'WAGER') {
        totalRevShareValue += item.totalValue;
      }
    });

    const totalClicks = bookmakerId
      ? intelligence.clicksByBookmaker[bookmakerId] || 0
      : intelligence.totalClicks;

    const estimatedRevenue = bookmakerId
      ? intelligence.estimatedRevenue.breakdown[bookmakerId] || 0
      : intelligence.estimatedRevenue.total;

    return NextResponse.json({
      success: true,
      data: {
        timeframe: {
          since: since.toISOString(),
          until: new Date().toISOString(),
        },
        affiliateClicks: totalClicks,
        registrations: conversionBreakdown['REGISTRATION']?.count || 0,
        firstDeposits: conversionBreakdown['FIRST_DEPOSIT']?.count || 0,
        cpaRevenue: totalCpaValue || parseFloat((estimatedRevenue * 0.7).toFixed(2)),
        revenueShare: totalRevShareValue || parseFloat((estimatedRevenue * 0.3).toFixed(2)),
        totalRevenue:
          (totalCpaValue + totalRevShareValue) || estimatedRevenue,
        currency: 'EUR',
        breakdownByBookmaker: intelligence.clicksByBookmaker,
      },
    });
  } catch (error: any) {
    console.error('[Admin Affiliate Revenue API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to aggregate revenue metrics' },
      { status: 500 }
    );
  }
}
