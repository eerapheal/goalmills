import { BlogPost } from '@goalmills/types';

export interface MobileRecentlyViewedItem {
  _id: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  viewedAt: number;
}

export const MOBILE_POPULAR_TEAMS = [
  'Arsenal',
  'Real Madrid',
  'Man City',
  'Chelsea',
  'Liverpool',
  'Barcelona',
  'Lakers',
  'India',
  'Nigeria',
];

export const MOBILE_FILTER_TABS = [
  { id: 'all', label: 'All', icon: 'newspaper-outline' },
  { id: 'trending', label: '⚡ Trending', icon: 'flash-outline' },
  { id: 'breaking', label: '🔥 Breaking', icon: 'flame-outline' },
  { id: 'favorites', label: '⭐ Teams', icon: 'star-outline' },
  { id: 'transfers', label: '🔄 Transfers', icon: 'swap-horizontal-outline' },
  { id: 'analysis', label: '📊 Tactics', icon: 'analytics-outline' },
  { id: 'popular', label: '📈 Popular', icon: 'trending-up-outline' },
  { id: 'featured', label: "🏆 Editor's", icon: 'ribbon-outline' },
  { id: 'recent', label: '👁️ Recent', icon: 'time-outline' },
];

let inMemoryHistory: MobileRecentlyViewedItem[] = [];
let inMemoryFavoriteTeams: string[] = ['Arsenal', 'Real Madrid'];

export const newsHistoryUtil = {
  addRecentlyViewed: (post: BlogPost) => {
    if (!post._id) return;
    inMemoryHistory = inMemoryHistory.filter((item) => item._id !== post._id);
    inMemoryHistory.unshift({
      _id: post._id,
      title: post.title,
      excerpt: post.excerpt,
      image: post.image,
      category: post.category,
      viewedAt: Date.now(),
    });
    if (inMemoryHistory.length > 25) {
      inMemoryHistory = inMemoryHistory.slice(0, 25);
    }
  },

  getRecentlyViewed: (): MobileRecentlyViewedItem[] => {
    return inMemoryHistory;
  },

  getFavoriteTeams: (): string[] => {
    return inMemoryFavoriteTeams;
  },

  setFavoriteTeams: (teams: string[]) => {
    inMemoryFavoriteTeams = teams;
  },
};
