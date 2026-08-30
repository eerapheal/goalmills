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
      default: 'daily_subscribers',
      index: true,
    },
    listId: {
      type: String,
      index: true,
    },
    segmentId: {
      type: String,
      index: true,
    },
    templateId: {
      type: String,
      index: true,
    },
    sendJobId: {
      type: String,
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
      enum: ['draft', 'scheduled', 'processing', 'sent', 'failed', 'paused'],
      default: 'draft',
      index: true,
    },
    stats: {
      totalRecipients: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      failureCount: { type: Number, default: 0 },
      openCount: { type: Number, default: 0 },
      clickCount: { type: Number, default: 0 },
      softBounceCount: { type: Number, default: 0 },
      hardBounceCount: { type: Number, default: 0 },
      complaintCount: { type: Number, default: 0 },
      unsubscribeCount: { type: Number, default: 0 },
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
    createdBy: {
      type: String,
      default: 'system_cron',
    },
  },
  { timestamps: true }
);

NewsletterCampaignSchema.index({ tenantSlug: 1, status: 1, createdAt: -1 });

export default mongoose.models.NewsletterCampaign ||
  mongoose.model('NewsletterCampaign', NewsletterCampaignSchema);
