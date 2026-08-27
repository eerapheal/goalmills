import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const BASE_URL = 'https://goalmills-web.vercel.app/api';

// Safe lazy-loader for expo-notifications to prevent Android Expo Go SDK 53 crash
let _notificationsModule: any = null;

function getNotifications(): any {
  if (_notificationsModule !== null) {
    return _notificationsModule;
  }

  const isExpoGo =
    Constants.appOwnership === 'expo' || (Constants as any).executionEnvironment === 'storeClient';
  const isAndroidExpoGo = Platform.OS === 'android' && isExpoGo;

  // Never require expo-notifications on Android inside Expo Go (SDK 53+ restriction)
  if (isAndroidExpoGo) {
    _notificationsModule = false;
    return null;
  }

  try {
    _notificationsModule = require('expo-notifications');
    if (_notificationsModule?.setNotificationHandler) {
      _notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: _notificationsModule.AndroidNotificationPriority?.HIGH ?? 2,
        }),
      });
    }
    return _notificationsModule;
  } catch (e) {
    _notificationsModule = false;
    return null;
  }
}

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
      const Notifications = getNotifications();

      // Expo Go on Android removed native push notification support in SDK 53
      if (!Notifications) {
        console.log(
          '[NotificationService] Notice: Push notifications in Expo Go on Android are disabled. Mock token active for local testing.'
        );
        return { granted: true, token: 'ExponentPushToken[ExpoGoDevMockToken]' };
      }

      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('live_scores', {
            name: 'Live Match Scores',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4f9bff',
            sound: 'default',
          });

          await Notifications.setNotificationChannelAsync('breaking_news', {
            name: 'Breaking News & Highlights',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 200, 100, 200],
            lightColor: '#10b981',
            sound: 'default',
          });

          await Notifications.setNotificationChannelAsync('default', {
            name: 'General Updates',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: 'default',
          });
        } catch (channelErr) {
          console.warn('[NotificationService] Channel setup notice:', channelErr);
        }
      }

      if (!Device.isDevice) {
        console.log('Push notifications require a physical device on native platforms.');
        return { granted: false, error: 'Must use physical device for Push Notifications' };
      }

      let finalStatus = 'undetermined';
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      } catch (permErr) {
        console.warn('[NotificationService] Permissions request notice:', permErr);
      }

      if (finalStatus !== 'granted') {
        return { granted: false, error: 'Permission not granted for notifications' };
      }

      let pushToken = 'ExponentPushToken[ExpoGoDevMockToken]';
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId ??
          '624257bb-dbbe-493f-bf52-e0c1911ef4c8';

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        if (tokenData?.data) {
          pushToken = tokenData.data;
        }
      } catch (tokenErr: any) {
        console.warn('[NotificationService] Push token notice:', tokenErr?.message);
      }

      // Register with GoalMills backend API
      try {
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
      } catch (backendErr) {
        console.warn('[NotificationService] Backend registration notice:', backendErr);
      }

      return { granted: true, token: pushToken };
    } catch (error: any) {
      console.warn('[NotificationService] Notice:', error?.message);
      return { granted: false, error: error?.message || 'Notice registering push' };
    }
  },

  /**
   * Safe listener registration for foreground notifications
   */
  addReceivedListener: (callback: (notification: any) => void) => {
    const Notifications = getNotifications();
    if (!Notifications?.addNotificationReceivedListener) return null;
    try {
      return Notifications.addNotificationReceivedListener(callback);
    } catch (e) {
      return null;
    }
  },

  /**
   * Safe listener registration for notification clicks/responses
   */
  addResponseListener: (callback: (response: any) => void) => {
    const Notifications = getNotifications();
    if (!Notifications?.addNotificationResponseReceivedListener) return null;
    try {
      return Notifications.addNotificationResponseReceivedListener(callback);
    } catch (e) {
      return null;
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
