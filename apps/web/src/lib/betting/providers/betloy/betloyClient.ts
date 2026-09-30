import { getBetloyConfig } from './betloyConfig';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface BetloyRequestOptions {
  path: string;
  method?: 'GET' | 'POST';
  body?: any;
  retries?: number;
  correlationId?: string;
  timeoutMs?: number;
}

export interface BetloyApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  latencyMs: number;
}

export class BetloyClient {
  private static circuitState: CircuitBreakerState = 'CLOSED';
  private static failureCount = 0;
  private static lastFailureTime = 0;
  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly COOLDOWN_PERIOD_MS = 30000; // 30 seconds

  public static getCircuitBreakerStatus(): {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime: number;
  } {
    // Check if cooldown elapsed to transition from OPEN to HALF_OPEN
    if (this.circuitState === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.COOLDOWN_PERIOD_MS) {
        this.circuitState = 'HALF_OPEN';
      }
    }
    return {
      state: this.circuitState,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  public static resetCircuitBreaker(): void {
    this.circuitState = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  private static recordSuccess(): void {
    if (this.circuitState === 'HALF_OPEN') {
      this.circuitState = 'CLOSED';
    }
    this.failureCount = 0;
  }

  private static recordFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.circuitState = 'OPEN';
    }
  }

  /**
   * Executes a resilient HTTP request against Betloy with circuit breaker, timeout, and retry logic.
   */
  public async request<T = any>(options: BetloyRequestOptions): Promise<BetloyApiResponse<T>> {
    const config = getBetloyConfig();
    const correlationId = options.correlationId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timeoutMs = options.timeoutMs || config.timeoutMs;
    const method = options.method || 'GET';
    const retries = options.retries ?? (method === 'GET' ? 2 : 0);

    // 1. Circuit Breaker Check
    const cbStatus = BetloyClient.getCircuitBreakerStatus();
    if (cbStatus.state === 'OPEN') {
      return {
        success: false,
        error: 'Betloy service temporarily suspended (Circuit Breaker OPEN). Degrading gracefully.',
        statusCode: 503,
        latencyMs: 0,
      };
    }

    const url = `${config.apiUrl}${options.path.startsWith('/') ? '' : '/'}${options.path}`;
    let attempt = 0;
    let lastError = 'Unknown error';
    let lastStatus = 500;
    const startTime = Date.now();

    while (attempt <= retries) {
      attempt++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
            'X-Correlation-ID': correlationId,
            'User-Agent': 'GoalMills-BettingEngine/1.0',
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);
        const latencyMs = Date.now() - startTime;
        lastStatus = response.status;

        // Handle Rate Limiting (429)
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
          BetloyClient.recordFailure();
          if (attempt <= retries) {
            await new Promise((res) => setTimeout(res, retryAfter * 1000));
            continue;
          }
          return {
            success: false,
            error: 'Betloy rate limit exceeded. Please try again shortly.',
            statusCode: 429,
            latencyMs,
          };
        }

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          lastError = `Betloy HTTP ${response.status}: ${errText.substring(0, 200)}`;
          if (response.status >= 500) {
            BetloyClient.recordFailure();
          }
          if (attempt <= retries) {
            const backoff = Math.pow(2, attempt) * 200;
            await new Promise((res) => setTimeout(res, backoff));
            continue;
          }
          return {
            success: false,
            error: lastError,
            statusCode: response.status,
            latencyMs,
          };
        }

        const data = (await response.json()) as T;
        BetloyClient.recordSuccess();

        return {
          success: true,
          data,
          statusCode: 200,
          latencyMs,
        };
      } catch (err: any) {
        clearTimeout(timer);
        const isTimeout = err.name === 'AbortError';
        lastError = isTimeout ? `Betloy request timed out after ${timeoutMs}ms` : (err.message || 'Network error');
        lastStatus = isTimeout ? 504 : 502;
        BetloyClient.recordFailure();

        if (attempt <= retries) {
          const backoff = Math.pow(2, attempt) * 200;
          await new Promise((res) => setTimeout(res, backoff));
          continue;
        }
      }
    }

    return {
      success: false,
      error: lastError,
      statusCode: lastStatus,
      latencyMs: Date.now() - startTime,
    };
  }
}
