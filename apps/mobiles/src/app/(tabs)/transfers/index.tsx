import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MobileEntityService } from '../../../utils/entityRegistry';
import { goalmillsApi } from '../../../services/goalmillsApi';
import { BlogPost, TransferItem } from '@goalmills/types';

export default function TransfersScreen() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [transferNews, setTransferNews] = useState<BlogPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'done_deal' | 'negotiation' | 'rumour'>('all');

  const loadData = async () => {
    setTransfers(MobileEntityService.getTransfers());
    try {
      const articles = await goalmillsApi.getNews({ articleType: 'transfer', limit: 5 });
      setTransferNews(articles);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredTransfers =
    filterTab === 'all' ? transfers : transfers.filter((t) => t.status === filterTab);

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'done_deal':
        return { text: 'DONE DEAL', bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
      case 'agreement':
      case 'medical':
        return { text: 'AGREED', bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
      case 'negotiation':
        return { text: 'IN TALKS', bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' };
      default:
        return { text: 'RUMOUR', bg: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="trending-up" size={14} color="#10b981" />
          <Text style={styles.badgeText}>24/7 TRANSFER RADAR</Text>
        </View>
        <Text style={styles.title}>Transfer Command Center</Text>
        <Text style={styles.subtitle}>
          Verified signatures, advanced negotiations, fees & scouting insights
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'done_deal', 'negotiation', 'rumour'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilterTab(tab)}
            style={[styles.tabButton, filterTab === tab && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, filterTab === tab && styles.tabTextActive]}>
              {tab === 'all'
                ? 'All Deals'
                : tab === 'done_deal'
                  ? 'Done Deals'
                  : tab === 'negotiation'
                    ? 'In Talks'
                    : 'Rumours'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transfer Cards List */}
      <View style={styles.cardsContainer}>
        {filteredTransfers.map((item) => {
          const pill = getStatusPill(item.status);
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
                  <Text style={[styles.statusText, { color: pill.color }]}>{pill.text}</Text>
                </View>
                {item.fee ? <Text style={styles.feeText}>{item.fee}</Text> : null}
              </View>

              {/* Clubs Visual */}
              <View style={styles.clubsRow}>
                <View style={styles.clubBlock}>
                  {item.fromTeam.logo ? (
                    <Image source={{ uri: item.fromTeam.logo }} style={styles.clubLogo} />
                  ) : null}
                  <Text style={styles.clubName} numberOfLines={1}>
                    {item.fromTeam.name}
                  </Text>
                </View>

                <View style={styles.transferIconWrap}>
                  <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
                </View>

                <View style={styles.clubBlock}>
                  {item.toTeam.logo ? (
                    <Image source={{ uri: item.toTeam.logo }} style={styles.clubLogo} />
                  ) : null}
                  <Text style={styles.clubName} numberOfLines={1}>
                    {item.toTeam.name}
                  </Text>
                </View>
              </View>

              {/* Player Info */}
              <View style={styles.playerRow}>
                <Text style={styles.playerName}>{item.playerName}</Text>
                <Text style={styles.descText}>{item.description}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Transfer News Feed */}
      {transferNews.length > 0 && (
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>Transfer News & Scouting Reports</Text>
          {transferNews.map((news) => (
            <TouchableOpacity
              key={news._id}
              style={styles.newsItem}
              onPress={() => router.push(`/(tabs)/news/${news._id}` as any)}
            >
              {news.image ? <Image source={{ uri: news.image }} style={styles.newsThumb} /> : null}
              <View style={styles.newsContent}>
                <Text style={styles.newsTag}>{news.category || 'Transfer News'}</Text>
                <Text style={styles.newsTitle} numberOfLines={2}>
                  {news.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B12',
  },
  header: {
    padding: 20,
    backgroundColor: '#0d1527',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  tabButton: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3B82F6',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#60A5FA',
  },
  cardsContainer: {
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  feeText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '900',
  },
  clubsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  clubBlock: {
    flex: 1,
    alignItems: 'center',
  },
  clubLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  clubName: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  transferIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  playerName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 1,
  },
  descText: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
  },
  newsSection: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  newsItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  newsThumb: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  newsContent: {
    flex: 1,
    justifyContent: 'center',
  },
  newsTag: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  newsTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  newsDate: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    marginTop: 2,
  },
});
