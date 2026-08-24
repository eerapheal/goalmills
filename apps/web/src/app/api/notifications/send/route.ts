import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '../../../../lib/pushService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      body: content,
      imageUrl,
      topic = 'all',
      targetPlatform = 'all',
      data = {},
      tokens,
      secretKey,
    } = body;

    // Optional admin security check (can be configured via ADMIN_NOTIFICATION_KEY or NEXTAUTH)
    const adminKey = process.env.ADMIN_NOTIFICATION_KEY || process.env.NEXTAUTH_SECRET;
    if (adminKey && secretKey && secretKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const result = await sendPushNotification({
      title,
      body: content,
      imageUrl,
      topic,
      targetPlatform,
      data,
      tokens,
    });

    return NextResponse.json({
      success: true,
      message: 'Push notification processed successfully',
      result,
    });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
