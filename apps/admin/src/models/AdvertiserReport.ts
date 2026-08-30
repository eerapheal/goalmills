import mongoose, { Schema, Document, Model } from 'mongoose';
import type { AdvertiserReportSummary } from '@goalmills/types';

export interface IAdvertiserReport extends Omit<AdvertiserReportSummary, '_id'>, Document {}

const AdvertiserReportSchema: Schema = new Schema(
  {
    sponsorId: {
      type: String,
      required: true,
      index: true,
    },
    sponsorName: {
      type: String,
      required: true,
    },
    tenantSlug: {
      type: String,
      required: true,
      default: 'goalmills',
      index: true,
    },
    campaignName: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
      index: true,
    },
    impressions: {
      type: Number,
      required: true,
      default: 0,
    },
    viewableImpressions: {
      type: Number,
      required: true,
      default: 0,
    },
    viewabilityRate: {
      type: Number,
      required: true,
      default: 0,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    ctr: {
      type: Number,
      required: true,
      default: 0,
    },
    effectiveCpm: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSpend: {
      type: Number,
      required: true,
      default: 0,
    },
    sportBreakdown: {
      type: Map,
      of: new Schema(
        {
          impressions: { type: Number, default: 0 },
          clicks: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: {},
    },
    certificateHash: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'advertiser_reports',
  }
);

AdvertiserReportSchema.index({ tenantSlug: 1, sponsorId: 1, period: 1 }, { unique: true });

export const AdvertiserReportModel: Model<IAdvertiserReport> =
  mongoose.models.AdvertiserReport ||
  mongoose.model<IAdvertiserReport>('AdvertiserReport', AdvertiserReportSchema);

export default AdvertiserReportModel;
