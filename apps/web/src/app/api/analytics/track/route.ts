import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import ContentMetricSummary from '@/models/ContentMetricSummary';
import { resolveTenantContext } from '@/lib/tenantContext';
import { cacheSet, cacheGet } from '@/lib/redisCache';
import type { AnalyticsEventType, AnalyticsEventMetadata } from '@goalmills/types';

export const dynamic = 'force-dynamic';

interface IncomingEventPayload {
  eventType: AnalyticsEventType;
  entityType?: 'article' | 'category' | 'video' | 'newsletter' | 'sponsorship' | 'page' | 'search';
  entityId?: string;
  metadata?: AnalyticsEventMetadata;
  timestamp?: string | number;
}

function generateDailySessionHash(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';
  const ua = req.headers.get('user-agent') || 'unknown-client';
  const today = new Date().toISOString().slice(0, 10);
  const secretSalt = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'goalmills-analytics-salt';

  return crypto
    .createHash('sha256')
    .update(`${ip}:${ua}:${today}:${secretSalt}`)
    .digest('hex')
    .slice(0, 32);
}

export async function POST(req: NextRequest) {
  try {
    const tenantContext = await resolveTenantContext(req);
    const tenantSlug = tenantContext.tenantSlug || 'goalmills';
    const tenantId = tenantContext.tenantId;
    const sessionHash = generateDailySessionHash(req);

    let rawBody: any;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json') || contentType.includes('text/plain')) {
      const text = await req.text();
      try {
        rawBody = JSON.parse(text);
      } catch {
        return NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 });
      }
    } else {
      rawBody = await req.json().catch(() => null);
    }

    if (!rawBody) {
      return NextResponse.json({ success: false, message: 'Missing body' }, { status: 400 });
    }

    const eventsList: IncomingEventPayload[] = Array.isArray(rawBody)
      ? rawBody
      : rawBody.events && Array.isArray(rawBody.events)
        ? rawBody.events
        : [rawBody];

    if (eventsList.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10);

    const documentsToInsert = [];
    const articleUpdates: Map<string, {
      pageViews: number;
      uniqueReaders: Set<string>;
      readDurationMs: number;
      p25: number;
      p50: number;
      p75: number;
      p100: number;
      shares: number;
      videoPlays: number;
      metadata: AnalyticsEventMetadata;
    }> = new Map();

    for (const evt of eventsList) {
      if (!evt.eventType) continue;

      const eventDoc = {
        tenantId,
        tenantSlug,
        eventType: evt.eventType,
        entityType: evt.entityType || (evt.metadata?.categorySlug ? 'category' : 'article'),
        entityId: evt.entityId || evt.metadata?.url || 'global',
        sessionHash,
        metadata: {
          ...evt.metadata,
          device: evt.metadata?.device || (/mobile|android|iphone|ipad/i.test(req.headers.get('user-agent') || '') ? 'mobile' : 'desktop'),
        },
        timestamp: evt.timestamp ? new Date(evt.timestamp) : new Date(),
      };

      documentsToInsert.push(eventDoc);

      // Aggregate article metrics in-flight
      const articleId = evt.entityId;
      if (articleId && articleId !== 'global' && evt.entityType === 'article') {
        if (!articleUpdates.has(articleId)) {
          articleUpdates.set(articleId, {
            pageViews: 0,
            uniqueReaders: new Set(),
            readDurationMs: 0,
            p25: 0,
            p50: 0,
            p75: 0,
            p100: 0,
            shares: 0,
            videoPlays: 0,
            metadata: evt.metadata || {},
          });
        }

        const metrics = articleUpdates.get(articleId)!;
        if (evt.eventType === 'page_view') {
          metrics.pageViews += 1;
          metrics.uniqueReaders.add(sessionHash);
        } else if (evt.eventType === 'article_read') {
          metrics.readDurationMs += Number(evt.metadata?.durationMs || evt.metadata?.readTimeMs || 0);
          metrics.uniqueReaders.add(sessionHash);
        } else if (evt.eventType === 'scroll_depth') {
          const depth = Number(evt.metadata?.scrollPercentage || 0);
          if (depth >= 100) metrics.p100 += 1;
          else if (depth >= 75) metrics.p75 += 1;
          else if (depth >= 50) metrics.p50 += 1;
          else if (depth >= 25) metrics.p25 += 1;
        } else if (evt.eventType === 'share') {
          metrics.shares += 1;
        } else if (evt.eventType === 'video_play') {
          metrics.videoPlays += 1;
        }
      }
    }

    // 1. Bulk write raw events
    if (documentsToInsert.length > 0) {
      await AnalyticsEvent.insertMany(documentsToInsert, { ordered: false }).catch((err) => {
        console.warn('[Analytics Ingestion] Warning on raw event insertion:', err.message);
      });
    }

    // 2. Increment Daily Aggregates per Article
    const summaryPromises = Array.from(articleUpdates.entries()).map(async ([articleId, data]) => {
      const incFields: Record<string, any> = {};
      if (data.pageViews > 0) incFields.pageViews = data.pageViews;
      if (data.uniqueReaders.size > 0) incFields.uniqueReaders = data.uniqueReaders.size;
      if (data.readDurationMs > 0) incFields.totalReadDurationMs = data.readDurationMs;
      if (data.p25 > 0) incFields['scrollMilestones.p25'] = data.p25;
      if (data.p50 > 0) incFields['scrollMilestones.p50'] = data.p50;
      if (data.p75 > 0) incFields['scrollMilestones.p75'] = data.p75;
      if (data.p100 > 0) incFields['scrollMilestones.p100'] = data.p100;
      if (data.shares > 0) incFields.shares = data.shares;
      if (data.videoPlays > 0) incFields.videoPlays = data.videoPlays;

      if (Object.keys(incFields).length === 0) return;

      const setOnInsert: Record<string, any> = {
        tenantId,
        tenantSlug,
        articleId,
        articleSlug: data.metadata?.url ? data.metadata.url.split('/').pop() : articleId,
        articleTitle: data.metadata?.title || 'Sports Intelligence',
        categorySlug: data.metadata?.categorySlug,
        sportSlug: data.metadata?.sportSlug,
        authorId: data.metadata?.authorId,
        authorSlug: data.metadata?.authorSlug,
        date: todayStr,
      };

      await ContentMetricSummary.updateOne(
        { tenantSlug, articleId, date: todayStr },
        {
          $inc: incFields,
          $setOnInsert: setOnInsert,
        },
        { upsert: true }
      ).catch(() => {});
    });

    await Promise.allSettled(summaryPromises);

    // 3. Update Real-Time Active Readers Key in Cache (5m rolling window)
    const realtimeKey = `analytics:realtime:${tenantSlug}:${Math.floor(Date.now() / 300000)}`;
    await cacheSet(realtimeKey, { activeTimestamp: Date.now() }, 360).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        processed: documentsToInsert.length,
        sessionHash,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Tenant-Id, X-Tenant-Slug',
        },
      }
    );
  } catch (error: any) {
    console.error('[Analytics Ingestion] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Tenant-Id, X-Tenant-Slug',
      'Access-Control-Max-Age': '86400',
    },
  });
}
