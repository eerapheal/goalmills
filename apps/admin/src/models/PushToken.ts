import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPushToken extends Document {
  token: string;
  platform: 'android' | 'ios' | 'web';
  topics: string[];
  userId?: string;
  deviceInfo?: {
    model?: string;
    osVersion?: string;
    appVersion?: string;
  };
  enabled: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PushTokenSchema = new Schema<IPushToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['android', 'ios', 'web'],
      required: true,
      index: true,
    },
    topics: {
      type: [String],
      default: ['all', 'breaking_news', 'live_scores'],
      index: true,
    },
    userId: {
      type: String,
      required: false,
      index: true,
    },
    deviceInfo: {
      model: { type: String, required: false },
      osVersion: { type: String, required: false },
      appVersion: { type: String, required: false },
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error during Next.js hot reload
const PushToken: Model<IPushToken> =
  mongoose.models.PushToken || mongoose.model<IPushToken>('PushToken', PushTokenSchema);

export default PushToken;
