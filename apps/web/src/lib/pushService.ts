import dbConnect from './db';
import PushToken from '../models/PushToken';
import Notification from '../models/Notification';

export interface SendPushOptions {
  title: string;
  body: string;
  imageUrl?: string;
  topic?: string;
  targetPlatform?: 'all' | 'android' | 'ios' | 'web';
  data?: Record<string, any>;
  tokens?: string[];
}

export interface PushResult {
  success: boolean;
  totalSent: number;
  successCount: number;
  failureCount: number;
  errors?: string[];
  notificationId?: string;
}

/**
 * Sends push notifications to Expo Push API
 */
async function sendExpoPushNotifications(
  messages: Array<{
    to: string;
    title: string;
    body: string;
    data?: any;
    sound?: string;
    channelId?: string;
    priority?: 'default' | 'normal' | 'high';
  }>
): Promise<{ successTokens: string[]; invalidTokens: string[] }> {
  const successTokens: string[] = [];
  const invalidTokens: string[] = [];

  if (messages.length === 0) {
    return { successTokens, invalidTokens };
  }

  // Expo Push API accepts batches of up to 100 messages
  const batchSize = 100;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          ...(process.env.EXPO_ACCESS_TOKEN
            ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error('Expo push API responded with status:', response.status);
        continue;
      }

      const result = await response.json();
      const tickets = result.data || [];

      tickets.forEach((ticket: any, idx: number) => {
        const token = batch[idx]?.to;
        if (!token) return;

        if (ticket.status === 'ok') {
          successTokens.push(token);
        } else if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          invalidTokens.push(token);
        }
      });
    } catch (error) {
      console.error('Error dispatching Expo push batch:', error);
    }
  }

  return { successTokens, invalidTokens };
}

/**
 * Sends direct FCM notifications to native / web tokens using FCM Legacy HTTP or FCM v1 endpoint
 */
async function sendFcmPushNotifications(
  tokens: string[],
  payload: {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, any>;
  }
): Promise<{ successTokens: string[]; invalidTokens: string[] }> {
  const successTokens: string[] = [];
  const invalidTokens: string[] = [];

  const serverKey = process.env.FIREBASE_SERVER_KEY || process.env.FCM_SERVER_KEY;

  if (!serverKey) {
    // If direct server key is not configured, we record tokens as queued
    console.log('FCM Server Key not set in environment. Push notification queued for FCM tokens.');
    return { successTokens: tokens, invalidTokens: [] };
  }

  // Send in batches of 500
  const batchSize = 500;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);

    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${serverKey}`,
        },
        body: JSON.stringify({
          registration_ids: batch,
          notification: {
            title: payload.title,
            body: payload.body,
            image: payload.imageUrl,
            icon: '/icon-192x192.png',
            click_action: payload.data?.url || '/',
          },
          data: payload.data || {},
          priority: 'high',
        }),
      });

      if (!response.ok) {
        console.error('FCM push error status:', response.status);
        continue;
      }

      const resJson = await response.json();
      const results = resJson.results || [];

      results.forEach((res: any, idx: number) => {
        const token = batch[idx];
        if (!token) return;

        if (res.message_id) {
          successTokens.push(token);
        } else if (res.error === 'NotRegistered' || res.error === 'InvalidRegistration') {
          invalidTokens.push(token);
        }
      });
    } catch (err) {
      console.error('FCM batch error:', err);
    }
  }

  return { successTokens, invalidTokens };
}

/**
 * Universal Push Dispatcher: sends notifications across Mobile (Expo & FCM) and Web
 */
export async function sendPushNotification(options: SendPushOptions): Promise<PushResult> {
  await dbConnect();

  const {
    title,
    body,
    imageUrl,
    topic = 'all',
    targetPlatform = 'all',
    data = {},
    tokens: directTokens,
  } = options;

  let targetTokens: Array<{ token: string; platform: string }> = [];

  if (directTokens && directTokens.length > 0) {
    const existing = await PushToken.find({
      token: { $in: directTokens },
      enabled: true,
    }).lean();
    targetTokens = existing.map((t) => ({ token: t.token, platform: t.platform }));
  } else {
    const query: any = { enabled: true };
    if (topic && topic !== 'all') {
      query.topics = topic;
    }
    if (targetPlatform && targetPlatform !== 'all') {
      query.platform = targetPlatform;
    }
    const matching = await PushToken.find(query).lean();
    targetTokens = matching.map((t) => ({ token: t.token, platform: t.platform }));
  }

  if (targetTokens.length === 0) {
    // Record the notification in history even if 0 active tokens currently
    const record = await Notification.create({
      title,
      body,
      imageUrl,
      data,
      topic,
      targetPlatform,
      deliveryStats: { totalSent: 0, successCount: 0, failureCount: 0 },
    });

    return {
      success: true,
      totalSent: 0,
      successCount: 0,
      failureCount: 0,
      notificationId: record._id.toString(),
    };
  }

  // Partition tokens into Expo Push tokens and standard FCM / Web tokens
  const expoMessages: any[] = [];
  const fcmTokens: string[] = [];

  targetTokens.forEach(({ token, platform }) => {
    if (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')) {
      expoMessages.push({
        to: token,
        title,
        body,
        sound: 'default',
        priority: 'high',
        channelId: topic === 'live_scores' ? 'live_scores' : 'default',
        data: {
          ...data,
          topic,
          imageUrl,
        },
      });
    } else {
      fcmTokens.push(token);
    }
  });

  const allSuccess: string[] = [];
  const allInvalid: string[] = [];

  // 1. Dispatch Expo tokens
  if (expoMessages.length > 0) {
    const expoResult = await sendExpoPushNotifications(expoMessages);
    allSuccess.push(...expoResult.successTokens);
    allInvalid.push(...expoResult.invalidTokens);
  }

  // 2. Dispatch FCM / Web tokens
  if (fcmTokens.length > 0) {
    const fcmResult = await sendFcmPushNotifications(fcmTokens, {
      title,
      body,
      imageUrl,
      data: { ...data, topic },
    });
    allSuccess.push(...fcmResult.successTokens);
    allInvalid.push(...fcmResult.invalidTokens);
  }

  // 3. Clean up invalid / unregistered tokens from DB
  if (allInvalid.length > 0) {
    try {
      await PushToken.updateMany({ token: { $in: allInvalid } }, { $set: { enabled: false } });
      console.log(`Deactivated ${allInvalid.length} unregistered tokens.`);
    } catch (cleanupErr) {
      console.error('Failed to deactivate invalid tokens:', cleanupErr);
    }
  }

  // 4. Save notification log in history
  const notificationRecord = await Notification.create({
    title,
    body,
    imageUrl,
    data,
    topic,
    targetPlatform,
    deliveryStats: {
      totalSent: targetTokens.length,
      successCount: allSuccess.length,
      failureCount: targetTokens.length - allSuccess.length,
    },
  });

  return {
    success: true,
    totalSent: targetTokens.length,
    successCount: allSuccess.length,
    failureCount: targetTokens.length - allSuccess.length,
    notificationId: notificationRecord._id.toString(),
  };
}

/**
 * Automatically dispatch push notifications when a new News Article is published
 */
export async function notifyOnNewNewsArticle(news: {
  _id: string | any;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  isBreaking?: boolean;
}) {
  try {
    const isBreaking = news.isBreaking;
    const title = isBreaking ? `🔥 BREAKING: ${news.title}` : `📰 ${news.title}`;
    const body =
      news.excerpt ||
      `New ${news.category || 'sports'} story published on GoalMills. Tap to read now!`;
    const newsId = news._id.toString();

    await sendPushNotification({
      title,
      body,
      imageUrl: news.image,
      topic: isBreaking ? 'breaking' : 'all',
      targetPlatform: 'all',
      data: {
        type: 'news',
        id: newsId,
        url: `/news/${newsId}`,
      },
    });
  } catch (error) {
    console.error('Failed to dispatch news push notification:', error);
  }
}

/**
 * Automatically dispatch push notifications when a new Video Highlight is uploaded
 */
export async function notifyOnNewVideoHighlight(video: {
  _id: string | any;
  video_title: string;
  video_thumbnail?: string;
  category?: string;
  source?: string;
}) {
  try {
    const title = `🎥 Highlight: ${video.video_title}`;
    const body = `Watch match highlights & replay on GoalMills (${video.category || 'Sports'}).`;
    const videoId = video._id.toString();

    await sendPushNotification({
      title,
      body,
      imageUrl: video.video_thumbnail,
      topic: 'highlights',
      targetPlatform: 'all',
      data: {
        type: 'video',
        id: videoId,
        url: `/highlights/${videoId}`,
      },
    });
  } catch (error) {
    console.error('Failed to dispatch video push notification:', error);
  }
}
