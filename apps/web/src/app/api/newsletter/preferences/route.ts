import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { sanitizeObject } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token && !email) {
      return NextResponse.json(
        { success: false, message: 'Authentication token or email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const query: Record<string, any> = {};
    if (token) {
      query.unsubscribeToken = token;
    } else if (email) {
      query.emailNormalized = email.trim().toLowerCase();
    }

    const subscriber = await NewsletterSubscriber.findOne(query).lean();

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Subscriber record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
        frequency: subscriber.frequency || 'daily',
        categories: subscriber.categories || ['all'],
        preferences: subscriber.preferences || {
          sports: subscriber.categories || ['football', 'cricket', 'basketball'],
          frequency: subscriber.frequency || 'daily',
          breakingAlerts: true,
          transfersOnly: false,
          isPaused: false,
        },
      },
    });
  } catch (error: any) {
    console.error('[Newsletter Preferences GET] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cleanData = sanitizeObject(body);
    const { token, email, preferences, frequency, categories } = cleanData;

    if (!token && !email) {
      return NextResponse.json(
        { success: false, message: 'Authentication token or email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const query: Record<string, any> = {};
    if (token) {
      query.unsubscribeToken = token;
    } else if (email) {
      query.emailNormalized = email.trim().toLowerCase();
    }

    const updateFields: Record<string, any> = {};
    if (frequency) updateFields.frequency = frequency;
    if (categories) updateFields.categories = categories;
    if (preferences) {
      updateFields.preferences = {
        sports: preferences.sports || ['football'],
        frequency: preferences.frequency || frequency || 'daily',
        breakingAlerts: preferences.breakingAlerts !== false,
        transfersOnly: preferences.transfersOnly === true,
        isPaused: preferences.isPaused === true,
        pausedUntil: preferences.pausedUntil ? new Date(preferences.pausedUntil) : null,
      };
      if (preferences.sports) {
        updateFields.categories = preferences.sports;
      }
    }

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    );

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter preferences updated successfully',
      preferences: subscriber.preferences,
    });
  } catch (error: any) {
    console.error('[Newsletter Preferences POST] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
