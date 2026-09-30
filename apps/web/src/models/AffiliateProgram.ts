import mongoose from 'mongoose';
import { AffiliateProgram as IAffiliateProgram } from '@goalmills/types';

const AffiliateProgramSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookmakerId: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      default: 'DIRECT',
    },
    affiliateId: {
      type: String,
      required: true,
      trim: true,
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
    trackingTemplate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'DISABLED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AffiliateProgramSchema.index({ bookmakerId: 1, status: 1 });

export default mongoose.models.AffiliateProgram ||
  mongoose.model<IAffiliateProgram>('AffiliateProgram', AffiliateProgramSchema);
