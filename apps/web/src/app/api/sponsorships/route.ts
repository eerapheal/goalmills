import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sponsorship from '@/models/Sponsorship';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import { resolveTenantContext, buildTenantFilter } from '@/lib/tenantContext';

export async function GET(request: NextRequest) {
  try {
    const tenantContext = await resolveTenantContext(request);
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') || 'all';
    const sport = searchParams.get('sport') || 'all';
    const device = searchParams.get('device') || 'all';
    const competition = searchParams.get('competition') || 'all';
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 50);

    const cacheKey = `cache:sponsorships:${tenantContext.tenantSlug}:${placement}:${sport}:${device}:${competition}`;
    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        tenantSlug: tenantContext.tenantSlug,
        sponsorships: cached,
        source: 'cache',
      });
    }

    await dbConnect();
    const tenantFilter = buildTenantFilter(tenantContext);
    const now = new Date();

    const query: Record<string, any> = {
      ...tenantFilter,
      status: 'active',
      isDeleted: { $ne: true },
      $and: [
        {
          $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }],
        },
        {
          $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
        },
      ],
    };

    if (placement !== 'all') {
      query.placement = placement;
    }

    if (sport !== 'all') {
      query.$or = [
        { sportSlug: 'all' },
        { sportSlug: sport },
        { 'targeting.sports': { $in: [sport, 'all'] } },
      ];
    }

    const rawSponsorships = await Sponsorship.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 2)
      .lean();

    // In-memory filter for budget caps and targeting parameters
    const eligibleSponsorships = rawSponsorships.filter((s: any) => {
      // 1. Budget and impression caps
      if (s.budgetControls?.maxImpressions && s.impressions >= s.budgetControls.maxImpressions) {
        return false;
      }
      if (s.budgetControls?.maxClicks && s.clicks >= s.budgetControls.maxClicks) {
        return false;
      }
      if (s.budget && s.spent && s.spent >= s.budget) {
        return false;
      }

      // 2. Device targeting
      if (device !== 'all' && s.targeting?.devices && s.targeting.devices.length > 0) {
        if (!s.targeting.devices.includes('all') && !s.targeting.devices.includes(device)) {
          return false;
        }
      }

      // 3. Competition targeting
      if (competition !== 'all' && s.targeting?.competitions && s.targeting.competitions.length > 0) {
        if (!s.targeting.competitions.includes(competition)) {
          return false;
        }
      }

      return true;
    }).slice(0, limit);

    // Cache for 60 seconds
    await cacheSet(cacheKey, eligibleSponsorships, 60);

    return NextResponse.json({
      success: true,
      tenantSlug: tenantContext.tenantSlug,
      sponsorships: eligibleSponsorships,
      source: 'db',
    });
  } catch (error: any) {
    console.error('[Web Sponsorships GET] Error:', error);
    return NextResponse.json({ success: true, sponsorships: [] });
  }
}
