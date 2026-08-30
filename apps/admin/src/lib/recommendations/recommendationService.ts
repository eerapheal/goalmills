import dbConnect from '@/lib/db';
import News from '@/models/News';
import Video from '@/models/Video';
import RecommendationConfig from '@/models/RecommendationConfig';
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
  getWeights: async (tenantSlug = 'goalmills'): Promise<RecommendationAlgorithmWeights> => {
    try {
      await dbConnect();
      const config = await RecommendationConfig.findOne({ tenantSlug }).lean();
      return (config as any)?.weights || DEFAULT_WEIGHTS;
    } catch {
      return DEFAULT_WEIGHTS;
    }
  },

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

    await dbConnect();
    const weights = await recommendationService.getWeights(tenantSlug);
    const candidates: RecommendationCandidate[] = [];

    // 1. Fetch Candidate Articles
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

        const recencyMultiplier = calculateRecencyMultiplier(art.createdAt || art.publishedAt, weights.recencyDecayHours);
        const finalScore = Math.round(score * recencyMultiplier * popularityMultiplier);

        candidates.push({
          id: art._id.toString(),
          type: 'article',
          title: art.title,
          slug: art.slug || art._id.toString(),
          url: `/news/${art.slug || art._id}`,
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

    // 2. Fetch Candidate Videos
    if (type === 'video' || type === 'multi') {
      try {
        const videoDocs = await Video.find({})
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

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, limit);
  },
};

export default recommendationService;
