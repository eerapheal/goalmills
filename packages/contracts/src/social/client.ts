import type {
  SocialPublishRequest,
  SocialPublishResponse,
  SocialEngineStatus,
  SocialGraphicOptions,
} from './contracts';

export interface SocialClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
  apiKey?: string;
}

/**
 * Type-safe HTTP Client for the Node.js Social Engine Microservice.
 * Enforces Blueprint Section 5.2 contract boundary.
 */
export class SocialEngineClient {
  private baseUrl: string;
  private timeoutMs: number;
  private apiKey?: string;

  constructor(config?: SocialClientConfig) {
    this.baseUrl = (
      config?.baseUrl ||
      process.env.SOCIAL_ENGINE_URL ||
      'http://localhost:4000'
    ).replace(/\/$/, '');
    this.timeoutMs = config?.timeoutMs ?? 15000;
    this.apiKey = config?.apiKey || process.env.SOCIAL_ENGINE_API_KEY;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['X-API-Key'] = this.apiKey;
    }
    return headers;
  }

  async getStatus(): Promise<SocialEngineStatus> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${this.baseUrl}/api/status`, {
        signal: controller.signal,
        headers: this.getHeaders(),
      });
      clearTimeout(timer);

      if (!res.ok) {
        return { online: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      return {
        online: true,
        service: data.service || 'social-engine',
        uptime: data.uptime,
        platforms: data.platforms || [],
        scheduledTasks: data.scheduledTasks || [],
        metrics: data.metrics,
      };
    } catch (err: any) {
      return { online: false, error: err.message || 'Service unreachable' };
    }
  }

  async publish(request: SocialPublishRequest): Promise<SocialPublishResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/dispatch`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text();
        return {
          id: request.id,
          status: 'failed',
          results: request.platforms.map((platform) => ({
            platform,
            status: 'failed',
            error: `HTTP ${res.status}: ${errText}`,
          })),
          processedAt: new Date().toISOString(),
        };
      }

      const body = await res.json();
      return {
        id: request.id,
        status: body.status || 'completed',
        results: body.results || [],
        processedAt: body.processedAt || new Date().toISOString(),
      };
    } catch (err: any) {
      clearTimeout(timer);
      return {
        id: request.id,
        status: 'failed',
        results: request.platforms.map((platform) => ({
          platform,
          status: 'failed',
          error: err.message || 'Network error during publish',
        })),
        processedAt: new Date().toISOString(),
      };
    }
  }

  async renderGraphic(options: SocialGraphicOptions): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/graphics/render`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(options),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `HTTP ${res.status}: ${errText}` };
      }

      const data = await res.json();
      return { success: true, imageUrl: data.imageUrl };
    } catch (err: any) {
      clearTimeout(timer);
      return { success: false, error: err.message || 'Failed to render graphic' };
    }
  }
}

export const socialEngineClient = new SocialEngineClient();
