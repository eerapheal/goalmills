import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { goalmillsApi } from '../../../services/goalmillsApi';
import { BlogPost } from '@goalmills/types';

export default function AnalysisScreen() {
  const router = useRouter();
  const [tacticalStories, setTacticalStories] = useState<BlogPost[]>([]);
  const [playerStories, setPlayerStories] = useState<BlogPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [tacRes, playerRes] = await Promise.all([
        goalmillsApi.getNews({ articleType: 'tactical_analysis', limit: 4 }),
        goalmillsApi.getNews({ articleType: 'player_analysis', limit: 4 }),
      ]);
      setTacticalStories(tacRes);
      setPlayerStories(playerRes);
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="compass" size={14} color="#3b82f6" />
          <Text style={styles.badgeText}>TACTICAL & DATA LAB</Text>
        </View>
        <Text style={styles.title}>GoalMills Analysis Hub</Text>
        <Text style={styles.subtitle}>
          Masterclass match breakdowns, pressing architectures & player heatmaps
        </Text>
      </View>

      {/* Intelligence Categories Strip */}
      <View style={styles.pillarsContainer}>
        <View style={styles.pillarCard}>
          <Ionicons name="layers" size={20} color="#3b82f6" />
          <Text style={styles.pillarTitle}>Match Tactics</Text>
          <Text style={styles.pillarDesc}>Formations & Transitions</Text>
        </View>
        <View style={styles.pillarCard}>
          <Ionicons name="locate" size={20} color="#10b981" />
          <Text style={styles.pillarTitle}>Player Scouts</Text>
          <Text style={styles.pillarDesc}>Heatmaps & Progressive Play</Text>
        </View>
        <View style={styles.pillarCard}>
          <Ionicons name="stats-chart" size={20} color="#f59e0b" />
          <Text style={styles.pillarTitle}>Data Metrics</Text>
          <Text style={styles.pillarDesc}>xG & Expected Points</Text>
        </View>
      </View>

      {/* Tactical Analysis Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tactical Breakdowns & Systems</Text>
        {tacticalStories.length > 0 ? (
          tacticalStories.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.articleCard}
              onPress={() => router.push(`/(tabs)/news/${item._id}` as any)}
            >
              {item.image && <Image source={{ uri: item.image }} style={styles.articleImage} />}
              <View style={styles.articleBody}>
                <Text style={styles.categoryLabel}>{item.category || 'Tactical Analysis'}</Text>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.excerpt && (
                  <Text style={styles.articleExcerpt} numberOfLines={2}>
                    {item.excerpt}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Fresh tactical breakdowns updating soon.</Text>
          </View>
        )}
      </View>

      {/* Player Deep Dives */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Player Deep Dives & Scouting</Text>
        {playerStories.length > 0
          ? playerStories.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.articleCard}
                onPress={() => router.push(`/(tabs)/news/${item._id}` as any)}
              >
                {item.image && <Image source={{ uri: item.image }} style={styles.articleImage} />}
                <View style={styles.articleBody}>
                  <Text style={styles.categoryLabel}>{item.category || 'Player Scouting'}</Text>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          : null}
      </View>
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
    backgroundColor: '#09152b',
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#3b82f6',
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
  pillarsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  pillarCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    alignItems: 'center',
    textAlign: 'center',
  },
  pillarTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  pillarDesc: {
    color: '#64748b',
    fontSize: 9,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  articleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 140,
  },
  articleBody: {
    padding: 14,
  },
  categoryLabel: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  articleTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    marginBottom: 4,
  },
  articleExcerpt: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },
  emptyCard: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
  },
});
