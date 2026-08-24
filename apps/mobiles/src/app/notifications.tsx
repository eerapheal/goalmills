import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../services/notificationService';
import { useToast } from '../components/Toast';

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  topic?: string;
  createdAt: string;
  data?: {
    url?: string;
    matchId?: string;
    newsId?: string;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const toast = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [liveScoresEnabled, setLiveScoresEnabled] = useState(true);
  const [newsEnabled, setNewsEnabled] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const items = await notificationService.getNotificationHistory(30);
      setNotifications(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const items = await notificationService.getNotificationHistory(30);
    setNotifications(items);
    setRefreshing(false);
  };

  const handleTogglePush = async (value: boolean) => {
    if (value) {
      const topics: string[] = ['all'];
      if (liveScoresEnabled) topics.push('live_scores');
      if (newsEnabled) topics.push('breaking_news');

      const res = await notificationService.registerForPushNotificationsAsync(topics);
      if (res.granted) {
        setPushEnabled(true);
        toast.success('Push notifications enabled!');
      } else {
        toast.error(res.error || 'Push notification permission was denied');
        setPushEnabled(false);
      }
    } else {
      setPushEnabled(false);
      toast.info('Push notifications disabled');
    }
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (item.data?.newsId) {
      router.push(`/(tabs)/news/${item.data.newsId}` as any);
    } else if (item.data?.matchId) {
      router.push(`/(tabs)/home/football/matches/${item.data.matchId}` as any);
    } else if (item.data?.url) {
      // General navigation if relevant
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Alerts &amp; Notifications</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadData}
          accessibilityLabel="Refresh notifications"
        >
          <Ionicons name="refresh" size={20} color="#4f9bff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f9bff"
          />
        }
      >
        {/* Master Push Toggle Card */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications" size={22} color="#4f9bff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>Push Notifications</Text>
              <Text style={styles.cardSubtitle}>
                Receive real-time match goals, live scores, and breaking news alerts.
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: '#334155', true: '#2563eb' }}
              thumbColor={pushEnabled ? '#60a5fa' : '#94a3b8'}
            />
          </View>

          {/* Preferences Section */}
          <View style={styles.subSettings}>
            <View style={styles.subRow}>
              <Text style={styles.subText}>Live Match &amp; Goal Alerts</Text>
              <Switch
                value={liveScoresEnabled}
                onValueChange={setLiveScoresEnabled}
                disabled={!pushEnabled}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor={liveScoresEnabled ? '#34d399' : '#94a3b8'}
              />
            </View>

            <View style={styles.subRow}>
              <Text style={styles.subText}>Breaking News &amp; Highlights</Text>
              <Switch
                value={newsEnabled}
                onValueChange={setNewsEnabled}
                disabled={!pushEnabled}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor={newsEnabled ? '#34d399' : '#94a3b8'}
              />
            </View>
          </View>
        </View>

        {/* Notifications Feed Header */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Recent Activity</Text>
          <Text style={styles.feedBadge}>FCM Powered</Text>
        </View>

        {/* Notifications List */}
        {loading ? (
          <ActivityIndicator size="large" color="#4f9bff" style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#64748b" />
            <Text style={styles.emptyTitle}>No Notifications Yet</Text>
            <Text style={styles.emptyText}>
              Turn on push alerts above to receive instant scores, goal updates, and sports highlights.
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.notificationItem}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.itemIconWrapper}>
                <Ionicons
                  name={
                    item.topic === 'live_scores'
                      ? 'football-outline'
                      : 'newspaper-outline'
                  }
                  size={20}
                  color="#4f9bff"
                />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemTime}>
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.itemBody}>{item.body}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001224',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 12,
    backgroundColor: '#001f3f',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 155, 255, 0.12)',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  toggleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(79, 155, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  subSettings: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subText: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  feedBadge: {
    fontSize: 11,
    color: '#4f9bff',
    backgroundColor: 'rgba(79, 155, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  itemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 155, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  itemTime: {
    fontSize: 11,
    color: '#64748b',
  },
  itemBody: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
