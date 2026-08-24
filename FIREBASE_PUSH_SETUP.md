# Firebase Push Notification Setup Guide (Mobile & Web)

**GoalMills Unified Push Notification Gateway**  
**Supported Platforms:** Android (FCM), iOS (APNs/FCM), Web (FCM Web Push)

---

## 1. Architecture Summary

GoalMills is equipped with a unified push notification system:
1. **Mobile App (`apps/mobiles`)**:
   - Integrated with `expo-notifications` and FCM.
   - Automatically registers push tokens to `/api/notifications/register`.
   - Supports foreground banners, background notifications, and deep links (e.g. to match details or news).
   - In-app Notification Center with topic toggles (`live_scores`, `breaking_news`, `all`).

2. **Web App (`apps/web`)**:
   - Integrated with Firebase Web Push Service Worker (`/public/firebase-messaging-sw.js`).
   - Interactive glassmorphic Notification Bell dropdown with toggle to enable browser push alerts.
   - Real-time alert feed.

3. **Backend API (`apps/web/src/app/api/notifications`)**:
   - `POST /api/notifications/register`: Registers / updates token with topics.
   - `POST /api/notifications/send`: Universal push dispatcher.
   - `GET /api/notifications/history`: Fetches past notification alerts.

---

## 2. Environment Variables Configuration

Add the following keys to your `.env` files:

### Web App (`apps/web/.env`)
```env
# MongoDB Connection (Already Configured)
MONGODB_URL="mongodb+srv://goalmills:G8jQXggyUTu5Dk45@goalmills.7oliki1.mongodb.net/?appName=goalmills"

# Firebase Cloud Messaging Server Key (from Firebase Console > Project Settings > Cloud Messaging)
FIREBASE_SERVER_KEY="your_firebase_fcm_server_key_here"

# Web Push VAPID Public Key (from Firebase Console > Cloud Messaging > Web Push certificates)
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your_web_push_vapid_public_key_here"

# Optional: Admin API Key to protect /api/notifications/send endpoint
ADMIN_NOTIFICATION_KEY="your_admin_secret_key"
```

---

## 3. How to Send Push Notifications via API

You can trigger a push notification to all users or specific topics using `POST /api/notifications/send`:

### Example 1: Broadcast a Live Match Score Alert
```bash
curl -X POST https://goalmills-web.vercel.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "⚽ GOAL! Arsenal 1 - 0 Chelsea",
    "body": "Bukayo Saka scores in the 34th minute with a sensational curler!",
    "topic": "live_scores",
    "targetPlatform": "all",
    "data": {
      "matchId": "12345",
      "sport": "football"
    }
  }'
```

### Example 2: Broadcast Breaking Sports News
```bash
curl -X POST https://goalmills-web.vercel.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🏆 Breaking News: Champions League Draw",
    "body": "The quarter-final matchups have just been confirmed. Tap to read more.",
    "topic": "breaking_news",
    "targetPlatform": "all",
    "data": {
      "newsId": "65f8a91b2c4e8d0012345678",
      "url": "/news"
    }
  }'
```

---

## 4. Firebase Console Setup Steps

1. **Go to Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
2. **Select / Create Project**: "GoalMills"
3. **For Web Push**:
   - Go to **Project Settings > Cloud Messaging**.
   - Under **Web configuration > Web Push certificates**, click **Generate key pair**.
   - Copy the public key and set it as `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in `apps/web/.env`.
4. **For Android / iOS Mobile (EAS Build)**:
   - In Firebase Console, add an Android app with package name `com.goalmills.app`.
   - Download `google-services.json` and place it in `apps/mobiles/` if building native APKs/AABs via EAS or `expo run:android`.
   - Expo handles FCM push routing automatically through your project's EAS credentials.
