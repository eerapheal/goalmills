import mongoose from 'mongoose';

const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      index: true,
    },
    emailNormalized: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'ACTIVE',
        'ENGAGED',
        'INACTIVE',
        'SOFT_BOUNCE',
        'HARD_BOUNCE',
        'COMPLAINT',
        'SUPPRESSED',
        'UNSUBSCRIBED',
        'active', // legacy support
        'unsubscribed', // legacy support
        'bounced', // legacy support
      ],
      default: 'CONFIRMED',
      index: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all'],
      default: 'daily',
      index: true,
    },
    categories: [{ type: String }],
    emailHealthScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
      index: true,
    },
    engagementScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      index: true,
    },
    reputationRiskScore: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    confirmedAt: {
      type: Date,
    },
    confirmationToken: {
      type: String,
      index: true,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      index: true,
    },
    lastOpenedAt: {
      type: Date,
    },
    lastClickedAt: {
      type: Date,
    },
    lastSentAt: {
      type: Date,
    },
    softBounceCount: {
      type: Number,
      default: 0,
    },
    hardBounceCount: {
      type: Number,
      default: 0,
    },
    complaintCount: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      default: 'website',
    },
  },
  { timestamps: true }
);

// Pre-validate hook to ensure emailNormalized is always populated and lowercased
NewsletterSubscriberSchema.pre('validate', function () {
  if (this.email && !this.emailNormalized) {
    this.emailNormalized = this.email.trim().toLowerCase();
  }
});

export default mongoose.models.NewsletterSubscriber ||
  mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
