/**
 * GoalMills Social Engine — SocialPlatformConfig Model
 *
 * Stores platform credentials and configuration for each social channel.
 * Credentials are loaded at startup and can be updated via admin API.
 */

import mongoose from 'mongoose';

const SocialPlatformConfigSchema = new mongoose.Schema(
  {
    /** Platform identifier */
    platform: {
      type: String,
      enum: ['twitter', 'telegram', 'whatsapp', 'facebook', 'linkedin', 'youtube', 'tiktok'],
      required: true,
      unique: true,
    },

    /** Whether this platform is enabled for automated posting */
    enabled: {
      type: Boolean,
      default: false,
    },

    /** Platform-specific credentials (encrypted at rest via application layer) */
    credentials: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /** Platform-specific configuration (e.g., channel ID, page ID) */
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /** Which post types are enabled for this platform */
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

    /** Which leagues to post about on this platform (empty = all) */
    enabledLeagueIds: {
      type: [Number],
      default: [],
    },

    /** Last time this platform was successfully used */
    lastSuccessAt: Date,

    /** Last error encountered */
    lastError: String,

    /** Health status */
    healthStatus: {
      type: String,
      enum: ['healthy', 'degraded', 'down', 'unconfigured'],
      default: 'unconfigured',
    },
  },
  { timestamps: true }
);

export default mongoose.models.SocialPlatformConfig ||
  mongoose.model('SocialPlatformConfig', SocialPlatformConfigSchema);
