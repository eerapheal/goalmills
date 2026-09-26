/**
 * GoalMills Social Engine — LinkedIn Platform Adapter
 *
 * Uses LinkedIn Marketing API to post to a Company/Organization Page.
 *
 * Setup:
 * 1. Create a LinkedIn Page for GoalMills
 * 2. Create a LinkedIn App at linkedin.com/developers
 * 3. Request r_organization_social and w_organization_social permissions
 * 4. Generate an OAuth 2.0 access token
 * 5. Set LINKEDIN_ORG_ID and LINKEDIN_ACCESS_TOKEN in .env
 */

import axios from 'axios';
import type { PlatformAdapter, PlatformPostResult } from './types';
import { logger } from '../utils/logger';

const ORG_ID = () => process.env.LINKEDIN_ORG_ID || '';
const ACCESS_TOKEN = () => process.env.LINKEDIN_ACCESS_TOKEN || '';
const API_BASE = 'https://api.linkedin.com/v2';

export class LinkedInAdapter implements PlatformAdapter {
  readonly name = 'linkedin';
  readonly displayName = 'LinkedIn';

  isConfigured(): boolean {
    return Boolean(ORG_ID() && ACCESS_TOKEN());
  }

  async postText(content: string): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'LinkedIn not configured' };
    }

    try {
      const response = await axios.post(
        `${API_BASE}/ugcPosts`,
        {
          author: `urn:li:organization:${ORG_ID()}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: content },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN()}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const postId = response.headers['x-restli-id'] || response.data?.id;
      logger.info(`LinkedIn post published: ${postId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: postId,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      logger.error(`LinkedIn postText failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }

  async postImage(
    content: string,
    imageBuffer: Buffer,
    altText?: string
  ): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'LinkedIn not configured' };
    }

    try {
      // Step 1: Register the image upload
      const registerResponse = await axios.post(
        `${API_BASE}/assets?action=registerUpload`,
        {
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: `urn:li:organization:${ORG_ID()}`,
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent',
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const uploadUrl =
        registerResponse.data?.value?.uploadMechanism?.[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ]?.uploadUrl;
      const asset = registerResponse.data?.value?.asset;

      if (!uploadUrl || !asset) {
        throw new Error('Failed to get upload URL from LinkedIn');
      }

      // Step 2: Upload the image binary
      await axios.put(uploadUrl, imageBuffer, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN()}`,
          'Content-Type': 'image/png',
        },
        maxBodyLength: Infinity,
      });

      // Step 3: Create the post with the uploaded image
      const response = await axios.post(
        `${API_BASE}/ugcPosts`,
        {
          author: `urn:li:organization:${ORG_ID()}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: content },
              shareMediaCategory: 'IMAGE',
              media: [
                {
                  status: 'READY',
                  description: { text: altText || 'GoalMills Sports Update' },
                  media: asset,
                  title: { text: 'GoalMills' },
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN()}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const postId = response.headers['x-restli-id'] || response.data?.id;
      logger.info(`LinkedIn image post published: ${postId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: postId,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      logger.error(`LinkedIn postImage failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }
}

export const linkedinAdapter = new LinkedInAdapter();
