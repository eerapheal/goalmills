import dbConnect from '@/lib/db';
import News from '@/models/News';
import Video from '@/models/Video';
import RecommendationConfig from '@/models/RecommendationConfig';
import { cacheGet, cacheSet } from '@/lib/redisCache';
import { getNewsUrl, slugify } from '@/lib/slugUtils';
import type {
  RecommendationCandidate,
  RecommendationContext,
  RecommendationType,
  RecommendationAlgorithmWeights,
  RecommendationAlgorithmType,
} from '@goalmills/types';

export interface GetRecommendationsParams {
  tenantSlug?: string;
  context: RecommendationContext;
  type?: RecommendationType;
  currentId?: string;
  sportSlug?: string;
  categorySlug?: string;
  teamSlug?: string;
  competitionSlug?: string;
  userFavorites?: string[];
  userSports?: string[];
  limit?: number;
}

const DEFAULT_WEIGHTS: RecommendationAlgorithmWeights = {
  sportMatchWeight: 30,
  competitionMatchWeight: 25,
  teamOverlapWeight: 35,
  categoryMatchWeight: 15,
  recencyDecayHours: 48,
  trendingPopularityWeight: 20,
  personalizationAffinityWeight: 25,
  diversityPenalty: 10,
};

function calculateRecencyMultiplier(dateStr?: string | Date, halfLifeHours = 48): number {
  if (!dateStr) return 0.5;
  const publishedTime = new Date(dateStr).getTime();
  const now = Date.now();
  const hoursOld = Math.max(0, (now - publishedTime) / (1000 * 60 * 60));
  return Math.exp((-Math.LN2 * hoursOld) / halfLifeHours);
}

export const recommendationService = {
  /**
   * Retrieves tenant-configured or default algorithm weights
   */
  getWeights: async (tenantSlug = 'goalmills'): Promise<RecommendationAlgorithmWeights> => {
    try {
      await dbConnect();
      const config = await RecommendationConfig.findOne({ tenantSlug }).lean();
      return (config as any)?.weights || DEFAULT_WEIGHTS;
    } catch {
      return DEFAULT_WEIGHTS;
    }
  },

  /**
   * Main recommendation dispatch method
   */
  getRecommendations: async (params: GetRecommendationsParams): Promise<RecommendationCandidate[]> => {
    const {
      tenantSlug = 'goalmills',
      context,
      type = 'article',
      currentId,
      sportSlug,
      categorySlug,
      teamSlug,
      competitionSlug,
      userFavorites = [],
      userSports = [],
      limit = 6,
    } = params;

    const cacheKey = `rec:v2:${tenantSlug}:${context}:${type}:${currentId || 'none'}:${sportSlug || 'all'}:${teamSlug || 'all'}:${limit}`;
    const cached = await cacheGet<RecommendationCandidate[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    await dbConnect();
    const weights = await recommendationService.getWeights(tenantSlug);
    const candidates: RecommendationCandidate[] = [];

    // 1. Fetch Candidate Articles from MongoDB
    if (type === 'article' || type === 'multi') {
      const articleFilter: Record<string, any> = {
        status: 'published',
      };
      if (currentId) {
        articleFilter._id = { $ne: currentId };
      }

      const articles = await News.find(articleFilter)
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

      for (const art of articles as any[]) {
        let score = 0;
        let algorithm: RecommendationAlgorithmType = 'content_similarity';
        let reasonBadge = 'Related Story';

        // Deterministic Feature Scoring
        if (sportSlug && (art.sportSlug === sportSlug || art.sport === sportSlug)) {
          score += weights.sportMatchWeight;
          reasonBadge = `⚽ Top ${art.sport || 'Sports'} Intel`;
        }

        if (competitionSlug && (art.competitionSlug === competitionSlug || art.competition === competitionSlug)) {
          score += weights.competitionMatchWeight;
          reasonBadge = `🏆 ${art.competition || 'League'} Coverage`;
        }

        if (teamSlug && (art.relatedTeam === teamSlug || (art.tags && art.tags.includes(teamSlug)))) {
          score += weights.teamOverlapWeight;
          reasonBadge = `⭐ ${teamSlug} Analysis`;
        }

        if (categorySlug && (art.categorySlug === categorySlug || art.category === categorySlug)) {
          score += weights.categoryMatchWeight;
        }

        // Personalized Affinity Boost
        const matchesFavorite = userFavorites.some(
          (fav) =>
            (art.relatedTeam && art.relatedTeam.toLowerCase().includes(fav.toLowerCase())) ||
            (art.title && art.title.toLowerCase().includes(fav.toLowerCase()))
        );

        if (matchesFavorite) {
          score += weights.personalizationAffinityWeight;
          algorithm = 'personalized_affinity';
          reasonBadge = '⭐ Because you follow this team';
        } else if (userSports.includes(art.sportSlug || art.sport)) {
          score += weights.personalizationAffinityWeight * 0.6;
          algorithm = 'personalized_affinity';
          reasonBadge = `🎯 For Your Sports Feed`;
        }

        // Popularity / Trending Multiplier
        const views = art.views || 0;
        const popularityMultiplier = 1 + Math.min(1.5, Math.log10(views + 1) * 0.3);
        if (art.isBreaking) {
          score += 40;
          algorithm = 'trending';
          reasonBadge = '🔥 Breaking Alert';
        } else if (art.isFeatured || views > 500) {
          score += weights.trendingPopularityWeight;
          reasonBadge = '📈 Trending Now';
        }

        // Recency Decay
        const recencyMultiplier = calculateRecencyMultiplier(art.createdAt || art.publishedAt, weights.recencyDecayHours);
        const finalScore = Math.round(score * recencyMultiplier * popularityMultiplier);

        candidates.push({
          id: art._id.toString(),
          type: 'article',
          title: art.title,
          slug: art.slug || (art.title ? slugify(art.title) : art._id.toString()),
          url: getNewsUrl(art),
          image: art.image,
          sportSlug: art.sportSlug || art.sport,
          categorySlug: art.categorySlug || art.category,
          teamSlug: art.relatedTeam,
          competitionSlug: art.competitionSlug || art.competition,
          score: Math.max(finalScore, 10),
          reasonBadge,
          algorithm,
          publishedAt: art.createdAt ? new Date(art.createdAt).toISOString() : new Date().toISOString(),
        });
      }
    }

    // 2. Fetch Candidate Videos from MongoDB (if multi or video requested)
    if (type === 'video' || type === 'multi') {
      try {
        const videoFilter: Record<string, any> = {};
        if (currentId) {
          videoFilter._id = { $ne: currentId };
        }

        const videoDocs = await Video.find(videoFilter)
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        for (const vid of videoDocs as any[]) {
          let score = 20;
          if (sportSlug && (vid.sport === sportSlug || vid.category === sportSlug)) {
            score += weights.sportMatchWeight;
          }
          const recencyMultiplier = calculateRecencyMultiplier(vid.createdAt, weights.recencyDecayHours);
          const finalScore = Math.round(score * recencyMultiplier);

          candidates.push({
            id: vid._id.toString(),
            type: 'video',
            title: vid.title,
            slug: vid._id.toString(),
            url: `/highlights/${vid._id}`,
            image: vid.thumbnail,
            sportSlug: vid.sport || 'football',
            categorySlug: vid.category || 'highlights',
            score: Math.max(finalScore, 15),
            reasonBadge: '🎥 Video Highlight',
            algorithm: 'content_similarity',
            publishedAt: vid.createdAt ? new Date(vid.createdAt).toISOString() : new Date().toISOString(),
          });
        }
      } catch {}
    }

    // 3. Sort by final score descending and enforce diversity
    candidates.sort((a, b) => b.score - a.score);

    // Filter diversity: max 3 per sport category unless all requested
    const sportCounts = new Map<string, number>();
    const diversifiedList: RecommendationCandidate[] = [];

    for (const item of candidates) {
      const sp = item.sportSlug || 'general';
      const count = sportCounts.get(sp) || 0;
      if (count < (weights.diversityPenalty > 0 ? 4 : 10) || diversifiedList.length < 3) {
        diversifiedList.push(item);
        sportCounts.set(sp, count + 1);
      }
      if (diversifiedList.length >= limit) break;
    }

    const finalResults = diversifiedList.slice(0, limit);

    // Cache in Redis for 3 minutes
    await cacheSet(cacheKey, finalResults, 180).catch(() => {});

    return finalResults;
  },

  /**
   * Generates dynamic newsletter recommendation candidates
   */
  getNewsletterRecommendations: async (
    frequency = 'daily',
    tenantSlug = 'goalmills',
    limit = 3
  ): Promise<RecommendationCandidate[]> => {
    return recommendationService.getRecommendations({
      tenantSlug,
      context: 'newsletter',
      type: 'article',
      limit,
    });
  },
};

export default recommendationService;
