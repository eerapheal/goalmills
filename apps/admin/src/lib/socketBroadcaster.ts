/**
 * Realtime Live Broadcast Hub
 * Broadcasts events (new news articles, new video highlights) to connected Web and Mobile clients.
 */

type RealtimeSubscriber = (data: string) => void;

class RealtimeHub {
  private subscribers = new Set<RealtimeSubscriber>();

  public subscribe(callback: RealtimeSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public broadcast(event: string, payload: any) {
    const message = JSON.stringify({ event, payload, timestamp: Date.now() });
    for (const callback of this.subscribers) {
      try {
        callback(message);
      } catch (err) {
        console.error('Error delivering realtime event to subscriber:', err);
      }
    }
  }
}

// Global Singleton (preserves subscribers across Next.js dev hot-reloads)
const globalRealtime = globalThis as unknown as { __realtimeHub?: RealtimeHub };
if (!globalRealtime.__realtimeHub) {
  globalRealtime.__realtimeHub = new RealtimeHub();
}

export const realtimeHub = globalRealtime.__realtimeHub;

/**
 * Broadcast newly published News Article to all active clients
 */
export function broadcastNewNews(newsItem: any) {
  realtimeHub.broadcast('news:new', newsItem);
}

/**
 * Broadcast newly published Video Highlight to all active clients
 */
export function broadcastNewVideo(videoItem: any) {
  realtimeHub.broadcast('video:new', videoItem);
}
