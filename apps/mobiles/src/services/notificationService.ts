import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const BASE_URL = 'https://goalmills-web.vercel.app/api';

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export interface NotificationSubscriptionResult {
  granted: boolean;
  token?: string;
  error?: string;
}

export const notificationService = {
  /**
   * Configures Android Notification Channels and requests notification permissions
   */
  registerForPushNotificationsAsync: async (
    topics: string[] = ['all', 'breaking_news', 'live_scores']
  ): Promise<NotificationSubscriptionResult> => {
    try {
      if (Platform.OS === 'android') {
        // High-priority channel for live match scores & goal alerts
        await Notifications.setNotificationChannelAsync('live_scores', {
          name: 'Live Match Scores',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4f9bff',
          sound: 'default',
        });

        // Channel for breaking sports news & highlights
        await Notifications.setNotificationChannelAsync('breaking_news', {
          name: 'Breaking News & Highlights',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 200, 100, 200],
          lightColor: '#10b981',
          sound: 'default',
        });

        // Default general channel
        await Notifications.setNotificationChannelAsync('default', {
          name: 'General Updates',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      if (!Device.isDevice) {
        console.log('Push notifications require a physical device on native platforms.');
        return { granted: false, error: 'Must use physical device for Push Notifications' };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return { granted: false, error: 'Permission not granted for notifications' };
      }

      // Fetch Expo / FCM push token
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId ??
        '624257bb-dbbe-493f-bf52-e0c1911ef4c8';

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const pushToken = tokenData.data;

      // Register with GoalMills backend API
      await fetch(`${BASE_URL}/notifications/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: pushToken,
          platform: Platform.OS === 'android' ? 'android' : 'ios',
          topics,
          deviceInfo: {
            model: Device.modelName || 'Unknown Device',
            osVersion: Device.osVersion || '',
            appVersion: Constants?.expoConfig?.version || '1.0.0',
          },
          enabled: true,
        }),
      });

      return { granted: true, token: pushToken };
    } catch (error: any) {
      console.error('Failed to register for push notifications:', error);
      return { granted: false, error: error?.message || 'Error registering push' };
    }
  },

  /**
   * Fetches recent notification history from backend
   */
  getNotificationHistory: async (limit: number = 20) => {
    try {
      const res = await fetch(`${BASE_URL}/notifications/history?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return [];
    }
  },

  /**
   * Unregisters push token on backend
   */
  unregisterPushToken: async (token: string) => {
    try {
      await fetch(`${BASE_URL}/notifications/register?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      console.error('Error unregistering push token:', err);
      return false;
    }
  },
};
