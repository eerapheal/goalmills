import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PushToken from '@/models/PushToken';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, platform, topics, userId, deviceInfo, enabled = true } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Valid push token is required' }, { status: 400 });
    }

    if (!platform || !['android', 'ios', 'web'].includes(platform)) {
      return NextResponse.json({ error: 'Platform must be android, ios, or web' }, { status: 400 });
    }

    await dbConnect();

    const normalizedTopics =
      Array.isArray(topics) && topics.length > 0
        ? Array.from(new Set(topics))
        : ['all', 'breaking_news', 'live_scores'];

    const updated = await PushToken.findOneAndUpdate(
      { token: token.trim() },
      {
        $set: {
          platform,
          topics: normalizedTopics,
          userId: userId || undefined,
          deviceInfo: deviceInfo || undefined,
          enabled: Boolean(enabled),
          lastActiveAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Push token registered successfully',
      data: {
        id: updated._id,
        platform: updated.platform,
        topics: updated.topics,
        enabled: updated.enabled,
      },
    });
  } catch (error: any) {
    console.error('Error registering push token:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await dbConnect();
    await PushToken.findOneAndUpdate({ token: token.trim() }, { $set: { enabled: false } });

    return NextResponse.json({
      success: true,
      message: 'Push token unregistered successfully',
    });
  } catch (error: any) {
    console.error('Error unregistering push token:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
