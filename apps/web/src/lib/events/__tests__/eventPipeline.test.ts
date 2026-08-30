import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SportsEventProducer } from '../eventProducer';
import { SportsEventWorker } from '../eventWorker';

describe('Phase 7: Distributed Sports Event & Stream Pipeline', () => {
  let producer: SportsEventProducer;
  let worker: SportsEventWorker;

  beforeEach(() => {
    producer = SportsEventProducer.getInstance();
    worker = SportsEventWorker.getInstance();
  });

  it('should generate deterministic idempotency keys for sports telemetry', () => {
    const payload = {
      matchId: 'match_arsenal_chelsea_101',
      sportSlug: 'football',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      score: '1 - 0',
      player: 'Bukayo Saka',
      sessionHash: 'sess_abc123',
    };

    const key1 = producer.generateIdempotencyKey('goalmills', 'match_goal', payload);
    const key2 = producer.generateIdempotencyKey('goalmills', 'match_goal', payload);

    expect(key1).toBeDefined();
    expect(typeof key1).toBe('string');
    expect(key1).toBe(key2);
  });

  it('should publish a live match goal event with correct stream envelope format', async () => {
    const liveMoment = {
      matchId: 'match_999',
      sport: 'football' as const,
      league: 'Premier League',
      homeTeam: 'Liverpool',
      awayTeam: 'Man City',
      score: '2 - 1',
      minute: "78'",
      eventType: 'goal' as const,
      headline: 'GOAL! Stunner from outside the box',
      detail: 'Curled into the top right corner.',
      timestamp: new Date().toISOString(),
    };

    const envelope = await producer.publishLiveMatchMoment(liveMoment, 'goalmills');

    expect(envelope).toBeDefined();
    expect(envelope.eventId).toMatch(/^evt_/);
    expect(envelope.eventType).toBe('match_goal');
    expect(envelope.priority).toBe('realtime');
    expect(envelope.payload.homeTeam).toBe('Liverpool');
    expect(envelope.payload.score).toBe('2 - 1');
  });

  it('should process sports stream events through the worker and detect duplicates', async () => {
    const envelope = await producer.publishEvent(
      'cricket_wicket',
      {
        matchId: 'cricket_ind_aus_01',
        sportSlug: 'cricket',
        player: 'Virat Kohli',
        actionDetail: 'Caught behind on 89',
      },
      { tenantSlug: 'goalmills', idempotencyKey: `test_idemp_${Date.now()}` }
    );

    // First process: should succeed
    const res1 = await worker.processEvent(envelope);
    expect(res1.success).toBe(true);
    expect(res1.duplicate).toBeUndefined();

    // Second process with same idempotency key: should detect duplicate
    const res2 = await worker.processEvent(envelope);
    expect(res2.success).toBe(true);
    expect(res2.duplicate).toBe(true);
  });

  it('should collect pipeline diagnostics and throughput metrics', async () => {
    const stats = await worker.getPipelineDiagnostics('goalmills');

    expect(stats).toBeDefined();
    expect(stats.currentEventsPerSec).toBeGreaterThan(0);
    expect(Array.isArray(stats.consumerGroups)).toBe(true);
    expect(stats.consumerGroups.length).toBeGreaterThanOrEqual(2);
    expect(stats.sportTelemetryBreakdown).toBeDefined();
    expect(stats.sportTelemetryBreakdown.football).toBeGreaterThan(0);
  });
});
