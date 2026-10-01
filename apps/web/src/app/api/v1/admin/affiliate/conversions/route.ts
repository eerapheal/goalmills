import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AffiliateConversionModel from '@/models/AffiliateConversion';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const bookmakerId = searchParams.get('bookmakerId');
    const status = searchParams.get('status');
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (bookmakerId) query.bookmakerId = bookmakerId;
    if (status) query.status = status;

    const [conversions, total] = await Promise.all([
      AffiliateConversionModel.find(query)
        .sort({ convertedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AffiliateConversionModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: conversions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[Admin Affiliate Conversions API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch conversions' },
      { status: 500 }
    );
  }
}
