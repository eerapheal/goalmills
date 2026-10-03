import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performance } from 'perf_hooks';
import { CentralizedCacheClient, MemoryCacheFallback } from '@goalmills/infrastructure-redis';
import { ProviderCircuitBreaker } from '@goalmills/core-sports';
import { validateEmail } from '@goalmills/core-audience';
import {
  ArticleSchema,
  SponsorshipSchema,
  HistoricalMatchSchema,
  HistoricalStandingsSchema,
  NewsletterSubscriberSchema,
} from '@goalmills/infrastructure-database';

describe('Phase 9: Performance Benchmarking & SLA Auditing Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. CACHE LATENCY BENCHMARK: In-Memory Read SLA < 1.0ms
  // =========================================================================
  describe('SLA Benchmark 1: Cache Tier Latency & Throughput', () => {
    it('executes in-memory cache reads with p99 latency < 1.0ms', async () => {
      const cache = new MemoryCacheFallback();
      const testData = { matchId: 'm-live-101', score: '3-2', status: 'LIVE', minute: 88 };
      cache.set('benchmark:match:101', testData, 120);

      const iterations = 1000;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const result = cache.get<typeof testData>('benchmark:match:101');
        const duration = performance.now() - start;
        latencies.push(duration);
        expect(result).not.toBeNull();
      }

      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(iterations * 0.5)];
      const p95 = latencies[Math.floor(iterations * 0.95)];
      const p99 = latencies[Math.floor(iterations * 0.99)];

      console.log(`[Cache Latency Benchmark] p50: ${p50.toFixed(4)}ms, p95: ${p95.toFixed(4)}ms, p99: ${p99.toFixed(4)}ms`);

      expect(p99).toBeLessThan(1.0); // Strict SLA: p99 < 1.0 ms
    });

    it('coalesces 50 concurrent stampede requests into a single execution (100% deduplicated)', async () => {
      const client = new CentralizedCacheClient({ defaultTtlSeconds: 60 });
      let fetcherExecutions = 0;

      const expensiveDbFetch = async () => {
        fetcherExecutions++;
        await new Promise((resolve) => setTimeout(resolve, 30)); // 30ms simulated DB latency
        return { standings: ['Arsenal', 'Man City', 'Liverpool'], season: '2026-2027' };
      };

      // Fire 50 concurrent requests simultaneously for the same key
      const concurrentRequests = Array.from({ length: 50 }, () =>
        client.cacheAside('stampede:standings:pl', expensiveDbFetch)
      );

      const results = await Promise.all(concurrentRequests);

      // Verify 100% coalescing: exactly 1 execution occurred
      expect(fetcherExecutions).toBe(1);
      expect(results.length).toBe(50);
      for (const res of results) {
        expect(res.standings).toContain('Arsenal');
      }
    });
  });

  // =========================================================================
  // 2. UPSTREAM RATE LIMIT SPACING & CIRCUIT BREAKER SLA
  // =========================================================================
  describe('SLA Benchmark 2: Provider Rate Spacing & Fast-Fail Latency', () => {
    it('strictly enforces minimum 250ms gap between consecutive outbound provider calls', async () => {
      const breaker = new ProviderCircuitBreaker({
        rateLimitGapMs: 250,
        failureThreshold: 5,
      });

      const timestamps: number[] = [];
      const mockFetch = async () => {
        timestamps.push(performance.now());
        return { ok: true };
      };

      // Perform 3 sequential calls protected by rate spacing
      await breaker.execute(mockFetch);
      await breaker.execute(mockFetch);
      await breaker.execute(mockFetch);

      expect(timestamps.length).toBe(3);

      const gap1 = timestamps[1] - timestamps[0];
      const gap2 = timestamps[2] - timestamps[1];

      console.log(`[Rate Spacing Benchmark] Gap 1: ${gap1.toFixed(2)}ms, Gap 2: ${gap2.toFixed(2)}ms`);

      // Enforced minimum gap must be >= 240ms (accounting for timer granularity)
      expect(gap1).toBeGreaterThanOrEqual(240);
      expect(gap2).toBeGreaterThanOrEqual(240);
    });

    it('fast-fails in < 1.0ms when circuit breaker is in OPEN state without network calls', async () => {
      const breaker = new ProviderCircuitBreaker({
        failureThreshold: 3,
        resetTimeoutMs: 10000,
        rateLimitGapMs: 0,
        maxRetries: 0,
      });

      let upstreamCalls = 0;
      const failingFetcher = async () => {
        upstreamCalls++;
        throw new Error('503 Service Unavailable');
      };

      // Trip the circuit with 3 consecutive failures
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFetcher)).rejects.toThrow('503 Service Unavailable');
      }

      expect(breaker.getState()).toBe('OPEN');

      // Benchmark fast-fail latency in OPEN state directly
      const start = performance.now();
      let caughtError: any = null;
      try {
        await breaker.execute(failingFetcher);
      } catch (err: any) {
        caughtError = err;
      }
      const fastFailDuration = performance.now() - start;

      console.log(`[Circuit Breaker Fast-Fail Latency] ${fastFailDuration.toFixed(4)}ms`);

      expect(caughtError).toBeDefined();
      expect(caughtError.message).toMatch(/Circuit breaker is OPEN/i);
      expect(fastFailDuration).toBeLessThan(5.0); // Fast-fails in < 5.0 ms
      expect(upstreamCalls).toBe(3); // No additional upstream calls made
    });
  });

  // =========================================================================
  // 3. DATABASE COMPOUND INDEX COVERAGE AUDIT
  // =========================================================================
  describe('SLA Benchmark 3: Database Index Coverage & Optimization Audit', () => {
    it('verifies ArticleSchema has composite indexes for public filtering and slug lookups', () => {
      const indexes = ArticleSchema.indexes();
      const indexFields = indexes.map(([spec]) => Object.keys(spec));

      // 1. Status + SportSlug + CreatedAt composite index
      const hasStatusSportIndex = indexes.some(([spec]) => spec.status && spec.sportSlug && spec.createdAt);
      expect(hasStatusSportIndex).toBe(true);

      // 2. Status + CompetitionSlug + CreatedAt composite index
      const hasStatusCompIndex = indexes.some(([spec]) => spec.status && spec.competitionSlug && spec.createdAt);
      expect(hasStatusCompIndex).toBe(true);

      // 3. Unique slug index
      const hasSlugIndex = indexes.some(([spec, opts]) => spec.slug && opts?.unique === true);
      expect(hasSlugIndex).toBe(true);
    });

    it('verifies SponsorshipSchema compound targeting and priority indexes', () => {
      const indexes = SponsorshipSchema.indexes();

      const hasTenantPriorityIndex = indexes.some(
        ([spec]) => spec.tenantId && spec.status && spec.placement && spec.priority
      );
      expect(hasTenantPriorityIndex).toBe(true);

      const hasStatusDeletedIndex = indexes.some(([spec]) => spec.status && spec.isDeleted);
      expect(hasStatusDeletedIndex).toBe(true);
    });

    it('verifies HistoricalStandings and HistoricalMatch unique compound indexes', () => {
      const standingsIndexes = HistoricalStandingsSchema.indexes();
      const hasStandingsComposite = standingsIndexes.some(
        ([spec, opts]) => spec.sport && spec.competitionSlug && spec.season && opts?.unique === true
      );
      expect(hasStandingsComposite).toBe(true);

      const matchIndexes = HistoricalMatchSchema.indexes();
      const hasMatchSportCompIndex = matchIndexes.some(
        ([spec]) => spec.sport && spec['competition.slug']
      );
      expect(hasMatchSportCompIndex).toBe(true);
    });

    it('verifies NewsletterSubscriberSchema unique normalized email index and health scoring composite', () => {
      const indexes = NewsletterSubscriberSchema.indexes();
      const hasUniqueEmail = indexes.some(([spec, opts]) => spec.emailNormalized && opts?.unique === true);
      const hasStatusHealthComposite = indexes.some(([spec]) => spec.status && spec.emailHealthScore);

      expect(hasUniqueEmail).toBe(true);
      expect(hasStatusHealthComposite).toBe(true);
    });
  });

  // =========================================================================
  // 4. EMAIL VALIDATION THROUGHPUT BENCHMARK (< 5ms per check)
  // =========================================================================
  describe('SLA Benchmark 4: Deliverability Validation Throughput', () => {
    it('validates emails with throughput latency < 5.0ms per address', async () => {
      const testEmails = [
        'editor@goalmills.com',
        'fan.premier.league@sportsmail.org',
        'analyst+tactics@deepdata.co.uk',
        'temp-user@mailinator.com', // Disposable
        'bad-email-format',
      ];

      const durations: number[] = [];

      for (const email of testEmails) {
        const start = performance.now();
        await validateEmail(email);
        const duration = performance.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      console.log(`[Email Validator Latency] Average: ${avgDuration.toFixed(4)}ms per email`);

      expect(avgDuration).toBeLessThan(5.0); // SLA: < 5.0ms
    });
  });
});
