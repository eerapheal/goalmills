import { BlogPost, Category, VideoHighlight, Sponsorship } from '@goalmills/types';
import { mobileCache } from '../lib/redisCache';

const BASE_URL = 'https://goalmills-web.vercel.app/api';

let currentTenantSlug = 'goalmills';

export interface TenantConfig {
  tenantId: string;
  tenantSlug: string;
  isDefaultTenant: boolean;
  settings: {
    brandName: string;
    primaryColor: string;
    accentColor: string;
    defaultSport: string;
    supportedSports: string[];
    logoUrl?: string;
  };
  features: Record<string, boolean>;
}

export interface NewsQueryParams {
  filter?: string;
  category?: string;
  sport?: string;
  competition?: string;
  team?: string;
  player?: string;
  articleType?: string;
  author?: string;
  search?: string;
  ids?: string;
  exclude?: string;
  sort?: string;
  limit?: number;
}

export const goalmillsApi = {
  setTenantSlug: (slug: string) => {
    currentTenantSlug = slug || 'goalmills';
  },

  getTenantSlug: () => currentTenantSlug,

  getTenantConfig: async (slug?: string): Promise<TenantConfig | null> => {
    const targetSlug = slug || currentTenantSlug;
    const cacheKey = `mobile:tenant:config:${targetSlug}`;
    const cached = await mobileCache.get<TenantConfig>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/tenants/config`, {
        headers: {
          'x-tenant-slug': targetSlug,
        },
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.success) {
        await mobileCache.set(cacheKey, data, 600); // 10 min TTL
        return data;
      }
      return null;
    } catch (error) {
      console.warn('Error fetching tenant config:', error);
      return null;
    }
  },

  getNews: async (params?: NewsQueryParams): Promise<BlogPost[]> => {
    const cacheKey = `mobile:news:${currentTenantSlug}:${JSON.stringify(params || {})}`;
    const cached = await mobileCache.get<BlogPost[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = new URL(`${BASE_URL}/news`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'x-tenant-slug': currentTenantSlug,
        },
      });
      if (!response.ok) return [];
      const data: BlogPost[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        await mobileCache.set(cacheKey, data, 120); // 2 min TTL
      }
      return data;
    } catch (error) {
      console.warn('Error fetching news:', error);
      return [];
    }
  },

  getNewsById: async (id: string): Promise<BlogPost | null> => {
    const cacheKey = `mobile:news:${currentTenantSlug}:${id}`;
    const cached = await mobileCache.get<BlogPost>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/news/${id}`, {
        headers: {
          'x-tenant-slug': currentTenantSlug,
        },
      });
      if (response.ok) {
        const item: BlogPost = await response.json();
        if (item) await mobileCache.set(cacheKey, item, 300); // 5 min TTL
        return item;
      }
      const all = await fetch(`${BASE_URL}/news`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (all.ok) {
        const list: BlogPost[] = await all.json();
        const found = list.find((n) => n._id === id) || null;
        if (found) await mobileCache.set(cacheKey, found, 300);
        return found;
      }
      return null;
    } catch (error) {
      console.warn('Error fetching news by id:', error);
      return null;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    const cacheKey = `mobile:categories:${currentTenantSlug}`;
    const cached = await mobileCache.get<Category[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/categories`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!response.ok) return [];
      const data: Category[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        await mobileCache.set(cacheKey, data, 600); // 10 min TTL
      }
      return data;
    } catch (error) {
      console.warn('Error fetching categories:', error);
      return [];
    }
  },

  getVideos: async (): Promise<VideoHighlight[]> => {
    const cacheKey = `mobile:videos:${currentTenantSlug}`;
    const cached = await mobileCache.get<VideoHighlight[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/videos`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!response.ok) return [];
      const data: VideoHighlight[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        await mobileCache.set(cacheKey, data, 180); // 3 min TTL
      }
      return data;
    } catch (error) {
      console.warn('Error fetching videos:', error);
      return [];
    }
  },

  getVideoById: async (id: string): Promise<VideoHighlight | null> => {
    const cacheKey = `mobile:videos:${currentTenantSlug}:${id}`;
    const cached = await mobileCache.get<VideoHighlight>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/videos/${id}`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (response.ok) {
        const item: VideoHighlight = await response.json();
        if (item) await mobileCache.set(cacheKey, item, 300);
        return item;
      }
      return null;
    } catch (error) {
      console.warn('Error fetching video by id:', error);
      return null;
    }
  },

  getSponsorships: async (placement?: string, sport?: string): Promise<Sponsorship[]> => {
    const cacheKey = `mobile:sponsorships:${currentTenantSlug}:${placement || 'all'}:${sport || 'all'}`;
    const cached = await mobileCache.get<Sponsorship[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = new URL(`${BASE_URL}/sponsorships`);
      if (placement) url.searchParams.append('placement', placement);
      if (sport) url.searchParams.append('sport', sport);

      const response = await fetch(url.toString(), {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!response.ok) return [];
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.sponsorships || [];
      if (Array.isArray(list) && list.length > 0) {
        await mobileCache.set(cacheKey, list, 120);
        return list;
      }
      return list;
    } catch (error) {
      console.warn('Error fetching sponsorships:', error);
      return [];
    }
  },

  trackSponsorshipEvent: async (id: string, type: 'impression' | 'click' = 'impression'): Promise<void> => {
    if (!id || id.startsWith('default_')) return;
    try {
      await fetch(`${BASE_URL}/sponsorships/${id}/track?type=${type}`, {
        method: 'POST',
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
    } catch {}
  },

  incrementNewsView: async (id: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/news/${id}/view`, {
        method: 'POST',
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
    } catch {}
  },

  incrementVideoView: async (id: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/videos/${id}/view`, {
        method: 'POST',
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
    } catch {}
  },

  getNewsletterPreferences: async (tokenOrEmail: string): Promise<any | null> => {
    try {
      const isEmail = tokenOrEmail.includes('@');
      const param = isEmail ? `email=${encodeURIComponent(tokenOrEmail)}` : `token=${encodeURIComponent(tokenOrEmail)}`;
      const response = await fetch(`${BASE_URL}/newsletter/preferences?${param}`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.subscriber || null;
    } catch (error) {
      console.warn('Error fetching newsletter preferences:', error);
      return null;
    }
  },

  updateNewsletterPreferences: async (payload: {
    token?: string;
    email?: string;
    preferences: {
      sports: string[];
      frequency: string;
      breakingAlerts: boolean;
      transfersOnly: boolean;
      isPaused: boolean;
    };
  }): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/newsletter/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': currentTenantSlug,
        },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (error) {
      console.warn('Error updating newsletter preferences:', error);
      return false;
    }
  },

  trackAnalyticsEvent: async (
    eventType: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': currentTenantSlug,
        },
        body: JSON.stringify({
          eventType,
          entityType,
          entityId,
          metadata: {
            ...metadata,
            device: 'mobile',
          },
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
  },

  search: async (options: {
    query: string;
    sport?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    try {
      const url = new URL(`${BASE_URL}/search`);
      url.searchParams.set('q', options.query);
      if (options.sport && options.sport !== 'all') url.searchParams.set('sport', options.sport);
      if (options.type && options.type !== 'all') url.searchParams.set('type', options.type);
      if (options.page) url.searchParams.set('page', String(options.page));
      if (options.limit) url.searchParams.set('limit', String(options.limit));

      const response = await fetch(url.toString(), {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!response.ok) return { success: false, results: [], total: 0 };
      return await response.json();
    } catch (error) {
      console.warn('Error executing mobile search:', error);
      return { success: false, results: [], total: 0 };
    }
  },

  searchSuggest: async (query: string): Promise<any[]> => {
    try {
      if (!query || query.trim().length < 2) return [];
      const response = await fetch(
        `${BASE_URL}/search/suggest?q=${encodeURIComponent(query.trim())}`,
        {
          headers: { 'x-tenant-slug': currentTenantSlug },
        }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.warn('Error fetching search suggestions:', error);
      return [];
    }
  },

  // ==========================================
  // PHASE 8: SPORTS DATA WAREHOUSE & TELEMETRY
  // ==========================================

  getHeadToHead: async (sport = 'football', teamA = 'arsenal', teamB = 'chelsea'): Promise<any> => {
    const cacheKey = `mobile:warehouse:h2h:${sport}:${teamA}:${teamB}`;
    const cached = await mobileCache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${BASE_URL}/warehouse/h2h?sport=${encodeURIComponent(sport)}&teamA=${encodeURIComponent(teamA)}&teamB=${encodeURIComponent(teamB)}`,
        {
          headers: { 'x-tenant-slug': currentTenantSlug },
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (data.success && data.h2h) {
        await mobileCache.set(cacheKey, data.h2h, 300); // 5 min TTL
        return data.h2h;
      }
      return null;
    } catch (error) {
      console.warn('Error fetching mobile Head-to-Head data:', error);
      return null;
    }
  },

  getTeamTrends: async (sport = 'football', teamSlug: string): Promise<any> => {
    const cacheKey = `mobile:warehouse:trends:${sport}:${teamSlug}`;
    const cached = await mobileCache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${BASE_URL}/warehouse/teams/${encodeURIComponent(teamSlug)}/trends?sport=${encodeURIComponent(sport)}`,
        {
          headers: { 'x-tenant-slug': currentTenantSlug },
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (data.success && data.trends) {
        await mobileCache.set(cacheKey, data.trends, 300);
        return data.trends;
      }
      return null;
    } catch (error) {
      console.warn('Error fetching mobile team trends:', error);
      return null;
    }
  },

  trackSportsTelemetry: async (eventType: string, payload: any): Promise<boolean> => {
    try {
      await fetch(`${BASE_URL}/events/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': currentTenantSlug,
        },
        body: JSON.stringify({
          eventType,
          payload: {
            ...payload,
            device: 'mobile',
          },
        }),
      });
      return true;
    } catch {
      return false;
    }
  },

  // ==========================================
  // PHASE 9: SYNDICATED WIRE & BREAKING FEED
  // ==========================================

  getSyndicatedFeed: async (sport?: string): Promise<any[]> => {
    try {
      const url = new URL(`${BASE_URL}/news`);
      url.searchParams.set('limit', '20');
      if (sport && sport !== 'all') url.searchParams.set('sport', sport);

      const res = await fetch(url.toString(), {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.news || data.result || [];
    } catch (error) {
      console.warn('Error fetching mobile syndicated feed:', error);
      return [];
    }
  },

  // ==========================================
  // PHASE 10: FAN PASS BILLING & MEDIA SUITE
  // ==========================================

  getSubscriptionStatus: async (): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/billing/subscription`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!res.ok) return { tier: 'free', status: 'active' };
      const data = await res.json();
      return data.subscription || { tier: 'free', status: 'active' };
    } catch {
      return { tier: 'free', status: 'active' };
    }
  },

  // ==========================================
  // UNIFIED SPORTS LIVE API PROXIES
  // ==========================================

  getFootballLivescore: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/football?met=Livescore`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data?.result || data?.matches || (Array.isArray(data) ? data : []);
    } catch {
      return [];
    }
  },

  getCricketLivescore: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/cricket?met=Livescore`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data?.result || (Array.isArray(data) ? data : []);
    } catch {
      return [];
    }
  },

  getBasketballLivescore: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/basketball?live=all`, {
        headers: { 'x-tenant-slug': currentTenantSlug },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data?.response || (Array.isArray(data) ? data : []);
    } catch {
      return [];
    }
  },
};

export default goalmillsApi;

