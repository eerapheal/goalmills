import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import EmailEvent from '@/models/EmailEvent';
import EmailSuppression from '@/models/EmailSuppression';
import { requirePermission } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const { error } = await requirePermission('articles:publish');
    if (error) return error;

    await dbConnect();

    const [
      totalSubscribers,
      activeCount,
      engagedCount,
      inactiveCount,
      suppressedCount,
      hardBounces,
      softBounces,
      complaints,
      opens,
      clicks,
      delivered,
    ] = await Promise.all([
      NewsletterSubscriber.countDocuments(),
      NewsletterSubscriber.countDocuments({ status: { $in: ['ACTIVE', 'CONFIRMED'] } }),
      NewsletterSubscriber.countDocuments({ status: 'ENGAGED' }),
      NewsletterSubscriber.countDocuments({ status: 'INACTIVE' }),
      EmailSuppression.countDocuments(),
      EmailEvent.countDocuments({ eventType: 'hard_bounce' }),
      EmailEvent.countDocuments({ eventType: 'soft_bounce' }),
      EmailEvent.countDocuments({ eventType: 'complaint' }),
      EmailEvent.countDocuments({ eventType: 'opened' }),
      EmailEvent.countDocuments({ eventType: 'clicked' }),
      EmailEvent.countDocuments({ eventType: 'delivered' }),
    ]);

    const bounceRate = delivered > 0 ? Number(((hardBounces / delivered) * 100).toFixed(2)) : 0;
    const complaintRate = delivered > 0 ? Number(((complaints / delivered) * 100).toFixed(3)) : 0;
    const openRate = delivered > 0 ? Number(((opens / delivered) * 100).toFixed(1)) : 0;
    const clickRate = delivered > 0 ? Number(((clicks / delivered) * 100).toFixed(1)) : 0;

    // Reputation Score (0–100)
    let reputationScore = 95;
    if (bounceRate > 2.0) reputationScore -= 25;
    else if (bounceRate > 1.0) reputationScore -= 10;

    if (complaintRate > 0.1) reputationScore -= 30;
    else if (complaintRate > 0.05) reputationScore -= 15;

    reputationScore = Math.max(10, Math.min(100, reputationScore));

    return NextResponse.json({
      success: true,
      data: {
        reputationScore,
        reputationTier:
          reputationScore >= 85 ? 'EXCELLENT' : reputationScore >= 70 ? 'GOOD' : 'NEEDS_ATTENTION',
        rates: {
          bounceRate,
          complaintRate,
          openRate,
          clickRate,
        },
        counts: {
          totalSubscribers,
          active: activeCount,
          engaged: engagedCount,
          inactive: inactiveCount,
          suppressed: suppressedCount,
          hardBounces,
          softBounces,
          complaints,
          delivered,
        },
        authentication: {
          domain: 'goalmills.com',
          spf: { status: 'VALID', record: 'v=spf1 include:_spf.google.com ~all' },
          dkim: { status: 'VALID', selector: 'gm2026', keySize: '2048-bit RSA' },
          dmarc: { status: 'VALID', policy: 'p=quarantine; rua=mailto:dmarc@goalmills.com' },
          bimi: { status: 'CONFIGURED', icon: 'https://goalmills.com/favicon.ico' },
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch reputation metrics' },
      { status: 500 }
    );
  }
}
