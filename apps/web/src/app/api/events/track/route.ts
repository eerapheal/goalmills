import { NextRequest, NextResponse } from 'next/server';
import { sportsEventProducer } from '@/lib/events/eventProducer';
import { sportsEventWorker } from '@/lib/events/eventWorker';
import { resolveTenantContext } from '@/lib/tenantContext';
import type { SportsEventType, SportsTelemetryPayload } from '@goalmills/types';

export async function POST(req: NextRequest) {
  try {
    const tenantContext = await resolveTenantContext(req);
    const body = await req.json();

    // Check if single event or batch payload
    const events: Array<{ eventType: SportsEventType | string; payload: SportsTelemetryPayload }> =
      Array.isArray(body.events) ? body.events : [body];

    const results = [];

    for (const item of events) {
      if (!item.eventType || !item.payload) continue;

      // 1. Dispatch to stream producer (high throughput buffer)
      const envelope = await sportsEventProducer.publishEvent(
        item.eventType,
        item.payload,
        {
          tenantSlug: tenantContext.tenantSlug,
          tenantId: tenantContext.tenantId,
          priority: 'standard',
          producer: 'web-beacon',
        }
      );

      // 2. Asynchronously process via worker
      sportsEventWorker.processEvent(envelope).catch((err) => {
        console.error('Async worker stream processing error:', err);
      });

      results.push({ eventId: envelope.eventId, status: 'buffered' });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Sports telemetry event(s) buffered successfully',
        processed: results.length,
        events: results,
      },
      { status: 202 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to ingest sports telemetry event',
      },
      { status: 500 }
    );
  }
}
