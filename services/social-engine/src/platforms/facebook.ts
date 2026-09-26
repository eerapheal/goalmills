/**
 * GoalMills Social Engine — Facebook Platform Adapter
 *
 * Uses Facebook Graph API to post to a Facebook Page.
 *
 * Setup:
 * 1. Create a Facebook Page for GoalMills
 * 2. Create a Facebook App at developers.facebook.com
 * 3. Generate a long-lived Page Access Token
 * 4. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in .env
 */

import axios from 'axios';
import FormData from 'form-data';
import type { PlatformAdapter, PlatformPostResult } from './types';
import { logger } from '../utils/logger';

const PAGE_ID = () => process.env.FACEBOOK_PAGE_ID || '';
const ACCESS_TOKEN = () => process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
const GRAPH_API = 'https://graph.facebook.com/v21.0';

export class FacebookAdapter implements PlatformAdapter {
  readonly name = 'facebook';
  readonly displayName = 'Facebook';

  isConfigured(): boolean {
    return Boolean(PAGE_ID() && ACCESS_TOKEN());
  }

  async postText(content: string): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'Facebook not configured' };
    }

    try {
      const response = await axios.post(`${GRAPH_API}/${PAGE_ID()}/feed`, {
        message: content,
        access_token: ACCESS_TOKEN(),
      });

      const postId = response.data?.id;
      logger.info(`Facebook post published: ${postId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: postId,
        url: `https://facebook.com/${postId}`,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`Facebook postText failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }

  async postImage(
    content: string,
    imageBuffer: Buffer,
    altText?: string
  ): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'Facebook not configured' };
    }

    try {
      const form = new FormData();
      form.append('message', content);
      form.append('access_token', ACCESS_TOKEN());
      form.append('source', imageBuffer, {
        filename: 'scorecard.png',
        contentType: 'image/png',
      });

      const response = await axios.post(`${GRAPH_API}/${PAGE_ID()}/photos`, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });

      const postId = response.data?.post_id || response.data?.id;
      logger.info(`Facebook photo published: ${postId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: postId,
        url: `https://facebook.com/${postId}`,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`Facebook postImage failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }
}

export const facebookAdapter = new FacebookAdapter();
