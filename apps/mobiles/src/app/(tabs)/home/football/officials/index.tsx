import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@goalmills/ui';
import { EntityService, OfficialMeta } from '../../../../../lib/entityService';
import { OfficialImage } from '../../../../../components/OfficialImage';

const COMPETITION_TABS = [
  { id: 'all', label: 'All Leagues' },
  { id: 'Premier League', label: 'Premier League' },
  { id: 'UEFA Champions League', label: 'Champions League' },
  { id: 'La Liga', label: 'La Liga' },
  { id: 'Serie A', label: 'Serie A' },
  { id: 'Bundesliga', label: 'Bundesliga' },
  { id: 'FIFA World Cup', label: 'FIFA Elite' },
];

const STRICTNESS_OPTIONS = [
  { id: 'all', label: 'All Styles' },
  { id: 'Strict', label: 'Strict' },
  { id: 'Balanced', label: 'Balanced' },
  { id: 'Permissive', label: 'Permissive' },
  { id: 'High-Card Index', label: 'High-Card Index' },
];

export default function OfficialsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComp, setSelectedComp] = useState('all');
  const [selectedStrictness, setSelectedStrictness] = useState('all');
  const [sortBy, setSortBy] = useState<'matches' | 'yellows' | 'reds' | 'fouls'>('matches');

  const officials = useMemo(() => EntityService.getAllOfficials(), []);

  // Filter & sort
  const filteredOfficials = useMemo(() => {
    return officials
      .filter((official) => {
        const matchesSearch =
          official.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          official.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          official.competitions.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesComp =
          selectedComp === 'all' ||
          official.competitions.some((c) => c.toLowerCase().includes(selectedComp.toLowerCase()));

        const matchesStrictness =
          selectedStrictness === 'all' || official.strictnessRating === selectedStrictness;

        return matchesSearch && matchesComp && matchesStrictness;
      })
      .sort((a, b) => {
        if (sortBy === 'yellows') return b.yellowCardsPerGame - a.yellowCardsPerGame;
        if (sortBy === 'reds') return b.redCardsPerGame - a.redCardsPerGame;
        if (sortBy === 'fouls') return b.foulsPerGame - a.foulsPerGame;
        return b.matches - a.matches;
      });
  }, [officials, searchQuery, selectedComp, selectedStrictness, sortBy]);

  // Aggregate stats
  const totalMatches = useMemo(
    () => officials.reduce((acc, curr) => acc + curr.matches, 0),
    [officials]
  );
  const totalYellows = useMemo(
    () => officials.reduce((acc, curr) => acc + curr.yellowCardsTotal, 0),
    [officials]
  );
  const avgYellowsPerGame = (totalYellows / Math.max(1, totalMatches)).toFixed(2);

  const getStrictnessColors = (rating: OfficialMeta['strictnessRating']) => {
    switch (rating) {
      case 'High-Card Index':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Strict':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Balanced':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Permissive':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', text: '#94A3B8', border: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070D18" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>🚩 Match Officials & VAR</Text>
          <Text style={styles.headerSubtitle}>
            {filteredOfficials.length} Elite Referee{filteredOfficials.length !== 1 ? 's' : ''} Tracked
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Aggregate Ribbon */}
        <View style={styles.ribbonContainer}>
          <View style={styles.ribbonCard}>
            <Text style={styles.ribbonLabel}>OFFICIALS</Text>
            <Text style={styles.ribbonValue}>{officials.length}</Text>
          </View>
          <View style={styles.ribbonCard}>
            <Text style={styles.ribbonLabel}>MATCHES</Text>
            <Text style={[styles.ribbonValue, { color: '#60A5FA' }]}>
              {totalMatches.toLocaleString()}
            </Text>
          </View>
          <View style={styles.ribbonCard}>
            <Text style={styles.ribbonLabel}>YELLOWS</Text>
            <Text style={[styles.ribbonValue, { color: '#FBBF24' }]}>
              {totalYellows.toLocaleString()}
            </Text>
          </View>
          <View style={styles.ribbonCard}>
            <Text style={styles.ribbonLabel}>AVG / GAME</Text>
            <Text style={[styles.ribbonValue, { color: '#34D399' }]}>{avgYellowsPerGame}</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by referee name, country, league..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>

        {/* League Horizontal Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {COMPETITION_TABS.map((tab) => {
            const isActive = selectedComp === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setSelectedComp(tab.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Strictness Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {STRICTNESS_OPTIONS.map((opt) => {
            const isActive = selectedStrictness === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setSelectedStrictness(opt.id)}
                style={[
                  styles.strictChip,
                  isActive && styles.strictChipActive,
                ]}
              >
                <Text style={[styles.strictChipText, isActive && styles.strictChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sorting Bar */}
        <View style={styles.sortBar}>
          <Text style={styles.sortLabel}>SORT BY:</Text>
          <View style={styles.sortRow}>
            {[
              { id: 'matches', label: 'Matches' },
              { id: 'yellows', label: '🟨/G' },
              { id: 'reds', label: '🟥/G' },
              { id: 'fouls', label: 'Fouls' },
            ].map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSortBy(s.id as any)}
                style={[styles.sortButton, sortBy === s.id && styles.sortButtonActive]}
              >
                <Text
                  style={[styles.sortButtonText, sortBy === s.id && styles.sortButtonTextActive]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Officials Cards List */}
        <View style={styles.listContainer}>
          {filteredOfficials.map((official) => {
            const strict = getStrictnessColors(official.strictnessRating);
            return (
              <Pressable
                key={official.slug}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(`/home/football/officials/${official.slug}` as any)}
              >
                <View style={styles.cardHeader}>
                  <OfficialImage
                    src={official.photo}
                    name={official.name}
                    countryFlag={official.countryFlag}
                    size={56}
                    style={styles.officialPhoto}
                  />
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.strictBadge,
                          { backgroundColor: strict.bg, borderColor: strict.border },
                        ]}
                      >
                        <Text style={[styles.strictBadgeText, { color: strict.text }]}>
                          {official.strictnessRating}
                        </Text>
                      </View>
                      <Text style={styles.fifaBadgeText}>FIFA: {official.fifaBadgeSince}</Text>
                    </View>
                    <Text style={styles.officialName}>{official.name}</Text>
                    <Text style={styles.officialMeta}>
                      {official.country} • {official.age} yrs
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748B" />
                </View>

                {/* Primary Competitions */}
                <View style={styles.competitionsRow}>
                  {official.competitions.slice(0, 3).map((comp) => (
                    <View key={comp} style={styles.compChip}>
                      <Text style={styles.compChipText}>{comp}</Text>
                    </View>
                  ))}
                </View>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>MATCHES</Text>
                    <Text style={styles.metricValue}>{official.matches}</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: '#FBBF24' }]}>🟨 / GAME</Text>
                    <Text style={[styles.metricValue, { color: '#FBBF24' }]}>
                      {official.yellowCardsPerGame}
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: '#F87171' }]}>🟥 / GAME</Text>
                    <Text style={[styles.metricValue, { color: '#F87171' }]}>
                      {official.redCardsPerGame}
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: '#60A5FA' }]}>FOULS / G</Text>
                    <Text style={[styles.metricValue, { color: '#60A5FA' }]}>
                      {official.foulsPerGame}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070D18',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#0A1424',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.15)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: 1,
  },
  scrollContent: {
    flex: 1,
  },
  ribbonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  ribbonCard: {
    flex: 1,
    backgroundColor: '#0C1728',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  ribbonLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  ribbonValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1728',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#0C1728',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#070D18',
    fontWeight: '900',
  },
  strictChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  strictChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  strictChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  strictChipTextActive: {
    color: '#FBBF24',
    fontWeight: '800',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  sortLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#0C1728',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sortButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6',
  },
  sortButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  sortButtonTextActive: {
    color: '#60A5FA',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  card: {
    backgroundColor: '#0B1526',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  officialPhoto: {
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 28,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  strictBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  strictBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  fifaBadgeText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  officialName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  officialMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  competitionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  compChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  compChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#060D18',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
