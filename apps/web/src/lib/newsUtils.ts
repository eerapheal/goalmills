export interface RecentlyViewedItem {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  image?: string;
  category?: string;
  viewedAt: number;
}

const RECENTLY_VIEWED_KEY = 'goalmills_recently_viewed_news';
const FAVORITE_TEAMS_KEY = 'goalmills_favorite_teams';

export const POPULAR_TEAMS = [
  'Arsenal',
  'Real Madrid',
  'Manchester City',
  'Chelsea',
  'Liverpool',
  'Barcelona',
  'Bayern Munich',
  'PSG',
  'Juventus',
  'Lakers',
  'Warriors',
  'India',
  'Nigeria',
];

export const NEWS_FILTER_TABS = [
  { id: 'all', label: 'All News', icon: '📰' },
  { id: 'trending', label: '⚡ Trending', icon: '⚡' },
  { id: 'breaking', label: '🔥 Breaking', icon: '🔥' },
  { id: 'favorites', label: '⭐ My Teams', icon: '⭐' },
  { id: 'transfers', label: '🔄 Transfers', icon: '🔄' },
  { id: 'analysis', label: '📊 Tactical Analysis', icon: '📊' },
  { id: 'popular', label: '📈 Most Read', icon: '📈' },
  { id: 'featured', label: "🏆 Editor's Picks", icon: '🏆' },
  { id: 'recent', label: '👁️ Recently Viewed', icon: '👁️' },
];

/**
 * Save article to Recently Viewed list in LocalStorage
 */
export function trackArticleView(article: {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  image?: string;
  category?: string;
}) {
  if (typeof window === 'undefined' || !article._id) return;
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let list: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];

    // Remove existing if already present to move to front
    list = list.filter((item) => item._id !== article._id);

    // Prepend
    list.unshift({
      _id: article._id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      image: article.image,
      category: article.category,
      viewedAt: Date.now(),
    });

    // Keep top 20
    if (list.length > 20) {
      list = list.slice(0, 20);
    }

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving recently viewed article:', err);
  }
}

/**
 * Get recently viewed articles from LocalStorage
 */
export function getRecentlyViewedArticles(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get user favorite teams
 */
export function getUserFavoriteTeams(): string[] {
  if (typeof window === 'undefined') return ['Arsenal', 'Real Madrid'];
  try {
    const raw = localStorage.getItem(FAVORITE_TEAMS_KEY);
    if (!raw) return ['Arsenal', 'Real Madrid'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['Arsenal', 'Real Madrid'];
  } catch {
    return ['Arsenal', 'Real Madrid'];
  }
}

/**
 * Save user favorite teams
 */
export function setUserFavoriteTeams(teams: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify(teams));
  } catch (err) {
    console.error('Error saving favorite teams:', err);
  }
}
