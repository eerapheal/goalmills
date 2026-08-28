import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { validateEmail } from '@/lib/deliverability/validator';
import { isEmailSuppressed } from '@/lib/deliverability/suppression';

export async function POST(req: NextRequest) {
  try {
    const { email, frequency, categories, source, requireDoubleOptIn = false } = await req.json();

    // Stage A: Validate Email (Syntax, Disposable, MX, Typo)
    const validation = await validateEmail(email);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.reason || 'Invalid email syntax' },
        { status: 400 }
      );
    }

    if (validation.isDisposable) {
      return NextResponse.json(
        {
          success: false,
          message: 'Temporary / disposable email addresses are not accepted. Please use a standard email provider.',
        },
        { status: 400 }
      );
    }

    if (validation.hasTypo && validation.suggestedCorrection) {
      return NextResponse.json(
        {
          success: false,
          hasTypo: true,
          suggestedCorrection: validation.suggestedCorrection,
          message: `Did you mean ${validation.suggestedCorrection}? Please double-check your email.`,
        },
        { status: 400 }
      );
    }

    const normalizedEmail = validation.emailNormalized;
    await dbConnect();

    // Check Global Suppression
    const suppressed = await isEmailSuppressed(normalizedEmail);
    if (suppressed) {
      return NextResponse.json(
        {
          success: false,
          message: 'This email address is currently on our global suppression list (e.g. past bounce or unsubscribe request).',
        },
        { status: 400 }
      );
    }

    let subscriber = await NewsletterSubscriber.findOne({ emailNormalized: normalizedEmail });

    if (subscriber) {
      // Re-activate or update preferences
      subscriber.status = subscriber.status === 'HARD_BOUNCE' || subscriber.status === 'COMPLAINT' ? 'CONFIRMED' : subscriber.status;
      if (subscriber.status === 'UNSUBSCRIBED' || subscriber.status === 'INACTIVE' || subscriber.status === 'unsubscribed') {
        subscriber.status = 'CONFIRMED';
      }
      if (frequency) subscriber.frequency = frequency;
      if (categories) subscriber.categories = categories;
      if (!subscriber.unsubscribeToken) {
        subscriber.unsubscribeToken = crypto.randomBytes(24).toString('hex');
      }
      subscriber.emailHealthScore = 85;
      await subscriber.save();

      return NextResponse.json({
        success: true,
        message: 'Your newsletter subscription preferences have been updated!',
        data: subscriber,
      });
    }

    const unsubscribeToken = crypto.randomBytes(24).toString('hex');
    const confirmationToken = crypto.randomBytes(24).toString('hex');

    const initialStatus = requireDoubleOptIn ? 'PENDING' : 'CONFIRMED';

    subscriber = await NewsletterSubscriber.create({
      email: email.trim(),
      emailNormalized: normalizedEmail,
      frequency: frequency || 'daily',
      categories: categories || [],
      status: initialStatus,
      emailHealthScore: 90,
      engagementScore: 60,
      reputationRiskScore: 10,
      confirmationToken,
      unsubscribeToken,
      confirmedAt: requireDoubleOptIn ? undefined : new Date(),
      source: source || 'website',
    });

    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://goalmills.com'}/newsletter/confirm?token=${confirmationToken}`;

    return NextResponse.json(
      {
        success: true,
        message: requireDoubleOptIn
          ? 'Please check your inbox to confirm your subscription.'
          : 'Thank you for subscribing to GoalMills Newsletters!',
        confirmationUrl: requireDoubleOptIn ? confirmationUrl : undefined,
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
