import mongoose, { Schema, Document } from 'mongoose';
import type { RecommendationAlgorithmWeights, RecommendationContext } from '@goalmills/types';

export interface IRecommendationConfigDocument extends Document {
  tenantId?: string;
  tenantSlug: string;
  weights: RecommendationAlgorithmWeights;
  enabledContexts: RecommendationContext[];
  excludedCategorySlugs: string[];
  maxCandidatesPerSport: number;
  createdAt: Date;
  updatedAt: Date;
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

const RecommendationConfigSchema = new Schema<IRecommendationConfigDocument>(
  {
    tenantId: {
      type: String,
      index: true,
    },
    tenantSlug: {
      type: String,
      default: 'goalmills',
      required: true,
      index: true,
    },
    weights: {
      sportMatchWeight: { type: Number, default: DEFAULT_WEIGHTS.sportMatchWeight },
      competitionMatchWeight: { type: Number, default: DEFAULT_WEIGHTS.competitionMatchWeight },
      teamOverlapWeight: { type: Number, default: DEFAULT_WEIGHTS.teamOverlapWeight },
      categoryMatchWeight: { type: Number, default: DEFAULT_WEIGHTS.categoryMatchWeight },
      recencyDecayHours: { type: Number, default: DEFAULT_WEIGHTS.recencyDecayHours },
      trendingPopularityWeight: { type: Number, default: DEFAULT_WEIGHTS.trendingPopularityWeight },
      personalizationAffinityWeight: { type: Number, default: DEFAULT_WEIGHTS.personalizationAffinityWeight },
      diversityPenalty: { type: Number, default: DEFAULT_WEIGHTS.diversityPenalty },
    },
    enabledContexts: {
      type: [String],
      default: ['homepage', 'article_detail', 'match_detail', 'sports_hub', 'mobile_feed', 'newsletter'],
    },
    excludedCategorySlugs: {
      type: [String],
      default: [],
    },
    maxCandidatesPerSport: {
      type: Number,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

RecommendationConfigSchema.index({ tenantSlug: 1 }, { unique: true });

export default mongoose.models.RecommendationConfig ||
  mongoose.model<IRecommendationConfigDocument>('RecommendationConfig', RecommendationConfigSchema);
