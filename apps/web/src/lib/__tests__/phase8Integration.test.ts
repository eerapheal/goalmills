import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import {
  normalizeFootballMatch,
  normalizeCricketMatch,
  ProviderCircuitBreaker,
} from '@goalmills/core-sports';
import {
  CampaignDispatcher,
  verifyMailerWebhookSignature,
  evaluateMailerWebhookEvent,
} from '@goalmills/core-audience';
import {
  formatSocialCopy,
} from '@goalmills/core-content';
import {
  buildCanonicalEventId,
  isValidCanonicalEventId,
} from '@goalmills/core-commercial';
import {
  sanitizeHtml,
  hasMinRole,
  hasPermission,
} from '@goalmills/core-identity';
import {
  CentralizedCacheClient,
} from '@goalmills/infrastructure-redis';
import {
  InMemoryEventDispatcher,
} from '@goalmills/infrastructure-events';

describe('Phase 8: Comprehensive Architecture Integration & Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. SPORTS DOMAIN: Ingestion, Normalization & Caching Resilience
  // =========================================================================
  describe('Flow 1: Sports Domain Ingestion, Normalization & Caching', () => {
    it('normalizes Football upstream payload into canonical UnifiedMatch with status & score state', () => {
      const rawFootball = {
        event_key: 'fb-101',
        event_date: '2026-10-03',
        event_time: '15:00',
        event_home_team: 'Arsenal',
        home_team_key: 'ars-1',
        event_away_team: 'Chelsea',
        away_team_key: 'che-2',
        event_final_result: '3 - 1',
        event_status: 'Finished',
        league_name: 'Premier League',
        league_key: 'pl-39',
        country: 'England',
      };

      const normalized = normalizeFootballMatch(rawFootball);

      expect(normalized.id).toBe('fb-101');
      expect(normalized.sport).toBe('football');
      expect(normalized.status).toBe('FT');
      expect(normalized.score.home).toBe(3);
      expect(normalized.score.away).toBe(1);
      expect(normalized.homeTeam.name).toBe('Arsenal');
      expect(normalized.awayTeam.name).toBe('Chelsea');
      expect(normalized.competition.slug).toBe('premier-league');
    });

    it('normalizes Cricket upstream payload into canonical UnifiedMatch', () => {
      const rawCricket = {
        id: 'crick-555',
        date: '2026-10-03',
        status: 'in_play',
        seriesName: 'T20 World Cup',
        seriesId: 'wc-2026',
        team1: { id: 'ind-1', name: 'India', score: 185 },
        team2: { id: 'aus-2', name: 'Australia', score: 142 },
      };

      const normalized = normalizeCricketMatch(rawCricket);

      expect(normalized.id).toBe('crick-555');
      expect(normalized.sport).toBe('cricket');
      expect(normalized.status).toBe('LIVE');
      expect(normalized.homeTeam.name).toBe('India');
      expect(normalized.awayTeam.name).toBe('Australia');
      expect(normalized.score.home).toBe(185);
      expect(normalized.score.away).toBe(142);
    });

    it('enforces circuit breaker tripping across upstream provider failures', async () => {
      const breaker = new ProviderCircuitBreaker({
        failureThreshold: 3,
        resetTimeoutMs: 1000,
        rateLimitGapMs: 10,
        maxRetries: 0,
      });

      let callCount = 0;
      const failingFetcher = async () => {
        callCount++;
        throw new Error('Upstream 503 Service Unavailable');
      };

      // Trip the breaker with 3 consecutive failures
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFetcher)).rejects.toThrow('Upstream 503');
      }

      expect(breaker.getState()).toBe('OPEN');

      // Subsequent call in OPEN state trips fallback or throws circuit open
      await expect(breaker.execute(failingFetcher)).rejects.toThrow(/Circuit breaker is OPEN/i);
      expect(callCount).toBe(3); // Upstream was not called again
    });

    it('coalesces concurrent queries and caches matches via CentralizedCacheClient', async () => {
      const cache = new CentralizedCacheClient({ defaultTtlSeconds: 60 });
      let expensiveFetcherCalls = 0;

      const fetchMatch = async () => {
        expensiveFetcherCalls++;
        await new Promise((r) => setTimeout(r, 20));
        return { matchId: 'm-99', score: '2-1' };
      };

      // Concurrent stampede call: both execute during the same single-flight
      const [res1, res2] = await Promise.all([
        cache.cacheAside('match:m-99', fetchMatch),
        cache.cacheAside('match:m-99', fetchMatch),
      ]);

      expect(res1).toEqual({ matchId: 'm-99', score: '2-1' });
      expect(res2).toEqual({ matchId: 'm-99', score: '2-1' });
      expect(expensiveFetcherCalls).toBe(1); // Single-flight stampede protection

      // Subsequent cached lookup
      const cached = await cache.get<typeof res1>('match:m-99');
      expect(cached).toEqual({ matchId: 'm-99', score: '2-1' });
    });
  });

  // =========================================================================
  // 2. AUDIENCE DOMAIN: Deliverability, Gating & HMAC Webhook Processing
  // =========================================================================
  describe('Flow 2: Audience & Newsletter Deliverability Gating', () => {
    it('gates campaign recipients against reputation risk and suppression before passing to Go Mailer', async () => {
      const mockMailerClient = {
        dispatch: vi.fn().mockResolvedValue({
          jobId: 'job-123',
          acceptedCount: 1,
          rejectedCount: 0,
          queuedAt: new Date().toISOString(),
        }),
        getJobStatus: vi.fn(),
        checkHealth: vi.fn(),
      };

      const dispatcher = new CampaignDispatcher(mockMailerClient as any);

      const subscribers: any[] = [
        { id: '1', email: 'good@example.com', emailNormalized: 'good@example.com', emailHealthScore: 90, status: 'CONFIRMED' },
        { id: '2', email: 'risky@example.com', emailNormalized: 'risky@example.com', emailHealthScore: 20, status: 'CONFIRMED' }, // Health score < 40 filtered
        { id: '3', email: 'bounced@example.com', emailNormalized: 'bounced@example.com', emailHealthScore: 80, status: 'HARD_BOUNCE' }, // Filtered
      ];

      const result = await dispatcher.dispatchCampaign({
        campaignId: 'camp-oct-03',
        subject: 'Matchday Brief',
        htmlBody: '<p>Top goals</p>',
        subscribers,
      });

      expect(result.totalEligible).toBe(1);
      expect(result.totalSuppressed).toBe(2);
      expect(mockMailerClient.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients: [
            expect.objectContaining({
              email: 'good@example.com',
            }),
          ],
        })
      );
    });

    it('validates HMAC-SHA256 signatures on incoming mailer webhooks and evaluates event state transitions', () => {
      const secret = 'super-secret-key-12345';
      const rawPayload = JSON.stringify({
        jobId: 'job-123',
        recipientEmail: 'fan@goalmills.com',
        eventType: 'bounce_hard',
        timestamp: Date.now(),
      });

      const validSignature = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

      // 1. Valid signature check
      expect(verifyMailerWebhookSignature(rawPayload, validSignature, secret)).toBe(true);

      // 2. Tampered signature check
      const tamperedSignature = 'deadbeef000111222333444555666777';
      expect(verifyMailerWebhookSignature(rawPayload, tamperedSignature, secret)).toBe(false);

      // 3. Webhook event evaluation
      const transition = evaluateMailerWebhookEvent(JSON.parse(rawPayload));
      expect(transition.email).toBe('fan@goalmills.com');
      expect(transition.newStatus).toBe('HARD_BOUNCE');
      expect(transition.healthScoreDelta).toBe(-50);
      expect(transition.incrementBounceCount).toBe('hard');
    });
  });

  // =========================================================================
  // 3. COMMERCIAL DOMAIN: Event Canonicalization & Wagering Rules
  // =========================================================================
  describe('Flow 3: Commercial Betting Event ID Resolution', () => {
    it('generates consistent canonical event ID adhering to gm_event_{sport}_{cleanId}', () => {
      const eventId = buildCanonicalEventId('football', 'pl_match_101');

      expect(eventId).toBe('gm_event_football_pl_match_101');
      expect(isValidCanonicalEventId(eventId)).toBe(true);
      expect(isValidCanonicalEventId('invalid-event-id')).toBe(false);
    });
  });

  // =========================================================================
  // 4. CONTENT & EDITORIAL DOMAIN: Multi-Platform Social Syndication
  // =========================================================================
  describe('Flow 4: Content Distribution & Social Copy Generation', () => {
    it('formats social copy tailored to platform constraints', () => {
      const article = {
        id: 'art-1',
        title: 'Bellingham Scores Decisive Stunner in El Clásico',
        excerpt: 'Real Madrid secure three points in a dramatic 2-1 thriller at the Bernabéu.',
        slug: 'bellingham-scores-decisive-stunner',
        sportSlug: 'football',
        tags: ['RealMadrid', 'LaLiga'],
      };

      // Twitter: Under 280 chars with link and hashtags
      const twitterCopy = formatSocialCopy(article, 'twitter');
      expect(twitterCopy.text.length).toBeLessThanOrEqual(280);
      expect(twitterCopy.text).toContain('https://goalmills.com/news/bellingham-scores-decisive-stunner');
      expect(twitterCopy.hashtags).toContain('#RealMadrid');

      // Telegram: Bold markdown title and call to action
      const telegramCopy = formatSocialCopy(article, 'telegram');
      expect(telegramCopy.text).toContain('*Bellingham Scores Decisive Stunner in El Clásico*');
      expect(telegramCopy.text).toContain('👉 Read full story:');

      // WhatsApp: Sports update header
      const whatsAppCopy = formatSocialCopy(article, 'whatsapp');
      expect(whatsAppCopy.text).toContain('*GoalMills Sports Update*');
    });
  });

  // =========================================================================
  // 5. IDENTITY & SECURITY: RBAC & Input Sanitization
  // =========================================================================
  describe('Flow 5: Identity, RBAC & Sanitization', () => {
    it('sanitizes malicious script injections from user generated content', () => {
      const dirtyHtml = '<p>Great match! <script>alert("hacked")</script><b>Check it out</b></p>';
      const cleanHtml = sanitizeHtml(dirtyHtml);

      expect(cleanHtml).not.toContain('<script>');
      expect(cleanHtml).not.toContain('alert');
      expect(cleanHtml).toContain('<p>Great match! <b>Check it out</b></p>');
    });

    it('enforces RBAC hierarchy and permission evaluation correctly', () => {
      expect(hasMinRole('super-admin', 'editor')).toBe(true);
      expect(hasMinRole('editor', 'staff')).toBe(true);
      expect(hasMinRole('staff', 'editor')).toBe(false);

      expect(hasPermission('editor', 'articles:publish')).toBe(true);
      expect(hasPermission('staff', 'articles:publish')).toBe(false);
      expect(hasPermission('user', 'articles:read')).toBe(true);
    });
  });

  // =========================================================================
  // 6. INFRASTRUCTURE EVENTS: Decoupled Domain Event Dispatching
  // =========================================================================
  describe('Flow 6: Domain Event Dispatching & Correlation Tracing', () => {
    it('dispatches typed domain events to registered handlers asynchronously', async () => {
      const dispatcher = new InMemoryEventDispatcher();
      const receivedEvents: any[] = [];

      dispatcher.subscribe('sports.match.live_score_updated', (event) => {
        receivedEvents.push(event);
      });

      await dispatcher.publish({
        eventId: 'evt-101',
        eventType: 'sports.match.live_score_updated',
        source: 'sports-engine',
        correlationId: 'req-trace-abc1234',
        timestamp: new Date(),
        payload: {
          matchId: 'fb-101',
          sport: 'football',
          homeScore: 3,
          awayScore: 1,
        },
      });

      expect(receivedEvents.length).toBe(1);
      expect(receivedEvents[0].source).toBe('sports-engine');
      expect(receivedEvents[0].correlationId).toBe('req-trace-abc1234');
      expect(receivedEvents[0].payload.homeScore).toBe(3);
    });
  });
});
