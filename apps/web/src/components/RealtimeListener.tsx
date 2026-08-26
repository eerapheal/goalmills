'use client';

import { useEffect } from 'react';
import { useToast } from './Toast';
import { useRouter } from 'next/navigation';

export default function RealtimeListener() {
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/realtime/stream');

        // Handle newly published news article
        eventSource.addEventListener('news:new', (e) => {
          try {
            const data = JSON.parse(e.data);
            toast.info(`📰 New Story: "${data.title}"`);
            router.refresh();
          } catch (err) {
            // ignore
          }
        });

        // Handle newly published video highlight
        eventSource.addEventListener('video:new', (e) => {
          try {
            const data = JSON.parse(e.data);
            toast.success(`🎥 New Highlight: "${data.video_title}"`);
            router.refresh();
          } catch (err) {
            // ignore
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect with backoff
          reconnectTimeout = setTimeout(connectSSE, 10000);
        };
      } catch (err) {
        console.warn('Realtime event stream connection deferred');
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [toast, router]);

  return null;
}
