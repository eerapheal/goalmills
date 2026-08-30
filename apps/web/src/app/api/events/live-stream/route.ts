import { NextRequest } from 'next/server';
import { resolveTenantContext } from '@/lib/tenantContext';
import { sportsEventProducer } from '@/lib/events/eventProducer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const tenantContext = await resolveTenantContext(req);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection packet
      const initPayload = JSON.stringify({
        type: 'connection_ack',
        tenant: tenantContext.tenantSlug,
        connectedAt: new Date().toISOString(),
        message: 'GoalMills Live Matchday Stream Connected',
      });
      controller.enqueue(encoder.encode(`event: init\ndata: ${initPayload}\n\n`));

      // Push latest buffered moments
      const recentEvents = sportsEventProducer.getBufferedEvents(5);
      for (const evt of recentEvents) {
        controller.enqueue(
          encoder.encode(`event: sports_moment\ndata: ${JSON.stringify(evt)}\n\n`)
        );
      }

      // Heartbeat pulse every 15s to keep connection alive
      const interval = setInterval(() => {
        try {
          const pingPayload = JSON.stringify({
            type: 'pulse',
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`event: ping\ndata: ${pingPayload}\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
