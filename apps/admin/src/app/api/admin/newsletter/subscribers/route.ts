import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { requirePermission } from '@/lib/serverAuth';
import { escapeRegex } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const { error } = await requirePermission('articles:publish');
    if (error) return error;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const frequency = searchParams.get('frequency');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: any = {};
    if (frequency && frequency !== 'all') {
      query.frequency = frequency;
    }
    if (status && status !== 'all') {
      if (status === 'active' || status === 'ACTIVE') {
        query.status = { $in: ['active', 'ACTIVE', 'CONFIRMED', 'ENGAGED'] };
      } else if (status === 'unsubscribed' || status === 'UNSUBSCRIBED') {
        query.status = { $in: ['unsubscribed', 'UNSUBSCRIBED', 'SUPPRESSED', 'HARD_BOUNCE'] };
      } else {
        query.status = status;
      }
    }
    if (search) {
      const safe = escapeRegex(search.trim());
      query.email = { $regex: safe, $options: 'i' };
    }

    const activeFilter = { status: { $in: ['active', 'ACTIVE', 'CONFIRMED', 'ENGAGED'] } };
    const unsubFilter = { status: { $in: ['unsubscribed', 'UNSUBSCRIBED', 'SUPPRESSED', 'HARD_BOUNCE'] } };

    const [subscribers, totalCount, dailyCount, weeklyCount, monthlyCount, unsubCount] =
      await Promise.all([
        NewsletterSubscriber.find(query).sort({ createdAt: -1 }).limit(limit),
        NewsletterSubscriber.countDocuments(activeFilter),
        NewsletterSubscriber.countDocuments({ ...activeFilter, frequency: 'daily' }),
        NewsletterSubscriber.countDocuments({ ...activeFilter, frequency: 'weekly' }),
        NewsletterSubscriber.countDocuments({ ...activeFilter, frequency: 'monthly' }),
        NewsletterSubscriber.countDocuments(unsubFilter),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalActive: totalCount,
        daily: dailyCount,
        weekly: weeklyCount,
        monthly: monthlyCount,
        unsubscribed: unsubCount,
      },
      data: subscribers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
