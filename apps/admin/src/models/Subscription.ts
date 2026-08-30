import mongoose, { Schema, Document, Model } from 'mongoose';
import type { UserSubscription } from '@goalmills/types';

export interface IUserSubscription extends Omit<UserSubscription, '_id'>, Document {}

const SubscriptionSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    tenantSlug: {
      type: String,
      required: true,
      default: 'goalmills',
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      index: true,
    },
    tier: {
      type: String,
      required: true,
      enum: ['free', 'fan_pass', 'vip_pass', 'sponsor_pro'],
      default: 'free',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete'],
      default: 'active',
      index: true,
    },
    currentPeriodStart: {
      type: String,
    },
    currentPeriodEnd: {
      type: String,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'subscriptions',
  }
);

SubscriptionSchema.index({ tenantSlug: 1, userId: 1 }, { unique: true });
SubscriptionSchema.index({ tenantSlug: 1, tier: 1, status: 1 });

export const SubscriptionModel: Model<IUserSubscription> =
  mongoose.models.Subscription ||
  mongoose.model<IUserSubscription>('Subscription', SubscriptionSchema);

export default SubscriptionModel;
