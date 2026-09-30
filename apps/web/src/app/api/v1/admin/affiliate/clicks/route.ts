import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AffiliateClickModel from '@/models/AffiliateClick';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const bookmakerId = searchParams.get('bookmakerId');
    const campaign = searchParams.get('campaign');
    const placement = searchParams.get('placement');
    const days = parseInt(searchParams.get('days') || '30', 10);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const matchStage: Record<string, any> = {
      createdAt: { $gte: fromDate },
    };
    if (bookmakerId) matchStage.bookmakerId = bookmakerId;
    if (campaign) matchStage.campaign = campaign;
    if (placement) matchStage.placement = placement;

    // Aggregations by bookmaker
    const byBookmaker = await AffiliateClickModel.aggregate([
      { $match: matchStage },
      { $group: { _id: '$bookmakerId', totalClicks: { $sum: 1 } } },
      { $sort: { totalClicks: -1 } },
    ]);

    // Aggregations by placement
    const byPlacement = await AffiliateClickModel.aggregate([
      { $match: matchStage },
      { $group: { _id: '$placement', totalClicks: { $sum: 1 } } },
      { $sort: { totalClicks: -1 } },
    ]);

    // Aggregations by country
    const byCountry = await AffiliateClickModel.aggregate([
      { $match: matchStage },
      { $group: { _id: '$country', totalClicks: { $sum: 1 } } },
      { $sort: { totalClicks: -1 } },
      { $limit: 10 },
    ]);

    const totalClicks = byBookmaker.reduce((acc, curr) => acc + curr.totalClicks, 0);

    return NextResponse.json({
      success: true,
      timeframeDays: days,
      totalClicks,
      byBookmaker,
      byPlacement,
      byCountry,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch click analytics' },
      { status: 500 }
    );
  }
}
