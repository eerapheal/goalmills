import mongoose, { Schema, Document } from 'mongoose';
import type { ScrollMilestones } from '@goalmills/types';

export interface IContentMetricSummaryDocument extends Document {
  tenantId?: string;
  tenantSlug: string;
  articleId: string;
  articleSlug?: string;
  articleTitle?: string;
  categorySlug?: string;
  sportSlug?: string;
  authorId?: string;
  authorSlug?: string;
  date: string; // YYYY-MM-DD
  pageViews: number;
  uniqueReaders: number;
  totalReadDurationMs: number;
  avgReadDurationMs: number;
  scrollMilestones: ScrollMilestones;
  shares: number;
  videoPlays: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContentMetricSummarySchema = new Schema<IContentMetricSummaryDocument>(
  {
    tenantId: {
      type: String,
      index: true,
    },
    tenantSlug: {
      type: String,
      default: 'goalmills',
      index: true,
    },
    articleId: {
      type: String,
      required: true,
      index: true,
    },
    articleSlug: {
      type: String,
      trim: true,
    },
    articleTitle: {
      type: String,
      trim: true,
    },
    categorySlug: {
      type: String,
      index: true,
    },
    sportSlug: {
      type: String,
      index: true,
    },
    authorId: {
      type: String,
      index: true,
    },
    authorSlug: {
      type: String,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    uniqueReaders: {
      type: Number,
      default: 0,
    },
    totalReadDurationMs: {
      type: Number,
      default: 0,
    },
    avgReadDurationMs: {
      type: Number,
      default: 0,
    },
    scrollMilestones: {
      p25: { type: Number, default: 0 },
      p50: { type: Number, default: 0 },
      p75: { type: Number, default: 0 },
      p100: { type: Number, default: 0 },
    },
    shares: {
      type: Number,
      default: 0,
    },
    videoPlays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast time-series aggregation
ContentMetricSummarySchema.index({ tenantSlug: 1, articleId: 1, date: -1 }, { unique: true });
ContentMetricSummarySchema.index({ tenantSlug: 1, date: -1 });
ContentMetricSummarySchema.index({ tenantSlug: 1, sportSlug: 1, date: -1 });

export default mongoose.models.ContentMetricSummary ||
  mongoose.model<IContentMetricSummaryDocument>('ContentMetricSummary', ContentMetricSummarySchema);
