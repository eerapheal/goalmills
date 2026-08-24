import { BlogPost, VideoHighlight } from '@goalmills/types';

// In a real environment, this should be in an .env file or config
// For development with Android emulator, use 10.0.2.2. For iOS, use localhost.
// Or use your local machine's IP address.
const BASE_URL = 'https://goalmills-web.vercel.app/api';

export const goalmillsApi = {
  getNews: async (): Promise<BlogPost[]> => {
    try {
      const response = await fetch(`${BASE_URL}/news`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  },

  getNewsById: async (id: string): Promise<BlogPost | null> => {
    try {
      // The web app doesn't have a specific GET /api/news/[id] route that returns a single item
      // but news/[id]/page.tsx fetches from DB.
      // However, we can fetch all and filter, or we can assume there might be a route.
      // Looking at web app, it seems News.findById(id) is used in the Page, not a shared API.
      // Let's check web routes again to see if there's a dynamic GET.
      const response = await fetch(`${BASE_URL}/news`);
      if (!response.ok) throw new Error('Failed to fetch news');
      const news: BlogPost[] = await response.json();
      return news.find(n => n._id === id) || null;
    } catch (error) {
      console.error('Error fetching news by id:', error);
      return null;
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
      return videos.find(v => v._id === id) || null;
    } catch (error) {
      console.error('Error fetching video by id:', error);
      return null;
    }
  }
};
