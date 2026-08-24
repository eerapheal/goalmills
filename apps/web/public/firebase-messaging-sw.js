// GoalMills Web Push Notification Service Worker
// Standard Firebase Cloud Messaging (FCM) Service Worker

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with default config or placeholder
const firebaseConfig = {
  apiKey: "AIzaSyGoalMillsWebClientConfigPlaceholder",
  authDomain: "goalmills-web.firebaseapp.com",
  projectId: "goalmills-web",
  storageBucket: "goalmills-web.appspot.com",
  messagingSenderId: "103953800507",
  appId: "1:103953800507:web:c672b158097b69c8f"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'GoalMills Sports Alert';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New live sports update available.',
    icon: payload.notification?.icon || payload.data?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    image: payload.notification?.image || payload.data?.imageUrl,
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/',
      topic: payload.data?.topic || 'general',
    },
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'goalmills-alert',
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
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
          client.navigate(targetUrl);
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
