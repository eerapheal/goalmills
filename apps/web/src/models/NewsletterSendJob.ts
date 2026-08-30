import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSendJobDocument extends Document {
  campaignId: string;
  tenantId?: string;
  tenantSlug?: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalRecipients: number;
  processedRecipients: number;
  successCount: number;
  failedCount: number;
  batchSize: number;
  currentBatchIndex: number;
  startedAt?: Date;
  pausedAt?: Date;
  completedAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSendJobSchema = new Schema<INewsletterSendJobDocument>(
  {
    campaignId: {
      type: String,
      required: true,
      index: true,
    },
    tenantId: {
      type: String,
      index: true,
    },
    tenantSlug: {
      type: String,
      default: 'goalmills',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'paused', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    processedRecipients: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    batchSize: {
      type: Number,
      default: 50,
    },
    currentBatchIndex: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    pausedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    lastError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

NewsletterSendJobSchema.index({ tenantSlug: 1, status: 1, createdAt: -1 });

export default mongoose.models.NewsletterSendJob ||
  mongoose.model<INewsletterSendJobDocument>('NewsletterSendJob', NewsletterSendJobSchema);
