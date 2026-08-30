import mongoose, { Schema, Document } from 'mongoose';
import type { AnalyticsEventType, AnalyticsEntityType } from '@goalmills/types';

export interface IAnalyticsEventDocument extends Document {
  tenantId?: string;
  tenantSlug: string;
  eventType: AnalyticsEventType;
  entityType?: AnalyticsEntityType;
  entityId?: string;
  sessionHash: string;
  metadata?: {
    sportSlug?: string;
    categorySlug?: string;
    authorId?: string;
    authorSlug?: string;
    teamSlug?: string;
    competitionSlug?: string;
    scrollPercentage?: number;
    durationMs?: number;
    readTimeMs?: number;
    referrer?: string;
    device?: 'desktop' | 'mobile' | 'tablet';
    country?: string;
    searchQuery?: string;
    url?: string;
    title?: string;
  };
  timestamp: Date;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEventDocument>(
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
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    sessionHash: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indices for fast multi-tenant queries and metric rollups
AnalyticsEventSchema.index({ tenantSlug: 1, eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ tenantSlug: 1, entityId: 1, eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ sessionHash: 1, createdAt: -1 });
// Auto-expire raw events after 90 days (7,776,000 seconds) to conserve storage
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEventDocument>('AnalyticsEvent', AnalyticsEventSchema);
