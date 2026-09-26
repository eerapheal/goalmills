/**
 * GoalMills Social Engine — X/Twitter Platform Adapter
 *
 * Uses Twitter API v2 (Free Tier: 1,500 tweets/month).
 *
 * Setup:
 * 1. Create a Twitter Developer App at developer.twitter.com
 * 2. Generate API keys and access tokens
 * 3. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET in .env
 */

import { TwitterApi } from 'twitter-api-v2';
import type { PlatformAdapter, PlatformPostResult } from './types';
import { logger } from '../utils/logger';

function getClient(): TwitterApi | null {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return null;
  }

  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  });
}

export class TwitterAdapter implements PlatformAdapter {
  readonly name = 'twitter';
  readonly displayName = 'X / Twitter';

  isConfigured(): boolean {
    return getClient() !== null;
  }

  /**
   * Post a text-only tweet.
   */
  async postText(content: string): Promise<PlatformPostResult> {
    const client = getClient();
    if (!client) {
      return { success: false, platform: this.name, error: 'Twitter not configured' };
    }

    try {
      // Twitter character limit: 280 characters
      const truncated = content.length > 280 ? content.slice(0, 277) + '...' : content;

      const tweet = await client.v2.tweet(truncated);
      const tweetId = tweet.data.id;

      logger.info(`Twitter tweet posted: ${tweetId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: tweetId,
        url: `https://twitter.com/i/status/${tweetId}`,
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown Twitter error';
      logger.error(`Twitter postText failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }

  /**
   * Post a tweet with an image attachment.
   *
   * Process: Upload media → get media_id → create tweet with media
   */
  async postImage(
    content: string,
    imageBuffer: Buffer,
    altText?: string
  ): Promise<PlatformPostResult> {
    const client = getClient();
    if (!client) {
      return { success: false, platform: this.name, error: 'Twitter not configured' };
    }

    try {
      // Step 1: Upload the image
      const mediaId = await client.v1.uploadMedia(imageBuffer, {
        mimeType: 'image/png',
      });

      // Step 2: Set alt text if provided
      if (altText) {
        await client.v1.createMediaMetadata(mediaId, { alt_text: { text: altText } });
      }

      // Step 3: Post the tweet with the media
      const truncated = content.length > 280 ? content.slice(0, 277) + '...' : content;
      const tweet = await client.v2.tweet({
        text: truncated,
        media: { media_ids: [mediaId] },
      });

      const tweetId = tweet.data.id;
      logger.info(`Twitter image tweet posted: ${tweetId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: tweetId,
        url: `https://twitter.com/i/status/${tweetId}`,
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown Twitter error';
      logger.error(`Twitter postImage failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }
}

export const twitterAdapter = new TwitterAdapter();
