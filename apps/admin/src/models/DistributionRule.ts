import mongoose, { Schema, Document, Model } from 'mongoose';
import type { DistributionRule } from '@goalmills/types';

export interface IDistributionRule extends Omit<DistributionRule, '_id'>, Document {}

const DistributionRuleSchema: Schema = new Schema(
  {
    ruleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tenantSlug: {
      type: String,
      required: true,
      default: 'goalmills',
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      required: true,
      index: true,
    },
    competitionSlug: {
      type: String,
      index: true,
    },
    triggerEvent: {
      type: String,
      required: true,
      enum: ['article_publish', 'match_recap', 'breaking_news', 'score_alert', 'manual_broadcast'],
      index: true,
    },
    targetChannels: [
      {
        type: String,
        required: true,
      },
    ],
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    template: {
      titlePrefix: { type: String },
      includeHashtags: { type: Boolean, default: true },
      customHashtags: [{ type: String }],
      includeScores: { type: Boolean, default: true },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'distribution_rules',
  }
);

DistributionRuleSchema.index({ tenantSlug: 1, sport: 1, triggerEvent: 1, isActive: 1 });

export const DistributionRuleModel: Model<IDistributionRule> =
  mongoose.models.DistributionRule ||
  mongoose.model<IDistributionRule>('DistributionRule', DistributionRuleSchema);

export default DistributionRuleModel;
