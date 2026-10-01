import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BettingCampaignModel from '@/models/BettingCampaign';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await dbConnect();
    const updated = await BettingCampaignModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('[Admin Campaign PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
