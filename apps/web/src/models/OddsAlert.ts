import mongoose, { Schema } from 'mongoose';
import { OddsAlert } from '@goalmills/types';

const OddsAlertSchema = new Schema(
  {
    userId: {
      type: String,
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      index: true,
    },
    sport: {
      type: String,
      default: 'football',
      index: true,
    },
    matchName: {
      type: String,
      required: true,
    },
    marketId: {
      type: String,
      required: true,
    },
    marketName: {
      type: String,
      default: '',
    },
    selection: {
      type: String,
      required: true,
    },
    bookmakerId: {
      type: String,
      index: true,
    },
    bookmakerName: {
      type: String,
    },
    targetOdds: {
      type: Number,
      required: true,
    },
    initialOdds: {
      type: Number,
      default: 1.0,
    },
    targetDirection: {
      type: String,
      enum: ['GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL'],
      default: 'GREATER_THAN_OR_EQUAL',
    },
    channel: {
      type: String,
      enum: ['EMAIL', 'PUSH', 'IN_APP'],
      default: 'IN_APP',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRIGGERED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    triggeredAt: {
      type: Date,
    },
    lastCheckedOdds: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

OddsAlertSchema.index({ eventId: 1, status: 1 });
OddsAlertSchema.index({ userId: 1, status: 1 });

export default mongoose.models.OddsAlert ||
  mongoose.model<OddsAlert>('OddsAlert', OddsAlertSchema);
