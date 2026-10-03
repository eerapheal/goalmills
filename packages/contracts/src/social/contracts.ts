/**
 * Social Engine Service Contract (Node.js Microservice)
 * Corresponds to Blueprint Section 5.2
 */

export type SocialPlatform =
  | 'twitter'
  | 'telegram'
  | 'whatsapp'
  | 'facebook'
  | 'youtube'
  | 'linkedin';

export interface SocialGraphicOptions {
  template: 'match_preview' | 'live_score' | 'full_time' | 'breaking_news' | 'standings';
  title: string;
  subtitle?: string;
  theme?: 'dark' | 'light' | 'gold';
  homeTeamName?: string;
  awayTeamName?: string;
  homeScore?: number;
  awayScore?: number;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  aspectRatio: '1:1' | '16:9' | '9:16';
}

export interface SocialPublishRequest {
  id: string;
  platforms: SocialPlatform[];
  content: {
    text: string;
    hashtags?: string[];
    linkUrl?: string;
  };
  graphic?: SocialGraphicOptions;
  mediaUrls?: string[];
  scheduledAt?: string;
  sourceContext?: {
    matchId?: string;
    articleId?: string;
    sport?: string;
    authorId?: string;
  };
}

export interface PlatformPublishResult {
  platform: SocialPlatform;
  status: 'published' | 'queued' | 'failed';
  platformPostId?: string;
  postUrl?: string;
  error?: string;
  publishedAt?: string;
}

export interface SocialPublishResponse {
  id: string;
  status: 'completed' | 'partial_failure' | 'failed' | 'scheduled';
  results: PlatformPublishResult[];
  processedAt: string;
}

export interface SocialEngineStatus {
  online: boolean;
  service?: string;
  uptime?: number;
  platforms?: Array<{
    name: string;
    displayName: string;
    isConfigured: boolean;
  }>;
  scheduledTasks?: Array<{
    id: string;
    name: string;
    cronExpression: string;
    enabled: boolean;
  }>;
  metrics?: {
    totalPosts: number;
    postsToday: number;
  };
  error?: string;
}
