/**
 * GoalMills Social Engine — WhatsApp Platform Adapter
 *
 * Uses WhatsApp Business Cloud API (Meta).
 * Free tier: 1,000 business-initiated conversations/month.
 *
 * Setup:
 * 1. Create a Meta Business Account
 * 2. Set up WhatsApp Business API in Meta Business Suite
 * 3. Create a WhatsApp Channel (for public broadcasting)
 * 4. Set WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN in .env
 */

import axios from 'axios';
import type { PlatformAdapter, PlatformPostResult } from './types';
import { logger } from '../utils/logger';

const PHONE_NUMBER_ID = () => process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = () => process.env.WHATSAPP_ACCESS_TOKEN || '';
const API_BASE = 'https://graph.facebook.com/v21.0';

export class WhatsAppAdapter implements PlatformAdapter {
  readonly name = 'whatsapp';
  readonly displayName = 'WhatsApp';

  isConfigured(): boolean {
    return Boolean(PHONE_NUMBER_ID() && ACCESS_TOKEN());
  }

  async postText(content: string): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'WhatsApp not configured' };
    }

    try {
      // WhatsApp Channel posting via WhatsApp Business API
      // For channels, we use the newsletter endpoint
      const response = await axios.post(
        `${API_BASE}/${PHONE_NUMBER_ID()}/messages`,
        {
          messaging_product: 'whatsapp',
          type: 'text',
          text: { body: content },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const messageId = response.data?.messages?.[0]?.id;
      logger.info(`WhatsApp message sent: ${messageId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: messageId,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`WhatsApp postText failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }

  async postImage(
    content: string,
    imageBuffer: Buffer,
    altText?: string
  ): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'WhatsApp not configured' };
    }

    try {
      // Step 1: Upload media to WhatsApp
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('messaging_product', 'whatsapp');
      form.append('type', 'image/png');
      form.append('file', imageBuffer, {
        filename: 'scorecard.png',
        contentType: 'image/png',
      });

      const uploadResponse = await axios.post(
        `${API_BASE}/${PHONE_NUMBER_ID()}/media`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${ACCESS_TOKEN()}`,
          },
          maxBodyLength: Infinity,
        }
      );

      const mediaId = uploadResponse.data?.id;

      // Step 2: Send image message with caption
      const response = await axios.post(
        `${API_BASE}/${PHONE_NUMBER_ID()}/messages`,
        {
          messaging_product: 'whatsapp',
          type: 'image',
          image: {
            id: mediaId,
            caption: content,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const messageId = response.data?.messages?.[0]?.id;
      logger.info(`WhatsApp image sent: ${messageId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: messageId,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`WhatsApp postImage failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }
}

export const whatsappAdapter = new WhatsAppAdapter();
