import mongoose from 'mongoose';

const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all'],
      default: 'daily',
      index: true,
    },
    categories: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'unsubscribed', 'bounced'],
      default: 'active',
      index: true,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      index: true,
    },
    source: {
      type: String,
      default: 'website',
    },
    lastEmailSentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.NewsletterSubscriber ||
  mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
