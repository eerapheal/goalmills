import mongoose, { Schema } from 'mongoose';

const AffiliateConversionSchema = new Schema(
  {
    clickId: {
      type: String,
      index: true,
    },
    bookmakerId: {
      type: String,
      required: true,
      index: true,
    },
    affiliateProgramId: {
      type: String,
      index: true,
    },
    affiliateLinkId: {
      type: String,
      index: true,
    },
    conversionType: {
      type: String,
      enum: ['REGISTRATION', 'FIRST_DEPOSIT', 'WAGER', 'REVENUE_SHARE'],
      default: 'REGISTRATION',
    },
    conversionValue: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'EUR',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    externalTransactionId: {
      type: String,
    },
    convertedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AffiliateConversionSchema.index({ bookmakerId: 1, convertedAt: -1 });

export default mongoose.models.AffiliateConversion ||
  mongoose.model('AffiliateConversion', AffiliateConversionSchema);
