/**
 * Realtime Live Broadcast Hub
 * Broadcasts events (live match score updates, new news articles, new video highlights)
 * to connected Web and Mobile SSE/WebSocket clients with duplicate suppression.
 */

type RealtimeSubscriber = (data: string) => void;

class RealtimeHub {
  private subscribers = new Set<RealtimeSubscriber>();
  private lastPayloadHashes = new Map<string, string>();

  public subscribe(callback: RealtimeSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public broadcast(event: string, payload: any, dedupKey?: string) {
    if (dedupKey) {
      const payloadString = JSON.stringify(payload);
      const lastPayload = this.lastPayloadHashes.get(dedupKey);
      if (lastPayload === payloadString) {
        // Suppress duplicate broadcast
        return;
      }
      this.lastPayloadHashes.set(dedupKey, payloadString);

      // Prune hash cache if exceeding 1000 items
      if (this.lastPayloadHashes.size > 1000) {
        const firstKey = this.lastPayloadHashes.keys().next().value;
        if (firstKey) this.lastPayloadHashes.delete(firstKey);
      }
    }

    const message = JSON.stringify({ event, payload, timestamp: Date.now() });
    for (const callback of this.subscribers) {
      try {
        callback(message);
      } catch (err) {
        console.error('Error delivering realtime event to subscriber:', err);
      }
    }
  }

  public getSubscriberCount(): number {
    return this.subscribers.size;
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
  realtimeHub.broadcast('news:new', newsItem, `news:${newsItem._id || newsItem.id}`);
}

/**
 * Broadcast newly published Video Highlight to all active clients
 */
export function broadcastNewVideo(videoItem: any) {
  realtimeHub.broadcast('video:new', videoItem, `video:${videoItem._id || videoItem.id}`);
}

/**
 * Broadcast real-time match score update with duplicate suppression
 */
export function broadcastLiveScore(sport: string, matchId: string, payload: any) {
  realtimeHub.broadcast(
    `match:score_update`,
    { sport, matchId, ...payload },
    `score:${sport}:${matchId}`
  );
}

/**
 * Broadcast real-time match status change (e.g. Halftime, Fulltime, Postponed)
 */
export function broadcastMatchStatus(sport: string, matchId: string, status: string, payload: any = {}) {
  realtimeHub.broadcast(
    `match:status_change`,
    { sport, matchId, status, ...payload },
    `status:${sport}:${matchId}:${status}`
  );
}
