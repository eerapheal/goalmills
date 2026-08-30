import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ChannelConnection } from '@goalmills/types';

export interface IChannelConnection extends Omit<ChannelConnection, '_id'>, Document {}

const ChannelConfigSchema: Schema = new Schema(
  {
    channel: {
      type: String,
      required: true,
      index: true,
    },
    tenantSlug: {
      type: String,
      required: true,
      default: 'goalmills',
      index: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    credentials: {
      apiKey: { type: String },
      apiSecret: { type: String },
      botToken: { type: String },
      chatId: { type: String },
      webhookUrl: { type: String },
    },
    stats: {
      totalDispatched: { type: Number, default: 0 },
      totalFailed: { type: Number, default: 0 },
      lastDispatchedAt: { type: String },
    },
    status: {
      type: String,
      enum: ['connected', 'unconfigured', 'error'],
      default: 'connected',
    },
  },
  {
    timestamps: true,
    collection: 'channel_configs',
  }
);

ChannelConfigSchema.index({ tenantSlug: 1, channel: 1 }, { unique: true });

export const ChannelConfigModel: Model<IChannelConnection> =
  mongoose.models.ChannelConfig ||
  mongoose.model<IChannelConnection>('ChannelConfig', ChannelConfigSchema);

export default ChannelConfigModel;
