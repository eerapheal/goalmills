import mongoose from 'mongoose';

const EmailSuppressionSchema = new mongoose.Schema(
  {
    emailNormalized: {
      type: String,
      required: [true, 'Normalized email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    reason: {
      type: String,
      enum: [
        'HARD_BOUNCE',
        'COMPLAINT',
        'UNSUBSCRIBE',
        'MANUAL',
        'INVALID_EMAIL',
        'POLICY',
        'GLOBAL_SUPPRESSION',
      ],
      required: true,
      index: true,
    },
    source: {
      type: String,
      default: 'system',
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsletterCampaign',
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EmailSuppression ||
  mongoose.model('EmailSuppression', EmailSuppressionSchema);
