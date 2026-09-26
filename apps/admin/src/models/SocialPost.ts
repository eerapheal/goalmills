import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialPostDocument extends Document {
  platform: 'twitter' | 'telegram' | 'whatsapp' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok';
  postType:
    | 'weekly_fixtures'
    | 'pre_match'
    | 'match_day_reminder'
    | 'ht_scorecard'
    | 'ft_scorecard'
    | 'post_match'
    | 'manual';
  matchId?: string;
  leagueId?: string;
  leagueName?: string;
  homeTeam?: string;
  awayTeam?: string;
  content: string;
  imageUrl?: string;
  platformPostId?: string;
  platformPostUrl?: string;
  status: 'queued' | 'posted' | 'failed' | 'retrying';
  error?: string;
  retryCount?: number;
  postedAt?: Date;
  scheduledFor?: Date;
  triggeredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SocialPostSchema = new Schema<ISocialPostDocument>(
  {
    platform: {
      type: String,
      enum: ['twitter', 'telegram', 'whatsapp', 'facebook', 'linkedin', 'youtube', 'tiktok'],
      required: true,
      index: true,
    },
    postType: {
      type: String,
      enum: [
        'weekly_fixtures',
        'pre_match',
        'match_day_reminder',
        'ht_scorecard',
        'ft_scorecard',
        'post_match',
        'manual',
      ],
      required: true,
      index: true,
    },
    matchId: { type: String, index: true },
    leagueId: { type: String, index: true },
    leagueName: String,
    homeTeam: String,
    awayTeam: String,
    content: { type: String, required: true },
    imageUrl: String,
    platformPostId: String,
    platformPostUrl: String,
    status: {
      type: String,
      enum: ['queued', 'posted', 'failed', 'retrying'],
      default: 'queued',
      index: true,
    },
    error: String,
    retryCount: { type: Number, default: 0 },
    postedAt: { type: Date, index: true },
    scheduledFor: { type: Date, index: true },
    triggeredBy: { type: String, default: 'cron_scheduler' },
  },
  { timestamps: true }
);

SocialPostSchema.index({ platform: 1, postType: 1, matchId: 1 });
SocialPostSchema.index({ createdAt: -1 });

export default mongoose.models.SocialPost ||
  mongoose.model<ISocialPostDocument>('SocialPost', SocialPostSchema);
