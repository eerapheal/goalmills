import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BettingCampaignModel from '@/models/BettingCampaign';
import { createBettingCampaign, getActiveCampaigns } from '@/lib/betting/campaignService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || undefined;
    const country = searchParams.get('country') || undefined;

    const campaigns = await getActiveCampaigns({ sport, country });

    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error: any) {
    console.error('[Admin Campaigns API] GET error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    const campaign = await createBettingCampaign(body);

    return NextResponse.json({
      success: true,
      data: campaign,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Campaigns API] POST error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
