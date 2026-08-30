import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { CricketIccRankingItem } from '@goalmills/types';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';

type Format = 'test' | 'odi' | 't20';
type Category = 'teams' | 'batting' | 'bowling';
type Gender = 'men' | 'women';

export default function CricketRankingsScreen() {
  const router = useRouter();
  const [activeGender, setActiveGender] = useState<Gender>('men');
  const [activeFormat, setActiveFormat] = useState<Format>('test');
  const [activeCategory, setActiveCategory] = useState<Category>('teams');
  const [loading, setLoading] = useState(false);
  const [rankings, setRankings] = useState<CricketIccRankingItem[]>([]);

  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      try {
        const response = await advancedCricketApi.getRankings(
          activeFormat,
          activeCategory,
          activeGender
        );
        setRankings(response.rankings || []);
      } catch (error) {
        console.error('Error loading mobile ICC rankings:', error);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    };
    loadRankings();
  }, [activeFormat, activeCategory, activeGender]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'ICC Rankings',
          headerStyle: { backgroundColor: '#0a0e27' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={{ marginLeft: 0 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Gender Toggle */}
        <View style={styles.genderToggle}>
          <TouchableOpacity
            style={[styles.genderBtn, activeGender === 'men' && styles.genderBtnActive]}
            onPress={() => setActiveGender('men')}
          >
            <Text style={[styles.genderText, activeGender === 'men' && styles.genderTextActive]}>
              Men&apos;s Cricket
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderBtn, activeGender === 'women' && styles.genderBtnActive]}
            onPress={() => setActiveGender('women')}
          >
            <Text style={[styles.genderText, activeGender === 'women' && styles.genderTextActive]}>
              Women&apos;s Cricket
            </Text>
          </TouchableOpacity>
        </View>

        {/* Format Tabs */}
        <View style={styles.formatTabs}>
          {(['test', 'odi', 't20'] as Format[]).map((fmt) => (
            <TouchableOpacity
              key={fmt}
              style={[styles.formatBtn, activeFormat === fmt && styles.formatBtnActive]}
              onPress={() => setActiveFormat(fmt)}
            >
              <Text style={[styles.formatText, activeFormat === fmt && styles.formatTextActive]}>
                {fmt === 't20' ? 'T20I' : fmt.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Chips */}
        <View style={styles.categoryRow}>
          {[
            { id: 'teams', label: 'Teams' },
            { id: 'batting', label: 'Batting' },
            { id: 'bowling', label: 'Bowling' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat.id as Category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rankings Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>#</Text>
            <Text style={[styles.thText, { flex: 4 }]}>
              {activeCategory === 'teams' ? 'Nation' : 'Player'}
            </Text>
            <Text style={[styles.thText, { flex: 2, textAlign: 'right' }]}>Rating</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Trend</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.secondary} />
            </View>
          ) : rankings.length > 0 ? (
            rankings.map((item, idx) => {
              const isFirst = item.rank === 1;
              return (
                <View key={idx} style={styles.tableRow}>
                  <View style={[styles.rankBadge, isFirst && styles.rankBadgeFirst]}>
                    <Text style={[styles.rankText, isFirst && styles.rankTextFirst]}>
                      {item.rank}
                    </Text>
                  </View>

                  <View style={{ flex: 4, paddingHorizontal: 6 }}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.team_name || item.player_name}
                    </Text>
                    {activeCategory !== 'teams' && (
                      <Text style={styles.itemSub}>{item.country}</Text>
                    )}
                  </View>

                  <Text style={styles.ratingText}>{item.rating}</Text>

                  <View style={{ flex: 1, alignItems: 'center' }}>
                    {item.trend === 'up' ? (
                      <Text style={{ color: '#34d399', fontSize: 12, fontWeight: '900' }}>▲</Text>
                    ) : item.trend === 'down' ? (
                      <Text style={{ color: '#f43f5e', fontSize: 12, fontWeight: '900' }}>▼</Text>
                    ) : (
                      <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>—</Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No rankings data available.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    gap: 4,
    marginBottom: SPACING.sm,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  genderBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  genderText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  genderTextActive: {
    color: '#60A5FA',
  },
  formatTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
    gap: 2,
    marginBottom: SPACING.xs,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  formatBtnActive: {
    backgroundColor: '#3B82F6',
  },
  formatText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  formatTextActive: {
    color: '#fff',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    flex: 1,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3B82F6',
  },
  categoryText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  categoryTextActive: {
    color: '#60A5FA',
  },
  tableCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  thText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeFirst: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  rankText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
  },
  rankTextFirst: {
    color: '#fbbf24',
  },
  itemName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  itemSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  ratingText: {
    flex: 2,
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
