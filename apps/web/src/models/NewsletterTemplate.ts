import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterTemplateDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  category: 'daily_digest' | 'breaking_news' | 'weekend_preview' | 'tactical_debrief' | 'transfer_radar' | 'custom';
  subjectFormat: string;
  headerTitle: string;
  headerSubtitle: string;
  bannerImageUrl?: string;
  accentColor: string;
  sections: {
    id: string;
    title: string;
    type: string;
    itemLimit: number;
  }[];
  footerText?: string;
  isDefault?: boolean;
  tenantId?: string;
  tenantSlug?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterTemplateSchema = new Schema<INewsletterTemplateDocument>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
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
    category: {
      type: String,
      enum: ['daily_digest', 'breaking_news', 'weekend_preview', 'tactical_debrief', 'transfer_radar', 'custom'],
      default: 'daily_digest',
      index: true,
    },
    subjectFormat: {
      type: String,
      default: 'GoalMills Intel • {{date}}',
    },
    headerTitle: {
      type: String,
      default: 'GOALMILLS DAILY INTEL',
    },
    headerSubtitle: {
      type: String,
      default: 'Live scores, tactical insights, and breaking headlines',
    },
    bannerImageUrl: {
      type: String,
    },
    accentColor: {
      type: String,
      default: '#F59E0B',
    },
    sections: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        type: { type: String, required: true, default: 'top_stories' },
        itemLimit: { type: Number, default: 5 },
      },
    ],
    footerText: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

NewsletterTemplateSchema.index({ tenantSlug: 1, slug: 1 }, { unique: true });

export default mongoose.models.NewsletterTemplate ||
  mongoose.model<INewsletterTemplateDocument>('NewsletterTemplate', NewsletterTemplateSchema);
