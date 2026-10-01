import mongoose, { Schema } from 'mongoose';
import { SavedBetSlip } from '@goalmills/types';

const BetSlipSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      default: 'My Bet Slip',
    },
    sourceBookmaker: {
      type: String,
      required: true,
      index: true,
    },
    originalCode: {
      type: String,
      default: '',
    },
    totalOdds: {
      type: Number,
      required: true,
    },
    legCount: {
      type: Number,
      default: 0,
    },
    legs: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED', 'SETTLED'],
      default: 'ACTIVE',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    stake: {
      type: Number,
      default: 10,
    },
    currency: {
      type: String,
      default: 'EUR',
    },
  },
  {
    timestamps: true,
  }
);

BetSlipSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.BetSlip ||
  mongoose.model<SavedBetSlip>('BetSlip', BetSlipSchema);
