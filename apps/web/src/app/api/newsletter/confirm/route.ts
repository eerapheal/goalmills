import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Missing confirmation token' }, { status: 400 });
    }

    await dbConnect();
    const subscriber = await NewsletterSubscriber.findOne({ confirmationToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired confirmation link' },
        { status: 404 }
      );
    }

    subscriber.status = 'CONFIRMED';
    subscriber.confirmedAt = new Date();
    subscriber.emailHealthScore = 95;
    subscriber.engagementScore = 75;
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: 'Your email address has been successfully confirmed and verified!',
      data: {
        email: subscriber.email,
        frequency: subscriber.frequency,
        status: subscriber.status,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Confirmation failed' },
      { status: 500 }
    );
  }
}
