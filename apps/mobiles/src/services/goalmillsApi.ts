import { BlogPost, Category, VideoHighlight } from '@goalmills/types';
import { mobileCache } from '../lib/redisCache';

const BASE_URL = 'https://goalmills-web.vercel.app/api';

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
  getNews: async (params?: NewsQueryParams): Promise<BlogPost[]> => {
    const cacheKey = `mobile:news:${JSON.stringify(params || {})}`;
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

      const response = await fetch(url.toString());
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
    const cacheKey = `mobile:news:${id}`;
    const cached = await mobileCache.get<BlogPost>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/news/${id}`);
      if (response.ok) {
        const item: BlogPost = await response.json();
        if (item) await mobileCache.set(cacheKey, item, 300); // 5 min TTL
        return item;
      }
      const all = await fetch(`${BASE_URL}/news`);
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
    const cacheKey = 'mobile:categories';
    const cached = await mobileCache.get<Category[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/categories`);
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
    const cacheKey = 'mobile:videos';
    const cached = await mobileCache.get<VideoHighlight[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/videos`);
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
    const cacheKey = `mobile:videos:${id}`;
    const cached = await mobileCache.get<VideoHighlight>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL}/videos/${id}`);
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

  incrementNewsView: async (id: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/news/${id}/view`, { method: 'POST' });
    } catch {}
  },

  incrementVideoView: async (id: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/videos/${id}/view`, { method: 'POST' });
    } catch {}
  },
};
