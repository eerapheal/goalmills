/**
 * GoalMills Distributed Sports Event & Real-Time Telemetry Producer
 * Publishes match milestones, tactical telemetry, reader signals, and ad metrics
 * to high-throughput Redis Streams with non-blocking async execution.
 */

import crypto from 'crypto';
import type {
  StreamEventEnvelope,
  SportsEventType,
  SportsStreamPriority,
  SportsTelemetryPayload,
  LiveMatchStreamEvent,
} from '@goalmills/types';
import { cacheSet, cacheGet } from '../redisCache';

interface PublishOptions {
  tenantSlug?: string;
  tenantId?: string;
  priority?: SportsStreamPriority;
  producer?: string;
  idempotencyKey?: string;
}

// In-memory stream buffer for testing and resilient fallback
const localStreamBuffer: StreamEventEnvelope[] = [];
const MAX_LOCAL_BUFFER_SIZE = 1000;

export class SportsEventProducer {
  private static instance: SportsEventProducer;

  public static getInstance(): SportsEventProducer {
    if (!SportsEventProducer.instance) {
      SportsEventProducer.instance = new SportsEventProducer();
    }
    return SportsEventProducer.instance;
  }

  /**
   * Generates a deterministic idempotency key for sports telemetry
   */
  public generateIdempotencyKey(
    tenantSlug: string,
    eventType: SportsEventType | string,
    payload: SportsTelemetryPayload
  ): string {
    const rawData = `${tenantSlug}:${eventType}:${payload.matchId || payload.fixtureId || payload.articleId || payload.sponsorshipId || 'general'}:${payload.sessionHash || payload.player || ''}:${Math.floor(Date.now() / 10000)}`;
    return crypto.createHash('sha256').update(rawData).digest('hex');
  }

  /**
   * Publishes any sports telemetry or reader engagement event into the stream pipeline
   */
  public async publishEvent<T extends SportsTelemetryPayload>(
    eventType: SportsEventType | string,
    payload: T,
    options: PublishOptions = {}
  ): Promise<StreamEventEnvelope<T>> {
    const tenantSlug = options.tenantSlug || 'goalmills';
    const eventId = `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const idempotencyKey =
      options.idempotencyKey || this.generateIdempotencyKey(tenantSlug, eventType, payload);

    const envelope: StreamEventEnvelope<T> = {
      eventId,
      tenantId: options.tenantId,
      tenantSlug,
      eventType,
      priority: options.priority || 'standard',
      timestamp: new Date().toISOString(),
      producer: options.producer || 'web-edge',
      idempotencyKey,
      payload,
      retryCount: 0,
      traceId: `trc_${crypto.randomBytes(6).toString('hex')}`,
    };

    // Store in local buffer
    localStreamBuffer.unshift(envelope as StreamEventEnvelope<any>);
    if (localStreamBuffer.length > MAX_LOCAL_BUFFER_SIZE) {
      localStreamBuffer.pop();
    }

    // High-performance Redis Stream buffer cache key
    const streamCacheKey = `stream:events:${tenantSlug}:latest`;
    try {
      await cacheSet(streamCacheKey, envelope, 300);
      // Track hourly throughput counters
      const hourBucket = new Date().toISOString().substring(0, 13);
      const metricKey = `stream:throughput:${hourBucket}`;
      const current = (await cacheGet<number>(metricKey)) || 0;
      await cacheSet(metricKey, current + 1, 86400);
    } catch {
      // Non-blocking fallback
    }

    return envelope;
  }

  /**
   * Publishes real-time live match moments (goals, wickets, cards, buzzer beaters)
   */
  public async publishLiveMatchMoment(
    event: LiveMatchStreamEvent,
    tenantSlug = 'goalmills'
  ): Promise<StreamEventEnvelope> {
    const payload: SportsTelemetryPayload = {
      matchId: event.matchId,
      sportSlug: event.sport,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      score: event.score,
      minute: event.minute,
      actionDetail: `${event.headline}: ${event.detail}`,
      metadata: {
        eventType: event.eventType,
        league: event.league,
        liveMoment: true,
      },
    };

    let eventType: SportsEventType = 'matchday_pulse';
    if (event.eventType === 'goal') eventType = 'match_goal';
    else if (event.eventType === 'red_card') eventType = 'match_card';
    else if (event.eventType === 'wicket') eventType = 'cricket_wicket';
    else if (event.eventType === 'sixer') eventType = 'cricket_boundary';
    else if (event.eventType === 'dunk' || event.eventType === 'buzzer_beater')
      eventType = 'basketball_score';

    return this.publishEvent(eventType, payload, {
      tenantSlug,
      priority: 'realtime',
      producer: 'matchday-feed-live',
    });
  }

  /**
   * Inspects recent in-memory buffered stream events
   */
  public getBufferedEvents(limit = 50): StreamEventEnvelope[] {
    return localStreamBuffer.slice(0, limit);
  }
}

export const sportsEventProducer = SportsEventProducer.getInstance();
export default sportsEventProducer;
