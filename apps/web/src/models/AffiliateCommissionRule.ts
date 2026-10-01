import mongoose, { Schema } from 'mongoose';
import { AffiliateCommissionRule } from '@goalmills/types';

const AffiliateCommissionRuleSchema = new Schema(
  {
    bookmakerId: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'DIRECT',
    },
    country: {
      type: String,
      default: 'ALL',
      index: true,
    },
    commissionType: {
      type: String,
      enum: ['CPA', 'REV_SHARE', 'HYBRID', 'SPONSORED'],
      default: 'CPA',
    },
    commissionValue: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'EUR',
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AffiliateCommissionRuleSchema.index({ bookmakerId: 1, country: 1, status: 1 });

export default mongoose.models.AffiliateCommissionRule ||
  mongoose.model<AffiliateCommissionRule>('AffiliateCommissionRule', AffiliateCommissionRuleSchema);
