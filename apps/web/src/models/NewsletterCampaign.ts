import mongoose from 'mongoose';

const NewsletterCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title / subject line is required'],
      trim: true,
    },
    previewText: {
      type: String,
      trim: true,
    },
    editorialNote: {
      type: String,
    },
    frequencyTier: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom_broadcast'],
      default: 'daily',
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['daily_subscribers', 'weekly_subscribers', 'monthly_subscribers', 'all_subscribers'],
      default: 'daily_subscribers',
      index: true,
    },
    articleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'News',
      },
    ],
    scheduledFor: {
      type: Date,
      index: true,
    },
    sentAt: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'processing', 'sent', 'failed'],
      default: 'draft',
      index: true,
    },
    stats: {
      totalRecipients: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      failureCount: { type: Number, default: 0 },
      openCount: { type: Number, default: 0 },
    },
    createdBy: {
      type: String,
      default: 'system_cron',
    },
  },
  { timestamps: true }
);

export default mongoose.models.NewsletterCampaign ||
  mongoose.model('NewsletterCampaign', NewsletterCampaignSchema);
