import mongoose, { Schema, Document, Model } from 'mongoose';
import type { SyndicationJob } from '@goalmills/types';

export interface ISyndicationJob extends Omit<SyndicationJob, '_id'>, Document {}

const SyndicationJobSchema: Schema = new Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ruleId: {
      type: String,
      index: true,
    },
    tenantSlug: {
      type: String,
      required: true,
      default: 'goalmills',
      index: true,
    },
    sport: {
      type: String,
      required: true,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      index: true,
    },
    triggerEvent: {
      type: String,
      required: true,
      index: true,
    },
    sourceEntityId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      headline: { type: String, required: true },
      body: { type: String, required: true },
      mediaUrls: [{ type: String }],
      linkUrl: { type: String },
      hashtags: [{ type: String }],
    },
    status: {
      type: String,
      required: true,
      enum: ['queued', 'pending_approval', 'dispatched', 'failed', 'cancelled'],
      default: 'queued',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    dispatchedAt: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    approvedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'syndication_jobs',
  }
);

SyndicationJobSchema.index({ tenantSlug: 1, status: 1, createdAt: -1 });

export const SyndicationJobModel: Model<ISyndicationJob> =
  mongoose.models.SyndicationJob ||
  mongoose.model<ISyndicationJob>('SyndicationJob', SyndicationJobSchema);

export default SyndicationJobModel;
