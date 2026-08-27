import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { CricketLeague, CricketEvent } from '@goalmills/types';
import { advancedCricketApi } from '../../../../../services/advancedCricketApi';
import { CricketMatchCard } from '../../../../../components/CricketMatchCard';
import { Ionicons } from '@expo/vector-icons';

type SeriesTab = 'matches' | 'table' | 'squads' | 'venues' | 'news';

export default function CricketSeriesDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<CricketLeague | null>(null);
  const [activeTab, setActiveTab] = useState<SeriesTab>('matches');
  const [matches, setMatches] = useState<CricketEvent[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [squads, setSquads] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch series metadata
        const leaguesRes = await advancedCricketApi.getLeagues();
        const foundSeries = leaguesRes.result?.find((l) => String(l.league_key) === String(id));
        setSeries(
          foundSeries || {
            league_key: String(id),
            league_name: `Cricket Series #${id}`,
            country_name: 'International',
            league_season: '2026',
            league_year: '2026',
          }
        );

        // Fetch all series data in parallel
        const [matchesRes, standingsRes, squadsRes, venuesRes, newsRes] = await Promise.all([
          advancedCricketApi.getSeriesMatches(id).catch(() => ({ result: [] })),
          advancedCricketApi.getSeriesPointsTable(id).catch(() => ({ result: [] })),
          advancedCricketApi.getSeriesSquads(id).catch(() => ({ result: [] })),
          advancedCricketApi.getSeriesVenues(id).catch(() => ({ result: [] })),
          advancedCricketApi.getSeriesNews(id).catch(() => ({ result: [] })),
        ]);

        setMatches(matchesRes?.result || []);
        setStandings(standingsRes?.result || []);
        setSquads(squadsRes?.result || (Array.isArray(squadsRes) ? squadsRes : []));
        setVenues(venuesRes?.result || (Array.isArray(venuesRes) ? venuesRes : []));
        setNews(newsRes?.result || newsRes?.storyList || []);
      } catch (error) {
        console.error('Error loading mobile series details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.secondary} size="large" />
      </View>
    );
  if (!series)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Series not found</Text>
      </View>
    );

  const tabs: { id: SeriesTab; label: string; icon: any }[] = [
    { id: 'matches', label: 'Matches', icon: 'calendar-outline' },
    { id: 'table', label: 'Standings', icon: 'trophy-outline' },
    { id: 'squads', label: 'Squads', icon: 'people-outline' },
    { id: 'venues', label: 'Venues', icon: 'location-outline' },
    { id: 'news', label: 'News', icon: 'newspaper-outline' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: series.league_name,
          headerStyle: { backgroundColor: '#0a0e27' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 0 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerImage}>
          {series.league_logo ? (
            <Image
              source={{ uri: series.league_logo }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Text style={{ fontSize: 48, fontWeight: '900', color: COLORS.secondary }}>
                {series.league_name.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.imageOverlay} />
          <View style={styles.headerContentOverlay}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{series.league_season || '2026'}</Text>
            </View>
            <Text style={styles.title}>{series.league_name}</Text>
            <Text style={styles.subtitle}>
              {series.country_name || 'Tournament Hub'} • {matches.length} Matches
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)'}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content: Matches */}
      {activeTab === 'matches' && (
        <FlatList
          data={matches}
          renderItem={({ item }) => <CricketMatchCard match={item} />}
          keyExtractor={(item) => item.event_key.toString()}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No scheduled fixtures or recent results available.
              </Text>
            </View>
          }
        />
      )}

      {/* Tab Content: Standings / Points Table */}
      {activeTab === 'table' && (
        <ScrollView contentContainerStyle={styles.content}>
          {standings.length > 0 ? (
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeadCol, { flex: 3 }]}>Team</Text>
                <Text style={[styles.tableHeadCol, { flex: 1, textAlign: 'center' }]}>P</Text>
                <Text style={[styles.tableHeadCol, { flex: 1, textAlign: 'center' }]}>W</Text>
                <Text style={[styles.tableHeadCol, { flex: 1, textAlign: 'center' }]}>L</Text>
                <Text style={[styles.tableHeadCol, { flex: 1.2, textAlign: 'center' }]}>PTS</Text>
                <Text style={[styles.tableHeadCol, { flex: 1.5, textAlign: 'right' }]}>NRR</Text>
              </View>
              {standings.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.rankNum}>{row.standing_place || idx + 1}</Text>
                    <Text style={styles.teamNameText} numberOfLines={1}>
                      {row.team_name || row.team_short_name}
                    </Text>
                  </View>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                    {row.standing_P}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#10b981' }]}
                  >
                    {row.standing_W}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#f43f5e' }]}
                  >
                    {row.standing_L}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { flex: 1.2, textAlign: 'center', fontWeight: '900', color: '#fbbf24' },
                    ]}
                  >
                    {row.standing_PTS}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { flex: 1.5, textAlign: 'right', color: 'rgba(255,255,255,0.6)' },
                    ]}
                  >
                    {row.standing_NRR}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Points table standings are currently being compiled.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Tab Content: Squads */}
      {activeTab === 'squads' && (
        <ScrollView contentContainerStyle={styles.content}>
          {squads.length > 0 ? (
            squads.map((sq, idx) => (
              <View key={idx} style={styles.squadCard}>
                <View style={styles.squadAvatar}>
                  <Text style={styles.squadInitial}>
                    {sq.squad_name ? sq.squad_name.charAt(0) : 'S'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.squadTitle}>{sq.squad_name}</Text>
                  <Text style={styles.squadSubtitle}>{sq.squad_type || 'Official Squad'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Official squad rosters will be announced soon.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Tab Content: Venues */}
      {activeTab === 'venues' && (
        <ScrollView contentContainerStyle={styles.content}>
          {venues.length > 0 ? (
            venues.map((v, idx) => (
              <View key={idx} style={styles.venueCard}>
                <Ionicons name="location" size={24} color={COLORS.secondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.venueTitle}>{v.ground}</Text>
                  <Text style={styles.venueSubtitle}>
                    {v.city}
                    {v.country ? `, ${v.country}` : ''}
                  </Text>
                  {v.capacity && <Text style={styles.venueCapacity}>Capacity: {v.capacity}</Text>}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Venue locations pending tournament release.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Tab Content: News */}
      {activeTab === 'news' && (
        <ScrollView contentContainerStyle={styles.content}>
          {news.length > 0 ? (
            news.map((item, idx) => (
              <View key={idx} style={styles.newsCard}>
                <Text style={styles.newsBadge}>TOURNAMENT INTEL</Text>
                <Text style={styles.newsTitle}>
                  {item.headline || item.title || 'Cricket News'}
                </Text>
                <Text style={styles.newsIntro} numberOfLines={2}>
                  {item.intro || item.description || ''}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No editorial news articles posted yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#0a0e27',
  },
  headerImage: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 14, 39, 0.8)',
  },
  headerContentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0a0e27',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: '#fff',
  },
  tableCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tableHeadCol: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  rankNum: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '800',
    width: 16,
  },
  teamNameText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    flex: 1,
  },
  tableCell: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  squadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  squadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  squadInitial: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '900',
  },
  squadTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  squadSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 10,
  },
  venueTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  venueSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  venueCapacity: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  newsCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 10,
  },
  newsBadge: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  newsTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  newsIntro: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    lineHeight: 16,
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
  },
});
