# GoalMills — Sports Provider Resilience & Fault Tolerance Strategy

**Version:** 2.0.0  

---

## 1. Resilience Features

### 1.1 Outbound Rate-Limit Spacer (250ms Gap Protection)
To protect against sudden burst 429 errors from rate-limited upstream providers:
```ts
let lastFetchTime = 0;
const MIN_FETCH_GAP_MS = 250;

async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLast = now - lastFetchTime;
  if (timeSinceLast < MIN_FETCH_GAP_MS) {
    const delay = MIN_FETCH_GAP_MS - timeSinceLast;
    lastFetchTime = now + delay;
    await new Promise((resolve) => setTimeout(resolve, delay));
  } else {
    lastFetchTime = Date.now();
  }
  return fetch(url, options);
}
```

### 1.2 Exponential Backoff Retry with Jitter
- **Max Retries:** 3 attempts
- **Delay:** `500ms * attempt`
- **Exclusions:** 4xx errors (e.g. 400, 401, 403, 404) are NOT retried. Only transient 5xx server errors trigger retries.

### 1.3 Circuit Breaker Pattern
- **Failure Threshold:** 5 consecutive upstream failures.
- **Trip Duration:** 30 seconds of provider bypass.
- **Degraded Fallback:** Serves stale cached match data with `isStale: true` and `X-Data-Freshness: STALE`.
- **Auto-Recovery:** Resets consecutive failure counter on the first successful upstream request after timeout expiry.

---

## 2. Sponsorship Telemetry Anti-Abuse System

Public tracking endpoint `POST /api/sponsorships/[id]/track`:
- **Rate Limit:** 20 telemetry events per minute per IP address.
- **Impression Deduplication:** Suppresses duplicate view counts from the same IP within 10 seconds.
- **Campaign State Gate:** Verifies `status === 'active'` and `isDeleted !== true` before database writes.
