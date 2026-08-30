import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterListDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  isDefault: boolean;
  subscriberCount: number;
  tenantId?: string;
  tenantSlug?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterListSchema = new Schema<INewsletterListDocument>(
  {
    name: {
      type: String,
      required: [true, 'List name is required'],
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
    isDefault: {
      type: Boolean,
      default: false,
    },
    subscriberCount: {
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

NewsletterListSchema.index({ tenantSlug: 1, slug: 1 }, { unique: true });
NewsletterListSchema.index({ tenantSlug: 1, isDefault: 1 });

export default mongoose.models.NewsletterList ||
  mongoose.model<INewsletterListDocument>('NewsletterList', NewsletterListSchema);
