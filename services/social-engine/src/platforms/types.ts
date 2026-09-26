/**
 * GoalMills Social Engine — Platform Adapter Types
 *
 * Shared interfaces for all social platform adapters.
 * Each platform implements PlatformAdapter to provide a unified posting API.
 */

/** Result of a post attempt */
export interface PlatformPostResult {
  success: boolean;
  platform: string;
  platformPostId?: string;
  url?: string;
  error?: string;
}

/** Unified interface that every platform adapter must implement */
export interface PlatformAdapter {
  /** Platform identifier (e.g., 'twitter', 'telegram') */
  readonly name: string;

  /** Human-readable display name */
  readonly displayName: string;

  /** Check if this platform has valid credentials configured */
  isConfigured(): boolean;

  /** Post text-only content */
  postText(content: string): Promise<PlatformPostResult>;

  /** Post text with an image */
  postImage(
    content: string,
    imageBuffer: Buffer,
    altText?: string
  ): Promise<PlatformPostResult>;

  /** Post text with a video (optional — not all platforms support this) */
  postVideo?(
    content: string,
    videoBuffer: Buffer,
    description?: string
  ): Promise<PlatformPostResult>;
}

/** Content payload passed to the distributor */
export interface SocialContent {
  /** Text content for the post */
  text: string;

  /** Generated image buffer (PNG) */
  imageBuffer?: Buffer;

  /** Alt text for the image */
  imageAltText?: string;

  /** Video buffer (for TikTok etc.) */
  videoBuffer?: Buffer;

  /** Classification */
  postType:
    | 'weekly_fixtures'
    | 'pre_match'
    | 'match_day_reminder'
    | 'ht_scorecard'
    | 'ft_scorecard'
    | 'post_match'
    | 'manual';

  /** Match reference (optional) */
  matchId?: string;
  leagueId?: string;
  leagueName?: string;
  homeTeam?: string;
  awayTeam?: string;
}

/** Which platforms to target for a post */
export type PlatformTarget = 'all' | string[];
