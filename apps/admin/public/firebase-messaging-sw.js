// GoalMills Web Push Notification Service Worker
// Standard Firebase Cloud Messaging (FCM) & Web Push Service Worker

/* eslint-disable no-undef */

// Parse configuration from URL query params (passed during registration)
const params = new URLSearchParams(self.location.search);
const apiKey = params.get('apiKey') || '';
const projectId = params.get('projectId') || '';
const messagingSenderId = params.get('messagingSenderId') || '';
const appId = params.get('appId') || '';

// Load Firebase compat scripts if configured
try {
  if (apiKey && projectId) {
    importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

    const firebaseConfig = {
      apiKey,
      projectId,
      messagingSenderId,
      appId,
    };

    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
      const messaging = firebase.messaging();

      messaging.onBackgroundMessage((payload) => {
        const title = payload.notification?.title || payload.data?.title || 'GoalMills Sports Alert';
        const options = {
          body: payload.notification?.body || payload.data?.body || 'New live sports update available.',
          icon: payload.notification?.icon || payload.data?.icon || '/icon.png',
          badge: '/icon.png',
          image: payload.notification?.image || payload.data?.imageUrl,
          data: {
            url: payload.data?.url || payload.fcmOptions?.link || '/',
            topic: payload.data?.topic || 'general',
          },
          vibrate: [200, 100, 200],
          tag: payload.data?.tag || 'goalmills-alert',
        };
        return self.registration.showNotification(title, options);
      });
    }
  }
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Firebase SDK init fallback to native push:', err);
}

// Native Web Push event handler
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.notification?.title || data.title || 'GoalMills Sports Alert';
  const options = {
    body: data.notification?.body || data.body || 'New live score or breaking news update.',
    icon: data.notification?.icon || data.icon || '/icon.png',
    badge: '/icon.png',
    image: data.notification?.image || data.imageUrl,
    data: {
      url: data.data?.url || data.url || '/',
      topic: data.data?.topic || data.topic || 'general',
    },
    vibrate: [200, 100, 200],
    tag: data.tag || 'goalmills-alert',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new tab/window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
