/**
 * GoalMills Social Engine — Per-Platform Rate Limiter
 *
 * Tracks API call counts per platform within sliding windows
 * to respect rate limits and avoid account bans.
 */

import { logger } from './logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  name: string;
}

interface RateLimitBucket {
  timestamps: number[];
}

/** Default rate limits per platform */
const PLATFORM_LIMITS: Record<string, RateLimitConfig> = {
  twitter: {
    name: 'X/Twitter',
    maxRequests: 50,        // ~50 tweets/day on free tier (1,500/month)
    windowMs: 24 * 60 * 60 * 1000,
  },
  telegram: {
    name: 'Telegram',
    maxRequests: 1000,      // Effectively unlimited for bots
    windowMs: 60 * 60 * 1000,
  },
  whatsapp: {
    name: 'WhatsApp',
    maxRequests: 30,        // Conservative limit
    windowMs: 24 * 60 * 60 * 1000,
  },
  facebook: {
    name: 'Facebook',
    maxRequests: 50,
    windowMs: 24 * 60 * 60 * 1000,
  },
  linkedin: {
    name: 'LinkedIn',
    maxRequests: 100,
    windowMs: 24 * 60 * 60 * 1000,
  },
  youtube: {
    name: 'YouTube',
    maxRequests: 50,        // Quota-based, conservative
    windowMs: 24 * 60 * 60 * 1000,
  },
  tiktok: {
    name: 'TikTok',
    maxRequests: 10,        // Official limit
    windowMs: 24 * 60 * 60 * 1000,
  },
};

/** In-memory rate limit buckets */
const buckets = new Map<string, RateLimitBucket>();

/**
 * Clean expired timestamps from a bucket.
 */
function cleanBucket(bucket: RateLimitBucket, windowMs: number): void {
  const cutoff = Date.now() - windowMs;
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);
}

/**
 * Check if a platform can accept another request.
 * Returns true if under limit, false if rate-limited.
 */
export function canPost(platform: string): boolean {
  const config = PLATFORM_LIMITS[platform];
  if (!config) {
    logger.warn(`No rate limit config for platform: ${platform}`);
    return true;
  }

  const bucket = buckets.get(platform) || { timestamps: [] };
  cleanBucket(bucket, config.windowMs);

  return bucket.timestamps.length < config.maxRequests;
}

/**
 * Record a successful post for rate limiting.
 */
export function recordPost(platform: string): void {
  const bucket = buckets.get(platform) || { timestamps: [] };
  bucket.timestamps.push(Date.now());
  buckets.set(platform, bucket);
}

/**
 * Get remaining capacity for a platform.
 */
export function getRemainingCapacity(platform: string): number {
  const config = PLATFORM_LIMITS[platform];
  if (!config) return Infinity;

  const bucket = buckets.get(platform) || { timestamps: [] };
  cleanBucket(bucket, config.windowMs);

  return Math.max(0, config.maxRequests - bucket.timestamps.length);
}

/**
 * Get rate limit status for all platforms (for admin dashboard).
 */
export function getAllRateLimitStatus(): Record<string, {
  name: string;
  used: number;
  max: number;
  remaining: number;
  windowMs: number;
}> {
  const status: Record<string, any> = {};

  for (const [platform, config] of Object.entries(PLATFORM_LIMITS)) {
    const bucket = buckets.get(platform) || { timestamps: [] };
    cleanBucket(bucket, config.windowMs);

    status[platform] = {
      name: config.name,
      used: bucket.timestamps.length,
      max: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - bucket.timestamps.length),
      windowMs: config.windowMs,
    };
  }

  return status;
}

export const isRateLimited = (platform: string): boolean => !canPost(platform);
export const recordCall = recordPost;
