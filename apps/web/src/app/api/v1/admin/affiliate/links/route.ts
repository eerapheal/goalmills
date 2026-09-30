import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AffiliateLinkModel from '@/models/AffiliateLink';
import { getCanonicalBookmaker, isAuthorizedBookmakerDestination } from '@/lib/betting';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const bookmakerId = searchParams.get('bookmakerId');
    const campaign = searchParams.get('campaign');

    const filter: Record<string, any> = {};
    if (bookmakerId) filter.bookmakerId = bookmakerId;
    if (campaign) filter.campaign = campaign;

    const links = await AffiliateLinkModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      total: links.length,
      data: links,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch affiliate links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      bookmakerId,
      destinationUrl,
      campaign = 'general',
      placement = 'odds_table',
      destinationType = 'REGISTRATION',
      trackingTemplate = '',
      country = 'ALL',
      sport = 'all',
      status = 'ACTIVE',
    } = body;

    if (!bookmakerId || !destinationUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: bookmakerId, destinationUrl' },
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

    if (!isAuthorizedBookmakerDestination(destinationUrl, canonical.id)) {
      return NextResponse.json(
        {
          success: false,
          error: `Destination URL must strictly match authorized domain for ${canonical.displayName} (${canonical.websiteUrl})`,
        },
        { status: 400 }
      );
    }

    const id = `link_${canonical.id}_${campaign}_${placement}`;

    const link = await AffiliateLinkModel.findOneAndUpdate(
      { id },
      {
        id,
        bookmakerId: canonical.id,
        destinationUrl,
        campaign,
        placement,
        destinationType,
        trackingTemplate,
        country,
        sport,
        status,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      data: link,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save affiliate link' },
      { status: 500 }
    );
  }
}
