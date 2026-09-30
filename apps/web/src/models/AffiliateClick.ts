import mongoose from 'mongoose';
import { AffiliateClick as IAffiliateClick } from '@goalmills/types';

const AffiliateClickSchema = new mongoose.Schema(
  {
    affiliateLinkId: {
      type: String,
      index: true,
    },
    bookmakerId: {
      type: String,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      index: true,
    },
    marketId: {
      type: String,
    },
    selectionId: {
      type: String,
    },
    placement: {
      type: String,
      default: 'odds_table',
      index: true,
    },
    campaign: {
      type: String,
      default: 'general',
      index: true,
    },
    sessionId: {
      type: String,
    },
    anonymousVisitorId: {
      type: String,
      index: true,
    },
    country: {
      type: String,
      index: true,
    },
    deviceType: {
      type: String,
    },
    referrer: {
      type: String,
    },
    destinationUrl: {
      type: String,
      required: true,
    },
    ipHash: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AffiliateClickSchema.index({ bookmakerId: 1, createdAt: -1 });
AffiliateClickSchema.index({ campaign: 1, placement: 1, createdAt: -1 });
AffiliateClickSchema.index({ eventId: 1, createdAt: -1 });

export default mongoose.models.AffiliateClick ||
  mongoose.model<IAffiliateClick>('AffiliateClick', AffiliateClickSchema);
