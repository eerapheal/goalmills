import { BlogPost, Category, VideoHighlight } from '@goalmills/types';

const BASE_URL = 'https://goalmills-web.vercel.app/api';

export interface NewsQueryParams {
  filter?: string;
  category?: string;
  search?: string;
  team?: string;
  ids?: string;
  exclude?: string;
  sort?: string;
  limit?: number;
}

export const goalmillsApi = {
  getNews: async (params?: NewsQueryParams): Promise<BlogPost[]> => {
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
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  },

  getNewsById: async (id: string): Promise<BlogPost | null> => {
    try {
      const response = await fetch(`${BASE_URL}/news/${id}`);
      if (response.ok) {
        return await response.json();
      }
      // Fallback
      const all = await fetch(`${BASE_URL}/news`);
      if (all.ok) {
        const list: BlogPost[] = await all.json();
        return list.find((n) => n._id === id) || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching news by id:', error);
      return null;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await fetch(`${BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  incrementNewsView: async (id: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/news/${id}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  },

  getVideos: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/videos`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      return await response.json();
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  },

  getVideoById: async (id: string): Promise<any | null> => {
    try {
      const response = await fetch(`${BASE_URL}/videos`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      const videos: any[] = await response.json();
      return videos.find((v) => v._id === id) || null;
    } catch (error) {
      console.error('Error fetching video by id:', error);
      return null;
    }
  },
};
