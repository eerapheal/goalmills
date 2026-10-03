import type { MailerDispatchRequest, MailerDispatchResponse } from './contracts';

export interface MailerClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface MailerHealthStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  uptimeSeconds?: number;
  activeWorkers?: number;
  queueDepth?: number;
}

/**
 * Type-safe HTTP Client for the Go 1.22 Mailer Microservice.
 * Enforces Blueprint Section 5.1 contract boundary.
 */
export class MailerServiceClient {
  private baseUrl: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(config?: MailerClientConfig) {
    this.baseUrl = (config?.baseUrl || process.env.MAILER_SERVICE_URL || 'http://localhost:8085').replace(/\/$/, '');
    this.timeoutMs = config?.timeoutMs ?? 10000;
    this.maxRetries = config?.maxRetries ?? 2;
  }

  async checkHealth(): Promise<MailerHealthStatus> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timer);

      if (!res.ok) {
        return { status: 'degraded', service: 'goalmills-mailer' };
      }

      const data = await res.json();
      return {
        status: 'ok',
        service: data.service || 'goalmills-mailer',
        activeWorkers: data.activeWorkers,
        queueDepth: data.queueDepth,
      };
    } catch {
      return { status: 'down', service: 'goalmills-mailer' };
    }
  }

  async dispatch(request: MailerDispatchRequest): Promise<MailerDispatchResponse> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const res = await fetch(`${this.baseUrl}/api/dispatch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (res.status === 202 || res.status === 200) {
          const body = (await res.json()) as Partial<MailerDispatchResponse>;
          return {
            jobId: request.jobId,
            status: 'accepted',
            totalQueued: body.totalQueued ?? request.recipients.length,
            acceptedAt: new Date().toISOString(),
          };
        }

        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.text();
          return {
            jobId: request.jobId,
            status: 'rejected',
            totalQueued: 0,
            acceptedAt: new Date().toISOString(),
            error: `HTTP ${res.status}: ${errBody}`,
          };
        }

        // For 5xx errors, retry
        attempt++;
        if (attempt <= this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 200));
        }
      } catch (err: any) {
        lastError = err;
        attempt++;
        if (attempt <= this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 200));
        }
      }
    }

    return {
      jobId: request.jobId,
      status: 'rejected',
      totalQueued: 0,
      acceptedAt: new Date().toISOString(),
      error: lastError?.message || 'Dispatch failed after retries',
    };
  }
}

export const mailerClient = new MailerServiceClient();
