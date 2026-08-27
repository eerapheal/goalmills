import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Notification from '../../../../models/Notification';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const topic = searchParams.get('topic');

    await dbConnect();

    const query: any = {};
    if (topic && topic !== 'all') {
      query.topic = { $in: [topic, 'all'] };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.error('Error fetching notification history:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
