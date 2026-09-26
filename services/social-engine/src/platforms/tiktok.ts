/**
 * GoalMills Social Engine — TikTok Platform Adapter
 *
 * Uses TikTok Content Posting API v2.
 * TikTok requires video format (or photo mode carousel via Creator Tools).
 *
 * Setup:
 * 1. Register TikTok Developer App at developers.tiktok.com
 * 2. Request permission: video.publish, video.upload
 * 3. Set TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_ACCESS_TOKEN in .env
 */

import axios from 'axios';
import type { PlatformAdapter, PlatformPostResult } from './types';
import { logger } from '../utils/logger';

const CLIENT_KEY = () => process.env.TIKTOK_CLIENT_KEY || '';
const CLIENT_SECRET = () => process.env.TIKTOK_CLIENT_SECRET || '';
const ACCESS_TOKEN = () => process.env.TIKTOK_ACCESS_TOKEN || '';
const API_BASE = 'https://open.tiktokapis.com/v2';

export class TikTokAdapter implements PlatformAdapter {
  readonly name = 'tiktok';
  readonly displayName = 'TikTok';

  isConfigured(): boolean {
    return Boolean(CLIENT_KEY() && CLIENT_SECRET() && ACCESS_TOKEN());
  }

  /**
   * TikTok does not support text-only posts.
   */
  async postText(content: string): Promise<PlatformPostResult> {
    logger.warn('TikTok does not support text-only posts — skipping');
    return {
      success: false,
      platform: this.name,
      error: 'TikTok requires media (video/photo) content. Text-only posting is unsupported.',
    };
  }

  /**
   * Post image as a photo post or log requirement for video conversion.
   */
  async postImage(
    content: string,
    imageBuffer: Buffer,
    altText?: string
  ): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'TikTok not configured' };
    }

    try {
      // Photo mode posting via TikTok v2 content publishing API
      const initResponse = await axios.post(
        `${API_BASE}/post/publish/content/init/`,
        {
          post_info: {
            title: content.slice(0, 150),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            photo_cover_index: 1,
            photo_images: [imageBuffer.toString('base64')],
          },
          post_mode: 'DIRECT_POST',
          media_type: 'PHOTO',
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const publishId = initResponse.data?.data?.publish_id;
      logger.info(`TikTok photo post initiated: ${publishId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: publishId,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.warn(`TikTok direct photo post not accepted, video format recommended: ${errorMsg}`);
      return {
        success: false,
        platform: this.name,
        error: `TikTok photo upload failed (${errorMsg}). Use animated video slide format.`,
      };
    }
  }

  /**
   * Upload video to TikTok (recommended method).
   */
  async postVideo(
    content: string,
    videoBuffer: Buffer,
    description?: string
  ): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'TikTok not configured' };
    }

    try {
      // Step 1: Initialize direct video post
      const initResponse = await axios.post(
        `${API_BASE}/post/publish/video/init/`,
        {
          post_info: {
            title: (description || content).slice(0, 150),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoBuffer.length,
            chunk_size: videoBuffer.length,
            total_chunk_count: 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const uploadUrl = initResponse.data?.data?.upload_url;
      const publishId = initResponse.data?.data?.publish_id;

      if (!uploadUrl) {
        throw new Error('TikTok did not provide upload_url');
      }

      // Step 2: Upload chunk
      await axios.put(uploadUrl, videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
        },
        maxBodyLength: Infinity,
      });

      logger.info(`TikTok video successfully published: ${publishId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: publishId,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`TikTok postVideo failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }
}

export const tiktokAdapter = new TikTokAdapter();
