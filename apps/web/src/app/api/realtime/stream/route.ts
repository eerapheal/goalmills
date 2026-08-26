import { NextRequest } from 'next/server';
import { realtimeHub } from '@/lib/socketBroadcaster';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: Date.now() })}\n\n`)
      );

      // Subscribe to realtime hub
      const unsubscribe = realtimeHub.subscribe((message) => {
        try {
          const parsed = JSON.parse(message);
          controller.enqueue(
            encoder.encode(`event: ${parsed.event}\ndata: ${JSON.stringify(parsed.payload)}\n\n`)
          );
        } catch (err) {
          // ignore formatting errors
        }
      });

      // Keep connection alive with periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch (e) {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
