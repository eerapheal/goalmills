/**
 * GoalMills Social Engine — Telegram Platform Adapter
 *
 * Uses the Telegram Bot API (100% free, no rate limits).
 * Best platform for testing — easiest to set up.
 *
 * Setup:
 * 1. Message @BotFather on Telegram → /newbot → get token
 * 2. Create a channel → add the bot as admin
 * 3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID in .env
 */

import axios from 'axios';
import FormData from 'form-data';
import type { PlatformAdapter, PlatformPostResult } from './types';
import { logger } from '../utils/logger';

const BOT_TOKEN = () => process.env.TELEGRAM_BOT_TOKEN || '';
const CHANNEL_ID = () => process.env.TELEGRAM_CHANNEL_ID || '';
const API_BASE = () => `https://api.telegram.org/bot${BOT_TOKEN()}`;

export class TelegramAdapter implements PlatformAdapter {
  readonly name = 'telegram';
  readonly displayName = 'Telegram';

  isConfigured(): boolean {
    return Boolean(BOT_TOKEN() && CHANNEL_ID());
  }

  /**
   * Send a text-only message to the Telegram channel.
   */
  async postText(content: string): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'Telegram not configured' };
    }

    try {
      const response = await axios.post(`${API_BASE()}/sendMessage`, {
        chat_id: CHANNEL_ID(),
        text: content,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });

      const messageId = response.data?.result?.message_id;
      logger.info(`Telegram post sent: message_id=${messageId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: String(messageId),
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.description || err.message;
      logger.error(`Telegram postText failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }

  /**
   * Send a photo with caption to the Telegram channel.
   */
  async postImage(
    content: string,
    imageBuffer: Buffer,
    altText?: string
  ): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'Telegram not configured' };
    }

    try {
      const form = new FormData();
      form.append('chat_id', CHANNEL_ID());
      form.append('caption', content);
      form.append('parse_mode', 'HTML');
      form.append('photo', imageBuffer, {
        filename: 'scorecard.png',
        contentType: 'image/png',
      });

      const response = await axios.post(`${API_BASE()}/sendPhoto`, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });

      const messageId = response.data?.result?.message_id;
      logger.info(`Telegram photo sent: message_id=${messageId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: String(messageId),
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.description || err.message;
      logger.error(`Telegram postImage failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }

  /**
   * Send a video to the Telegram channel.
   */
  async postVideo(
    content: string,
    videoBuffer: Buffer,
    description?: string
  ): Promise<PlatformPostResult> {
    if (!this.isConfigured()) {
      return { success: false, platform: this.name, error: 'Telegram not configured' };
    }

    try {
      const form = new FormData();
      form.append('chat_id', CHANNEL_ID());
      form.append('caption', content);
      form.append('parse_mode', 'HTML');
      form.append('video', videoBuffer, {
        filename: 'scorecard.mp4',
        contentType: 'video/mp4',
      });

      const response = await axios.post(`${API_BASE()}/sendVideo`, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });

      const messageId = response.data?.result?.message_id;
      logger.info(`Telegram video sent: message_id=${messageId}`);

      return {
        success: true,
        platform: this.name,
        platformPostId: String(messageId),
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.description || err.message;
      logger.error(`Telegram postVideo failed: ${errorMsg}`);
      return { success: false, platform: this.name, error: errorMsg };
    }
  }
}

export const telegramAdapter = new TelegramAdapter();
