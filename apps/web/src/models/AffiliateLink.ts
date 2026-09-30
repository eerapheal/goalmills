import mongoose from 'mongoose';
import { AffiliateLink as IAffiliateLink } from '@goalmills/types';

const AffiliateLinkSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    affiliateProgramId: {
      type: String,
      index: true,
    },
    bookmakerId: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: String,
      default: 'ALL',
      index: true,
    },
    sport: {
      type: String,
      default: 'all',
      index: true,
    },
    campaign: {
      type: String,
      default: 'general',
      index: true,
    },
    placement: {
      type: String,
      default: 'odds_table',
      index: true,
    },
    destinationType: {
      type: String,
      enum: ['HOMEPAGE', 'EVENT', 'REGISTRATION', 'DEPOSIT'],
      default: 'REGISTRATION',
    },
    destinationUrl: {
      type: String,
      required: true,
    },
    trackingTemplate: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'DISABLED'],
      default: 'ACTIVE',
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

AffiliateLinkSchema.index({ bookmakerId: 1, placement: 1, status: 1 });
AffiliateLinkSchema.index({ bookmakerId: 1, campaign: 1 });

export default mongoose.models.AffiliateLink ||
  mongoose.model<IAffiliateLink>('AffiliateLink', AffiliateLinkSchema);
