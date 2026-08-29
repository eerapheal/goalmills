import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sponsorship from '@/models/Sponsorship';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import { sanitizeObject } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') || 'all';
    const sport = searchParams.get('sport') || 'all';

    const cacheKey = `cache:sponsorships:${placement}:${sport}`;
    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, sponsorships: cached, source: 'cache' });
    }

    await dbConnect();
    const filter: Record<string, any> = {
      status: 'active',
      isDeleted: { $ne: true },
      $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: new Date() } }],
    };

    if (placement !== 'all') {
      filter.placement = placement;
    }
    if (sport !== 'all') {
      filter.sportSlug = { $in: [sport, 'all'] };
    }

    const sponsorships = await Sponsorship.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .limit(10)
      .lean();

    // Cache for 60 seconds
    await cacheSet(cacheKey, sponsorships, 60);

    return NextResponse.json({ success: true, sponsorships, source: 'db' });
  } catch (error: any) {
    console.error('[Web Sponsorships GET] Error:', error);
    return NextResponse.json({ success: true, sponsorships: [] });
  }
}
