/**
 * GoalMills Social Engine Microservice Client
 * Connects Admin Hub & Content Distribution Studio directly with the Social Engine
 */

export interface SocialEngineStatus {
  online: boolean;
  service?: string;
  uptime?: number;
  platforms?: Array<{
    name: string;
    displayName: string;
    isConfigured: boolean;
  }>;
  scheduledTasks?: Array<{
    id: string;
    name: string;
    cronExpression: string;
    enabled: boolean;
  }>;
  metrics?: {
    totalPosts: number;
    postsToday: number;
  };
  error?: string;
}

export interface PlatformDetail {
  platform: string;
  displayName: string;
  isConfigured: boolean;
  enabled: boolean;
  healthStatus: 'healthy' | 'unconfigured' | 'error' | 'degraded';
  lastSuccessAt?: string;
  lastError?: string;
  enabledPostTypes?: string[];
}

export interface DispatchResponse {
  success: boolean;
  summary?: {
    totalAttempted: number;
    successCount: number;
    failedCount: number;
    imageUrl?: string;
    results: Record<
      string,
      {
        success: boolean;
        platform: string;
        platformPostId?: string;
        url?: string;
        error?: string;
      }
    >;
  };
  error?: string;
}

class SocialEngineClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.SOCIAL_ENGINE_URL ||
      process.env.NEXT_PUBLIC_SOCIAL_ENGINE_URL ||
      'http://localhost:4000';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Health / Status of Social Engine Microservice
   */
  async getStatus(): Promise<SocialEngineStatus> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${this.baseUrl}/api/status`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return { online: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      return {
        online: true,
        service: data.service,
        uptime: data.uptime,
        platforms: data.platforms,
        scheduledTasks: data.scheduledTasks,
        metrics: data.metrics,
      };
    } catch (err: any) {
      return {
        online: false,
        error: err.name === 'AbortError' ? 'Connection timed out' : err.message || 'Offline',
      };
    }
  }

  /**
   * Get detailed status of all 7 platform adapters
   */
  async getPlatforms(): Promise<{ success: boolean; platforms: PlatformDetail[]; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/platforms`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return { success: false, platforms: [], error: err.message };
    }
  }

  /**
   * Test a platform adapter connection
   */
  async testPlatform(
    platform: string
  ): Promise<{ success: boolean; platform: string; displayName?: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/test-platform/${encodeURIComponent(platform)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, platform, error: err.message };
    }
  }

  /**
   * Dispatch manual or automated content across social channels
   */
  async dispatch(payload: {
    text: string;
    headline?: string;
    linkUrl?: string;
    imageUrl?: string;
    postType?: string;
    platforms: string[] | 'all';
    matchId?: string;
    homeTeam?: string;
    awayTeam?: string;
  }): Promise<DispatchResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to dispatch via social engine',
      };
    }
  }

  /**
   * Trigger an automated AI social workflow on demand
   */
  async triggerWorkflow(
    workflow: 'weekly-fixtures' | 'pre-match' | 'live-poll' | 'post-match',
    options?: { leagueId?: number; platforms?: string[] | 'all' }
  ): Promise<{ success: boolean; workflow: string; result?: any; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/trigger/${workflow}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      });

      return await res.json();
    } catch (err: any) {
      return { success: false, workflow, error: err.message };
    }
  }

  /**
   * Get audit log of recent social posts from social engine
   */
  async getPosts(params?: {
    page?: number;
    limit?: number;
    platform?: string;
    status?: string;
  }): Promise<{ success: boolean; posts: any[]; pagination?: any; error?: string }> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.platform) query.set('platform', params.platform);
      if (params?.status) query.set('status', params.status);

      const res = await fetch(`${this.baseUrl}/api/posts?${query.toString()}`, {
        cache: 'no-store',
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, posts: [], error: err.message };
    }
  }

  /**
   * Retry a failed post
   */
  async retryPost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/posts/${encodeURIComponent(postId)}/retry`, {
        method: 'POST',
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const socialEngineClient = new SocialEngineClient();
export default socialEngineClient;
