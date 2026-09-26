/**
 * GoalMills Social Engine — SocialPost Model
 *
 * Logs every post published to any social platform.
 * Used for history, analytics, retry, and deduplication.
 */

import mongoose from 'mongoose';

const SocialPostSchema = new mongoose.Schema(
  {
    /** Which platform this was posted to */
    platform: {
      type: String,
      enum: ['twitter', 'telegram', 'whatsapp', 'facebook', 'linkedin', 'youtube', 'tiktok'],
      required: true,
      index: true,
    },

    /** Content type classification */
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

    /** AllSportsAPI match event_key (optional — not set for weekly fixtures) */
    matchId: {
      type: String,
      index: true,
    },

    /** AllSportsAPI league_key */
    leagueId: {
      type: String,
      index: true,
    },

    /** League name for display */
    leagueName: {
      type: String,
    },

    /** Team names */
    homeTeam: String,
    awayTeam: String,

    /** The text content that was posted */
    content: {
      type: String,
      required: true,
    },

    /** URL to the generated image stored in Cloudinary */
    imageUrl: {
      type: String,
    },

    /** Platform-specific post ID returned after successful publish */
    platformPostId: {
      type: String,
    },

    /** Public URL of the post on the platform (if available) */
    platformPostUrl: {
      type: String,
    },

    /** Delivery status */
    status: {
      type: String,
      enum: ['queued', 'posted', 'failed', 'retrying'],
      default: 'queued',
      index: true,
    },

    /** Error message if failed */
    error: {
      type: String,
    },

    /** Number of retry attempts */
    retryCount: {
      type: Number,
      default: 0,
    },

    /** When the post was actually published */
    postedAt: {
      type: Date,
      index: true,
    },

    /** Scheduled time (for future posts) */
    scheduledFor: {
      type: Date,
      index: true,
    },

    /** Who/what triggered this post */
    triggeredBy: {
      type: String,
      default: 'cron_scheduler',
    },
  },
  { timestamps: true }
);

// Compound index for deduplication: prevent double-posting the same content
SocialPostSchema.index(
  { platform: 1, postType: 1, matchId: 1 },
  { unique: false }
);

// Index for listing recent posts
SocialPostSchema.index({ createdAt: -1 });

export default mongoose.models.SocialPost ||
  mongoose.model('SocialPost', SocialPostSchema);
