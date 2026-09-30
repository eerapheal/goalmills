import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AffiliateProgramModel from '@/models/AffiliateProgram';
import { getCanonicalBookmaker } from '@/lib/betting';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const bookmakerId = searchParams.get('bookmakerId');

    const filter: Record<string, any> = {};
    if (bookmakerId) {
      filter.bookmakerId = bookmakerId;
    }

    const programs = await AffiliateProgramModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      total: programs.length,
      data: programs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch affiliate programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { bookmakerId, affiliateId, trackingTemplate, provider = 'DIRECT', country = 'ALL', sport = 'all' } = body;

    if (!bookmakerId || !affiliateId || !trackingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: bookmakerId, affiliateId, trackingTemplate' },
        { status: 400 }
      );
    }

    const canonical = getCanonicalBookmaker(bookmakerId);
    if (!canonical) {
      return NextResponse.json(
        { success: false, error: `Invalid bookmaker operator: ${bookmakerId}` },
        { status: 400 }
      );
    }

    const id = `prog_${canonical.id}_${provider.toLowerCase()}_${country.toLowerCase()}`;

    const program = await AffiliateProgramModel.findOneAndUpdate(
      { id },
      {
        id,
        bookmakerId: canonical.id,
        provider,
        affiliateId,
        country,
        sport,
        trackingTemplate,
        status: body.status || 'ACTIVE',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      data: program,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save affiliate program' },
      { status: 500 }
    );
  }
}
