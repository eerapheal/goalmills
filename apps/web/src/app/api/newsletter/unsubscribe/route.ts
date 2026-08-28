import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Missing unsubscribe token' },
        { status: 400 }
      );
    }

    await dbConnect();
    const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired unsubscribe token' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: subscriber.email,
        frequency: subscriber.frequency,
        status: subscriber.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch subscription info' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, action, frequency } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Missing unsubscribe token' },
        { status: 400 }
      );
    }

    await dbConnect();
    const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired unsubscribe token' },
        { status: 404 }
      );
    }

    if (action === 'update_frequency' && frequency) {
      subscriber.frequency = frequency;
      subscriber.status = 'active';
      await subscriber.save();

      return NextResponse.json({
        success: true,
        message: `Subscription updated to ${frequency} digest successfully!`,
      });
    }

    // Default action: unsubscribe
    subscriber.status = 'unsubscribed';
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from GoalMills newsletters.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}
