import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';
import { goalmillsApi } from '../../../services/goalmillsApi';
import { BlogPost, Category } from '@goalmills/types';
import { NewsCard } from '../../../components/NewsCard';
import {
  MOBILE_FILTER_TABS,
  MOBILE_POPULAR_TEAMS,
  newsHistoryUtil,
} from '../../../utils/newsHistory';

export default function NewsScreen() {
  const router = useRouter();
  const [news, setNews] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('Arsenal');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catData = await goalmillsApi.getCategories();
      if (Array.isArray(catData)) {
        setCategories(catData);
      }

      // 2. Fetch news with active filters
      const params: any = {};
      if (activeTab === 'recent') {
        const recent = newsHistoryUtil.getRecentlyViewed();
        const ids = recent.map((r) => r._id).join(',');
        if (ids) params.ids = ids;
      } else if (activeTab === 'favorites') {
        params.team = selectedTeam;
      } else if (activeTab !== 'all') {
        params.filter = activeTab;
      }

      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const data = await goalmillsApi.getNews(params);
      setNews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load news:', error);
      setNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedCategory, selectedTeam, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePress = (id: string) => {
    router.push(`/news/${id}`);
  };

  return (
    <View style={styles.container}>
      {/* Header & Search */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.heading}>Sports Pulse & News</Text>
            <Text style={styles.subheading}>
              Breaking news, transfers & expert analysis
            </Text>
          </View>
          <Pressable style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={20} color="#F8FAFC" />
          </Pressable>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#64748B"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search teams, players, topics..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </Pressable>
          )}
        </View>

        {/* 9+ Filter Tabs Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsSlider}
        >
          {MOBILE_FILTER_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[styles.filterTab, isSelected && styles.activeFilterTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isSelected && styles.activeFilterTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Favorite Teams Bar (when 'favorites' is active) */}
        {activeTab === 'favorites' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamSlider}
          >
            {MOBILE_POPULAR_TEAMS.map((team) => {
              const isSelected = selectedTeam === team;
              return (
                <Pressable
                  key={team}
                  style={[styles.teamChip, isSelected && styles.activeTeamChip]}
                  onPress={() => setSelectedTeam(team)}
                >
                  <Text
                    style={[
                      styles.teamChipText,
                      isSelected && styles.activeTeamChipText,
                    ]}
                  >
                    ⚽ {team}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesSlider}
        >
          <Pressable
            style={[
              styles.categoryChip,
              selectedCategory === 'All' && styles.activeCategoryChip,
            ]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'All' && styles.activeCategoryText,
              ]}
            >
              All Topics
            </Text>
          </Pressable>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <Pressable
                key={cat._id}
                style={[
                  styles.categoryChip,
                  isSelected && styles.activeCategoryChip,
                ]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.activeCategoryText,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Articles List */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading sports pulse...</Text>
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={({ item }) => (
            <NewsCard item={item} onPress={() => handlePress(item._id)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="newspaper-outline" size={48} color="#64748B" />
              <Text style={styles.emptyTitle}>No Stories Found</Text>
              <Text style={styles.emptySubtitle}>
                Try choosing another filter tab or adjusting your search.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B12',
  },
  headerContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: '#070B12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  subheading: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#141C2B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141C2B',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  filterTabsSlider: {
    paddingBottom: 8,
    gap: 6,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeFilterTab: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  teamSlider: {
    paddingBottom: 8,
    gap: 6,
  },
  teamChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  activeTeamChip: {
    backgroundColor: '#1D4ED8',
    borderColor: '#3B82F6',
  },
  teamChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#93C5FD',
  },
  activeTeamChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoriesSlider: {
    paddingBottom: 10,
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeCategoryChip: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeCategoryText: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
});
