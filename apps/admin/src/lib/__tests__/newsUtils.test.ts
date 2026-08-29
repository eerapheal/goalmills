import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackArticleView,
  getRecentlyViewedArticles,
  getUserFavoriteTeams,
  setUserFavoriteTeams,
  POPULAR_TEAMS,
  NEWS_FILTER_TABS,
} from '../newsUtils';

describe('newsUtils library', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes popular teams and news filter tabs', () => {
    expect(POPULAR_TEAMS.length).toBeGreaterThan(5);
    expect(NEWS_FILTER_TABS.some((tab) => tab.id === 'breaking')).toBe(true);
  });

  it('tracks article views in localStorage and moves newest to front', () => {
    trackArticleView({ _id: '1', title: 'Article 1' });
    trackArticleView({ _id: '2', title: 'Article 2' });

    let history = getRecentlyViewedArticles();
    expect(history.length).toBe(2);
    expect(history[0]._id).toBe('2');

    // Viewing article 1 again moves it to top
    trackArticleView({ _id: '1', title: 'Article 1' });
    history = getRecentlyViewedArticles();
    expect(history[0]._id).toBe('1');
  });

  it('saves and retrieves user favorite teams from localStorage', () => {
    expect(getUserFavoriteTeams()).toEqual(['Arsenal', 'Real Madrid']);

    setUserFavoriteTeams(['Arsenal', 'Barcelona']);
    expect(getUserFavoriteTeams()).toEqual(['Arsenal', 'Barcelona']);
  });
});
