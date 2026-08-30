import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSegmentDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  rules: {
    field: string;
    operator: string;
    value: any;
  }[];
  matchType: 'all' | 'any';
  estimatedSubscribers: number;
  tenantId?: string;
  tenantSlug?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSegmentSchema = new Schema<INewsletterSegmentDocument>(
  {
    name: {
      type: String,
      required: [true, 'Segment name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rules: [
      {
        field: { type: String, required: true },
        operator: { type: String, required: true, default: 'in' },
        value: { type: Schema.Types.Mixed, required: true },
      },
    ],
    matchType: {
      type: String,
      enum: ['all', 'any'],
      default: 'all',
    },
    estimatedSubscribers: {
      type: Number,
      default: 0,
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
  },
  {
    timestamps: true,
  }
);

NewsletterSegmentSchema.index({ tenantSlug: 1, slug: 1 }, { unique: true });

export default mongoose.models.NewsletterSegment ||
  mongoose.model<INewsletterSegmentDocument>('NewsletterSegment', NewsletterSegmentSchema);
