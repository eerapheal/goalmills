import mongoose, { Schema } from 'mongoose';

const BettingAnalyticsEventSchema = new Schema(
  {
    eventName: {
      type: String,
      required: true,
      index: true,
    },
    bookmakerId: {
      type: String,
      index: true,
    },
    eventId: {
      type: String,
      index: true,
    },
    sport: {
      type: String,
      default: 'football',
    },
    placement: {
      type: String,
      index: true,
    },
    campaign: {
      type: String,
      index: true,
    },
    sessionId: {
      type: String,
    },
    anonymousVisitorId: {
      type: String,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 7776000, // 90 days automatic TTL expiration
    },
  },
  {
    timestamps: false,
  }
);

BettingAnalyticsEventSchema.index({ eventName: 1, createdAt: -1 });

export default mongoose.models.BettingAnalyticsEvent ||
  mongoose.model('BettingAnalyticsEvent', BettingAnalyticsEventSchema);
