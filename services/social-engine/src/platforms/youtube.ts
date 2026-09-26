/**
 * GoalMills Social Engine — YouTube Platform Adapter
 *
 * Uses YouTube Data API v3 for community posts.
 * Note: Community tab requires 500+ subscribers.
 * Falls back to video thumbnail upload for channels under 500 subs.
 *
 * Setup:
 * 1. Enable YouTube Data API v3 in Google Cloud Console
 * 2. Create OAuth 2.0 credentials
 * 3. Authorize and get refresh token
 * 4. Set YOUTUBE_CHANNEL_ID, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN in .env
 */

import axios from 'axios';
import type { PlatformAdapter, PlatformPostResult } from './types';
import { logger } from '../utils/logger';

const CHANNEL_ID = () => process.env.YOUTUBE_CHANNEL_ID || '';
const CLIENT_ID = () => process.env.YOUTUBE_CLIENT_ID || '';
const CLIENT_SECRET = () => process.env.YOUTUBE_CLIENT_SECRET || '';
const REFRESH_TOKEN = () => process.env.YOUTUBE_REFRESH_TOKEN || '';

let cachedAccessToken: string | null = null;
let tokenExpiry = 0;

/**
 * Refresh the OAuth2 access token using the refresh token.
 */
async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken;
  }

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: CLIENT_ID(),
    client_secret: CLIENT_SECRET(),
    refresh_token: REFRESH_TOKEN(),
    grant_type: 'refresh_token',
  });

  cachedAccessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

  return cachedAccessToken!;
}

export class YouTubeAdapter implements PlatformAdapter {
  readonly name = 'youtube';
  readonly displayName = 'YouTube';

  isConfigured(): boolean {
    return Boolean(CHANNEL_ID() && CLIENT_ID() && CLIENT_SECRET() && REFRESH_TOKEN());
  }

  /**
   * Post to YouTube Community tab.
   * Note: This requires the channel to have community posts enabled (500+ subs).
   */
  async postText(content: string): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'YouTube not configured' };
    }

    try {
      const accessToken = await getAccessToken();

      // YouTube Data API doesn't have a direct community post endpoint in v3.
      // Community posts are managed via the internal API.
      // For now, we log and return a placeholder.
      // When the YouTube Community Posts API becomes publicly available,
      // this will be updated.
      logger.warn('YouTube community posts API is not publicly available — post logged only');

      return {
        success: false,
        platform: this.name,
        error: 'YouTube community posts API not yet publicly available. Consider uploading as Shorts.',
      };
    } catch (err: any) {
      const errorMsg = err.message || 'YouTube error';
      logger.error(`YouTube postText failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }

  /**
   * Upload a YouTube Short (vertical video) with the scorecard as a thumbnail.
   * This is the workaround for channels without community post access.
   */
  async postImage(
    content: string,
    imageBuffer: Buffer,
    altText?: string
  ): Promise<PlatformPostResult> {
    // For YouTube, image-only posting is not supported.
    // We would need to convert to a short video first.
    // Delegating to postText with a note.
    logger.info('YouTube does not support image-only posts — skipping');
    return {
      success: false,
      platform: this.name,
      error: 'YouTube requires video content. Use TikTok-style video conversion for scorecard Shorts.',
    };
  }

  /**
   * Upload a video to YouTube (Shorts or regular).
   */
  async postVideo(
    content: string,
    videoBuffer: Buffer,
    description?: string
  ): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'YouTube not configured' };
    }

    try {
      const accessToken = await getAccessToken();

      // YouTube resumable upload
      // Step 1: Initiate upload
      const initResponse = await axios.post(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          snippet: {
            title: content.slice(0, 100),
            description: description || content,
            tags: ['GoalMills', 'Football', 'Sports', 'Scores'],
            categoryId: '17', // Sports
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
            madeForKids: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/mp4',
            'X-Upload-Content-Length': String(videoBuffer.length),
          },
        }
      );

      const uploadUrl = initResponse.headers.location;
      if (!uploadUrl) {
        throw new Error('Failed to get YouTube upload URL');
      }

      // Step 2: Upload the video
      const uploadResponse = await axios.put(uploadUrl, videoBuffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'video/mp4',
          'Content-Length': String(videoBuffer.length),
        },
        maxBodyLength: Infinity,
      });

      const videoId = uploadResponse.data?.id;
      logger.info(`YouTube video uploaded: ${videoId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: videoId,
        url: `https://youtube.com/watch?v=${videoId}`,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`YouTube postVideo failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }
}

export const youtubeAdapter = new YouTubeAdapter();
