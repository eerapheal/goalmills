/**
 * GoalMills Provider Circuit Breaker & Rate-Limit Spacer
 * Corresponds to Blueprint Phase 6 Provider Resilience.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Consecutive failures before tripping
  resetTimeoutMs?: number; // How long to stay OPEN before testing HALF_OPEN
  rateLimitGapMs?: number; // Enforced spacing between outbound requests
  maxRetries?: number; // Max retry attempts for transient errors
}

export class ProviderCircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private lastStateChange: number = Date.now();
  private lastRequestTime: number = 0;

  private failureThreshold: number;
  private resetTimeoutMs: number;
  private rateLimitGapMs: number;
  private maxRetries: number;

  constructor(options?: CircuitBreakerOptions) {
    this.failureThreshold = options?.failureThreshold ?? 3;
    this.resetTimeoutMs = options?.resetTimeoutMs ?? 15000;
    this.rateLimitGapMs = options?.rateLimitGapMs ?? 250;
    this.maxRetries = options?.maxRetries ?? 2;
  }

  getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() - this.lastStateChange > this.resetTimeoutMs) {
      this.state = 'HALF_OPEN';
      this.lastStateChange = Date.now();
    }
    return this.state;
  }

  /**
   * Enforces a minimum gap between requests to prevent upstream 429 rate-limiting.
   */
  private async enforceRateSpacing(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.rateLimitGapMs) {
      const waitTime = this.rateLimitGapMs - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Executes an operation protected by circuit breaking and rate spacing.
   */
  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      if (fallback) {
        return fallback();
      }
      throw new Error('Circuit breaker is OPEN: upstream provider degraded');
    }

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        await this.enforceRateSpacing();
        const result = await operation();
        this.onSuccess();
        return result;
      } catch (err: any) {
        attempt++;
        // Don't retry client errors (401, 403, 404)
        if (err?.status >= 400 && err?.status < 500 && err?.status !== 429) {
          throw err;
        }

        if (attempt > this.maxRetries) {
          this.onFailure();
          if (fallback) {
            return fallback();
          }
          throw err;
        }

        // Exponential backoff with jitter
        const backoff = Math.pow(2, attempt) * 100 + Math.random() * 50;
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }

    throw new Error('Operation failed after retries');
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastStateChange = Date.now();
  }

  private onFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.lastStateChange = Date.now();
    }
  }
}
