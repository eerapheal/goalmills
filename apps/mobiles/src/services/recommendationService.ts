import { RecommendationCandidate, RecommendationContext, RecommendationType } from '@goalmills/types';
import { newsHistoryUtil } from '../utils/newsHistory';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://goalmills.com/api';

export interface MobileRecParams {
  context?: RecommendationContext;
  type?: RecommendationType;
  currentId?: string;
  sportSlug?: string;
  categorySlug?: string;
  teamSlug?: string;
  limit?: number;
}

export const mobileRecommendationService = {
  /**
   * Fetches personalized & contextual recommendations for mobile screens
   */
  getRecommendations: async (params: MobileRecParams = {}): Promise<RecommendationCandidate[]> => {
    const {
      context = 'mobile_feed',
      type = 'article',
      currentId,
      sportSlug,
      categorySlug,
      teamSlug,
      limit = 5,
    } = params;

    const favoriteTeams = newsHistoryUtil.getFavoriteTeams();
    const favoritesQuery = favoriteTeams.length > 0 ? favoriteTeams.join(',') : '';

    try {
      const urlParams = new URLSearchParams({
        context,
        type,
        limit: limit.toString(),
      });
      if (currentId) urlParams.set('currentId', currentId);
      if (sportSlug) urlParams.set('sport', sportSlug);
      if (categorySlug) urlParams.set('category', categorySlug);
      if (teamSlug) urlParams.set('team', teamSlug);
      if (favoritesQuery) urlParams.set('favorites', favoritesQuery);

      const res = await fetch(`${BASE_URL}/recommendations?${urlParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': 'goalmills',
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.recommendations) && json.recommendations.length > 0) {
          return json.recommendations;
        }
      }
    } catch (err) {
      console.log('[Mobile Rec] Network fetch failed, falling back to local history:', err);
    }

    // Offline / Local Fallback from newsHistoryUtil
    const recent = newsHistoryUtil.getRecentlyViewed();
    if (recent.length > 0) {
      return recent.slice(0, limit).map((r) => ({
        id: r._id,
        type: 'article',
        title: r.title,
        slug: r._id,
        url: `/news/${r._id}`,
        image: r.image,
        sportSlug: sportSlug || 'football',
        categorySlug: r.category || 'general',
        score: 80,
        reasonBadge: '👁️ Recently Viewed',
        algorithm: 'personalized_affinity',
      }));
    }

    return [
      {
        id: 'rec-fallback-1',
        type: 'article',
        title: 'Premier League Title Race & Tactical Breakdown',
        slug: 'pl-title-race',
        url: '/news/pl-title-race',
        sportSlug: 'football',
        score: 95,
        reasonBadge: '🔥 Top Football Intel',
        algorithm: 'trending',
      },
      {
        id: 'rec-fallback-2',
        type: 'article',
        title: 'Cricket World Cup Pitch Report & Player Matchups',
        slug: 'cricket-pitch-report',
        url: '/news/cricket-pitch-report',
        sportSlug: 'cricket',
        score: 85,
        reasonBadge: '🏆 World Cup Special',
        algorithm: 'content_similarity',
      },
    ];
  },

  /**
   * Dispatches recommendation click telemetry
   */
  trackClick: (candidateId: string, candidateType = 'article', context: RecommendationContext = 'mobile_feed') => {
    fetch(`${BASE_URL}/recommendations/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId,
        candidateType,
        context,
        action: 'click',
        tenantSlug: 'goalmills',
      }),
    }).catch(() => {});
  },
};

export default mobileRecommendationService;
