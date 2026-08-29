import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sponsorship from '@/models/Sponsorship';
import { isValidObjectId } from '@/lib/security';
import { cacheGet, cacheSet } from '@/lib/redisCache';

const RATE_LIMIT_WINDOW_SECS = 60;
const MAX_TRACKS_PER_WINDOW = 20;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('type') || 'impression';

    if (eventType !== 'impression' && eventType !== 'click') {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // 1. IP / Client Telemetry Protection
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateLimitKey = `rate:track:${ip}`;
    const recentCount = (await cacheGet<number>(rateLimitKey)) || 0;

    if (recentCount >= MAX_TRACKS_PER_WINDOW) {
      return NextResponse.json(
        { success: false, message: 'Telemetry rate limit exceeded' },
        { status: 429 }
      );
    }
    await cacheSet(rateLimitKey, recentCount + 1, RATE_LIMIT_WINDOW_SECS);

    // 2. Duplicate Suppression (Suppress repeated impressions within 10s from same IP)
    if (eventType === 'impression') {
      const dedupKey = `dedup:imp:${id}:${ip}`;
      const hasRecentImpression = await cacheGet<boolean>(dedupKey);
      if (hasRecentImpression) {
        return NextResponse.json({ success: true, message: 'Duplicate impression suppressed' });
      }
      await cacheSet(dedupKey, true, 10);
    }

    await dbConnect();

    // 3. Campaign Validation & Targeted Atomic Increment
    const updateField = eventType === 'click' ? { $inc: { clicks: 1 } } : { $inc: { impressions: 1 } };

    const updated = await Sponsorship.findOneAndUpdate(
      {
        _id: id,
        status: 'active',
        isDeleted: { $ne: true },
      },
      updateField,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Sponsorship campaign inactive or not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tracked: eventType });
  } catch (error: any) {
    console.error('[Web Sponsorship Track] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
