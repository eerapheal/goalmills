import mongoose, { Schema } from 'mongoose';

export type PlacementType =
  | 'odds_table'
  | 'best_odds'
  | 'match_details'
  | 'betting_scanner'
  | 'sidebar'
  | 'homepage'
  | 'article'
  | 'newsletter'
  | 'mobile';

const CampaignPlacementSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'BettingCampaign',
      required: true,
      index: true,
    },
    bookmakerId: {
      type: String,
      required: true,
      index: true,
    },
    placement: {
      type: String,
      enum: [
        'odds_table',
        'best_odds',
        'match_details',
        'betting_scanner',
        'sidebar',
        'homepage',
        'article',
        'newsletter',
        'mobile',
      ],
      required: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 10,
    },
    badgeText: {
      type: String,
      default: 'SPONSORED',
    },
    customCta: {
      type: String,
    },
    targetCountry: {
      type: String,
      default: 'GLOBAL',
      index: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CampaignPlacementSchema.index({ placement: 1, targetCountry: 1, status: 1 });

export default mongoose.models.CampaignPlacement ||
  mongoose.model('CampaignPlacement', CampaignPlacementSchema);
