import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export async function POST(req: NextRequest) {
  try {
    const { email, frequency, categories, source } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    await dbConnect();

    let subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

    if (subscriber) {
      // Re-activate or update preferences
      subscriber.status = 'active';
      if (frequency) subscriber.frequency = frequency;
      if (categories) subscriber.categories = categories;
      if (!subscriber.unsubscribeToken) {
        subscriber.unsubscribeToken = crypto.randomBytes(24).toString('hex');
      }
      await subscriber.save();

      return NextResponse.json({
        success: true,
        message: 'Your newsletter subscription preferences have been updated!',
        data: subscriber,
      });
    }

    const unsubscribeToken = crypto.randomBytes(24).toString('hex');

    subscriber = await NewsletterSubscriber.create({
      email: normalizedEmail,
      frequency: frequency || 'daily',
      categories: categories || [],
      status: 'active',
      unsubscribeToken,
      source: source || 'website',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing to GoalMills Newsletters!',
        data: subscriber,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
