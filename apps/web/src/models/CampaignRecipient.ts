import mongoose from 'mongoose';

const CampaignRecipientSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsletterCampaign',
      required: true,
      index: true,
    },
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsletterSubscriber',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    domain: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'SKIPPED',
        'QUEUED',
        'SENDING',
        'DELIVERED',
        'DEFERRED',
        'SOFT_BOUNCED',
        'HARD_BOUNCED',
        'COMPLAINED',
        'FAILED',
      ],
      default: 'PENDING',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    clickedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate recipient records per campaign
CampaignRecipientSchema.index({ campaignId: 1, email: 1 }, { unique: true });

export default mongoose.models.CampaignRecipient ||
  mongoose.model('CampaignRecipient', CampaignRecipientSchema);
