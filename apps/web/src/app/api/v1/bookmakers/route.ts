import { NextRequest, NextResponse } from 'next/server';
import { getAllCanonicalBookmakers } from '@/lib/betting';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import dbConnect from '@/lib/db';
import BookmakerModel from '@/models/Bookmaker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country')?.toUpperCase();
    const sport = searchParams.get('sport')?.toLowerCase();

    const cacheKey = `api:v1:bookmakers:${country || 'ALL'}:${sport || 'all'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    // Attempt DB read, fallback to canonical code registry
    let bookmakers = getAllCanonicalBookmakers();
    try {
      await dbConnect();
      const dbBookies = await BookmakerModel.find({ status: 'ACTIVE' })
        .sort({ priorityRank: 1 })
        .lean();
      if (dbBookies && dbBookies.length > 0) {
        bookmakers = dbBookies.map((b: any) => ({
          id: b.id,
          slug: b.slug,
          displayName: b.displayName,
          legalName: b.legalName,
          logoUrl: b.logoUrl,
          websiteUrl: b.websiteUrl,
          countries: b.countries,
          supportedSports: b.supportedSports,
          status: b.status,
          externalProviderIds: b.externalProviderIds ? Object.fromEntries(b.externalProviderIds) : {},
          priorityRank: b.priorityRank,
          isFeatured: b.isFeatured,
          isSponsored: b.isSponsored,
          rating: b.rating,
          bonusText: b.bonusText,
        }));
      }
    } catch {
      // Use in-memory canonical registry
    }

    if (country) {
      bookmakers = bookmakers.filter(
        (b) => b.countries.includes('ALL') || b.countries.includes(country)
      );
    }

    if (sport) {
      bookmakers = bookmakers.filter((b) => b.supportedSports.includes(sport));
    }

    // Cache for 10 minutes (600s)
    await cacheSet(cacheKey, bookmakers, 600);

    return NextResponse.json({
      success: true,
      total: bookmakers.length,
      data: bookmakers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve bookmakers' },
      { status: 500 }
    );
  }
}
