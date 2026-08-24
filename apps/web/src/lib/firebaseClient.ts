'use client';

export interface WebNotificationPreferences {
  enabled: boolean;
  topics: string[];
}

const DEFAULT_TOPICS = ['all', 'breaking_news', 'live_scores'];

/**
 * Checks if browser supports push notifications and service workers
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
}

/**
 * Gets current browser notification permission state
 */
export function getNotificationPermissionState(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

/**
 * Registers browser push notifications with GoalMills backend
 */
export async function requestAndRegisterWebPush(
  topics: string[] = DEFAULT_TOPICS
): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'Push notifications are not supported in this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied or dismissed.' };
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    await navigator.serviceWorker.ready;

    // Check if Firebase Web SDK is available or generate web push subscription token
    let token: string | null = null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    try {
      // Use standard Web Push Subscription
      const sub = await registration.pushManager.getSubscription();
      let pushSub = sub;

      if (!pushSub) {
        pushSub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined,
        });
      }

      if (pushSub) {
        token = JSON.stringify(pushSub);
      }
    } catch (subErr) {
      console.warn('Standard Web Push subscribe fallback:', subErr);
      // Fallback token generated from browser registration
      token = `web_${btoa(navigator.userAgent).slice(0, 20)}_${Date.now()}`;
    }

    if (!token) {
      return { success: false, error: 'Failed to retrieve browser push registration token.' };
    }

    // Register token with backend API
    const response = await fetch('/api/notifications/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: 'web',
        topics,
        deviceInfo: {
          model: navigator.userAgent,
          appVersion: '1.0.0-web',
        },
        enabled: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status} when registering token`);
    }

    // Store in localStorage
    localStorage.setItem('goalmills_web_push_token', token);
    localStorage.setItem('goalmills_web_push_topics', JSON.stringify(topics));
    localStorage.setItem('goalmills_web_push_enabled', 'true');

    return { success: true, token };
  } catch (error: any) {
    console.error('Failed to register web push:', error);
    return { success: false, error: error.message || 'Unknown error registering push.' };
  }
}

/**
 * Disables web push notifications and unregisters token
 */
export async function disableWebPush(): Promise<boolean> {
  try {
    const token = localStorage.getItem('goalmills_web_push_token');
    if (token) {
      await fetch(`/api/notifications/register?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
      });
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
      }
    }

    localStorage.setItem('goalmills_web_push_enabled', 'false');
    return true;
  } catch (error) {
    console.error('Error disabling web push:', error);
    return false;
  }
}

// Helper to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
