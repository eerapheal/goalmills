import mongoose from 'mongoose';

const EmailEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'delivered',
        'opened',
        'clicked',
        'soft_bounce',
        'hard_bounce',
        'complaint',
        'unsubscribed',
        'deferred',
      ],
      required: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'go_mailer',
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsletterCampaign',
      required: false,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignRecipient',
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EmailEvent ||
  mongoose.model('EmailEvent', EmailEventSchema);
