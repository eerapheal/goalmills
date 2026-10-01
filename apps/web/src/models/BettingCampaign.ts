import mongoose, { Schema } from 'mongoose';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'ARCHIVED';

const BettingCampaignSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sport: {
      type: String,
      default: 'all',
      index: true,
    },
    country: {
      type: String,
      default: 'GLOBAL',
      index: true,
    },
    bookmakers: [
      {
        type: String,
        trim: true,
      },
    ],
    placements: [
      {
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
      },
    ],
    startAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endAt: {
      type: Date,
      index: true,
    },
    budget: {
      total: { type: Number, default: 0 },
      daily: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      currency: { type: String, default: 'EUR' },
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BettingCampaignSchema.index({ status: 1, sport: 1, country: 1 });
BettingCampaignSchema.index({ startAt: 1, endAt: 1 });

export default mongoose.models.BettingCampaign ||
  mongoose.model('BettingCampaign', BettingCampaignSchema);
