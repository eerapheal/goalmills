import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialPlatformConfigDocument extends Document {
  platform: 'twitter' | 'telegram' | 'whatsapp' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok';
  enabled: boolean;
  credentials: Record<string, any>;
  config: Record<string, any>;
  enabledPostTypes: string[];
  enabledLeagueIds: number[];
  lastSuccessAt?: Date;
  lastError?: string;
  healthStatus: 'healthy' | 'degraded' | 'down' | 'unconfigured';
  createdAt: Date;
  updatedAt: Date;
}

const SocialPlatformConfigSchema = new Schema<ISocialPlatformConfigDocument>(
  {
    platform: {
      type: String,
      enum: ['twitter', 'telegram', 'whatsapp', 'facebook', 'linkedin', 'youtube', 'tiktok'],
      required: true,
      unique: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    credentials: {
      type: Schema.Types.Mixed,
      default: {},
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    enabledPostTypes: {
      type: [String],
      default: [
        'weekly_fixtures',
        'pre_match',
        'match_day_reminder',
        'ht_scorecard',
        'ft_scorecard',
        'post_match',
      ],
    },
    enabledLeagueIds: {
      type: [Number],
      default: [],
    },
    lastSuccessAt: Date,
    lastError: String,
    healthStatus: {
      type: String,
      enum: ['healthy', 'degraded', 'down', 'unconfigured'],
      default: 'unconfigured',
    },
  },
  { timestamps: true }
);

export default mongoose.models.SocialPlatformConfig ||
  mongoose.model<ISocialPlatformConfigDocument>(
    'SocialPlatformConfig',
    SocialPlatformConfigSchema
  );
